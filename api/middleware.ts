import { ErrorMessages } from "@contracts/constants";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { getDb } from "./queries/connection";
import { centers, users } from "@db/schema";
import { eq, and, count } from "drizzle-orm";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const createRouter = t.router;
export const publicQuery = t.procedure;

const requireAuth = t.middleware(async (opts) => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ErrorMessages.unauthenticated,
    });
  }

  return next({ ctx: { ...ctx, user: ctx.user } });
});

function requireRole(role: string) {
  return t.middleware(async (opts) => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== role) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: ErrorMessages.insufficientRole,
      });
    }

    return next({ ctx: { ...ctx, user: ctx.user } });
  });
}

export const authedQuery = t.procedure.use(requireAuth);
export const adminQuery = authedQuery.use(requireRole("teacher"));
export const superAdminQuery = authedQuery.use(requireRole("admin"));

export async function getCenterPlan(centerId: number): Promise<{ plan: "free" | "premium"; videoUploadCount: number; videoUploadWeek: number | null }> {
  const db = getDb();
  const [center] = await db
    .select({ plan: centers.plan, videoUploadCount: centers.videoUploadCount, videoUploadWeek: centers.videoUploadWeek })
    .from(centers)
    .where(eq(centers.id, centerId));
  if (!center) throw new TRPCError({ code: "NOT_FOUND", message: "Center not found" });
  return center;
}

export async function checkInviteLimit(centerId: number): Promise<void> {
  const { plan } = await getCenterPlan(centerId);
  if (plan !== "free") return;
  const db = getDb();
  const [existing] = await db
    .select({ count: count() })
    .from(users)
    .where(and(eq(users.centerId, centerId), eq(users.role, "student")));
  if (existing.count >= 10) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Free plan limited to 10 students. Upgrade to Premium for unlimited enrollment.",
    });
  }
}

export async function checkVideoUploadLimit(centerId: number): Promise<void> {
  const { plan, videoUploadCount, videoUploadWeek } = await getCenterPlan(centerId);
  if (plan !== "free") return;

  const currentWeek = getWeekNumber(new Date());
  if (videoUploadWeek === currentWeek && videoUploadCount >= 1) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Free plan limited to 1 video per week. Upgrade to Premium for unlimited uploads.",
    });
  }
}

export async function incrementVideoUploadCount(centerId: number): Promise<void> {
  const db = getDb();
  const currentWeek = getWeekNumber(new Date());
  const center = await getCenterPlan(centerId);
  if (center.plan !== "free") return;

  if (center.videoUploadWeek !== currentWeek) {
    await db.update(centers).set({ videoUploadCount: 1, videoUploadWeek: currentWeek }).where(eq(centers.id, centerId));
  } else {
    await db.update(centers).set({ videoUploadCount: center.videoUploadCount + 1 }).where(eq(centers.id, centerId));
  }
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
