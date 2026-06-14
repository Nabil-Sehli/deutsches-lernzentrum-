import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getPresignedUploadUrl } from "./lib/s3";

export const uploadRouter = createRouter({
  getUrl: authedQuery
    .input(
      z.object({
        fileName: z.string().min(1),
        contentType: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const key = `uploads/${Date.now()}-${input.fileName}`;
      return getPresignedUploadUrl(key, input.contentType);
    }),
});
