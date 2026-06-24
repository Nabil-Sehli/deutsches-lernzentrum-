import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { trpc } from "@/providers/trpc";
import { CountdownTimer } from "@/components/CountdownTimer";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";
import { VideoCall } from "@/components/VideoCall";
import {
  GraduationCap,
  PlayCircle,
  ClipboardCheck,
  Award,
  KeyRound,
  BookOpen,
  ArrowRight,
  Sparkles,
  Loader2,
  MapPin,
  Phone,
  MessageSquare,
  Send,
  Plus,
  MoreHorizontal,
  Trash2,
  ExternalLink,
  Video,
  ClipboardList,
  Bell,
  AlertTriangle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  redeemInviteSchema,
  type RedeemInviteForm,
} from "@/lib/form-schemas";

export default function Dashboard() {
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuth({
    redirectOnUnauthenticated: true,
  });
  const location = useLocation();
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [callRoom, setCallRoom] = useState<string | null>(null);
  const { data: meetingRooms } = trpc.meetingRooms.listByCenter.useQuery(
    { centerId: user?.centerId ?? 0 },
    { enabled: !!user?.centerId }
  );

  const form = useForm<RedeemInviteForm>({
    resolver: zodResolver(redeemInviteSchema),
    defaultValues: {
      code: "",
    },
  });

  const {
    data: lessons,
    isLoading: lessonsLoading,
  } = trpc.lesson.myLessons.useQuery(undefined, {
    enabled: !!user && !!user.centerId,
  });

  const {
    data: attempts,
  } = trpc.quiz.myAttempts.useQuery(undefined, {
    enabled: !!user,
  });

  const {
    data: myCenter,
    isLoading: centerLoading,
  } = trpc.invite.myCenter.useQuery(undefined, {
    enabled: !!user,
  });

  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash.slice(1));
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [location.hash]);

  const utils = trpc.useUtils();
  const redeemMutation = trpc.invite.redeem.useMutation({
    onSuccess: () => {
      form.reset({ code: "" });
      setRedeemOpen(false);
      utils.invalidate();
    },
  });

  const onSubmit = (data: RedeemInviteForm) => {
    redeemMutation.mutate({ code: data.code.toUpperCase() });
  };

  if (authLoading) {
    return <DashboardSkeleton />;
  }

  if (!user) return null;

  const totalQuizzes = attempts?.length ?? 0;
  const avgScore =
    totalQuizzes > 0
      ? Math.round(
          attempts!.reduce(
            (acc, a) => acc + (a.score / a.totalQuestions) * 100,
            0
          ) / totalQuizzes
        )
      : 0;

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#2c3e2d]">
              {t("dashboard.greeting", { name: user.title ? `${user.title}. ${user.name ?? "Student"}` : (user.name ?? "Student") })}
            </h1>
            <p className="text-[#78909c] mt-1">
              {myCenter
                ? t("dashboard.learningAt", { name: myCenter.name })
                : t("dashboard.joinCenter")}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card className="clay-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#00695c]/8 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-[#00695c]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#00695c]">
                      {lessons?.length ?? 0}
                    </p>
                    <p className="text-sm text-[#78909c]">{t("dashboard.lessons")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="clay-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#81c784]/20 flex items-center justify-center">
                    <ClipboardCheck className="w-6 h-6 text-[#00695c]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#00695c]">
                      {totalQuizzes}
                    </p>
                    <p className="text-sm text-[#78909c]">{t("dashboard.quizzesTaken")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="clay-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#004d40]/10 flex items-center justify-center">
                    <Award className="w-6 h-6 text-[#00695c]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#00695c]">
                      {avgScore}%
                    </p>
                    <p className="text-sm text-[#78909c]">{t("dashboard.avgScore")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Loading */}
          {centerLoading && (
            <Card className="clay-card border-0 mb-8 overflow-hidden">
              <div className="h-32 sm:h-40 w-full bg-[#00695c]/5 animate-pulse" />
              <CardContent className="p-6">
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-[#00695c]/8 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-6 w-48 bg-[#00695c]/8 rounded-lg animate-pulse" />
                    <div className="h-4 w-full bg-[#00695c]/8 rounded-lg animate-pulse" />
                    <div className="h-4 w-3/4 bg-[#00695c]/8 rounded-lg animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Center Info */}
          {myCenter && (
            <Card className="clay-card border-0 mb-8 overflow-hidden relative pt-0">
              {myCenter.banner ? (
                <div className="h-32 sm:h-44 w-full relative overflow-hidden">
                  <img
                    src={myCenter.banner}
                    alt=""
                    className="w-full h-full object-cover"
                    style={{
                      maskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
                      WebkitMaskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              ) : (
                <div className="h-20 sm:h-24 w-full" style={{ backgroundColor: myCenter.themeColor ?? "#e8f5e9" }} />
              )}
              <CardContent className="px-6 pb-6 pt-0 relative">
                <div className="flex items-end -mt-10 sm:-mt-12 gap-4 relative z-10">
                  {myCenter.logo ? (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-4 border-white shadow-xl shrink-0 bg-white">
                      <img
                        src={myCenter.logo}
                        alt={`${myCenter.name} logo`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-4 border-white shadow-xl shrink-0 bg-white flex items-center justify-center">
                      <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10 text-[#00695c]" />
                    </div>
                  )}
                </div>
                <div className="mt-3 sm:mt-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl sm:text-2xl font-bold text-[#2c3e2d]">
                        {myCenter.name}
                      </h2>
                      {myCenter.slug && (
                        <Link
                          to={`/c/${myCenter.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#00695c] hover:text-[#004d40] transition-colors bg-[#00695c]/8 px-2.5 py-1 rounded-full hover:bg-[#00695c]/15"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Page
                        </Link>
                      )}
                    </div>
                    {myCenter.description && (
                      <p className="text-sm text-[#78909c] mt-1.5 leading-relaxed max-w-2xl">
                        {myCenter.description}
                      </p>
                    )}
                  </div>
                </div>
                {(myCenter.address || myCenter.phone) && (
                  <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 pt-4 border-t border-[#00695c]/8">
                    {myCenter.address && (
                      <span className="flex items-center gap-1.5 text-xs text-[#78909c]">
                        <MapPin className="w-3.5 h-3.5 text-[#00695c]" />
                        {myCenter.address}
                      </span>
                    )}
                    {myCenter.phone && (
                      <span className="flex items-center gap-1.5 text-xs text-[#78909c]">
                        <Phone className="w-3.5 h-3.5 text-[#00695c]" />
                        {myCenter.phone}
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* No Center State */}
          {!centerLoading && !myCenter && (
            <Card className="clay-card border-0 mb-8 bg-gradient-to-r from-[#00695c] to-[#004d40]">
              <CardContent className="p-8 flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                  <KeyRound className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {t("dashboard.joinLearningCenter")}
                  </h3>
                  <p className="text-white/80 mb-4">
                    {t("dashboard.joinDesc")}
                  </p>
                </div>
                <Dialog open={redeemOpen} onOpenChange={setRedeemOpen}>
                  <DialogTrigger asChild>
                    <Button className="rounded-full bg-white text-[#00695c] hover:bg-[#e8f5e9] font-semibold px-6">
                      <Sparkles className="w-4 h-4 mr-2" />
                      {t("dashboard.redeemCode")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-3xl border-0 shadow-xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl text-[#2c3e2d]">
                        {t("dashboard.enterInviteCode")}
                      </DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="pt-4">
                        <FormField
                          control={form.control}
                          name="code"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder={t("dashboard.codePlaceholder")}
                                  className="rounded-2xl h-12 text-center text-lg tracking-widest uppercase border-[#00695c]/15 focus:border-[#00695c]"
                                  maxLength={32}
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {redeemMutation.error && (
                          <p className="text-sm text-red-500 mt-2 text-center">
                            {redeemMutation.error.message}
                          </p>
                        )}
                        {redeemMutation.isSuccess && (
                          <p className="text-sm text-green-600 mt-2 text-center font-medium">
                            {t("dashboard.joinedSuccess", { name: redeemMutation.data.centerName })}
                          </p>
                        )}
                        <Button
                          type="submit"
                          className="w-full mt-4 rounded-full bg-[#00695c] hover:bg-[#004d40] h-11 font-semibold"
                          disabled={redeemMutation.isPending}
                        >
                          {redeemMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            t("dashboard.joinCenter")
                          )}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}

          {/* Level Needed Warning */}
          {myCenter && user.role === "student" && !user.level && (
            <LevelNeededCard />
          )}

          {/* Lessons */}
          {myCenter && (user.role !== "student" || user.level) && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#2c3e2d] flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#00695c]" />
                  {t("dashboard.yourLessons")}
                </h2>
              </div>

              {lessonsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="clay-card p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gray-200 animate-pulse shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-5 w-3/4 bg-gray-200 rounded-lg animate-pulse" />
                          <div className="h-4 w-full bg-gray-200 rounded-lg animate-pulse" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !lessons || lessons.length === 0 ? (
                <Card className="clay-card border-0 p-12 text-center">
                  <BookOpen className="w-12 h-12 text-[#78909c] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[#2c3e2d] mb-2">
                    {t("dashboard.noLessonsTitle")}
                  </h3>
                  <p className="text-[#78909c]">
                    {t("dashboard.noLessonsDesc")}
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                  {lessons.map((lesson) => {
                    const lessonAttempts =
                      attempts?.filter((a) => a.lessonId === lesson.id) ?? [];
                    const bestScore =
                      lessonAttempts.length > 0
                        ? Math.max(
                            ...lessonAttempts.map(
                              (a) => (a.score / a.totalQuestions) * 100
                            )
                          )
                        : 0;

                    return (
                      <Link
                        key={lesson.id}
                        to={`/lessons/${lesson.id}`}
                        className="clay-card clay-card-hover p-6 block"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-[#00695c]/8 flex items-center justify-center shrink-0">
                            <PlayCircle className="w-6 h-6 text-[#00695c]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-[#2c3e2d] truncate mb-1">
                              {lesson.title}
                            </h3>
                            <p className="text-sm text-[#78909c] line-clamp-2 mb-3">
                              {lesson.description}
                            </p>
                            {bestScore > 0 && (
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={bestScore}
                                  className="h-2 flex-1 bg-[#00695c]/10"
                                />
                                <span className="text-xs font-medium text-[#00695c]">
                                  {Math.round(bestScore)}%
                                </span>
                              </div>
                            )}
                          </div>
                          <ArrowRight className="w-5 h-5 text-[#78909c] shrink-0 self-center" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Quiz History */}
          {attempts && attempts.length > 0 && (
            <>
              <h2 className="text-xl font-semibold text-[#2c3e2d] mb-6 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-[#00695c]" />
                {t("dashboard.quizHistory")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {attempts.slice(0, 6).map((attempt) => (
                  <Card key={attempt.id} className="clay-card border-0">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-[#2c3e2d]">
                            {attempt.lessonTitle}
                          </p>
                          <p className="text-xs text-[#78909c] mt-1">
                            {new Date(attempt.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-lg font-bold ${
                              (attempt.score / attempt.totalQuestions) * 100 >=
                              70
                                ? "text-[#00695c]"
                                : "text-amber-600"
                            }`}
                          >
                            {attempt.score}/{attempt.totalQuestions}
                          </span>
                          <p className="text-xs text-[#78909c]">
                            {Math.round(
                              (attempt.score / attempt.totalQuestions) * 100
                            )}
                            %
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Assignments */}
          {myCenter && user?.role === "student" && user?.level && (
            <StudentAssignments />
          )}

          {/* Meeting Rooms */}
          {meetingRooms && meetingRooms.length > 0 && (
            <div className="mt-12">
              <VideoCall roomUrl={callRoom ?? ""} open={!!callRoom} onClose={() => setCallRoom(null)} />
              <h2 className="text-xl font-semibold text-[#2c3e2d] mb-6 flex items-center gap-2">
                <Video className="w-5 h-5 text-[#00695c]" />
                Meeting Rooms
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                {meetingRooms.map((room) => (
                  <Card key={room.id} className="clay-card border-0">
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-[#2c3e2d] mb-1">{room.name}</h3>
                      {room.description && (
                        <p className="text-sm text-[#78909c] mb-3">{room.description}</p>
                      )}
                      {room.scheduledAt && (
                        <p className="text-xs text-[#78909c] mb-3">
                          {new Date(room.scheduledAt).toLocaleString()}
                        </p>
                      )}
                      <button
                        onClick={() => setCallRoom(room.url)}
                        className="text-sm bg-[#00695c] text-white px-4 py-1.5 rounded-full hover:bg-[#004d40] transition-colors font-medium"
                      >
                        Join Call
                      </button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Chat */}
          {myCenter && (user.role !== "student" || user.level) && <StudentChat />}
        </div>
      </div>
    </div>
  );
}

function StudentAssignments() {
  const utils = trpc.useUtils();
  const { data } = trpc.assignments.myAssignments.useQuery();
  const submitAssignment = trpc.assignments.submit.useMutation({
    onSuccess: () => utils.assignments.myAssignments.invalidate(),
  });
  const [selectedAssignment, setSelectedAssignment] = useState<number | null>(null);
  const [text, setText] = useState("");

  if (!data || data.length === 0) return null;

  const handleSubmit = (assignmentId: number) => {
    if (!text.trim()) return;
    submitAssignment.mutate({ assignmentId, text: text.trim() });
    setText("");
    setSelectedAssignment(null);
  };

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold text-[#2c3e2d] mb-6 flex items-center gap-2">
        <ClipboardList className="w-5 h-5 text-[#00695c]" />
        Assignments
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        {data.map((a) => {
          const submitted = !!a.submission;
          const graded = a.submission?.grade != null;
          const isExpired = a.dueDate && new Date(a.dueDate) < new Date();

          return (
            <Card key={a.id} className="clay-card border-0">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#2c3e2d]">{a.title}</h3>
                    {a.description && <p className="text-sm text-[#78909c] mt-1">{a.description}</p>}
                    {a.dueDate && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-[#78909c]">Due:</span>
                        <CountdownTimer dueDate={a.dueDate} />
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      {submitted ? (
                        <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                          ✓ Submitted
                          {graded && ` — Grade: ${a.submission!.grade}/100`}
                        </span>
                      ) : isExpired ? (
                        <span className="text-xs text-red-500 font-medium">Expired</span>
                      ) : (
                        <button
                          onClick={() => setSelectedAssignment(selectedAssignment === a.id ? null : a.id)}
                          className="text-xs bg-[#00695c] text-white px-3 py-1.5 rounded-full hover:bg-[#004d40] transition-colors font-medium"
                        >
                          Submit
                        </button>
                      )}
                    </div>
                    {graded && a.submission!.feedback && (
                      <p className="text-xs text-[#445E5D] mt-2 bg-[#F0F7F4] rounded-lg p-2 whitespace-pre-wrap">
                        <span className="font-medium">Feedback:</span> {a.submission!.feedback}
                      </p>
                    )}
                    {selectedAssignment === a.id && !submitted && !isExpired && (
                      <div className="mt-3 space-y-2">
                        <textarea
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          placeholder="Type your answer..."
                          className="flex min-h-[80px] w-full rounded-xl border border-[#00695c]/15 bg-white px-4 py-3 text-sm"
                        />
                        <Button
                          onClick={() => handleSubmit(a.id)}
                          disabled={submitAssignment.isPending || !text.trim()}
                          className="rounded-full bg-[#00695c] hover:bg-[#004d40] text-xs h-8 px-4"
                        >
                          {submitAssignment.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Submit Answer"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function LevelNeededCard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const remindLevel = trpc.center.remindLevel.useMutation();

  const levelRequestedAt = user?.levelRequestedAt ? new Date(user.levelRequestedAt) : null;
  const twoHours = 2 * 60 * 60 * 1000;
  const cooldownEnd = levelRequestedAt ? new Date(levelRequestedAt.getTime() + twoHours) : null;
  const [remaining, setRemaining] = useState(
    cooldownEnd ? Math.max(0, cooldownEnd.getTime() - Date.now()) : 0
  );
  const isCooldown = remaining > 0;

  useEffect(() => {
    if (!cooldownEnd || cooldownEnd.getTime() <= Date.now()) return;
    const interval = setInterval(() => {
      setRemaining(Math.max(0, cooldownEnd.getTime() - Date.now()));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownEnd]);

  const formatTime = (ms: number) => {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const handleRemind = () => {
    remindLevel.mutate(undefined, {
      onSuccess: () => {
        utils.invalidate();
      },
    });
  };

  return (
    <Card className="clay-card border-0 mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[#2c3e2d] mb-1">
              {t("dashboard.noLevelTitle")}
            </h3>
            <p className="text-sm text-[#78909c] mb-4">
              {t("dashboard.noLevelDesc")}
            </p>
            {isCooldown ? (
              <div className="text-xs text-amber-600 font-medium">
                {t("dashboard.remindCooldown", { time: formatTime(remaining) })}
              </div>
            ) : (
              <Button
                onClick={handleRemind}
                disabled={remindLevel.isPending}
                className="rounded-full bg-[#00695c] hover:bg-[#004d40] text-sm h-9 px-5"
              >
                {remindLevel.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <Bell className="w-4 h-4 mr-1" />
                )}
                {t("dashboard.remindTeacher")}
              </Button>
            )}
            {remindLevel.isSuccess && (
              <p className="text-xs text-green-600 font-medium mt-2">
                {t("dashboard.remindSent")}
              </p>
            )}
            {remindLevel.isError && (
              <p className="text-xs text-red-500 font-medium mt-2">
                {remindLevel.error.message}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const EMOJI_LIST = ["👍", "❤️", "😂", "🎉", "🔥", "😮", "🙏", "💯"];

function StudentChat() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [chatLevelFilter, setChatLevelFilter] = useState<string | null>(null);
  const { data: messages, isLoading } = trpc.chat.list.useQuery(
    chatLevelFilter ? { level: chatLevelFilter as "a1" | "a2" | "b1" | "b2" | "c1" | "c2" } : undefined,
    { refetchInterval: 3000 }
  );
  const sendMessage = trpc.chat.send.useMutation({
    onSuccess: () => utils.chat.list.invalidate(),
  });
  const deleteMessage = trpc.chat.delete.useMutation({
    onSuccess: () => utils.chat.list.invalidate(),
  });
  const reactMessage = trpc.chat.react.useMutation({
    onSuccess: () => utils.chat.list.invalidate(),
  });
  const getPresignedUrl = trpc.upload.getChatUploadUrl.useMutation();
  const [text, setText] = useState("");
  const [pendingImage, setPendingImage] = useState<{ file: File; preview: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [emojiPicker, setEmojiPicker] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isNearBottom = useRef(true);

  useEffect(() => {
    if (isNearBottom.current) {
      chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  const onChatScroll = useCallback(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    isNearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  }, []);

  useEffect(() => {
    return () => { if (pendingImage) URL.revokeObjectURL(pendingImage.preview); };
  }, [pendingImage]);

  const handleSend = async () => {
    if (!text.trim() && !pendingImage) return;
    const level = (chatLevelFilter ?? user?.level) as "a1" | "a2" | "b1" | "b2" | "c1" | "c2" | undefined;
    if (pendingImage) {
      setUploading(true);
      try {
        const { uploadUrl, publicUrl } = await getPresignedUrl.mutateAsync({
          fileName: pendingImage.file.name,
          contentType: pendingImage.file.type,
          fileSize: pendingImage.file.size,
        });
        await fetch(uploadUrl, { method: "PUT", body: pendingImage.file, headers: { "Content-Type": pendingImage.file.type } });
        sendMessage.mutate({ message: text.trim(), imageUrl: publicUrl, level });
      } catch (err) {
        console.error("Upload failed", err);
        setUploading(false);
        return;
      }
      setUploading(false);
      setPendingImage(null);
    } else {
      sendMessage.mutate({ message: text.trim(), level });
    }
    setText("");
    isNearBottom.current = true;
    setTimeout(() => chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: "smooth" }), 50);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (pendingImage) URL.revokeObjectURL(pendingImage.preview);
    setPendingImage({ file, preview: URL.createObjectURL(file) });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div id="chat" className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[#2c3e2d] flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#00695c]" />
          {t("admin.tabChat")}
        </h2>
        <select
          value={chatLevelFilter ?? ""}
          onChange={(e) => setChatLevelFilter(e.target.value || null)}
          className="h-9 rounded-xl border border-[#00695c]/15 bg-white px-3 text-sm text-[#2c3e2d]"
        >
          <option value="">{t("admin.allLevels")}</option>
          {user?.level && (
            <option value={user.level}>{user.level.toUpperCase()}</option>
          )}
        </select>
      </div>

      <Card className="clay-card border-0 relative overflow-hidden">
        <CardContent className="p-4 relative">
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
            <svg className="w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
              <defs>
                <pattern id="chat-contour-s" patternUnits="userSpaceOnUse" width="120" height="80" patternTransform="scale(1.5)">
                  <path d="M0,40 Q30,20 60,40 T120,40" fill="none" stroke="#00695c" strokeWidth="2" />
                  <path d="M0,20 Q30,0 60,20 T120,20" fill="none" stroke="#00695c" strokeWidth="1.5" opacity="0.6" />
                  <path d="M0,60 Q30,40 60,60 T120,60" fill="none" stroke="#00695c" strokeWidth="1.5" opacity="0.6" />
                  <path d="M0,0 Q30,-20 60,0 T120,0" fill="none" stroke="#00695c" strokeWidth="1" opacity="0.3" />
                  <path d="M0,80 Q30,60 60,80 T120,80" fill="none" stroke="#00695c" strokeWidth="1" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#chat-contour-s)" />
            </svg>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />

          <Dialog open={!!lightboxUrl} onOpenChange={(o) => !o && setLightboxUrl(null)}>
            <DialogContent className="max-w-3xl border-0 bg-transparent shadow-none">
              {lightboxUrl && <img src={lightboxUrl} alt="" className="w-full rounded-2xl" />}
            </DialogContent>
          </Dialog>

          <div ref={chatContainerRef} onScroll={onChatScroll} className="h-[400px] overflow-y-auto space-y-3 mb-4 pr-2">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-[#00695c]" />
              </div>
            ) : !messages || messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare className="w-10 h-10 text-[#78909c] mb-2" />
                <p className="text-sm text-[#78909c]">No messages yet.</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.userId === user?.id;
                const userReacted = (emoji: string) =>
                  (msg.reactions as { emoji: string; userId: number }[])?.some(
                    (r) => r.emoji === emoji && r.userId === user?.id
                  );

                return (
                  <div key={msg.id} className={`group flex gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                      isOwn
                        ? "bg-[#00695c] text-white rounded-tr-md"
                        : "bg-white text-[#2c3e2d] rounded-tl-md border border-[#00695c]/10"
                    }`}>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-medium opacity-70 mb-1">
                          {msg.userName ?? "Unknown"}
                        </p>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-black/10">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align={isOwn ? "end" : "start"} className="rounded-xl border-0 shadow-xl min-w-[140px]">
                            <DropdownMenuItem className="relative" onSelect={(e) => { e.preventDefault(); setEmojiPicker(emojiPicker === msg.id ? null : msg.id); }}>
                              <span className="mr-2">😊</span> React
                              {emojiPicker === msg.id && (
                                <div className="absolute left-0 top-full mt-1 z-50 flex gap-1 p-2 bg-white rounded-xl shadow-xl border">
                                  {EMOJI_LIST.map((emoji) => (
                                    <button
                                      key={emoji}
                                      onClick={() => { reactMessage.mutate({ id: msg.id, emoji }); setEmojiPicker(null); }}
                                      className={`text-lg hover:scale-125 transition-transform p-0.5 ${userReacted(emoji) ? "scale-110" : ""}`}
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </DropdownMenuItem>
                            {isOwn && (
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => deleteMessage.mutate({ id: msg.id })}
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {msg.imageUrl && (
                        <img
                          src={msg.imageUrl}
                          alt=""
                          className="max-w-full rounded-lg mb-1 max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setLightboxUrl(msg.imageUrl!)}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      )}
                      {msg.message && <p className="text-sm">{msg.message}</p>}

                      {(msg.reactions as { emoji: string; userId: number; userName: string }[])?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {(msg.reactions as { emoji: string; userId: number; userName: string }[]).map((r, i) => (
                            <button
                              key={i}
                              onClick={() => reactMessage.mutate({ id: msg.id, emoji: r.emoji })}
                              className={`text-xs px-1.5 py-0.5 rounded-full border ${
                                r.userId === user?.id
                                  ? "bg-white/20 border-white/30"
                                  : "bg-white/10 border-transparent"
                              }`}
                              title={r.userName}
                            >
                              {r.emoji}
                            </button>
                          ))}
                        </div>
                      )}

                      <p className="text-[10px] opacity-50 mt-1 text-right">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="flex items-center gap-2 border-t border-[#00695c]/10 pt-4">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="rounded-full bg-[#00695c]/10 text-[#00695c] hover:bg-[#00695c]/20 h-11 w-11 p-0 shrink-0"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </Button>
            {pendingImage && (
              <div className="relative shrink-0">
                <img src={pendingImage.preview} alt="" className="h-10 w-10 rounded-lg object-cover border border-[#00695c]/20" />
                <button
                  onClick={() => { URL.revokeObjectURL(pendingImage.preview); setPendingImage(null); }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>
            )}
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={pendingImage ? "Add a caption..." : "Type a message..."}
              className="flex-1 h-11 rounded-xl border border-[#00695c]/15 bg-white px-4 text-sm"
            />
            <Button
              onClick={handleSend}
              disabled={sendMessage.isPending || uploading || (!text.trim() && !pendingImage)}
              className="rounded-full bg-[#00695c] hover:bg-[#004d40] h-11 w-11 p-0 shrink-0"
            >
              {sendMessage.isPending || uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
