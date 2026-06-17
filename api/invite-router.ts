import { z } from "zod";
import { createRouter, authedQuery, getCenterPlan, checkInviteLimit } from "./middleware";
import { getDb } from "./queries/connection";
import { inviteCodes, centers, users } from "@db/schema";
import { eq, count } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const inviteRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    if (!ctx.user.centerId) return [];

    const codes = await db
      .select()
      .from(inviteCodes)
      .where(eq(inviteCodes.centerId, ctx.user.centerId));

    const results = [];
    for (const code of codes) {
      let usedByName = null;
      if (code.usedBy) {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, code.usedBy));
        usedByName = user?.name ?? "Unknown";
      }
      results.push({ ...code, usedByName });
    }
    return results;
  }),

  create: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    if (!ctx.user.centerId) throw new TRPCError({ code: "NOT_FOUND", message: "You do not manage a center" });

    const { plan } = await getCenterPlan(ctx.user.centerId);
    if (plan === "free") {
      const [existing] = await db
        .select({ count: count() })
        .from(inviteCodes)
        .where(eq(inviteCodes.centerId, ctx.user.centerId));
      if (existing.count >= 10) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Free plan limited to 10 invite codes. Upgrade to Premium for unlimited codes.",
        });
      }
    }

    let code = generateCode();
    let attempts = 0;
    while (attempts < 10) {
      const [existing] = await db
        .select()
        .from(inviteCodes)
        .where(eq(inviteCodes.code, code));
      if (!existing) break;
      code = generateCode();
      attempts++;
    }

    const [invite] = await db.insert(inviteCodes).values({
      code,
      centerId: ctx.user.centerId,
    });
    return { code, id: invite.insertId };
  }),

  redeem: authedQuery
    .input(z.object({ code: z.string().min(1).max(32) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [invite] = await db
        .select()
        .from(inviteCodes)
        .where(eq(inviteCodes.code, input.code.toUpperCase()));

      if (!invite) throw new TRPCError({ code: "NOT_FOUND", message: "Invalid invite code" });
      if (invite.usedBy) throw new TRPCError({ code: "CONFLICT", message: "This code has already been used" });

      await checkInviteLimit(invite.centerId);

      await db
        .update(inviteCodes)
        .set({ usedBy: ctx.user.id, usedAt: new Date() })
        .where(eq(inviteCodes.id, invite.id));

      await db
        .update(users)
        .set({ centerId: invite.centerId })
        .where(eq(users.id, ctx.user.id));

      const [center] = await db
        .select()
        .from(centers)
        .where(eq(centers.id, invite.centerId));

      return {
        success: true,
        centerName: center?.name ?? "Your Center",
      };
    }),

  myCenter: authedQuery.query(async ({ ctx }) => {
    if (!ctx.user.centerId) return null;
    const db = getDb();
    const [center] = await db
      .select()
      .from(centers)
      .where(eq(centers.id, ctx.user.centerId));
    return center ?? null;
  }),
});
