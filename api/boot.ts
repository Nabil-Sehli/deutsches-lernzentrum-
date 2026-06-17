import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { setCookie } from "hono/cookie";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { signSessionToken } from "./lib/session";
import { hashPassword } from "./lib/password";
import { findUserByEmail, createUser, updateLastSignIn } from "./queries/users";

const app = new Hono<{ Bindings: HttpBindings }>();

// bodyLimit only on dev-login route — not globally, to avoid conflicting with tRPC body parsing
app.post("/api/dev-login", bodyLimit({ maxSize: 50 * 1024 * 1024 }), async (c) => {
  if (env.isProduction) {
    return c.json({ error: "Dev login only available in development" }, 403);
  }

  const body = await c.req.json().catch(() => ({}));
  const role = body.role ?? "student";
  if (role !== "student" && role !== "teacher") {
    return c.json({ error: "Role must be 'student' or 'teacher'" }, 400);
  }
  const name = (body.name ?? "Dev User") as string;
  const email = `dev-${role}-${name.toLowerCase().replace(/\s+/g, "-")}@dev.local`;

  let user = await findUserByEmail(email);
  if (!user) {
    user = await createUser({
      email,
      passwordHash: await hashPassword("dev123456"),
      name,
      role,
      lastSignInAt: new Date(),
    });
  } else {
    await updateLastSignIn(user.id);
  }

  if (!user) {
    return c.json({ error: "Failed to create user" }, 500);
  }

  const token = await signSessionToken({ userId: user.id });

  const cookieOpts = getSessionCookieOptions(c.req.raw.headers);
  setCookie(c, Session.cookieName, token, {
    ...cookieOpts,
    maxAge: Session.maxAgeMs / 1000,
  });

  return c.json({ success: true, role, name });
});

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
