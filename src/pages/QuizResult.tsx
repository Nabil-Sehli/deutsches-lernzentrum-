import { useParams, Link } from "react-router";
import Navigation from "@/components/Navigation";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  RotateCcw,
  Home,
  Check,
  X,
  Loader2,
  Trophy,
  Target,
} from "lucide-react";

export default function QuizResult() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const id = Number(attemptId);
  useAuth();

  const { data: attempt, isLoading } = trpc.quiz.getAttempt.useQuery(
    { id },
    { enabled: id > 0 }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#e8f5e9] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#00695c] animate-spin" />
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-h-screen bg-[#e8f5e9] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[#2c3e2d] mb-4">
            Result not found
          </h2>
          <Link to="/dashboard">
            <Button className="rounded-full bg-[#00695c]">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);
  const isPass = percentage >= 70;
  const userAnswers = attempt.answers as number[];
  const questions = attempt.questions;

  return (
    <div className="min-h-screen bg-[#e8f5e9]">
      <Navigation />

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-[700px] mx-auto">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-[#78909c] hover:text-[#00695c] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>

          {/* Score Card */}
          <Card
            className={`clay-card border-0 mb-8 ${
              isPass
                ? "bg-gradient-to-br from-[#00695c] to-[#004d40]"
                : "bg-gradient-to-br from-amber-500 to-amber-600"
            }`}
          >
            <CardContent className="p-10 text-center">
              <div className="w-20 h-20 rounded-full bg-white/15 flex items-center justify-center mx-auto mb-6">
                {isPass ? (
                  <Trophy className="w-10 h-10 text-white" />
                ) : (
                  <Target className="w-10 h-10 text-white" />
                )}
              </div>

              <h1 className="text-3xl font-bold text-white mb-2">
                {isPass ? "Great Job!" : "Keep Practicing!"}
              </h1>
              <p className="text-white/80 mb-6">
                {attempt.lessonTitle}
              </p>

              <div className="flex items-center justify-center gap-8">
                <div>
                  <p className="text-4xl font-bold text-white">
                    {attempt.score}/{attempt.totalQuestions}
                  </p>
                  <p className="text-sm text-white/70">Correct Answers</p>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div>
                  <p
                    className={`text-4xl font-bold ${
                      isPass ? "text-[#81c784]" : "text-amber-200"
                    }`}
                  >
                    {percentage}%
                  </p>
                  <p className="text-sm text-white/70">Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Review */}
          <h2 className="text-xl font-semibold text-[#2c3e2d] mb-4">
            Answer Review
          </h2>

          <div className="space-y-4 mb-8">
            {questions.map((q, i) => {
              const userAnswer = userAnswers[i];
              const isCorrect = userAnswer === q.correctAnswerIndex;

              return (
                <Card key={q.id} className="clay-card border-0">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                          isCorrect
                            ? "bg-[#81c784]/20 text-[#00695c]"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {isCorrect ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </div>
                      <h3 className="font-medium text-[#2c3e2d] pt-0.5">
                        {q.text}
                      </h3>
                    </div>

                    <div className="ml-10 space-y-2">
                      {(q.options as string[]).map((opt, j) => (
                        <div
                          key={j}
                          className={`p-3 rounded-xl text-sm flex items-center gap-2 ${
                            j === q.correctAnswerIndex
                              ? "bg-[#81c784]/15 text-[#00695c] font-medium border border-[#81c784]/30"
                              : j === userAnswer && !isCorrect
                              ? "bg-red-50 text-red-600 border border-red-200"
                              : "bg-gray-50 text-[#78909c]"
                          }`}
                        >
                          <span className="text-xs font-bold w-5">
                            {String.fromCharCode(65 + j)}
                          </span>
                          {opt}
                          {j === q.correctAnswerIndex && (
                            <Check className="w-4 h-4 ml-auto text-[#81c784]" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <Link to={`/lessons/${attempt.lessonId}/quiz`}>
              <Button
                variant="outline"
                className="rounded-full border-[#00695c]/15 hover:bg-[#00695c]/6"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Retake Quiz
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button className="rounded-full bg-[#00695c] hover:bg-[#004d40]">
                <Home className="w-4 h-4 mr-1" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
