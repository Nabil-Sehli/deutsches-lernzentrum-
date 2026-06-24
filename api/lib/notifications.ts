import { getDb } from "../queries/connection";
import { notifications, users } from "@db/schema";
import { eq } from "drizzle-orm";
import { sendEmail } from "./email";

export type NotificationType =
  | "new_message"
  | "upcoming_meeting"
  | "grade_ready"
  | "assignment_posted"
  | "level_needed"
  | "level_reminder"
  | "lesson_published"
  | "quiz_graded"
  | "level_changed"
  | "assignment_due_soon";

type EmailConfig = {
  subject: string;
  html: (body: string) => string;
};

const emailTemplates: Partial<Record<NotificationType, EmailConfig>> = {
  level_needed: {
    subject: "A student needs a level assignment",
    html: (body) => `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;"><h2 style="color:#00695c;">Level Assignment Needed</h2><p>${body}</p><p><a href="${process.env.BASE_URL ?? "http://localhost:3000"}/admin?tab=students" style="display:inline-block;background:#00695c;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;">Assign Level</a></p></div>`,
  },
  level_reminder: {
    subject: "A student is waiting for a level",
    html: (body) => `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;"><h2 style="color:#00695c;">Level Reminder</h2><p>${body}</p><p><a href="${process.env.BASE_URL ?? "http://localhost:3000"}/admin?tab=students" style="display:inline-block;background:#00695c;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;">Go to Admin</a></p></div>`,
  },
  assignment_posted: {
    subject: "New assignment posted",
    html: (body) => `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;"><h2 style="color:#00695c;">New Assignment</h2><p>${body}</p><p><a href="${process.env.BASE_URL ?? "http://localhost:3000"}/dashboard" style="display:inline-block;background:#00695c;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;">View Assignment</a></p></div>`,
  },
  grade_ready: {
    subject: "Your assignment has been graded",
    html: (body) => `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;"><h2 style="color:#00695c;">Grade Ready</h2><p>${body}</p><p><a href="${process.env.BASE_URL ?? "http://localhost:3000"}/dashboard" style="display:inline-block;background:#00695c;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;">View Grade</a></p></div>`,
  },
  lesson_published: {
    subject: "New lesson available",
    html: (body) => `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;"><h2 style="color:#00695c;">New Lesson</h2><p>${body}</p><p><a href="${process.env.BASE_URL ?? "http://localhost:3000"}/dashboard" style="display:inline-block;background:#00695c;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;">Watch Now</a></p></div>`,
  },
  level_changed: {
    subject: "Your language level has been updated",
    html: (body) => `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;"><h2 style="color:#00695c;">Level Updated</h2><p>${body}</p><p><a href="${process.env.BASE_URL ?? "http://localhost:3000"}/dashboard" style="display:inline-block;background:#00695c;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;">Go to Dashboard</a></p></div>`,
  },
  assignment_due_soon: {
    subject: "Assignment due soon",
    html: (body) => `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;"><h2 style="color:#00695c;">Assignment Due</h2><p>${body}</p><p><a href="${process.env.BASE_URL ?? "http://localhost:3000"}/dashboard" style="display:inline-block;background:#00695c;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;">Submit Now</a></p></div>`,
  },
};

const emailNotificationTypes: Set<NotificationType> = new Set([
  "level_needed",
  "level_reminder",
  "grade_ready",
  "assignment_posted",
  "lesson_published",
  "level_changed",
  "assignment_due_soon",
]);

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

  if (emailNotificationTypes.has(type)) {
    try {
      const [user] = await db
        .select({ email: users.email })
        .from(users)
        .where(eq(users.id, userId));
      if (user?.email) {
        const template = emailTemplates[type];
        if (template) {
          await sendEmail({
            to: user.email,
            subject: template.subject,
            html: template.html(body ?? title),
          });
        }
      }
    } catch {
      // Email failures are non-blocking
    }
  }
}
