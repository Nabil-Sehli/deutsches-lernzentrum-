import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import Navigation from "@/components/Navigation";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { QuizPageSkeleton } from "@/components/QuizPageSkeleton";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  AlertCircle,
  Flag,
} from "lucide-react";

export default function QuizPage() {
  const { id } = useParams<{ id: string }>();
  const lessonId = Number(id);
  const navigate = useNavigate();
  useAuth({ redirectOnUnauthenticated: true });

  const { data: lesson, isLoading } = trpc.lesson.getById.useQuery(
    { id: lessonId },
    { enabled: lessonId > 0 }
  );

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const submitMutation = trpc.quiz.submit.useMutation({
    onSuccess: (data) => {
      navigate(`/quiz/${data.attemptId}`);
    },
  });

  if (!lessonId || isNaN(lessonId)) {
    return (
      <div className="min-h-screen bg-[#e8f5e9] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-[#78909c] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#2c3e2d] mb-2">
            Invalid quiz ID
          </h2>
          <Link
            to="/dashboard"
            className="text-[#00695c] hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <QuizPageSkeleton />;
  }

  if (!lesson || !lesson.questions || lesson.questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#e8f5e9] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-[#78909c] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#2c3e2d] mb-2">
            No questions available
          </h2>
          <Link
            to={`/lessons/${lessonId}`}
            className="text-[#00695c] hover:underline"
          >
            Back to Lesson
          </Link>
        </div>
      </div>
    );
  }

  const questions = lesson.questions;
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const q = questions[currentQuestion];

  const handleNext = () => {
    if (selectedOption === null) return;
    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitMutation.mutate({ lessonId, answers: newAnswers });
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      const newAnswers = answers.slice(0, -1);
      setAnswers(newAnswers);
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(answers[currentQuestion - 1] ?? null);
    }
  };

  return (
    <div className="min-h-screen bg-[#e8f5e9]">
      <Navigation />

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-[700px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              to={`/lessons/${lessonId}`}
              className="inline-flex items-center gap-1 text-sm text-[#78909c] hover:text-[#00695c] mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Lesson
            </Link>
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl font-semibold text-[#2c3e2d]">
                Quiz: {lesson.title}
              </h1>
              <span className="text-sm text-[#78909c]">
                {currentQuestion + 1} of {questions.length}
              </span>
            </div>
            <Progress
              value={progress}
              className="h-2.5 bg-[#00695c]/10"
            />
          </div>

          {/* Question */}
          <div className="clay-card p-8 mb-6">
            <div className="flex items-start gap-3 mb-6">
              <span className="w-8 h-8 rounded-full bg-[#00695c] text-white flex items-center justify-center text-sm font-bold shrink-0">
                {currentQuestion + 1}
              </span>
              <h2 className="text-lg font-medium text-[#2c3e2d] leading-relaxed pt-0.5">
                {q.text}
              </h2>
            </div>

            <div className="space-y-3 ml-11">
              {(q.options ?? []).map((option, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedOption(i)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-3 ${
                    selectedOption === i
                      ? "border-[#00695c] bg-[#00695c]/5"
                      : "border-transparent bg-[#f5f5f5] hover:bg-[#00695c]/5 hover:border-[#00695c]/20"
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                      selectedOption === i
                        ? "border-[#00695c] bg-[#00695c] text-white"
                        : "border-[#78909c]/30 text-[#78909c]"
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-[#2c3e2d]">{option}</span>
                  {selectedOption === i && (
                    <Check className="w-5 h-5 text-[#00695c] ml-auto shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="rounded-full border-[#00695c]/15 hover:bg-[#00695c]/6"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            {submitMutation.isPending ? (
              <Button
                disabled
                className="rounded-full bg-[#00695c] px-6"
              >
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Submitting...
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={selectedOption === null}
                className="rounded-full bg-[#00695c] hover:bg-[#004d40] px-6 font-semibold"
              >
                {currentQuestion < questions.length - 1 ? (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  <>
                    <Flag className="w-4 h-4 mr-1" />
                    Finish
                  </>
                )}
              </Button>
            )}
          </div>

          {submitMutation.error && (
            <p className="text-center text-red-500 mt-4 text-sm">
              {submitMutation.error.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
