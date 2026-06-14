import { eq } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertUser } from "@db/schema";
import { getDb } from "./connection";

export async function findUserByEmail(email: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);
  return rows.at(0);
}

export async function findUserById(id: number) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .limit(1);
  return rows.at(0);
}

export async function createUser(data: InsertUser) {
  const [result] = await getDb().insert(schema.users).values(data);
  const id = result.insertId;
  return findUserById(id);
}

export async function updateUser(
  id: number,
  data: Partial<InsertUser>,
) {
  await getDb()
    .update(schema.users)
    .set(data)
    .where(eq(schema.users.id, id));
  return findUserById(id);
}

export async function updateLastSignIn(id: number) {
  await getDb()
    .update(schema.users)
    .set({ lastSignInAt: new Date() })
    .where(eq(schema.users.id, id));
}
