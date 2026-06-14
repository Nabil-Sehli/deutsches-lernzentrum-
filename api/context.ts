import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { verifySessionToken } from "./lib/session";
import { findUserById } from "./queries/users";
import * as cookie from "cookie";
import { Session } from "@contracts/constants";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };
  try {
    const cookies = cookie.parse(opts.req.headers.get("cookie") || "");
    const token = cookies[Session.cookieName];
    if (token) {
      const claim = await verifySessionToken(token);
      if (claim) {
        ctx.user = await findUserById(claim.userId);
      }
    }
  } catch {
    // not authenticated
  }
  return ctx;
}
