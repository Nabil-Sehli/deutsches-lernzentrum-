import { trpc } from "@/providers/trpc";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Trophy,
  Medal,
  Flame,
  Loader2,
  Crown,
} from "lucide-react";

const RANK_COLORS = {
  1: "from-yellow-100 to-amber-50 border-amber-200",
  2: "from-slate-100 to-gray-50 border-slate-200",
  3: "from-orange-100 to-orange-50 border-orange-200",
};

const RANK_ICONS = {
  1: <Crown className="w-4 h-4 text-amber-500" />,
  2: <Medal className="w-4 h-4 text-slate-500" />,
  3: <Medal className="w-4 h-4 text-orange-500" />,
};

export default function Leaderboard() {
  const { data, isLoading } = trpc.activity.leaderboard.useQuery({ limit: 10 });

  if (isLoading) {
    return (
      <Card className="clay-card border-0">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-[#00695c] animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="clay-card border-0">
        <CardContent className="p-6 text-center">
          <Trophy className="w-10 h-10 text-[#78909c] mx-auto mb-2" />
          <p className="text-sm text-[#78909c]">No students yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="clay-card border-0">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#2c3e2d] flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#00695c]" />
            Leaderboard
          </h3>
          <p className="text-xs text-[#78909c]">Top {data.length}</p>
        </div>

        <div className="space-y-2">
          {data.map((entry, idx) => {
            const rank = idx + 1;
            const isTop3 = rank <= 3;
            const isYou = entry.isCurrentUser;

            return (
              <div
                key={entry.studentId}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                  isYou
                    ? "bg-[#00695c]/10 border-2 border-[#00695c]/30 ring-1 ring-[#00695c]/20"
                    : isTop3
                    ? `bg-gradient-to-r ${RANK_COLORS[rank as 1 | 2 | 3]} border`
                    : "bg-stone-50 border border-stone-100"
                }`}
              >
                <div className="w-7 text-center shrink-0">
                  {isTop3 ? RANK_ICONS[rank as 1 | 2 | 3] : (
                    <span className="text-sm font-bold text-[#78909c]">#{rank}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isYou ? "text-[#00695c]" : "text-[#2c3e2d]"}`}>
                    {entry.studentName ?? "Unknown"}
                    {isYou && (
                      <span className="ml-1.5 text-[10px] bg-[#00695c] text-white px-1.5 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {entry.studentLevel && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#00695c]/10 text-[#00695c]">
                        {entry.studentLevel.toUpperCase()}
                      </span>
                    )}
                    {entry.currentStreak > 0 && (
                      <span className="text-[10px] text-orange-500 flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5" />
                        {entry.currentStreak}d
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-sm font-bold ${isTop3 ? "text-[#00695c]" : "text-[#2c3e2d]"}`}>
                    {entry.totalPoints}
                  </span>
                  <p className="text-[10px] text-[#78909c]">points</p>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[10px] text-[#78909c] text-center mt-4 pt-3 border-t border-stone-100">
          Earn points: Quiz +50 • Vocab +10 • Submission +30 • Streak +5/day
        </p>
      </CardContent>
    </Card>
  );
}
