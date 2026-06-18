import { getDb } from "../queries/connection";
import { notifications } from "@db/schema";

type NotificationType = "new_message" | "upcoming_meeting" | "grade_ready" | "assignment_posted";

export async function createNotification(
  userId: number,
  type: NotificationType,
  title: string,
  body?: string,
  link?: string
) {
  const db = getDb();
  await db.insert(notifications).values({
    userId,
    type,
    title,
    body: body ?? null,
    link: link ?? null,
  });
}
