import { z } from "zod";
import * as cookie from "cookie";
import { TRPCError } from "@trpc/server";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { signSessionToken } from "./lib/session";
import { hashPassword, comparePassword } from "./lib/password";
import {
  findUserByEmail,
  createUser,
  updateUser,
  updateLastSignIn,
} from "./queries/users";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import type { User } from "@db/schema";

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.enum(["Mr", "Mrs"]).nullable().optional(),
  sex: z.enum(["male", "female"]).nullable().optional(),
  age: z.number().min(1).max(150).nullable().optional(),
  city: z.string().max(255).optional(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
});

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  role: z.enum(["student", "teacher"]),
  title: z.enum(["Mr", "Mrs"]).optional(),
  sex: z.enum(["male", "female"]).optional(),
  age: z.number().min(1).max(150).optional(),
  city: z.string().max(255).optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const authRouter = createRouter({
  register: publicQuery
    .input(registerSchema)
    .mutation(async ({ input, ctx }) => {
      const existing = await findUserByEmail(input.email);
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An account with this email already exists",
        });
      }

      const passwordHash = await hashPassword(input.password);
      const user = await createUser({
        email: input.email,
        passwordHash,
        name: input.name,
        role: input.role,
        title: input.title ?? null,
        sex: input.sex ?? null,
        age: input.age ?? null,
        city: input.city ?? null,
        lastSignInAt: new Date(),
      });
      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create account",
        });
      }

      const token = await signSessionToken({ userId: user.id });
      const opts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(Session.cookieName, token, {
          httpOnly: true,
          path: "/",
          sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
          secure: opts.secure,
          maxAge: Session.maxAgeMs / 1000,
        }),
      );

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    }),

  login: publicQuery
    .input(loginSchema)
    .mutation(async ({ input, ctx }) => {
      const user = await findUserByEmail(input.email);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid email or password",
        });
      }

      const valid = await comparePassword(input.password, user.passwordHash);
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      await updateLastSignIn(user.id);

      const token = await signSessionToken({ userId: user.id });
      const opts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(Session.cookieName, token, {
          httpOnly: true,
          path: "/",
          sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
          secure: opts.secure,
          maxAge: Session.maxAgeMs / 1000,
        }),
      );

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    }),

  me: authedQuery.query((opts) => opts.ctx.user),

  updateProfile: authedQuery
    .input(updateProfileSchema)
    .mutation(async ({ input, ctx }) => {
      const updated = await updateUser(ctx.user.id, input as Partial<User>);
      return updated;
    }),

  updateAdminProfile: authedQuery
    .input(z.object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Invalid email address"),
      password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admins only" });
      }
      const data: Partial<User> = { name: input.name, email: input.email };
      if (input.password) {
        data.passwordHash = await hashPassword(input.password);
      }
      const updated = await updateUser(ctx.user.id, data);
      return updated;
    }),

  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      }),
    );
    return { success: true };
  }),
});
