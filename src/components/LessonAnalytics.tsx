import { trpc } from "@/providers/trpc";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  BarChart3,
} from "lucide-react";

interface Props {
  lessonId: number;
  open: boolean;
  onClose: () => void;
}

export default function LessonAnalytics({ lessonId, open, onClose }: Props) {
  const { data, isLoading } = trpc.quiz.lessonAnalytics.useQuery(
    { lessonId },
    { enabled: open }
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl rounded-3xl border-0 shadow-xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl text-[#2c3e2d] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#00695c]" />
            {data?.lessonTitle ?? "Lesson Analytics"}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-[#00695c] animate-spin" />
          </div>
        ) : !data ? (
          <p className="text-center text-[#78909c] py-8">No data available.</p>
        ) : (
          <div className="space-y-4 overflow-y-auto pr-2">
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="clay-card border-0">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-[#2c3e2d]">{data.totalStudents}</p>
                  <p className="text-xs text-[#78909c]">Students</p>
                </CardContent>
              </Card>
              <Card className="clay-card border-0">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-[#00695c]">{data.completedCount}</p>
                  <p className="text-xs text-[#78909c]">Completed</p>
                </CardContent>
              </Card>
              <Card className="clay-card border-0">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-[#2c3e2d]">{data.completionRate}%</p>
                  <p className="text-xs text-[#78909c]">Rate</p>
                </CardContent>
              </Card>
            </div>

            {/* Student list */}
            <div className="space-y-1.5">
              {data.students.length === 0 ? (
                <p className="text-sm text-[#78909c] text-center py-4">No students enrolled.</p>
              ) : (
                data.students.map((s) => (
                  <div
                    key={s.studentId}
                    className="flex items-center justify-between bg-white rounded-xl border border-[#00695c]/10 px-4 py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {s.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-[#00695c] shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-[#78909c] shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#2c3e2d] truncate">
                          {s.studentName ?? "Unknown"}
                        </p>
                        {s.studentLevel && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#00695c]/10 text-[#00695c]">
                            {s.studentLevel.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      {s.completed ? (
                        <>
                          <span
                            className={`text-sm font-bold ${
                              s.bestScore != null && s.bestScore >= 70
                                ? "text-[#00695c]"
                                : "text-amber-600"
                            }`}
                          >
                            {s.bestScore}%
                          </span>
                          <p className="text-[10px] text-[#78909c]">
                            {s.attemptCount} attempt{s.attemptCount > 1 ? "s" : ""}
                          </p>
                        </>
                      ) : (
                        <span className="text-xs text-[#78909c]">Not completed</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
