import { useState } from "react";
import { Link } from "react-router";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { trpc } from "@/providers/trpc";
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
} from "lucide-react";
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
  const [redeemOpen, setRedeemOpen] = useState(false);

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
    <div className="min-h-screen bg-[#e8f5e9]">
      <Navigation />

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#2c3e2d]">
              {t("dashboard.greeting", { name: user.name ?? "Student" })}
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
            <Card className="clay-card border-0 mb-8 overflow-hidden">
              {myCenter.banner && (
                <div className="h-32 sm:h-40 w-full bg-[#00695c]/5">
                  <img
                    src={myCenter.banner}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex items-start gap-5">
                  {myCenter.logo ? (
                    <div className="w-16 h-16 rounded-2xl bg-[#00695c]/8 flex items-center justify-center shrink-0 overflow-hidden">
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
                    <div className="w-16 h-16 rounded-2xl bg-[#00695c]/8 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-8 h-8 text-[#00695c]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-[#2c3e2d]">
                      {myCenter.name}
                    </h2>
                    {myCenter.description && (
                      <p className="text-sm text-[#78909c] mt-1.5 leading-relaxed">
                        {myCenter.description}
                      </p>
                    )}
                    {(myCenter.address || myCenter.phone) && (
                      <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-xs text-[#78909c]">
                        {myCenter.address && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            {myCenter.address}
                          </span>
                        )}
                        {myCenter.phone && (
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" />
                            {myCenter.phone}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
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

          {/* Lessons */}
          {myCenter && (
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
        </div>
      </div>
    </div>
  );
}
