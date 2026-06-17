import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { webhooks, webhookLogs } from "@db/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

async function testWebhookUrl(url: string): Promise<{ statusCode: number; success: boolean }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Event": "test",
        "X-Webhook-Signature": "test-signature",
      },
      body: JSON.stringify({
        event: "test",
        timestamp: new Date().toISOString(),
        data: { message: "This is a test webhook" },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return { statusCode: response.status, success: response.ok };
  } catch (error) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Failed to reach webhook URL: ${(error as Error).message}`,
    });
  }
}

export const webhooksRouter = createRouter({
  // List all webhooks
  list: adminQuery.query(async ({ ctx }) => {
    if (!ctx.user.centerId) {
      return [];
    }

    const db = getDb();
    return db
      .select()
      .from(webhooks)
      .where(eq(webhooks.centerId, ctx.user.centerId));
  }),

  // Get webhook details with recent logs
  get: adminQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user.centerId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "You do not manage a center",
        });
      }

      const db = getDb();
      const [webhook] = await db
        .select()
        .from(webhooks)
        .where(
          and(eq(webhooks.id, input.id), eq(webhooks.centerId, ctx.user.centerId))
        );

      if (!webhook) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Webhook not found" });
      }

      const logs = await db
        .select()
        .from(webhookLogs)
        .where(eq(webhookLogs.webhookId, input.id))
        .orderBy((t) => [t.createdAt])
        .limit(50);

      return { ...webhook, logs };
    }),

  // Create a new webhook
  create: adminQuery
    .input(
      z.object({
        url: z.string().url().startsWith("https://", { message: "Webhook URL must use HTTPS" }),
        events: z.array(z.string()).min(1, "Select at least one event"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.centerId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "You do not manage a center",
        });
      }

      // Test the webhook URL
      const testResult = await testWebhookUrl(input.url);

      const db = getDb();
      const [result] = await db.insert(webhooks).values({
        centerId: ctx.user.centerId,
        url: input.url,
        events: input.events,
        active: true,
      });

      return {
        id: result.insertId,
        url: input.url,
        events: input.events,
        active: true,
        createdAt: new Date(),
        testResult,
      };
    }),

  // Update webhook
  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        url: z.string().url().optional(),
        events: z.array(z.string()).optional(),
        active: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.centerId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "You do not manage a center",
        });
      }

      const db = getDb();
      const [webhook] = await db
        .select()
        .from(webhooks)
        .where(
          and(eq(webhooks.id, input.id), eq(webhooks.centerId, ctx.user.centerId))
        );

      if (!webhook) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Webhook not found" });
      }

      // Test URL if it changed
      if (input.url && input.url !== webhook.url) {
        await testWebhookUrl(input.url);
      }

      await db
        .update(webhooks)
        .set({
          url: input.url || webhook.url,
          events: input.events || webhook.events,
          active: input.active !== undefined ? input.active : webhook.active,
        })
        .where(eq(webhooks.id, input.id));

      return { success: true };
    }),

  // Delete webhook
  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.centerId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "You do not manage a center",
        });
      }

      const db = getDb();
      const [webhook] = await db
        .select()
        .from(webhooks)
        .where(
          and(eq(webhooks.id, input.id), eq(webhooks.centerId, ctx.user.centerId))
        );

      if (!webhook) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Webhook not found" });
      }

      await db.delete(webhooks).where(eq(webhooks.id, input.id));
      return { success: true };
    }),

  // Test webhook by sending a test event
  test: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.centerId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "You do not manage a center",
        });
      }

      const db = getDb();
      const [webhook] = await db
        .select()
        .from(webhooks)
        .where(
          and(eq(webhooks.id, input.id), eq(webhooks.centerId, ctx.user.centerId))
        );

      if (!webhook) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Webhook not found" });
      }

      const result = await testWebhookUrl(webhook.url);

      // Log the test
      await db.insert(webhookLogs).values({
        webhookId: webhook.id,
        eventType: "test",
        statusCode: result.statusCode,
        response: result.success ? "Test successful" : "Test failed",
      });

      return result;
    }),

  // Get webhook event types available
  getEventTypes: adminQuery.query(async () => {
    return [
      { id: "student.enrolled", label: "Student Enrolled" },
      { id: "student.left", label: "Student Left" },
      { id: "lesson.created", label: "Lesson Created" },
      { id: "lesson.deleted", label: "Lesson Deleted" },
      { id: "lesson.completed", label: "Lesson Completed" },
      { id: "quiz.created", label: "Quiz Created" },
      { id: "quiz.submitted", label: "Quiz Submitted" },
      { id: "center.updated", label: "Center Settings Updated" },
    ];
  }),
});
