import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { centers } from "@db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import Stripe from "stripe";

// Initialize Stripe (add to .env: STRIPE_SECRET_KEY, STRIPE_PREMIUM_PRICE_ID, VITE_API_URL)
const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = new Stripe(stripeKey || "sk_test_placeholder");

export const billingRouter = createRouter({
  // Get billing information
  getBillingInfo: adminQuery.query(async ({ ctx }) => {
    const db = getDb();
    const [center] = await db
      .select()
      .from(centers)
      .where(eq(centers.adminId, ctx.user.id));

    if (!center) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Center not found" });
    }

    let subscription = null;
    if (center.stripeSubscriptionId) {
      try {
        subscription = await stripe.subscriptions.retrieve(
          center.stripeSubscriptionId
        );
      } catch (error) {
        console.error("Failed to fetch Stripe subscription:", error);
      }
    }

    return {
      plan: center.plan,
      nextBillingDate: center.nextBillingDate,
      planStartDate: center.planStartDate,
      stripeSubscriptionId: center.stripeSubscriptionId,
      stripeCustomerId: center.stripeCustomerId,
      billingEmail: center.billingEmail || ctx.user.email,
      subscription: subscription ? {
        status: subscription.status,
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        currency: subscription.currency || "eur",
        amount: subscription.items?.data?.[0]?.price?.unit_amount || 4999, // €49.99 default
      } : null,
    };
  }),

  // Create checkout session for upgrade
  createUpgradeSession: adminQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    const [center] = await db
      .select()
      .from(centers)
      .where(eq(centers.adminId, ctx.user.id));

    if (!center) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Center not found" });
    }

    if (center.plan === "premium") {
      throw new TRPCError({
        code: "CONFLICT",
        message: "You are already on a premium plan",
      });
    }

    let customerId = center.stripeCustomerId;

    // Create customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: ctx.user.email,
        name: center.name,
        metadata: { centerId: center.id },
      });
      customerId = customer.id;

      // Update center with customer ID
      await db
        .update(centers)
        .set({ stripeCustomerId: customerId })
        .where(eq(centers.id, center.id));
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: process.env.STRIPE_PREMIUM_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.VITE_API_URL}/admin?tab=settings&upgraded=true`,
      cancel_url: `${process.env.VITE_API_URL}/admin?tab=settings`,
      billing_address_collection: "auto",
      automatic_tax: { enabled: true },
    });

    return { sessionId: session.id, checkoutUrl: session.url };
  }),

  // Cancel subscription
  cancelSubscription: adminQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    const [center] = await db
      .select()
      .from(centers)
      .where(eq(centers.adminId, ctx.user.id));

    if (!center) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Center not found" });
    }

    if (!center.stripeSubscriptionId) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "No active subscription to cancel",
      });
    }

    // Cancel at period end
    const subscription = await stripe.subscriptions.update(
      center.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );

    return {
      success: true,
      cancelsAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : new Date(),
    };
  }),

  // Reactivate canceled subscription
  reactivateSubscription: adminQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    const [center] = await db
      .select()
      .from(centers)
      .where(eq(centers.adminId, ctx.user.id));

    if (!center) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Center not found" });
    }

    if (!center.stripeSubscriptionId) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "No subscription to reactivate",
      });
    }

    await stripe.subscriptions.update(
      center.stripeSubscriptionId,
      { cancel_at_period_end: false }
    );

    return { success: true };
  }),

  // Simulate upgrade (development mode - no real Stripe)
  simulateUpgrade: adminQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    const [center] = await db
      .select()
      .from(centers)
      .where(eq(centers.adminId, ctx.user.id));

    if (!center) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Center not found" });
    }

    if (center.plan === "premium") {
      throw new TRPCError({ code: "CONFLICT", message: "Already on Premium plan" });
    }

    await db
      .update(centers)
      .set({
        plan: "premium",
        stripeSubscriptionId: "sim_sub_" + Math.random().toString(36).slice(2),
        stripeCustomerId: "sim_cus_" + Math.random().toString(36).slice(2),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        planStartDate: new Date(),
        billingEmail: ctx.user.email,
      })
      .where(eq(centers.id, center.id));

    return {
      success: true,
      plan: "premium",
      message: "Upgraded to Premium (simulated). Your plan will renew in 30 days.",
    };
  }),

  // Downgrade to free (simulated)
  simulateDowngrade: adminQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    const [center] = await db
      .select()
      .from(centers)
      .where(eq(centers.adminId, ctx.user.id));

    if (!center) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Center not found" });
    }

    await db
      .update(centers)
      .set({
        plan: "free",
        stripeSubscriptionId: null,
        stripeCustomerId: null,
        nextBillingDate: null,
        planStartDate: null,
      })
      .where(eq(centers.id, center.id));

    return { success: true, plan: "free", message: "Downgraded to Free plan." };
  }),

  // Get billing portal session
  getPortalSession: adminQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    const [center] = await db
      .select()
      .from(centers)
      .where(eq(centers.adminId, ctx.user.id));

    if (!center || !center.stripeCustomerId) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Stripe customer not found",
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: center.stripeCustomerId,
      return_url: `${process.env.VITE_API_URL}/admin?tab=settings`,
    });

    return { portalUrl: session.url };
  }),

  // Webhook handler for Stripe events
  handleWebhook: adminQuery
    .input(
      z.object({
        event: z.object({
          type: z.string(),
          data: z.object({
            object: z.any(),
          }),
        }),
      })
    )
    .mutation(async ({ input }) => {
      const { type, data } = input.event;
      const db = getDb();

      switch (type) {
        case "customer.subscription.updated":
        case "customer.subscription.created": {
          const subscription = data.object;
          const [center] = await db
            .select()
            .from(centers)
            .where(eq(centers.stripeCustomerId, subscription.customer));

          if (center) {
            await db
              .update(centers)
              .set({
                plan:
                  subscription.status === "active" ? "premium" : "free",
                stripeSubscriptionId: subscription.id,
                nextBillingDate: new Date(
                  subscription.current_period_end * 1000
                ),
                planStartDate:
                  subscription.start_date &&
                  new Date(subscription.start_date * 1000),
              })
              .where(eq(centers.id, center.id));
          }
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = data.object;
          const [center] = await db
            .select()
            .from(centers)
            .where(eq(centers.stripeCustomerId, subscription.customer));

          if (center) {
            await db
              .update(centers)
              .set({
                plan: "free",
                stripeSubscriptionId: null,
                nextBillingDate: null,
              })
              .where(eq(centers.id, center.id));
          }
          break;
        }

        case "invoice.payment_succeeded": {
          const invoice = data.object;
          const [center] = await db
            .select()
            .from(centers)
            .where(eq(centers.stripeCustomerId, invoice.customer));

          if (center) {
            // Update next billing date
            if (invoice.subscription) {
              const subscription = await stripe.subscriptions.retrieve(
                invoice.subscription
              );
              await db
                .update(centers)
                .set({
                  nextBillingDate: new Date(
                    (subscription as any).current_period_end * 1000
                  ),
                })
                .where(eq(centers.id, center.id));
            }
          }
          break;
        }
      }

      return { received: true };
    }),
});
