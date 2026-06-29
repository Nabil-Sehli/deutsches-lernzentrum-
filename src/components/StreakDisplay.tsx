import { useEffect } from "react";
import { trpc } from "@/providers/trpc";
import { Flame, Loader2, Trophy, CalendarDays } from "lucide-react";

export default function StreakDisplay() {
  const { data: stats, isLoading } = trpc.activity.stats.useQuery();
  const { data: week } = trpc.activity.weekly.useQuery();
  const logActivity = trpc.activity.log.useMutation();

  useEffect(() => {
    logActivity.mutate();
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="flex items-center gap-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-100">
        <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
      </div>
    );
  }

  const maxVal = Math.max(...(week ?? []).map((d) => d.value), 1);

  return (
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${stats.todayActive ? "bg-orange-200" : "bg-orange-100"}`}>
            <Flame className={`w-6 h-6 ${stats.todayActive ? "text-orange-600" : "text-orange-400"}`} />
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-700">
              {stats.currentStreak}
              <span className="text-sm font-normal text-orange-500 ml-1">day streak</span>
            </p>
            <p className="text-xs text-orange-500">
              {stats.todayActive ? "Studied today!" : "Study today to keep your streak"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-orange-500">
          <span className="flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" />
            Best: {stats.longestStreak}
          </span>
          <span className="flex items-center gap-1">
            <CalendarDays className="w-3.5 h-3.5" />
            {stats.totalActiveDays} days
          </span>
        </div>
      </div>

      {/* Weekly heatmap */}
      {week && week.length > 0 && (
        <div className="flex items-end gap-1.5">
          {week.map((day) => (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-md transition-all"
                style={{
                  height: `${Math.max(4, (day.value / maxVal) * 28)}px`,
                  backgroundColor: day.value > 0
                    ? `rgba(234, 88, 12, ${0.2 + (day.value / maxVal) * 0.6})`
                    : "#f5f5f4",
                }}
                title={`${day.date}: ${day.value} activities`}
              />
              <span className="text-[10px] text-orange-400 font-medium">{day.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
