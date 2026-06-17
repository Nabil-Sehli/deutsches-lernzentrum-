import "dotenv/config";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "./api/router";

const client = createTRPCClient({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, { ...init, credentials: "include" });
      },
    }),
  ],
});

async function main() {
  // First login as the dev teacher
  const login = await client.auth.login.mutate({
    email: "dev-teacher-dev-teacher@dev.local",
    password: "dev-teacher-password",
  });
  console.log("Login:", JSON.stringify(login));

  // Get settings
  const settings = await client.center.settings.query();
  console.log("Settings before:", JSON.stringify({ id: settings?.id, name: settings?.name, banner: settings?.banner }));

  // Save with a test banner
  const result = await client.center.saveSettings.mutate({
    id: settings!.id,
    name: settings!.name,
    description: settings!.description,
    logo: settings!.logo,
    banner: "http://localhost:9000/my-bucket/uploads/1781485839101-Gemini_Generated_Image_marfbjmarfbjmarf.png",
    address: settings!.address,
    phone: settings!.phone,
    emails: settings!.emails ?? [],
    locations: settings!.locations ?? [],
    phones: settings!.phones ?? [],
    albumImages: settings!.albumImages ?? [],
  });
  console.log("Save result:", JSON.stringify(result));

  // Check settings after
  const settings2 = await client.center.settings.query();
  console.log("Settings after:", JSON.stringify({ id: settings2?.id, name: settings2?.name, banner: settings2?.banner }));
}

main().catch(console.error);
