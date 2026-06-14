import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminSkeleton } from "@/components/AdminSkeleton";
import {
  BookOpen,
  Users,
  KeyRound,
  Plus,
  Trash2,
  Loader2,
  ArrowRight,
  Copy,
  Check,
  BarChart3,
  GraduationCap,
  ClipboardList,
  PlayCircle,
  AlertTriangle,
  Settings,
  Save,
  Upload,
  Image,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  createLessonSchema,
  type CreateLessonForm,
  questionSchema,
  type QuestionForm,
} from "@/lib/form-schemas";

function CreateLessonDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { t } = useTranslation();
  const utils = trpc.useUtils();
  const form = useForm<CreateLessonForm>({
    resolver: zodResolver(createLessonSchema),
    defaultValues: {
      title: "",
      description: "",
      videoUrl: "",
    },
  });

  const mutation = trpc.lesson.create.useMutation({
    onSuccess: () => {
      utils.lesson.myLessons.invalidate();
      utils.center.dashboardStats.invalidate();
      form.reset();
      onOpenChange(false);
    },
  });

  const onSubmit = (data: CreateLessonForm) => {
    mutation.mutate({ ...data, order: 0 });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl border-0 shadow-xl max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl text-[#2c3e2d]">
            {t("admin.createLessonTitle")}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.lessonTitleLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("admin.lessonTitlePlaceholder")}
                      className="rounded-xl h-11 border-[#00695c]/15"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.lessonDescLabel")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("admin.lessonDescPlaceholder")}
                      className="rounded-xl min-h-[80px] border-[#00695c]/15"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="videoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.videoUrlLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("admin.videoUrlPlaceholder")}
                      className="rounded-xl h-11 border-[#00695c]/15"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="w-full rounded-full bg-[#00695c] hover:bg-[#004d40] h-11 font-semibold"
            >
              {mutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                t("admin.createLessonBtn")
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function QuizBuilder({ lessonId }: { lessonId: number }) {
  const { t } = useTranslation();
  const utils = trpc.useUtils();
  const form = useForm<QuestionForm>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      text: "",
      options: ["", "", "", ""],
      correctAnswerIndex: 0,
    },
  });

  const { data: questions } = trpc.question.listByLesson.useQuery(
    { lessonId },
    { enabled: lessonId > 0 }
  );

  const createQuestion = trpc.question.create.useMutation({
    onSuccess: () => {
      utils.question.listByLesson.invalidate({ lessonId });
      form.reset({ text: "", options: ["", "", "", ""], correctAnswerIndex: 0 });
    },
  });

  const deleteQuestion = trpc.question.delete.useMutation({
    onSuccess: () => {
      utils.question.listByLesson.invalidate({ lessonId });
    },
  });

  const onSubmit = (data: QuestionForm) => {
    createQuestion.mutate({
      lessonId,
      ...data,
      options: data.options.filter((o) => o.trim() !== ""),
    });
  };

  return (
    <div className="space-y-4">
      <div className="clay-card p-6">
        <h4 className="font-semibold text-[#2c3e2d] mb-4">
          {t("admin.addQuestion")}
        </h4>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder={t("admin.questionPlaceholder")}
                      className="rounded-xl border-[#00695c]/15"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              {form.getValues("options").map((_opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => form.setValue("correctAnswerIndex", i)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                      form.watch("correctAnswerIndex") === i
                        ? "border-[#00695c] bg-[#00695c] text-white"
                        : "border-[#78909c]/30 text-[#78909c]"
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </button>
                  <FormField
                    control={form.control}
                    name={`options.${i}`}
                    render={({ field }) => (
                      <FormItem className="flex-1 mb-0">
                        <FormControl>
                          <Input
                            placeholder={`Option ${String.fromCharCode(65 + i)}`}
                            className="rounded-xl border-[#00695c]/15"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
            <Button
              type="submit"
              disabled={createQuestion.isPending}
              className="rounded-full bg-[#00695c] hover:bg-[#004d40] font-semibold"
            >
              {createQuestion.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                t("admin.addQuestionBtn")
              )}
            </Button>
          </form>
        </Form>
      </div>

      {questions && questions.length > 0 && (
        <div className="space-y-2">
          {questions.map((q, i) => (
            <div key={q.id} className="clay-card p-4 flex items-start gap-3">
              <span className="text-sm font-bold text-[#00695c] shrink-0 mt-0.5">
                Q{i + 1}
              </span>
              <div className="flex-1">
                <p className="text-sm text-[#2c3e2d] font-medium">{q.text}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                    {(q.options ?? []).map((opt, j) => (
                    <span
                      key={j}
                      className={`text-xs px-2.5 py-1 rounded-lg ${
                        j === q.correctAnswerIndex
                          ? "bg-[#81c784]/20 text-[#00695c] font-medium"
                          : "bg-gray-100 text-[#78909c]"
                      }`}
                    >
                      {String.fromCharCode(65 + j)}. {opt}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => deleteQuestion.mutate({ id: q.id })}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuth({
    redirectOnUnauthenticated: true,
  });
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") ?? "lessons";
  const [createLessonOpen, setCreateLessonOpen] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const { data: stats, isLoading: statsLoading } =
    trpc.center.dashboardStats.useQuery(undefined, {
      enabled: user?.role === "teacher",
    });

  const { data: students } = trpc.center.myStudents.useQuery(undefined, {
    enabled: user?.role === "teacher",
  });

  const { data: inviteCodesList } = trpc.invite.list.useQuery(undefined, {
    enabled: user?.role === "teacher",
  });

  const { data: lessons } = trpc.lesson.myLessons.useQuery(undefined, {
    enabled: user?.role === "teacher",
  });

  const { data: analytics } = trpc.quiz.centerAnalytics.useQuery(undefined, {
    enabled: user?.role === "teacher",
  });

  const utils = trpc.useUtils();

  const createInvite = trpc.invite.create.useMutation({
    onSuccess: () => {
      utils.invite.list.invalidate();
    },
  });

  const deleteLesson = trpc.lesson.delete.useMutation({
    onSuccess: () => {
      utils.lesson.myLessons.invalidate();
      utils.center.dashboardStats.invalidate();
      setDeleteConfirmId(null);
    },
  });

  if (authLoading) {
    return <AdminSkeleton />;
  }

  if (!user) return null;

  if (user.role !== "teacher") {
    navigate("/dashboard");
    return null;
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#e8f5e9]">
      <Navigation />

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#2c3e2d]">
              {stats?.center?.name ?? t("admin.centerDashboard")}
            </h1>
            <p className="text-[#78909c] mt-1">
              {t("admin.manageSubtitle")}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: t("admin.lessons"),
                value: stats?.lessonsCount ?? 0,
                icon: BookOpen,
                color: "bg-[#00695c]/8",
              },
              {
                label: t("admin.students"),
                value: stats?.studentsCount ?? 0,
                icon: Users,
                color: "bg-[#81c784]/20",
              },
              {
                label: t("admin.inviteCodes"),
                value: stats?.inviteCodesCount ?? 0,
                icon: KeyRound,
                color: "bg-[#004d40]/10",
              },
              {
                label: t("admin.quizAttempts"),
                value: analytics?.length ?? 0,
                icon: BarChart3,
                color: "bg-amber-100",
              },
            ].map((stat) => (
              <Card key={stat.label} className="clay-card border-0">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full ${stat.color} flex items-center justify-center`}
                    >
                      <stat.icon className="w-5 h-5 text-[#00695c]" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-[#00695c]">
                        {stat.value}
                      </p>
                      <p className="text-xs text-[#78909c]">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs value={tab} onValueChange={(v) => setSearchParams({ tab: v })} className="space-y-6">
            <TabsList className="bg-white rounded-full p-1 h-auto">
              <TabsTrigger
                value="lessons"
                className="rounded-full px-5 py-2 data-[state=active]:bg-[#00695c] data-[state=active]:text-white"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                {t("admin.tabLessons")}
              </TabsTrigger>
              <TabsTrigger
                value="students"
                className="rounded-full px-5 py-2 data-[state=active]:bg-[#00695c] data-[state=active]:text-white"
              >
                <Users className="w-4 h-4 mr-2" />
                {t("admin.tabStudents")}
              </TabsTrigger>
              <TabsTrigger
                value="invites"
                className="rounded-full px-5 py-2 data-[state=active]:bg-[#00695c] data-[state=active]:text-white"
              >
                <KeyRound className="w-4 h-4 mr-2" />
                {t("admin.tabInvites")}
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="rounded-full px-5 py-2 data-[state=active]:bg-[#00695c] data-[state=active]:text-white"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                {t("admin.tabAnalytics")}
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="rounded-full px-5 py-2 data-[state=active]:bg-[#00695c] data-[state=active]:text-white"
              >
                <Settings className="w-4 h-4 mr-2" />
                {t("admin.tabSettings")}
              </TabsTrigger>
            </TabsList>

            {/* Lessons Tab */}
            <TabsContent value="lessons" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#2c3e2d]">
                  {t("admin.yourLessons")}
                </h2>
                <Button
                  onClick={() => setCreateLessonOpen(true)}
                  className="rounded-full bg-[#00695c] hover:bg-[#004d40] font-semibold"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {t("admin.newLesson")}
                </Button>
              </div>

              <CreateLessonDialog
                open={createLessonOpen}
                onOpenChange={setCreateLessonOpen}
              />

              {!lessons || lessons.length === 0 ? (
                <Card className="clay-card border-0 p-12 text-center">
                  <GraduationCap className="w-12 h-12 text-[#78909c] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[#2c3e2d] mb-2">
                    {t("admin.noLessonsTitle")}
                  </h3>
                  <p className="text-[#78909c] mb-4">
                    {t("admin.noLessonsDesc")}
                  </p>
                  <Button
                    onClick={() => setCreateLessonOpen(true)}
                    className="rounded-full bg-[#00695c] hover:bg-[#004d40]"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    {t("admin.createLesson")}
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {lessons.map((lesson) => (
                    <Card key={lesson.id} className="clay-card border-0">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <PlayCircle className="w-5 h-5 text-[#00695c]" />
                              <h3 className="font-semibold text-[#2c3e2d]">
                                {lesson.title}
                              </h3>
                            </div>
                            <p className="text-sm text-[#78909c] mb-3 line-clamp-2">
                              {lesson.description}
                            </p>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full text-xs border-[#00695c]/15 hover:bg-[#00695c]/6"
                                onClick={() =>
                                  setSelectedLessonId(
                                    selectedLessonId === lesson.id
                                      ? null
                                      : lesson.id
                                  )
                                }
                              >
                                <ClipboardList className="w-3 h-3 mr-1" />
                                {selectedLessonId === lesson.id
                                  ? t("admin.hideQuizBuilder")
                                  : t("admin.quizBuilder")}
                              </Button>
                              <Link
                                to={`/lessons/${lesson.id}`}
                                className="text-xs text-[#00695c] hover:underline flex items-center gap-1"
                              >
                                {t("admin.viewLesson")}
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>
                          {deleteConfirmId === lesson.id ? (
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                              <span className="text-xs text-red-500 font-medium">{t("admin.deleteConfirm")}</span>
                              <button
                                onClick={() => deleteLesson.mutate({ id: lesson.id })}
                                className="text-xs text-red-600 hover:text-red-800 font-semibold"
                              >
                                {t("admin.yes")}
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="text-xs text-[#78909c] hover:text-[#2c3e2d]"
                              >
                                {t("admin.no")}
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(lesson.id)}
                              className="text-red-400 hover:text-red-600 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        {selectedLessonId === lesson.id && (
                          <div className="mt-4 pt-4 border-t border-[#00695c]/8">
                            <QuizBuilder lessonId={lesson.id} />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Students Tab */}
            <TabsContent value="students">
              <h2 className="text-lg font-semibold text-[#2c3e2d] mb-4">
                {t("admin.enrolledStudents")}
              </h2>
              {!students || students.length === 0 ? (
                <Card className="clay-card border-0 p-12 text-center">
                  <Users className="w-12 h-12 text-[#78909c] mx-auto mb-4" />
                  <p className="text-[#78909c]">
                    {t("admin.noStudentsDesc")}
                  </p>
                </Card>
              ) : (
                <div className="clay-card overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-[#78909c]">{t("admin.name")}</TableHead>
                        <TableHead className="text-[#78909c]">{t("admin.email")}</TableHead>
                        <TableHead className="text-[#78909c]">{t("admin.joined")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((s) => (
                        <TableRow
                          key={s.id}
                          className="hover:bg-[#00695c]/3"
                        >
                          <TableCell className="font-medium text-[#2c3e2d]">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-[#00695c]/10 flex items-center justify-center text-xs font-bold text-[#00695c]">
                                {(s.name ?? "U").charAt(0).toUpperCase()}
                              </div>
                              {s.name ?? t("admin.anonymous")}
                            </div>
                          </TableCell>
                          <TableCell className="text-[#78909c]">
                            {s.email ?? "-"}
                          </TableCell>
                          <TableCell className="text-[#78909c]">
                            {new Date(s.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* Invites Tab */}
            <TabsContent value="invites" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#2c3e2d]">
                  {t("admin.inviteCodesTitle")}
                </h2>
                <Button
                  onClick={() => createInvite.mutate()}
                  disabled={createInvite.isPending}
                  className="rounded-full bg-[#00695c] hover:bg-[#004d40] font-semibold"
                >
                  {createInvite.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-1" />
                  )}
                  {t("admin.generateCode")}
                </Button>
              </div>

              {!inviteCodesList || inviteCodesList.length === 0 ? (
                <Card className="clay-card border-0 p-12 text-center">
                  <KeyRound className="w-12 h-12 text-[#78909c] mx-auto mb-4" />
                  <p className="text-[#78909c]">
                    {t("admin.noInvitesDesc")}
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {inviteCodesList.map((code) => (
                    <div
                      key={code.id}
                      className={`clay-card p-4 flex items-center justify-between ${
                        code.usedBy ? "opacity-60" : ""
                      }`}
                    >
                      <div>
                        <p className="font-mono text-lg font-bold text-[#00695c] tracking-wider">
                          {code.code}
                        </p>
                        <p className="text-xs text-[#78909c]">
                          {code.usedBy
                            ? t("admin.usedBy", { name: code.usedByName })
                            : t("admin.available")}
                        </p>
                      </div>
                      <button
                        onClick={() => copyCode(code.code)}
                        className="p-2 rounded-full hover:bg-[#00695c]/8 transition-colors"
                      >
                        {copiedCode === code.code ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-[#78909c]" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <h2 className="text-lg font-semibold text-[#2c3e2d] mb-4">
                {t("admin.quizPerformance")}
              </h2>
              {!analytics || analytics.length === 0 ? (
                <Card className="clay-card border-0 p-12 text-center">
                  <BarChart3 className="w-12 h-12 text-[#78909c] mx-auto mb-4" />
                  <p className="text-[#78909c]">
                    {t("admin.noQuizData")}
                  </p>
                </Card>
              ) : (
                <div className="clay-card overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-[#78909c]">
                          {t("admin.studentCol")}
                        </TableHead>
                        <TableHead className="text-[#78909c]">
                          {t("admin.lessonCol")}
                        </TableHead>
                        <TableHead className="text-[#78909c]">
                          {t("admin.scoreCol")}
                        </TableHead>
                        <TableHead className="text-[#78909c]">
                          {t("admin.dateCol")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analytics.map((a) => (
                        <TableRow
                          key={a.id}
                          className="hover:bg-[#00695c]/3"
                        >
                          <TableCell className="font-medium text-[#2c3e2d]">
                            {a.studentName}
                          </TableCell>
                          <TableCell className="text-[#78909c]">
                            {a.lessonTitle}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`font-semibold ${
                                (a.score / a.totalQuestions) * 100 >= 70
                                  ? "text-[#00695c]"
                                  : "text-amber-600"
                              }`}
                            >
                              {a.score}/{a.totalQuestions}
                            </span>
                            <span className="text-xs text-[#78909c] ml-1">
                              ({Math.round((a.score / a.totalQuestions) * 100)}
                              %)
                            </span>
                          </TableCell>
                          <TableCell className="text-[#78909c]">
                            {new Date(a.completedAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <h2 className="text-lg font-semibold text-[#2c3e2d] mb-4">
                {t("admin.centerSettings")}
              </h2>
              {statsLoading ? (
                <Card className="clay-card border-0 p-8">
                  <div className="flex items-start gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-[#00695c]/8 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-3">
                      <div className="h-6 w-48 bg-[#00695c]/8 rounded-lg animate-pulse" />
                      <div className="h-4 w-full bg-[#00695c]/8 rounded-lg animate-pulse" />
                      <div className="h-4 w-3/4 bg-[#00695c]/8 rounded-lg animate-pulse" />
                    </div>
                  </div>
                </Card>
              ) : !stats ? (
                <Card className="clay-card border-0 p-12 text-center">
                  <GraduationCap className="w-12 h-12 text-[#78909c] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[#2c3e2d] mb-2">
                    {t("admin.noCenterTitle")}
                  </h3>
                  <p className="text-[#78909c] mb-4">
                    {t("admin.noCenterDesc")}
                  </p>
                  <Button
                    onClick={() => navigate("/register-center")}
                    className="rounded-full bg-[#00695c] hover:bg-[#004d40] font-semibold"
                  >
                    {t("admin.createCenter")}
                  </Button>
                </Card>
              ) : (
                <CenterSettingsForm center={stats.center} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function CenterSettingsForm({ center }: { center: { id: number; name: string; description: string | null; logo: string | null; banner: string | null; address: string | null; phone: string | null } }) {
  const { t } = useTranslation();
  const utils = trpc.useUtils();
  const [name, setName] = useState(center.name);
  const [description, setDescription] = useState(center.description ?? "");
  const [logo, setLogo] = useState(center.logo ?? "");
  const [banner, setBanner] = useState(center.banner ?? "");
  const [address, setAddress] = useState(center.address ?? "");
  const [phone, setPhone] = useState(center.phone ?? "");
  const [uploading, setUploading] = useState<"logo" | "banner" | null>(null);

  const updateMutation = trpc.center.update.useMutation({
    onSuccess: () => {
      utils.center.dashboardStats.invalidate();
      utils.center.myCenter.invalidate();
    },
  });

  const getUploadUrl = trpc.upload.getUrl.useMutation();

  const handleImageUpload = async (field: "logo" | "banner", file: File) => {
    setUploading(field);
    try {
      const { uploadUrl, publicUrl } = await getUploadUrl.mutateAsync({
        fileName: file.name,
        contentType: file.type,
      });
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (field === "logo") setLogo(publicUrl);
      else setBanner(publicUrl);
    } finally {
      setUploading(null);
    }
  };

  const handleSave = () => {
    updateMutation.mutate({
      id: center.id,
      name,
      description: description || undefined,
      logo: logo || undefined,
      banner: banner || undefined,
      address: address || undefined,
      phone: phone || undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Logo & Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="clay-card border-0">
          <CardContent className="p-6 space-y-4">
            <label className="text-sm font-medium text-[#2c3e2d]">{t("admin.logoLabel")}</label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={uploading === "logo"}
                onClick={() => document.getElementById("logo-upload")?.click()}
                className="rounded-xl h-11 border-[#00695c]/15 text-[#2c3e2d]"
              >
                {uploading === "logo" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                {uploading === "logo" ? t("admin.uploading") : t("admin.chooseImage")}
              </Button>
              {logo && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setLogo("")}
                  className="text-red-500 hover:text-red-600"
                >
                  {t("admin.remove")}
                </Button>
              )}
            </div>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading === "logo"}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload("logo", file);
                e.target.value = "";
              }}
            />
            {logo ? (
              <div className="w-24 h-24 rounded-2xl overflow-hidden border border-[#00695c]/10">
                <img src={logo} alt="logo" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-[#00695c]/15 flex items-center justify-center">
                {uploading === "logo" ? (
                  <Loader2 className="w-8 h-8 text-[#00695c] animate-spin" />
                ) : (
                  <Image className="w-8 h-8 text-[#78909c]" />
                )}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="clay-card border-0">
          <CardContent className="p-6 space-y-4">
            <label className="text-sm font-medium text-[#2c3e2d]">{t("admin.bannerLabel")}</label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={uploading === "banner"}
                onClick={() => document.getElementById("banner-upload")?.click()}
                className="rounded-xl h-11 border-[#00695c]/15 text-[#2c3e2d]"
              >
                {uploading === "banner" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                {uploading === "banner" ? t("admin.uploading") : t("admin.chooseImage")}
              </Button>
              {banner && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setBanner("")}
                  className="text-red-500 hover:text-red-600"
                >
                  {t("admin.remove")}
                </Button>
              )}
            </div>
            <input
              id="banner-upload"
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading === "banner"}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload("banner", file);
                e.target.value = "";
              }}
            />
            {banner ? (
              <div className="w-full h-20 rounded-2xl overflow-hidden border border-[#00695c]/10">
                <img src={banner} alt="banner" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-full h-20 rounded-2xl border-2 border-dashed border-[#00695c]/15 flex items-center justify-center">
                {uploading === "banner" ? (
                  <Loader2 className="w-8 h-8 text-[#00695c] animate-spin" />
                ) : (
                  <Image className="w-8 h-8 text-[#78909c]" />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Basic Info */}
      <Card className="clay-card border-0">
        <CardContent className="p-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-[#2c3e2d]">{t("admin.centerNameLabel")}</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl h-11 border-[#00695c]/15 mt-1.5"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#2c3e2d]">{t("admin.descriptionLabel")}</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-xl min-h-[100px] border-[#00695c]/15 mt-1.5"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card className="clay-card border-0">
        <CardContent className="p-6 space-y-5">
          <h3 className="font-semibold text-[#2c3e2d]">{t("admin.contactInfo")}</h3>
          <div>
            <label className="text-sm font-medium text-[#2c3e2d]">{t("admin.addressLabel")}</label>
            <Textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t("admin.addressPlaceholder")}
              className="rounded-xl min-h-[80px] border-[#00695c]/15 mt-1.5"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#2c3e2d]">{t("admin.phoneLabel")}</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("admin.phonePlaceholder")}
              className="rounded-xl h-11 border-[#00695c]/15 mt-1.5"
            />
          </div>
        </CardContent>
      </Card>

      {updateMutation.error && (
        <p className="text-sm text-red-500">{updateMutation.error.message}</p>
      )}
      {updateMutation.isSuccess && (
        <p className="text-sm text-green-600 font-medium">{t("admin.updatedSuccess")}</p>
      )}
      <Button
        onClick={handleSave}
        disabled={updateMutation.isPending}
        className="rounded-full bg-[#00695c] hover:bg-[#004d40] font-semibold"
      >
        {updateMutation.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <Save className="w-4 h-4 mr-2" />
        )}
        {t("admin.saveChanges")}
      </Button>
    </div>
  );
}
