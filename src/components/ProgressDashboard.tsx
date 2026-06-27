import { useMemo } from "react";
import { trpc } from "@/providers/trpc";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  BookOpen,
  ClipboardCheck,
  Award,
  TrendingUp,
  BarChart3,
  Loader2,
} from "lucide-react";

const levelOrder = ["a1", "a2", "b1", "b2", "c1", "c2"];

export default function ProgressDashboard() {
  const { data, isLoading } = trpc.quiz.progressDashboard.useQuery();

  const chartData = useMemo(() => {
    if (!data?.scoresOverTime) return [];
    const grouped: Record<string, { date: string; score: number; label: string }> = {};
    for (const s of data.scoresOverTime) {
      const d = new Date(s.date).toLocaleDateString();
      if (!grouped[d] || s.score > grouped[d].score) {
        grouped[d] = { date: d, score: s.score, label: s.lessonTitle };
      }
    }
    return Object.values(grouped);
  }, [data]);

  const levelData = useMemo(() => {
    if (!data?.levelBreakdown) return [];
    return data.levelBreakdown
      .filter((l) => levelOrder.includes(l.level))
      .sort((a, b) => levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level))
      .map((l) => ({ level: l.level.toUpperCase(), avgScore: l.avgScore, lessons: l.lessonsCompleted }));
  }, [data]);

  const currentLevelIndex = data?.currentLevel ? levelOrder.indexOf(data.currentLevel) : -1;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#00695c] animate-spin" />
      </div>
    );
  }

  if (!data || data.totalQuizzes === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-12 h-12 text-[#78909c] mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold text-[#2c3e2d] mb-2">No progress yet</h3>
        <p className="text-[#78909c]">Complete some lessons and quizzes to see your progress here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="clay-card border-0">
          <CardContent className="p-4 text-center">
            <BookOpen className="w-5 h-5 text-[#00695c] mx-auto mb-1" />
            <p className="text-xl font-bold text-[#2c3e2d]">{data.lessonsCompleted}</p>
            <p className="text-xs text-[#78909c]">Lessons done</p>
          </CardContent>
        </Card>
        <Card className="clay-card border-0">
          <CardContent className="p-4 text-center">
            <ClipboardCheck className="w-5 h-5 text-[#00695c] mx-auto mb-1" />
            <p className="text-xl font-bold text-[#2c3e2d]">{data.totalQuizzes}</p>
            <p className="text-xs text-[#78909c]">Quizzes taken</p>
          </CardContent>
        </Card>
        <Card className="clay-card border-0">
          <CardContent className="p-4 text-center">
            <Award className="w-5 h-5 text-[#00695c] mx-auto mb-1" />
            <p className="text-xl font-bold text-[#2c3e2d]">{data.avgScore}%</p>
            <p className="text-xs text-[#78909c]">Avg score</p>
          </CardContent>
        </Card>
        <Card className="clay-card border-0">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-5 h-5 text-[#00695c] mx-auto mb-1" />
            <p className="text-xl font-bold text-[#2c3e2d]">{data.currentLevel?.toUpperCase() ?? "—"}</p>
            <p className="text-xs text-[#78909c]">Current level</p>
          </CardContent>
        </Card>
      </div>

      {/* CEFR Milestone bar */}
      <Card className="clay-card border-0">
        <CardContent className="p-5">
          <h3 className="font-semibold text-[#2c3e2d] mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#00695c]" /> CEFR Milestones
          </h3>
          <div className="flex items-center gap-1">
            {levelOrder.map((lvl, i) => {
              const completed = i < currentLevelIndex;
              const current = i === currentLevelIndex;
              return (
                <div key={lvl} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full h-2 rounded-full transition-colors ${
                      completed ? "bg-[#00695c]" : current ? "bg-[#00695c]/50" : "bg-[#e0e0e0]"
                    }`}
                  />
                  <span
                    className={`text-xs font-medium ${
                      completed || current ? "text-[#00695c]" : "text-[#78909c]"
                    }`}
                  >
                    {lvl.toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Score chart */}
      <Card className="clay-card border-0">
        <CardContent className="p-5">
          <h3 className="font-semibold text-[#2c3e2d] mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#00695c]" /> Scores over time
          </h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#78909c" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#78909c" />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  labelStyle={{ fontWeight: 600, color: "#2c3e2d" }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#00695c"
                  strokeWidth={2}
                  dot={{ fill: "#00695c", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-[#78909c] text-center py-8">Not enough data for a chart yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Level breakdown */}
      {levelData.length > 0 && (
        <Card className="clay-card border-0">
          <CardContent className="p-5">
            <h3 className="font-semibold text-[#2c3e2d] mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#00695c]" /> Performance by level
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={levelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="level" tick={{ fontSize: 11 }} stroke="#78909c" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#78909c" />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                />
                <Bar dataKey="avgScore" name="Avg Score" fill="#00695c" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent activity */}
      <Card className="clay-card border-0">
        <CardContent className="p-5">
          <h3 className="font-semibold text-[#2c3e2d] mb-3">Recent quizzes</h3>
          {data.scoresOverTime.slice(-5).reverse().map((s, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-[#e0e0e0] last:border-0">
              <div>
                <p className="text-sm font-medium text-[#2c3e2d]">{s.lessonTitle}</p>
                <p className="text-xs text-[#78909c]">{new Date(s.date).toLocaleDateString()}</p>
              </div>
              <span className={`text-sm font-bold ${s.score >= 70 ? "text-[#00695c]" : "text-amber-600"}`}>
                {s.score}%
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
