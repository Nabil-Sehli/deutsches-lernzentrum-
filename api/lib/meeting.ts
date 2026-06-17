const JITSI_DOMAIN = "meet.jit.si";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64) || `room-${Date.now()}`;
}

export async function createDailyRoom(name: string) {
  const roomName = slugify(name);
  const url = `https://${JITSI_DOMAIN}/${roomName}`;
  return { url, name: roomName };
}

export async function deleteDailyRoom(_name: string) {
  // Jitsi rooms are ephemeral — nothing to delete
}
