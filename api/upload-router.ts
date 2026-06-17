import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { uploads } from "@db/schema";
import { getPresignedUploadUrl } from "./lib/s3";
import { TRPCError } from "@trpc/server";

const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/webp",
  "application/pdf",
  "video/mp4", "video/webm", "video/ogg", "video/quicktime",
];
const MAX_SIZE = 500 * 1024 * 1024; // 500 MB max
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB for images/docs

const CHAT_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_CHAT_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

function categoryFromContentType(contentType: string): "image" | "video" | "document" | "other" {
  if (contentType.startsWith("image/")) return "image";
  if (contentType.startsWith("video/")) return "video";
  if (contentType === "application/pdf") return "document";
  return "other";
}

export const uploadRouter = createRouter({
  // For students — chat images only
  getChatUploadUrl: authedQuery
    .input(
      z.object({
        fileName: z.string().min(1),
        contentType: z.string().refine((v) => CHAT_IMAGE_TYPES.includes(v), { message: `Unsupported image type. Allowed: ${CHAT_IMAGE_TYPES.join(", ")}` }),
        fileSize: z.number().max(MAX_CHAT_IMAGE_SIZE),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.centerId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not part of a center" });
      }

      const ext = input.fileName.split(".").pop()?.toLowerCase() ?? "";
      const allowedExts = ["jpg", "jpeg", "png", "webp", "gif"];
      if (!allowedExts.includes(ext)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `Unsupported file extension: .${ext}` });
      }

      const sanitizedName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const uuid = crypto.randomUUID();
      const key = `chat-uploads/${uuid}-${sanitizedName}`;

      // Don't record in uploads table — chat images are transient
      return getPresignedUploadUrl(key, input.contentType);
    }),

  getUrl: authedQuery
    .input(
      z.object({
        fileName: z.string().min(1),
        contentType: z.string().min(1),
        fileSize: z.number().max(MAX_SIZE),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ALLOWED_TYPES.includes(input.contentType)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `Unsupported file type: ${input.contentType}. Allowed: ${ALLOWED_TYPES.join(", ")}` });
      }

      const isVideo = input.contentType.startsWith("video/");
      if (!isVideo && input.fileSize > MAX_IMAGE_SIZE) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `File too large. Images/PDFs limited to ${MAX_IMAGE_SIZE / 1024 / 1024}MB.` });
      }

      const ext = input.fileName.split(".").pop()?.toLowerCase() ?? "";
      const allowedExts = isVideo
        ? ["mp4", "webm", "ogv", "mov"]
        : ["jpg", "jpeg", "png", "webp", "pdf"];
      if (!allowedExts.includes(ext)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `Unsupported file extension: .${ext}` });
      }

      const sanitizedName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const uuid = crypto.randomUUID();
      const key = `uploads/${uuid}-${sanitizedName}`;

      if (ctx.user.centerId) {
        const db = getDb();
        await db.insert(uploads).values({
          centerId: ctx.user.centerId,
          fileName: input.fileName,
          fileSize: input.fileSize,
          contentType: input.contentType,
          category: categoryFromContentType(input.contentType),
        });
      }

      return getPresignedUploadUrl(key, input.contentType);
    }),
});
