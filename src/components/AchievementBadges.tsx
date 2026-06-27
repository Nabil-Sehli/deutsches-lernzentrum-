import { useEffect, useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Award,
  Lock,
  Sparkles,
  Loader2,
} from "lucide-react";

interface Achievement {
  id: number;
  key: string;
  name: string;
  description: string | null;
  icon: string | null;
  requirementType: string;
  requirementCount: number;
  unlocked: boolean;
  unlockedAt: string | null;
  progress?: number;
}

export default function AchievementBadges() {
  const { data, isLoading, refetch } = trpc.achievements.list.useQuery();
  const checkMutation = trpc.achievements.check.useMutation({
    onSuccess: () => refetch(),
  });
  const [newBadges, setNewBadges] = useState<{ name: string; icon: string | null }[]>([]);
  const [showNew, setShowNew] = useState(false);

  const achievements: Achievement[] = data ?? [];

  useEffect(() => {
    checkMutation.mutate();
  }, []);

  useEffect(() => {
    if (checkMutation.data?.newlyUnlocked?.length) {
      setNewBadges(checkMutation.data.newlyUnlocked);
      setShowNew(true);
      const timer = setTimeout(() => setShowNew(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [checkMutation.data]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  if (isLoading && achievements.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-[#00695c] animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* New badge notification */}
      {showNew && newBadges.length > 0 && (
        <div className="fixed top-24 right-6 z-50 space-y-2">
          {newBadges.map((badge, i) => (
            <div
              key={i}
              className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl shadow-xl px-5 py-4 flex items-center gap-3 animate-in slide-in-from-right fade-in duration-300"
            >
              <span className="text-3xl">{badge.icon ?? "🏆"}</span>
              <div>
                <p className="text-xs text-amber-600 font-medium">Achievement Unlocked!</p>
                <p className="text-sm font-bold text-[#2c3e2d]">{badge.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#78909c]">
          {unlockedCount} / {achievements.length} unlocked
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {achievements.map((badge) => (
          <Card
            key={badge.id}
            className={`clay-card border-0 transition-all ${
              badge.unlocked
                ? "bg-gradient-to-br from-amber-50/80 to-white"
                : "opacity-60"
            }`}
          >
            <CardContent className="p-4 text-center">
              <div className={`text-3xl mb-2 ${badge.unlocked ? "" : "grayscale"}`}>
                {badge.icon ?? <Award className="w-8 h-8 mx-auto text-[#00695c]" />}
              </div>
              <p className={`text-sm font-semibold truncate ${badge.unlocked ? "text-[#2c3e2d]" : "text-[#78909c]"}`}>
                {badge.name}
              </p>
              <p className="text-[10px] text-[#78909c] mt-0.5 leading-tight line-clamp-2">
                {badge.description}
              </p>
              {badge.unlocked ? (
                <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-[#00695c] font-medium">
                  <Award className="w-3 h-3" />
                  Earned
                </div>
              ) : (
                <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-[#78909c]">
                  <Lock className="w-3 h-3" />
                  {badge.progress != null && badge.progress > 0
                    ? `${badge.progress}/${badge.requirementCount}`
                    : "Locked"}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
