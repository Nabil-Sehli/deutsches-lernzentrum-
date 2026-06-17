import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { apiKeys } from "@db/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { randomBytes } from "crypto";

function generateApiKey(): string {
  return randomBytes(32).toString("hex");
}

export const apiKeysRouter = createRouter({
  // List all API keys for the center
  list: adminQuery.query(async ({ ctx }) => {
    if (!ctx.user.centerId) {
      return [];
    }

    const db = getDb();
    const keys = await db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        key: apiKeys.key,
        lastUsedAt: apiKeys.lastUsedAt,
        createdAt: apiKeys.createdAt,
      })
      .from(apiKeys)
      .where(eq(apiKeys.centerId, ctx.user.centerId));

    return keys.map((k) => ({
      ...k,
      key: k.key.substring(0, 8) + "..." + k.key.substring(k.key.length - 4), // Mask key
    }));
  }),

  // Create a new API key
  create: adminQuery
    .input(z.object({ name: z.string().min(1).max(255) }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.centerId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "You do not manage a center",
        });
      }

      const db = getDb();
      const key = generateApiKey();
      const hashedKey = Buffer.from(key).toString("base64");

      const [result] = await db.insert(apiKeys).values({
        centerId: ctx.user.centerId,
        name: input.name,
        key: hashedKey,
      });

      return {
        id: result.insertId,
        name: input.name,
        key: key, // Return unhashed key only on creation
        createdAt: new Date(),
      };
    }),

  // Delete an API key
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
      const [key] = await db
        .select()
        .from(apiKeys)
        .where(and(eq(apiKeys.id, input.id), eq(apiKeys.centerId, ctx.user.centerId)));

      if (!key) {
        throw new TRPCError({ code: "NOT_FOUND", message: "API key not found" });
      }

      await db.delete(apiKeys).where(eq(apiKeys.id, input.id));

      return { success: true };
    }),

  // Verify and update last used timestamp
  verify: adminQuery
    .input(z.object({ key: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const hashedKey = Buffer.from(input.key).toString("base64");

      const [apiKey] = await db
        .select()
        .from(apiKeys)
        .where(eq(apiKeys.key, hashedKey));

      if (!apiKey) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid API key",
        });
      }

      // Update last used
      await db
        .update(apiKeys)
        .set({ lastUsedAt: new Date() })
        .where(eq(apiKeys.id, apiKey.id));

      return {
        valid: true,
        centerId: apiKey.centerId,
        name: apiKey.name,
      };
    }),
});
