import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface VideoCallProps {
  roomUrl: string;
  open: boolean;
  onClose: () => void;
}

export function VideoCall({ roomUrl, open, onClose }: VideoCallProps) {
  const roomName = roomUrl.split("/").pop() ?? "default";
  const src = `https://meet.jit.si/${roomName}#config.prejoinPageEnabled=false&config.enableLobby=false&config.requirePassword=false&config.disableModeratorIndicator=true&config.startWithAudioMuted=false&config.startWithVideoMuted=false`;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl h-[90vh] p-0 border-0 rounded-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-50 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60"
        >
          <X className="w-5 h-5" />
        </button>
        <iframe
          src={src}
          allow="camera; microphone; screen-wake-lock; autoplay; display-capture; fullscreen"
          className="w-full h-full border-0"
          title="Video Call"
        />
      </DialogContent>
    </Dialog>
  );
}
