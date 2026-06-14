import { useParams, Link } from "react-router";
import Navigation from "@/components/Navigation";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LessonDetailSkeleton } from "@/components/LessonDetailSkeleton";
import {
  ArrowLeft,
  PlayCircle,
  ClipboardCheck,
  AlertCircle,
} from "lucide-react";

function getYouTubeEmbedUrl(url: string): string {
  if (url.includes("youtube.com/watch?v=")) {
    const videoId = url.split("v=")[1]?.split("&")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  }
  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1]?.split("?")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  }
  return url;
}

export default function LessonDetail() {
  const { id } = useParams<{ id: string }>();
  const lessonId = Number(id);
  const { user } = useAuth();

  const { data: lesson, isLoading } = trpc.lesson.getById.useQuery(
    { id: lessonId },
    { enabled: lessonId > 0 }
  );

  const { data: attempts } = trpc.quiz.lessonAttempts.useQuery(
    { lessonId },
    { enabled: lessonId > 0 && !!user }
  );

  if (!lessonId || isNaN(lessonId)) {
    return (
      <div className="min-h-screen bg-[#e8f5e9] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-[#78909c] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#2c3e2d] mb-2">
            Invalid lesson ID
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
    return <LessonDetailSkeleton />;
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-[#e8f5e9] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-[#78909c] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#2c3e2d] mb-2">
            Lesson not found
          </h2>
          <Link
            to="/dashboard"
            className="text-[#00695c] hover:underline flex items-center gap-1 justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const hasQuestions = lesson.questions && lesson.questions.length > 0;
  const bestAttempt = attempts?.length
    ? attempts.reduce((best, a) => {
        const scorePct = a.score / a.totalQuestions;
        const bestPct = best.score / best.totalQuestions;
        return scorePct > bestPct ? a : best;
      })
    : null;

  return (
    <div className="min-h-screen bg-[#e8f5e9]">
      <Navigation />

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-[900px] mx-auto">
          <Link
            to={user?.role === "teacher" ? "/admin" : "/dashboard"}
            className="inline-flex items-center gap-1 text-sm text-[#78909c] hover:text-[#00695c] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>

          <h1 className="text-3xl font-bold text-[#2c3e2d] mb-2">
            {lesson.title}
          </h1>
          {lesson.description && (
            <p className="text-[#78909c] mb-6">{lesson.description}</p>
          )}

          {/* Video Player */}
          <div className="clay-card overflow-hidden mb-6">
            <div className="aspect-video bg-black">
              <iframe
                src={getYouTubeEmbedUrl(lesson.videoUrl)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={lesson.title}
              />
            </div>
          </div>

          {/* Quiz Section */}
          {hasQuestions && (
            <Card className="clay-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#00695c]/8 flex items-center justify-center">
                      <ClipboardCheck className="w-6 h-6 text-[#00695c]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#2c3e2d]">
                        Quiz: {lesson.title}
                      </h3>
                      <p className="text-sm text-[#78909c]">
                        {lesson.questions.length} question
                        {lesson.questions.length !== 1 ? "s" : ""}
                        {bestAttempt && (
                          <span className="ml-2 text-[#00695c] font-medium">
                            Best: {Math.round((bestAttempt.score / bestAttempt.totalQuestions) * 100)}%
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Link to={`/lessons/${lesson.id}/quiz`}>
                    <Button className="rounded-full bg-[#00695c] hover:bg-[#004d40] font-semibold px-6">
                      <PlayCircle className="w-4 h-4 mr-2" />
                      {bestAttempt ? "Retake Quiz" : "Start Quiz"}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {!hasQuestions && user?.role === "teacher" && (
            <Card className="clay-card border-0 p-8 text-center">
              <ClipboardCheck className="w-10 h-10 text-[#78909c] mx-auto mb-3" />
              <p className="text-[#78909c] mb-2">
                No quiz questions added yet.
              </p>
              <Link
                to="/admin"
                className="text-[#00695c] hover:underline text-sm"
              >
                Go to Admin to add questions
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
