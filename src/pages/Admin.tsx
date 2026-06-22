import { useEffect, useState, useRef, useCallback, useMemo } from "react";
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
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminSkeleton } from "@/components/AdminSkeleton";
import { VideoCall } from "@/components/VideoCall";
import { CountdownTimer } from "@/components/CountdownTimer";
import {
  BookOpen,
  Users,
  User,
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
  ClipboardCheck,
  PlayCircle,
  AlertTriangle,
  Settings,
  Save,
  Upload,
  Image,
  Film,
  X,
  Globe,
  MapPin,
  ChevronDown,
  Video,
  MessageSquare,
  Send,
  MoreHorizontal,
  LogOut,
  Mail,
  Calendar,
  Bell,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createLessonSchema,
  type CreateLessonForm,
  questionSchema,
  type QuestionForm,
} from "@/lib/form-schemas";
import { countries } from "@/data/countries";
import { ImageCropper } from "@/components/ImageCropper";

function CreateLessonDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { t } = useTranslation();
  const utils = trpc.useUtils();
  const getUploadUrl = trpc.upload.getUrl.useMutation();
  const [videoSource, setVideoSource] = useState<"url" | "upload">("url");
  const [videoUploading, setVideoUploading] = useState(false);
  const form = useForm<CreateLessonForm>({
    resolver: zodResolver(createLessonSchema),
    defaultValues: {
      title: "",
      description: "",
      videoUrl: "",
    },
  });

  const handleVideoUpload = async (file: File) => {
    setVideoUploading(true);
    try {
      const { uploadUrl, publicUrl } = await getUploadUrl.mutateAsync({
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
      });
      const res = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);
      form.setValue("videoUrl", publicUrl);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      alert(msg);
    } finally {
      setVideoUploading(false);
    }
  };

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
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setVideoSource("url")}
                      className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                        videoSource === "url"
                          ? "bg-[#00695c] text-white"
                          : "bg-[#00695c]/10 text-[#00695c] hover:bg-[#00695c]/20"
                      }`}
                    >
                      YouTube URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoSource("upload")}
                      className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                        videoSource === "upload"
                          ? "bg-[#00695c] text-white"
                          : "bg-[#00695c]/10 text-[#00695c] hover:bg-[#00695c]/20"
                      }`}
                    >
                      Upload Video
                    </button>
                  </div>
                  <FormControl>
                    {videoSource === "url" ? (
                      <Input
                        placeholder={t("admin.videoUrlPlaceholder")}
                        className="rounded-xl h-11 border-[#00695c]/15"
                        {...field}
                      />
                    ) : (
                      <div className="space-y-2">
                        <label className="flex items-center justify-center h-24 rounded-xl border-2 border-dashed border-[#00695c]/20 cursor-pointer hover:border-[#00695c]/40 transition-colors bg-[#00695c]/5">
                          <input
                            type="file"
                            accept="video/mp4,video/webm,video/ogg,video/quicktime"
                            className="hidden"
                            disabled={videoUploading}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleVideoUpload(file);
                            }}
                          />
                          <div className="text-center">
                            {videoUploading ? (
                              <Loader2 className="w-6 h-6 animate-spin text-[#00695c] mx-auto" />
                            ) : field.value ? (
                              <div className="text-[#00695c] text-sm">
                                <Film className="w-6 h-6 mx-auto mb-1" />
                                Video uploaded
                              </div>
                            ) : (
                              <div className="text-[#78909c] text-sm">
                                <Upload className="w-6 h-6 mx-auto mb-1" />
                                Click to upload MP4/WebM
                              </div>
                            )}
                          </div>
                        </label>
                        {field.value && (
                          <div className="flex items-start gap-2 text-xs text-[#78909c] max-w-full">
                            <span className="break-all min-w-0 flex-1">{field.value.split("/").pop()}</span>
                            <button
                              type="button"
                              onClick={() => {
                                form.setValue("videoUrl", "");
                                setVideoSource("url");
                              }}
                              className="text-red-500 hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("admin.levelCol")}</FormLabel>
                  <FormControl>
                    <select
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value || undefined)}
                      className="flex h-11 w-full rounded-xl border border-[#00695c]/15 bg-white px-4 text-sm text-[#2c3e2d]"
                    >
                      <option value="">{t("admin.allLevels")}</option>
                      {(["a1", "a2", "b1", "b2", "c1", "c2"] as const).map((l) => (
                        <option key={l} value={l}>{l.toUpperCase()}</option>
                      ))}
                    </select>
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
  const [studentsView, setStudentsView] = useState<"students" | "analytics">("students");
  const [assignmentsView, setAssignmentsView] = useState<"assignments" | "progress" | "submissions">("assignments");
  const [kickStudentId, setKickStudentId] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<{
    id: number; name: string | null; email: string; avatar: string | null;
    title: string | null; bio: string | null; createdAt: Date;
  } | null>(null);
  const levels = ["a1", "a2", "b1", "b2", "c1", "c2"] as const;
  const [levelFilter, setLevelFilter] = useState<string | null>(null);

  const updateStudentLevel = trpc.center.updateStudentLevel.useMutation({
    onSuccess: () => utils.center.myStudents.invalidate(),
  });

  const { data: stats, isLoading: statsLoading } =
    trpc.center.dashboardStats.useQuery(undefined, {
      enabled: user?.role === "teacher",
    });

  const { data: rawStudents } = trpc.center.myStudents.useQuery(undefined, {
    enabled: user?.role === "teacher",
  });
  const students = rawStudents?.filter((s) => s.id !== user?.id);

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

  const kickStudent = trpc.center.kickStudent.useMutation({
    onSuccess: () => {
      utils.center.myStudents.invalidate();
      utils.center.dashboardStats.invalidate();
      utils.invite.list.invalidate();
      setKickStudentId(null);
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
    <div className="min-h-screen">
      <Navigation />

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#2c3e2d]">
                {stats?.center?.name ?? t("admin.centerDashboard")}
              </h1>
              <p className="text-[#78909c] mt-1">
                {t("admin.manageSubtitle")}
              </p>
            </div>
            <NotificationBell />
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <TabsTrigger
                    value="students"
                    className="rounded-full px-5 py-2 data-[state=active]:bg-[#00695c] data-[state=active]:text-white"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    {t("admin.tabStudents")}
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </TabsTrigger>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => { setSearchParams({ tab: "students" }); setStudentsView("students"); }}>
                    <Users className="w-4 h-4 mr-2" />
                    Students
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSearchParams({ tab: "students" }); setStudentsView("analytics"); }}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <TabsTrigger
                value="invites"
                className="rounded-full px-5 py-2 data-[state=active]:bg-[#00695c] data-[state=active]:text-white"
              >
                <KeyRound className="w-4 h-4 mr-2" />
                {t("admin.tabInvites")}
              </TabsTrigger>
              <TabsTrigger
                value="meetingRooms"
                className="rounded-full px-5 py-2 data-[state=active]:bg-[#00695c] data-[state=active]:text-white"
              >
                <Video className="w-4 h-4 mr-2" />
                {t("admin.tabMeetingRooms")}
              </TabsTrigger>
              <TabsTrigger
                value="chat"
                className="rounded-full px-5 py-2 data-[state=active]:bg-[#00695c] data-[state=active]:text-white"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {t("admin.tabChat")}
              </TabsTrigger>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <TabsTrigger
                    value="assignments"
                    className="rounded-full px-5 py-2 data-[state=active]:bg-[#00695c] data-[state=active]:text-white"
                  >
                    <ClipboardList className="w-4 h-4 mr-2" />
                    Assignments
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </TabsTrigger>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => { setSearchParams({ tab: "assignments" }); setAssignmentsView("assignments"); }}>
                    <ClipboardList className="w-4 h-4 mr-2" />
                    Assignments
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSearchParams({ tab: "assignments" }); setAssignmentsView("progress"); }}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSearchParams({ tab: "assignments" }); setAssignmentsView("submissions"); }}>
                    <ClipboardCheck className="w-4 h-4 mr-2" />
                    Submissions
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

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
                <div className="flex items-center gap-2">
                  <select
                    value={levelFilter ?? ""}
                    onChange={(e) => setLevelFilter(e.target.value || null)}
                    className="h-9 rounded-xl border border-[#00695c]/15 bg-white px-3 text-sm text-[#2c3e2d]"
                  >
                    <option value="">{t("admin.allLevels")}</option>
                    {levels.map((l) => (
                      <option key={l} value={l}>{l.toUpperCase()}</option>
                    ))}
                  </select>
                  <Button
                    onClick={() => setCreateLessonOpen(true)}
                    className="rounded-full bg-[#00695c] hover:bg-[#004d40] font-semibold"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    {t("admin.newLesson")}
                  </Button>
                </div>
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
                  {lessons
                    .filter((l) => !levelFilter || l.level === levelFilter)
                    .map((lesson) => (
                    <Card key={lesson.id} className="clay-card border-0">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <PlayCircle className="w-5 h-5 text-[#00695c]" />
                              <h3 className="font-semibold text-[#2c3e2d]">
                                {lesson.title}
                              </h3>
                              {lesson.level && (
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#00695c]/10 text-[#00695c]">
                                  {lesson.level.toUpperCase()}
                                </span>
                              )}
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
              {studentsView === "students" ? (
                !students || students.length === 0 ? (
                  <Card className="clay-card border-0 p-12 text-center">
                    <Users className="w-12 h-12 text-[#78909c] mx-auto mb-4" />
                    <p className="text-[#78909c]">
                      {t("admin.noStudentsDesc")}
                    </p>
                  </Card>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm font-medium text-[#445E5D]">{t("admin.filterByLevel")}</span>
                      <select
                        value={levelFilter ?? ""}
                        onChange={(e) => setLevelFilter(e.target.value || null)}
                        className="h-9 rounded-xl border border-[#00695c]/15 bg-white px-3 text-sm text-[#2c3e2d]"
                      >
                        <option value="">{t("admin.allLevels")}</option>
                        {levels.map((l) => (
                          <option key={l} value={l}>{l.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                    <div className="clay-card overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="text-[#78909c]">{t("admin.name")}</TableHead>
                          <TableHead className="text-[#78909c]">{t("admin.email")}</TableHead>
                          <TableHead className="text-[#78909c]">{t("admin.levelCol")}</TableHead>
                          <TableHead className="text-[#78909c]">{t("admin.joined")}</TableHead>
                          <TableHead className="text-[#78909c] w-[80px]">{t("admin.actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students
                          .filter((s) => !levelFilter || s.level === levelFilter)
                          .map((s) => (
                          <TableRow
                            key={s.id}
                            className="hover:bg-[#00695c]/3 cursor-pointer"
                            onClick={() => setSelectedStudent(s)}
                          >
                            <TableCell className="font-medium text-[#2c3e2d]">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-[#00695c]/10 flex items-center justify-center overflow-hidden text-xs font-bold text-[#00695c] shrink-0">
                                  {s.avatar ? (
                                    <img src={s.avatar} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    (s.name ?? "U").charAt(0).toUpperCase()
                                  )}
                                </div>
                                {s.name ?? t("admin.anonymous")}
                              </div>
                            </TableCell>
                            <TableCell className="text-[#78909c]">
                              {s.email ?? "-"}
                            </TableCell>
                            <TableCell>
                              <select
                                value={s.level ?? ""}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => updateStudentLevel.mutate({ studentId: s.id, level: (e.target.value || null) as "a1" | "a2" | "b1" | "b2" | "c1" | "c2" | null })}
                                className="h-8 rounded-lg border border-[#00695c]/15 bg-white px-2 text-xs text-[#2c3e2d]"
                              >
                                <option value="">—</option>
                                {levels.map((l) => (
                                  <option key={l} value={l}>{l.toUpperCase()}</option>
                                ))}
                              </select>
                            </TableCell>
                            <TableCell className="text-[#78909c]">
                              {new Date(s.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <AlertDialog open={kickStudentId === s.id} onOpenChange={(open) => { if (!open) setKickStudentId(null); }}>
                                <AlertDialogTrigger asChild>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setKickStudentId(s.id); }}
                                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                    title={t("admin.kickStudent")}
                                  >
                                    <LogOut className="w-4 h-4" />
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-3xl border-0 shadow-xl">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-[#2c3e2d]">
                                      {t("admin.kickConfirmTitle")}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-[#78909c]">
                                      {t("admin.kickConfirmDesc", { name: s.name ?? t("admin.anonymous") })}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="rounded-full border-[#00695c]/20 text-[#445E5D]">
                                      {t("admin.cancel")}
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={(e) => { e.preventDefault(); kickStudent.mutate({ studentId: s.id }); }}
                                      disabled={kickStudent.isPending}
                                      className="rounded-full bg-red-600 hover:bg-red-700 text-white"
                                    >
                                      {kickStudent.isPending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        t("admin.kickConfirmAction")
                                      )}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                )
              ) : !analytics || analytics.length === 0 ? (
                <Card className="clay-card border-0 p-12 text-center">
                  <BarChart3 className="w-12 h-12 text-[#78909c] mx-auto mb-4" />
                  <p className="text-[#78909c]">
                    {t("admin.noQuizData")}
                  </p>
                </Card>
              ) : (
                <>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-medium text-[#445E5D]">{t("admin.filterByLevel")}</span>
                  <select
                    value={levelFilter ?? ""}
                    onChange={(e) => setLevelFilter(e.target.value || null)}
                    className="h-9 rounded-xl border border-[#00695c]/15 bg-white px-3 text-sm text-[#2c3e2d]"
                  >
                    <option value="">{t("admin.allLevels")}</option>
                    {levels.map((l) => (
                      <option key={l} value={l}>{l.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
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
                      {analytics
                        .filter((a) => !levelFilter || a.studentLevel === levelFilter)
                        .map((a) => (
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
              </>)}
            </TabsContent>

            {selectedStudent && (
              <Dialog open={!!selectedStudent} onOpenChange={(open) => { if (!open) setSelectedStudent(null); }}>
                <DialogContent className="sm:max-w-[420px]">
                  <DialogHeader>
                    <DialogTitle className="text-[#2c3e2d]">Student Profile</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="w-24 h-24 rounded-full bg-[#00695c]/10 flex items-center justify-center overflow-hidden">
                      {selectedStudent.avatar ? (
                        <img src={selectedStudent.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-10 h-10 text-[#00695c]" />
                      )}
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-[#2c3e2d]">
                        {selectedStudent.title ? `${selectedStudent.title}. ` : ""}{selectedStudent.name}
                      </h3>
                      {selectedStudent.bio && (
                        <p className="text-sm text-[#78909c] mt-1 max-w-[300px]">{selectedStudent.bio}</p>
                      )}
                    </div>
                    <div className="w-full space-y-3 pt-2 border-t border-[#00695c]/8">
                      <div className="flex items-center gap-3 text-sm text-[#78909c]">
                        <Mail className="w-4 h-4 shrink-0" />
                        <span>{selectedStudent.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-[#78909c]">
                        <Calendar className="w-4 h-4 shrink-0" />
                        <span>Joined {new Date(selectedStudent.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

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
                <>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-medium text-[#445E5D]">{t("admin.filterByLevel")}</span>
                  <select
                    value={levelFilter ?? ""}
                    onChange={(e) => setLevelFilter(e.target.value || null)}
                    className="h-9 rounded-xl border border-[#00695c]/15 bg-white px-3 text-sm text-[#2c3e2d]"
                  >
                    <option value="">{t("admin.allLevels")}</option>
                    {levels.map((l) => (
                      <option key={l} value={l}>{l.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
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
                      {analytics
                        .filter((a) => !levelFilter || a.studentLevel === levelFilter)
                        .map((a) => (
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
              </>)}
            </TabsContent>

            {/* Meeting Rooms Tab */}
            <TabsContent value="meetingRooms">
              <MeetingRoomsPanel />
            </TabsContent>



            {/* Chat Tab */}
            <TabsContent value="chat">
              <ChatPanel />
            </TabsContent>

            {/* Assignments Tab */}
            <TabsContent value="assignments">
              {assignmentsView === "assignments" ? (
                <AssignmentsPanel />
              ) : assignmentsView === "progress" ? (
                <ProgressPanel />
              ) : (
                <SubmissionsPanel />
              )}
            </TabsContent>

            {/* Progress Tab (legacy direct access) */}
            <TabsContent value="progress">
              <ProgressPanel />
            </TabsContent>

            {/* Submissions Tab (legacy direct access) */}
            <TabsContent value="submissions">
              <SubmissionsPanel />
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
                <CenterSettingsForm centerId={stats.center.id} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function AssignmentsPanel() {
  const { t } = useTranslation();
  const utils = trpc.useUtils();
  const { data: assignments } = trpc.assignments.listByCenter.useQuery();
  const createAssignment = trpc.assignments.create.useMutation({
    onSuccess: () => utils.assignments.listByCenter.invalidate(),
  });
  const deleteAssignment = trpc.assignments.delete.useMutation({
    onSuccess: () => utils.assignments.listByCenter.invalidate(),
  });
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [level, setLevel] = useState("");
  const assignmentLevels = ["a1", "a2", "b1", "b2", "c1", "c2"] as const;
  const [assignmentLevelFilter, setAssignmentLevelFilter] = useState<string | null>(null);

  const handleCreate = () => {
    if (!title.trim()) return;
    createAssignment.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate || undefined,
      level: level ? (level as "a1" | "a2" | "b1" | "b2" | "c1" | "c2") : undefined,
    });
    setTitle("");
    setDescription("");
    setDueDate("");
    setLevel("");
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#2c3e2d]">Assignments</h2>
        <div className="flex items-center gap-2">
          <select
            value={assignmentLevelFilter ?? ""}
            onChange={(e) => setAssignmentLevelFilter(e.target.value || null)}
            className="h-9 rounded-xl border border-[#00695c]/15 bg-white px-3 text-sm text-[#2c3e2d]"
          >
            <option value="">{t("admin.allLevels")}</option>
            {assignmentLevels.map((l) => (
              <option key={l} value={l}>{l.toUpperCase()}</option>
            ))}
          </select>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="rounded-full bg-[#00695c] hover:bg-[#004d40] font-semibold"
          >
            <Plus className="w-4 h-4 mr-1" />
            {showForm ? "Cancel" : "New Assignment"}
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="clay-card border-0">
          <CardContent className="p-6 space-y-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Assignment title"
              className="flex h-11 w-full rounded-xl border border-[#00695c]/15 bg-white px-4 text-sm"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="flex min-h-[80px] w-full rounded-xl border border-[#00695c]/15 bg-white px-4 py-3 text-sm"
            />
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-[#00695c]/15 bg-white px-4 text-sm"
            />
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-[#00695c]/15 bg-white px-4 text-sm text-[#2c3e2d]"
            >
              <option value="">{t("admin.allLevels")}</option>
              {(["a1", "a2", "b1", "b2", "c1", "c2"] as const).map((l) => (
                <option key={l} value={l}>{l.toUpperCase()}</option>
              ))}
            </select>
            <Button
              onClick={handleCreate}
              disabled={createAssignment.isPending || !title.trim()}
              className="rounded-full bg-[#00695c] hover:bg-[#004d40]"
            >
              {createAssignment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
            </Button>
          </CardContent>
        </Card>
      )}

      {!assignments || assignments.length === 0 ? (
        <Card className="clay-card border-0 p-12 text-center">
          <ClipboardList className="w-12 h-12 text-[#78909c] mx-auto mb-4" />
          <p className="text-[#78909c]">No assignments yet. Create one to give homework to your students.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {assignments
            .filter((a) => !assignmentLevelFilter || a.level === assignmentLevelFilter)
            .map((a) => (
            <Card key={a.id} className="clay-card border-0">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#2c3e2d]">{a.title}</h3>
                    {a.level && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#00695c]/10 text-[#00695c] ml-2">
                        {a.level.toUpperCase()}
                      </span>
                    )}
                    {a.description && <p className="text-sm text-[#78909c] mt-1">{a.description}</p>}
                    {a.dueDate && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-[#78909c]">Due:</span>
                        <CountdownTimer dueDate={a.dueDate} />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => deleteAssignment.mutate({ id: a.id })}
                    className="text-red-400 hover:text-red-600 p-1 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ProgressPanel() {
  const { t } = useTranslation();
  const { data: progress } = trpc.assignments.progress.useQuery();
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const progressLevels = ["a1", "a2", "b1", "b2", "c1", "c2"] as const;
  const [progressLevelFilter, setProgressLevelFilter] = useState<string | null>(null);

  if (!progress || progress.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[#2c3e2d]">Student Progress</h2>
        <Card className="clay-card border-0 p-12 text-center">
          <Users className="w-12 h-12 text-[#78909c] mx-auto mb-4" />
          <p className="text-[#78909c]">No students have joined your center yet.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#2c3e2d]">Student Progress</h2>
        <select
          value={progressLevelFilter ?? ""}
          onChange={(e) => setProgressLevelFilter(e.target.value || null)}
          className="h-9 rounded-xl border border-[#00695c]/15 bg-white px-3 text-sm text-[#2c3e2d]"
        >
          <option value="">{t("admin.allLevels")}</option>
          {progressLevels.map((l) => (
            <option key={l} value={l}>{l.toUpperCase()}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {progress
          .filter((p) => !progressLevelFilter || p.student.level === progressLevelFilter)
          .map((p) => (
          <Card key={p.student.id} className="clay-card border-0">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-[#2c3e2d]">
                    {p.student.title ? `${p.student.title}. ${p.student.name}` : p.student.name}
                  </h3>
                  <p className="text-xs text-[#78909c]">{p.student.email}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-bold text-[#00695c]">{p.quizAttempts}</p>
                    <p className="text-[10px] text-[#78909c]">Quizzes</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-[#00695c]">{p.avgQuizScore ?? "—"}%</p>
                    <p className="text-[10px] text-[#78909c]">Avg Quiz</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-[#00695c]">{p.lessonsCompleted}/{p.totalLessons}</p>
                    <p className="text-[10px] text-[#78909c]">Lessons</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-[#00695c]">{p.submissions}</p>
                    <p className="text-[10px] text-[#78909c]">Submitted</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-[#00695c]">{p.avgAssignmentGrade ?? "—"}%</p>
                    <p className="text-[10px] text-[#78909c]">Avg Grade</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SubmissionsPanel() {
  const { t } = useTranslation();
  const utils = trpc.useUtils();
  const { data: submissions, isLoading } = trpc.assignments.listSubmissions.useQuery();
  const gradeMutation = trpc.assignments.grade.useMutation({
    onSuccess: () => utils.assignments.listSubmissions.invalidate(),
  });
  const [gradingId, setGradingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Record<number, { grade: string; feedback: string }>>({});
  const submissionLevels = ["a1", "a2", "b1", "b2", "c1", "c2"] as const;
  const [submissionLevelFilter, setSubmissionLevelFilter] = useState<string | null>(null);

  const handleGrade = async (id: number) => {
    const val = editValues[id];
    if (!val) return;
    const grade = parseInt(val.grade);
    if (isNaN(grade) || grade < 0 || grade > 100) return;
    setGradingId(id);
    try {
      await gradeMutation.mutateAsync({ id, grade, feedback: val.feedback || undefined });
      setEditingId(null);
      setEditValues(prev => { const next = { ...prev }; delete next[id]; return next; });
    } finally {
      setGradingId(null);
    }
  };

  const startEditing = (id: number, currentGrade: number | null, currentFeedback: string | null) => {
    setEditValues(prev => ({ ...prev, [id]: { grade: currentGrade?.toString() ?? "", feedback: currentFeedback ?? "" } }));
    setEditingId(id);
  };

  const filteredSubmissions = useMemo(() => {
    if (!submissions) return [];
    return submissions.filter((s) => !submissionLevelFilter || s.studentLevel === submissionLevelFilter);
  }, [submissions, submissionLevelFilter]);

  const grouped = useMemo(() => {
    if (!filteredSubmissions) return [];
    const map = new Map<string, typeof filteredSubmissions>();
    for (const s of filteredSubmissions) {
      const key = s.assignmentTitle;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return Array.from(map.entries());
  }, [filteredSubmissions]);

  if (isLoading) {
    return (
      <Card className="clay-card border-0 p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00695c] mx-auto" />
      </Card>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[#2c3e2d]">Submissions</h2>
        <Card className="clay-card border-0 p-12 text-center">
          <ClipboardCheck className="w-12 h-12 text-[#78909c] mx-auto mb-4" />
          <p className="text-[#78909c]">No submissions yet. Students will appear here once they submit their work.</p>
        </Card>
      </div>
    );
  }

  const isGrading = (id: number) => gradingId === id;
  const isEditing = (id: number) => editingId === id;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#2c3e2d]">Submissions</h2>
        <select
          value={submissionLevelFilter ?? ""}
          onChange={(e) => setSubmissionLevelFilter(e.target.value || null)}
          className="h-9 rounded-xl border border-[#00695c]/15 bg-white px-3 text-sm text-[#2c3e2d]"
        >
          <option value="">{t("admin.allLevels")}</option>
          {submissionLevels.map((l) => (
            <option key={l} value={l}>{l.toUpperCase()}</option>
          ))}
        </select>
      </div>
      {grouped.map(([title, subs]) => (
        <Card key={title} className="clay-card border-0 overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-[#00695c]/5 px-5 py-3 border-b border-[#E6DFD3]">
              <h3 className="font-semibold text-[#2c3e2d]">{title}</h3>
              <p className="text-xs text-[#78909c]">{subs.length} submission{subs.length !== 1 ? "s" : ""}</p>
            </div>
            {subs.map((s) => {
              const editing = isEditing(s.id);
              const vals = editValues[s.id] ?? { grade: s.grade?.toString() ?? "", feedback: s.feedback ?? "" };
              return (
                <div key={s.id} className="px-5 py-4 border-b border-[#E6DFD3]/50 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-[#2c3e2d]">
                        {s.studentTitle ? `${s.studentTitle}. ${s.studentName}` : s.studentName}
                      </p>
                      <p className="text-[10px] text-[#aab7b7]">
                        Submitted {new Date(s.submittedAt).toLocaleString()}
                      </p>
                    </div>
                    {s.grade != null && (
                      <span className="text-sm font-bold text-[#00695c]">{s.grade}/100</span>
                    )}
                  </div>
                  {s.text && (
                    <p className="text-sm text-[#445E5D] bg-[#F8F4EB] rounded-lg p-3 mb-3 whitespace-pre-wrap">{s.text}</p>
                  )}
                  {s.fileUrl && (
                    <a
                      href={s.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#00695c] font-medium hover:underline mb-3"
                    >
                      <Upload className="w-3 h-3" />
                      View attachment
                    </a>
                  )}

                  {s.grade != null && !editing ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#00695c]">Grade: {s.grade}/100</span>
                        <button
                          onClick={() => startEditing(s.id, s.grade, s.feedback)}
                          className="text-xs text-[#00695c] font-medium hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                      {s.feedback && (
                        <p className="text-sm text-[#445E5D] bg-[#F0F7F4] rounded-lg p-3">{s.feedback}</p>
                      )}
                      {s.gradedAt && (
                        <p className="text-[10px] text-[#aab7b7]">
                          Graded {new Date(s.gradedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="Grade (0-100)"
                        value={vals.grade}
                        onChange={(e) => setEditValues(prev => ({
                          ...prev,
                          [s.id]: { ...prev[s.id] ?? { grade: "", feedback: "" }, grade: e.target.value }
                        }))}
                        className="w-full h-10 rounded-xl border border-[#00695c]/15 bg-white px-4 text-sm"
                      />
                      <textarea
                        placeholder="Feedback (optional)"
                        value={vals.feedback}
                        onChange={(e) => setEditValues(prev => ({
                          ...prev,
                          [s.id]: { ...prev[s.id] ?? { grade: "", feedback: "" }, feedback: e.target.value }
                        }))}
                        className="flex min-h-[60px] w-full rounded-xl border border-[#00695c]/15 bg-white px-4 py-2 text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleGrade(s.id)}
                          disabled={isGrading(s.id) || !vals.grade}
                          className="rounded-full bg-[#00695c] hover:bg-[#004d40] text-xs h-8"
                        >
                          {isGrading(s.id) ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3 mr-1" />}
                          {s.grade != null ? "Update" : "Grade"}
                        </Button>
                        {editing && (
                          <Button
                            variant="ghost"
                            onClick={() => setEditingId(null)}
                            className="rounded-full text-xs h-8"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                      {s.gradedAt && (
                        <p className="text-[10px] text-[#aab7b7]">
                          Graded {new Date(s.gradedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CenterSettingsForm({ centerId }: { centerId: number }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const { data: settings, isLoading } = trpc.center.settings.useQuery();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("");
  const [banner, setBanner] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [emails, setEmails] = useState<{ email: string }[]>([{ email: "" }]);
  const [locations, setLocations] = useState<{ country: string; city: string; address: string }[]>([
    { country: "", city: "", address: "" },
  ]);
  const [phones, setPhones] = useState<{ countryCode: string; number: string }[]>([
    { countryCode: "49", number: "" },
  ]);
  const [albumImages, setAlbumImages] = useState<string[]>([]);
  const [themeColor, setThemeColor] = useState("#e8f5e9");
  const [uploading, setUploading] = useState<"logo" | "banner" | "album" | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropField, setCropField] = useState<"logo" | "banner" | null>(null);

  const uploadCroppedImage = async (blob: Blob) => {
    const field = cropField;
    if (!field) return;
    setUploading(field);
    try {
      const { uploadUrl, publicUrl } = await getUploadUrl.mutateAsync({
        fileName: `${field}.jpg`,
        contentType: "image/jpeg",
        fileSize: blob.size,
      });
      await fetch(uploadUrl, {
        method: "PUT",
        body: blob,
        headers: { "Content-Type": "image/jpeg" },
      });
      if (field === "logo") setLogo(publicUrl);
      else setBanner(publicUrl);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      alert(`Failed to upload ${field}: ${msg}`);
    } finally {
      setUploading(null);
      setCropImageSrc(null);
      setCropField(null);
    }
  };

  // Validation helpers
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePhone = (number: string) => {
    return /^\d{7,15}$/.test(number.replace(/\D/g, ""));
  };

  const [emailErrors, setEmailErrors] = useState<{ [key: number]: boolean }>({});
  const [phoneErrors, setPhoneErrors] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    if (settings) {
      setName(settings.name);
      setDescription(settings.description ?? "");
      setLogo(settings.logo ?? "");
      setBanner(settings.banner ?? "");
      setAddress(settings.address ?? "");
      setPhone(settings.phone ?? "");
      setEmails(settings.emails && settings.emails.length > 0 ? settings.emails : [{ email: "" }]);
      setLocations(
        settings.locations && settings.locations.length > 0
          ? settings.locations
          : [{ country: "", city: "", address: "" }]
      );
      setPhones(
        settings.phones && settings.phones.length > 0
          ? settings.phones
          : [{ countryCode: "49", number: "" }]
      );
      setAlbumImages(settings.albumImages ?? []);
      setThemeColor(settings.themeColor ?? "#e8f5e9");
    }
  }, [settings]);

  const saveMutation = trpc.center.update.useMutation({
    onSuccess: () => {
      utils.center.settings.invalidate();
      utils.center.dashboardStats.invalidate();
      utils.center.myCenter.invalidate();
    },
    onError: (err) => {
      alert("Save failed: " + err.message);
    },
  });

  const getUploadUrl = trpc.upload.getUrl.useMutation();
  const deleteMutation = trpc.center.delete.useMutation({
    onSuccess: () => {
      navigate("/");
    },
  });

  const upgradeMutation = trpc.billing.simulateUpgrade.useMutation({
    onSuccess: () => {
      utils.center.settings.invalidate();
      utils.center.dashboardStats.invalidate();
    },
  });

  const downgradeMutation = trpc.billing.simulateDowngrade.useMutation({
    onSuccess: () => {
      utils.center.settings.invalidate();
      utils.center.dashboardStats.invalidate();
    },
  });

  const handleAlbumUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;
    setUploading("album");
    try {
      const urls = await Promise.all(
        fileArray.map(async (file) => {
          const { uploadUrl, publicUrl } = await getUploadUrl.mutateAsync({
            fileName: file.name,
            contentType: file.type,
            fileSize: file.size,
          });
          await fetch(uploadUrl, {
            method: "PUT",
            body: file,
            headers: { "Content-Type": file.type },
          });
          return publicUrl;
        })
      );
      setAlbumImages((prev) => [...prev, ...urls]);
    } finally {
      setUploading(null);
    }
  };

  const handleSave = () => {
    const payload = {
      id: centerId,
      name,
      description: description || null,
      logo: logo || null,
      banner: banner || null,
      address: address || null,
      phone: phone || null,
      emails: emails.filter((e) => e.email.trim() !== ""),
      locations: locations.filter((l) => l.country && l.city),
      phones: phones.filter((p) => p.number.trim() !== ""),
      albumImages,
      themeColor,
    };
    saveMutation.mutate(payload);
  };

  if (isLoading) {
    return (
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
    );
  }

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
                onClick={() => document.getElementById("settings-logo-upload")?.click()}
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
              id="settings-logo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    setCropImageSrc(reader.result as string);
                    setCropField("logo");
                  };
                  reader.readAsDataURL(file);
                }
                e.target.value = "";
              }}
            />
            {logo ? (
              <div
                className="w-24 h-24 rounded-2xl overflow-hidden border border-[#00695c]/10 cursor-pointer"
                onClick={() => { setCropImageSrc(logo); setCropField("logo"); }}
              >
                <img src={logo} alt="logo" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-[#00695c]/15 flex items-center justify-center">
                <Image className="w-8 h-8 text-[#78909c]" />
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="clay-card border-0">
          <CardContent className="p-6 space-y-4">
            <label className="text-sm font-medium text-[#2c3e2d]">{t("admin.bannerLabel")}</label>
            <p className="text-xs text-[#78909c]">{t("admin.bannerRecommended")}</p>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={uploading === "banner"}
                onClick={() => document.getElementById("settings-banner-upload")?.click()}
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
              id="settings-banner-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    setCropImageSrc(reader.result as string);
                    setCropField("banner");
                  };
                  reader.readAsDataURL(file);
                }
                e.target.value = "";
              }}
            />
            {banner ? (
              <div
                className="w-full h-20 rounded-2xl overflow-hidden border border-[#00695c]/10 cursor-pointer"
                onClick={() => { setCropImageSrc(banner); setCropField("banner"); }}
              >
                <img src={banner} alt="banner" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-full h-20 rounded-2xl border-2 border-dashed border-[#00695c]/15 flex items-center justify-center">
                <Image className="w-8 h-8 text-[#78909c]" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {cropImageSrc && cropField && (
        <ImageCropper
          open={!!cropImageSrc}
          onOpenChange={(open) => { if (!open) { setCropImageSrc(null); setCropField(null); } }}
          imageSrc={cropImageSrc}
          onCropComplete={(blob) => uploadCroppedImage(blob)}
          aspect={cropField === "logo" ? 1 : 16 / 9}
          shape={cropField === "logo" ? "round" : "rect"}
        />
      )}

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

      {/* Contact Emails */}
      <Card className="clay-card border-0">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[#2c3e2d]">{t("admin.contactEmails")}</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEmails((prev) => [...prev, { email: "" }])}
              className="rounded-full border-[#00695c]/15 text-xs h-8"
            >
              <Plus className="w-3 h-3 mr-1" /> {t("admin.addEmail")}
            </Button>
          </div>
           <div className="space-y-2">
             {emails.map((entry, i) => (
               <div key={i} className="space-y-1">
                 <div className="flex items-center gap-2">
                   <Input
                     value={entry.email}
                     onChange={(e) => {
                       const next = [...emails];
                       next[i] = { email: e.target.value };
                       setEmails(next);
                       if (e.target.value) {
                         setEmailErrors((prev) => ({
                           ...prev,
                           [i]: !validateEmail(e.target.value),
                         }));
                       }
                     }}
                     placeholder="email@example.com"
                     className={`rounded-xl h-11 border-[#00695c]/15 flex-1 ${
                       emailErrors[i] ? "border-red-500" : ""
                     }`}
                   />
                   {emails.length > 1 && (
                     <button
                       type="button"
                       onClick={() => setEmails(emails.filter((_, j) => j !== i))}
                       className="text-red-400 hover:text-red-600 p-2"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                   )}
                 </div>
                 {emailErrors[i] && entry.email && (
                   <p className="text-xs text-red-500">Invalid email format</p>
                 )}
               </div>
             ))}
           </div>
        </CardContent>
      </Card>

      {/* Locations */}
      <Card className="clay-card border-0">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[#2c3e2d]">{t("admin.contactLocations")}</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setLocations((prev) => [...prev, { country: "", city: "", address: "" }])
              }
              className="rounded-full border-[#00695c]/15 text-xs h-8"
            >
              <Plus className="w-3 h-3 mr-1" /> {t("admin.addLocation")}
            </Button>
          </div>
          <div className="space-y-4">
            {locations.map((loc, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl border border-[#00695c]/10 bg-[#00695c]/3 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#78909c]">
                    {t("admin.locationLabel")} {i + 1}
                  </span>
                  {locations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setLocations(locations.filter((_, j) => j !== i))}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-[#78909c]">{t("admin.countryLabel")}</label>
                    <div className="relative mt-1">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78909c] pointer-events-none" />
                      <select
                        value={loc.country}
                        onChange={(e) => {
                          const next = [...locations];
                          next[i] = { ...next[i], country: e.target.value };
                          setLocations(next);
                        }}
                        className="flex h-11 w-full rounded-xl border border-[#00695c]/15 bg-white pl-10 pr-10 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00695c] appearance-none cursor-pointer"
                      >
                        <option value="" disabled>
                          {t("admin.countryPlaceholder")}
                        </option>
                        {countries.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.flag} {c.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78909c] pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-[#78909c]">{t("admin.cityLabel")}</label>
                    <div className="relative mt-1">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78909c] pointer-events-none" />
                      <Input
                        value={loc.city}
                        onChange={(e) => {
                          const next = [...locations];
                          next[i] = { ...next[i], city: e.target.value };
                          setLocations(next);
                        }}
                        placeholder={t("admin.cityPlaceholder")}
                        className="rounded-xl h-11 border-[#00695c]/15 pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-[#78909c]">{t("admin.addressLabel")}</label>
                    <Input
                      value={loc.address}
                      onChange={(e) => {
                        const next = [...locations];
                        next[i] = { ...next[i], address: e.target.value };
                        setLocations(next);
                      }}
                      placeholder={t("admin.addressPlaceholder")}
                      className="rounded-xl h-11 border-[#00695c]/15 mt-1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Phone Numbers */}
      <Card className="clay-card border-0">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[#2c3e2d]">{t("admin.contactPhones")}</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPhones((prev) => [...prev, { countryCode: "49", number: "" }])}
              className="rounded-full border-[#00695c]/15 text-xs h-8"
            >
              <Plus className="w-3 h-3 mr-1" /> {t("admin.addPhone")}
            </Button>
          </div>
           <div className="space-y-2">
             {phones.map((entry, i) => (
               <div key={i} className="space-y-1">
                 <div className="flex items-center gap-2">
                   <Select
                     value={phones[i]?.countryCode ?? "49"}
                     onValueChange={(v) => {
                       const next = [...phones];
                       next[i] = { ...next[i], countryCode: v };
                       setPhones(next);
                     }}
                   >
                     <SelectTrigger className="w-[180px] rounded-xl h-11 border-[#00695c]/15">
                       <SelectValue>
                         {(() => {
                           const code = phones[i]?.countryCode;
                           const country = [...countries].find((c) => c.dial === code);
                           return country ? `${country.flag} +${country.dial}` : t("admin.selectCountry");
                         })()}
                       </SelectValue>
                     </SelectTrigger>
                     <SelectContent className="rounded-2xl border-0 shadow-xl">
                       {countries.map((c) => (
                         <SelectItem key={c.code} value={c.dial}>
                           {c.flag} +{c.dial} {c.name}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                   <Input
                     value={entry.number}
                     onChange={(e) => {
                       const next = [...phones];
                       next[i] = { ...next[i], number: e.target.value };
                       setPhones(next);
                       if (e.target.value) {
                         setPhoneErrors((prev) => ({
                           ...prev,
                           [i]: !validatePhone(e.target.value),
                         }));
                       }
                     }}
                     placeholder={t("admin.phonePlaceholder")}
                     className={`rounded-xl h-11 border-[#00695c]/15 flex-1 ${
                       phoneErrors[i] ? "border-red-500" : ""
                     }`}
                   />
                   {phones.length > 1 && (
                     <button
                       type="button"
                       onClick={() => setPhones(phones.filter((_, j) => j !== i))}
                       className="text-red-400 hover:text-red-600 p-2"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                   )}
                 </div>
                 {phoneErrors[i] && entry.number && (
                   <p className="text-xs text-red-500">Phone must have 7-15 digits</p>
                 )}
               </div>
             ))}
           </div>
        </CardContent>
      </Card>

      {/* Album */}
      <Card className="clay-card border-0">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-[#2c3e2d]">{t("admin.photoAlbum")}</h3>
          <input
            id="settings-album-upload"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleAlbumUpload(e.target.files);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading === "album"}
            onClick={() => document.getElementById("settings-album-upload")?.click()}
            className="rounded-xl h-11 border-[#00695c]/15 text-[#2c3e2d]"
          >
            {uploading === "album" ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {uploading === "album" ? t("admin.uploading") : t("admin.chooseImages")}
          </Button>
          <p className="text-xs text-[#78909c]">{t("admin.albumSupported")}</p>
          {albumImages.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {albumImages.map((url, i) => (
                <div key={i} className="relative group">
                  <div className="w-full aspect-square rounded-xl overflow-hidden border border-[#00695c]/10">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setAlbumImages(albumImages.filter((_, j) => j !== i))}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Theme Color */}
      <Card className="clay-card border-0">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-[#2c3e2d]">{t("admin.themeColor")}</h3>
          <div className="flex flex-wrap gap-3">
            {["#e8f5e9","#ffffff","#f5f0e8","#e3f2fd","#fce4ec","#f3e5f5","#fff8e1","#e0f2f1","#f5f5f5","#00695c","#2c3e2d","#37474f","#c8e6c9","#a5d6a7","#81c784","#66bb6a","#b2dfdb","#80cbc4","#4db6ac","#b3e5fc","#81d4fa","#4fc3f7","#b39ddb","#9575cd","#ce93d8","#ab47bc","#ef9a9a","#e57373","#ffcc80","#ffb74d","#fff176","#ffd54f","#bcaaa4","#90a4ae","#78909c","#546e7a"].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setThemeColor(c)}
                className={`w-9 h-9 rounded-full border-2 transition-all ${
                  themeColor === c ? "border-[#00695c] scale-110 shadow-md" : "border-transparent hover:scale-105"
                }`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Dashboard */}
      {settings?.usage && (
        <div className="space-y-4 mb-6">
          <h3 className="text-sm font-semibold text-[#2c3e2d]">Usage & Limits</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                label: "Students",
                value: settings.usage.studentCount,
                limit: settings.limits.maxStudents,
                color: "blue",
              },
              {
                label: "Active (30d)",
                value: settings.usage.activeStudents,
                limit: settings.limits.maxStudents,
                color: "green",
              },
              {
                label: "Lessons",
                value: settings.usage.lessonsCreated,
                limit: 999999,
                color: "purple",
              },
              {
                label: "Quizzes",
                value: settings.usage.quizzesCreated,
                limit: 999999,
                color: "orange",
              },
            ].map((stat) => (
              <Card key={stat.label} className="clay-card border-0">
                <CardContent className="p-4">
                  <p className="text-xs text-[#78909c] mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-[#2c3e2d]">{stat.value}</p>
                  {stat.limit !== 999999 && (
                    <p className="text-xs text-[#78909c] mt-1">
                      {Math.round((stat.value / stat.limit) * 100)}% used
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Storage Usage */}
          <Card className="clay-card border-0">
            <CardContent className="p-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-[#2c3e2d]">Storage Usage</span>
                <span className="text-sm font-medium text-[#00695c]">
                  {settings.usage.storageUsedMB.toFixed(1)} MB / {settings.limits.maxStorageGB} GB
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    (settings.usage.storageUsedMB / (settings.limits.maxStorageGB * 1024)) * 100 > 80
                      ? "bg-red-500"
                      : "bg-[#00695c]"
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      (settings.usage.storageUsedMB / (settings.limits.maxStorageGB * 1024)) * 100
                    )}%`,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Plan Card - Enhanced */}
      <Card className="clay-card border-0 bg-gradient-to-br from-[#e8f5e9] to-[#f1f8e9] mb-6">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[#2c3e2d]">{t("admin.plan")}</h3>
              <p className="text-xs text-[#78909c] mt-1">
                {settings?.plan === "premium"
                  ? settings?.nextBillingDate
                    ? `Renews on ${new Date(settings.nextBillingDate).toLocaleDateString()}`
                    : "Active subscription"
                  : "Upgrade to unlock unlimited resources"}
              </p>
            </div>
            <span
              className={`text-sm font-bold px-4 py-2 rounded-full ${
                settings?.plan === "premium"
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {settings?.plan === "premium" ? t("admin.planPremium") : t("admin.planFree")}
            </span>
          </div>

          {/* Plan Features */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/50">
              <span className="text-sm text-[#2c3e2d]">Students</span>
              <span className="font-semibold text-[#00695c]">
                {settings?.usage?.studentCount ?? 0}/
                {settings?.plan === "premium" ? "∞" : "10"}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/50">
              <span className="text-sm text-[#2c3e2d]">Videos per week</span>
              <span className="font-semibold text-[#00695c]">
                {settings?.videoUploadCount ?? 0}/
                {settings?.plan === "premium" ? "∞" : "1"}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/50">
              <span className="text-sm text-[#2c3e2d]">Assignments per week</span>
              <span className="font-semibold text-[#00695c]">
                {settings?.assignmentCount ?? 0}/
                {settings?.plan === "premium" ? "∞" : "5"}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/50">
              <span className="text-sm text-[#2c3e2d]">Meeting Rooms</span>
              <span
                className={`font-semibold ${
                  settings?.plan === "premium" ? "text-green-600" : "text-[#78909c]"
                }`}
              >
                {settings?.plan === "premium" ? "✓ Included" : "Not included"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          {settings?.plan === "free" ? (
            <UpgradeDialog
              onUpgrade={() => upgradeMutation.mutate()}
              isPending={upgradeMutation.isPending}
            />
          ) : (
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full rounded-full"
                onClick={() => alert("Subscription management is not available in development mode.")}
              >
                {t("admin.manageSubscription")}
              </Button>
              <Button
                variant="ghost"
                className="w-full text-red-600 rounded-full"
                disabled={downgradeMutation.isPending}
                onClick={() => {
                  if (window.confirm("Downgrade to Free plan? This is a simulation.")) {
                    downgradeMutation.mutate();
                  }
                }}
              >
                {downgradeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {t("admin.cancelSubscription")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

        {/* Delete Center */}
      <Card className="clay-card border-0 border-red-200">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-red-600">{t("admin.deleteCenter")}</h3>
          <p className="text-sm text-[#78909c]">{t("admin.deleteCenterWarning")}</p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl h-11 border-red-300 text-red-600 hover:bg-red-50"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                {t("admin.deleteCenter")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-3xl">
              <AlertDialogHeader>
                <AlertDialogTitle>{t("admin.confirmDeleteTitle")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("admin.confirmDeleteDescription")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-full">{t("admin.cancel")}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteMutation.mutate({ id: settings!.id })}
                  className="rounded-full bg-red-600 hover:bg-red-700 text-white"
                >
                  {t("admin.deleteCenter")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {saveMutation.error && (
        <p className="text-sm text-red-500">{saveMutation.error.message}</p>
      )}
      {saveMutation.isSuccess && (
        <p className="text-sm text-green-600 font-medium">{t("admin.updatedSuccess")}</p>
      )}
      <Button
        onClick={handleSave}
        disabled={saveMutation.isPending || uploading !== null}
        className="rounded-full bg-[#00695c] hover:bg-[#004d40] font-semibold"
      >
        {saveMutation.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <Save className="w-4 h-4 mr-2" />
        )}
        {t("admin.saveChanges")}
      </Button>
    </div>
  );
}

function UpgradeDialog({ onUpgrade, isPending }: { onUpgrade: () => void; isPending: boolean }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("monthly");

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-[#00695c] hover:bg-[#004d40] font-semibold w-full"
      >
        {t("admin.planUpgrade")} - From €9.99/month
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-3xl border-0 shadow-xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-[#2c3e2d]">Upgrade Your Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-[#78909c]">
              Choose the plan that fits your center:
            </p>

            {/* Monthly Plan */}
            <button
              type="button"
              onClick={() => setSelectedPlan("monthly")}
              className={`w-full text-left rounded-2xl border-2 p-4 bg-white transition-all ${
                selectedPlan === "monthly"
                  ? "border-[#00695c] shadow-md"
                  : "border-[#00695c]/20 hover:border-[#00695c]/40"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedPlan === "monthly" ? "border-[#00695c]" : "border-[#78909c]"
                    }`}>
                      {selectedPlan === "monthly" && <div className="w-2 h-2 rounded-full bg-[#00695c]" />}
                    </div>
                    <h4 className="font-semibold text-[#2c3e2d]">Monthly</h4>
                  </div>
                  <p className="text-xs text-[#78909c] ml-6">Cancel after first month</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-[#00695c]">€9.99</span>
                  <span className="text-xs text-[#78909c]">/month</span>
                </div>
              </div>
              <ul className="space-y-1.5 ml-6">
                {[
                  "Unlimited students",
                  "Unlimited videos, lessons & assignments",
                  "Meeting rooms & community chat",
                  "Progress analytics",
                  "Priority support",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-[#2c3e2d]">
                    <span className="w-5 h-5 rounded-full bg-[#00695c]/10 flex items-center justify-center shrink-0">
                      <span className="text-[#00695c] text-xs">✓</span>
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </button>

            {/* Yearly Plan */}
            <button
              type="button"
              onClick={() => setSelectedPlan("yearly")}
              className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${
                selectedPlan === "yearly"
                  ? "border-[#445E5D] shadow-md bg-[#445E5D]/5"
                  : "border-[#445E5D]/20 bg-[#445E5D]/5 hover:border-[#445E5D]/40"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedPlan === "yearly" ? "border-[#445E5D]" : "border-[#78909c]"
                    }`}>
                      {selectedPlan === "yearly" && <div className="w-2 h-2 rounded-full bg-[#445E5D]" />}
                    </div>
                    <h4 className="font-semibold text-[#2c3e2d]">Yearly</h4>
                    <span className="text-[10px] font-semibold bg-[#445E5D] text-white px-2 py-0.5 rounded-full">BEST VALUE</span>
                  </div>
                  <p className="text-xs text-[#78909c] ml-6">Save ~€20/year</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-[#00695c]">€99.99</span>
                  <span className="text-xs text-[#78909c]">/year</span>
                </div>
              </div>
              <ul className="space-y-1.5 ml-6">
                {[
                  "Everything in Monthly",
                  "Custom domain",
                  "White-label branding",
                  "Multiple admins",
                  "AI agent access",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-[#2c3e2d]">
                    <span className="w-5 h-5 rounded-full bg-[#445E5D]/10 flex items-center justify-center shrink-0">
                      <span className="text-[#445E5D] text-xs">✓</span>
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </button>

            <p className="text-xs text-[#78909c] italic">
              {selectedPlan === "monthly"
                ? "Monthly plan — cancel after the first month. No long-term commitment."
                : "Yearly plan — best value. Billed annually at €99.99."}
            </p>
            <Button
              type="button"
              onClick={() => {
                onUpgrade();
                setOpen(false);
              }}
              disabled={isPending}
              className="w-full rounded-full bg-[#00695c] hover:bg-[#004d40] font-semibold"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {selectedPlan === "monthly" ? "Upgrade to Monthly — €9.99/month" : "Upgrade to Yearly — €99.99/year"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: unreadCount } = trpc.notifications.unreadCount.useQuery(undefined, {
    refetchInterval: 30000,
  });
  const { data: notifications } = trpc.notifications.list.useQuery({ limit: 10 });
  const utils = trpc.useUtils();
  const markRead = trpc.notifications.markRead.useMutation({
    onSuccess: () => utils.notifications.invalidate(),
  });
  const markAllRead = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => utils.notifications.invalidate(),
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-[#00695c]/10 transition-colors"
      >
        <Bell className="w-5 h-5 text-[#2c3e2d]" />
        {unreadCount && unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#00695c]/10 overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#00695c]/10">
            <h3 className="text-sm font-semibold text-[#2c3e2d]">Notifications</h3>
            {unreadCount && unreadCount > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                className="text-xs text-[#00695c] font-medium hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {!notifications || notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-[#78909c]">
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.read && markRead.mutate({ id: n.id })}
                  className={`w-full text-left px-4 py-3 border-b border-[#00695c]/5 hover:bg-[#00695c]/3 transition-colors ${
                    !n.read ? "bg-[#00695c]/5" : ""
                  }`}
                >
                  <p className={`text-sm ${!n.read ? "font-semibold text-[#2c3e2d]" : "text-[#445E5D]"}`}>
                    {n.title}
                  </p>
                  {n.body && (
                    <p className="text-xs text-[#78909c] mt-0.5 line-clamp-2">{n.body}</p>
                  )}
                  <p className="text-[10px] text-[#aab7b7] mt-1">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ChatPanel() {
  const { t } = useTranslation();
  const utils = trpc.useUtils();
  const { user } = useAuth();
  const chatLevels = ["a1", "a2", "b1", "b2", "c1", "c2"] as const;
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
    const level = chatLevelFilter as "a1" | "a2" | "b1" | "b2" | "c1" | "c2" | undefined;
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#2c3e2d]">{t("admin.tabChat")}</h2>
        <select
          value={chatLevelFilter ?? ""}
          onChange={(e) => setChatLevelFilter(e.target.value || null)}
          className="h-9 rounded-xl border border-[#00695c]/15 bg-white px-3 text-sm text-[#2c3e2d]"
        >
          <option value="">{t("admin.allLevels")}</option>
          {chatLevels.map((l) => (
            <option key={l} value={l}>{l.toUpperCase()}</option>
          ))}
        </select>
      </div>

      <Card className="clay-card border-0 relative overflow-hidden">
        <CardContent className="p-4 relative">
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
            <svg className="w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
              <defs>
                <pattern id="chat-contour-a" patternUnits="userSpaceOnUse" width="120" height="80" patternTransform="scale(1.5)">
                  <path d="M0,40 Q30,20 60,40 T120,40" fill="none" stroke="#00695c" strokeWidth="2" />
                  <path d="M0,20 Q30,0 60,20 T120,20" fill="none" stroke="#00695c" strokeWidth="1.5" opacity="0.6" />
                  <path d="M0,60 Q30,40 60,60 T120,60" fill="none" stroke="#00695c" strokeWidth="1.5" opacity="0.6" />
                  <path d="M0,0 Q30,-20 60,0 T120,0" fill="none" stroke="#00695c" strokeWidth="1" opacity="0.3" />
                  <path d="M0,80 Q30,60 60,80 T120,80" fill="none" stroke="#00695c" strokeWidth="1" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#chat-contour-a)" />
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
                <p className="text-sm text-[#78909c]">No messages yet. Start the conversation!</p>
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

const EMOJI_LIST = ["👍", "❤️", "😂", "🎉", "🔥", "😮", "🙏", "💯"];

function RoomChat({ room, onBack }: { room: { id: number; name: string; url?: string | null }; onBack: () => void }) {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const { data: messages, isLoading } = trpc.meetingRooms.messages.useQuery(
    { roomId: room.id },
    { refetchInterval: 3000 }
  );
  const sendMessage = trpc.meetingRooms.sendMessage.useMutation({
    onSuccess: () => utils.meetingRooms.messages.invalidate(),
  });
  const deleteMessage = trpc.meetingRooms.deleteMessage.useMutation({
    onSuccess: () => utils.meetingRooms.messages.invalidate(),
  });
  const reactMessage = trpc.meetingRooms.reactMessage.useMutation({
    onSuccess: () => utils.meetingRooms.messages.invalidate(),
  });
  const getPresignedUrl = trpc.upload.getChatUploadUrl.useMutation();
  const [text, setText] = useState("");
  const [pendingImage, setPendingImage] = useState<{ file: File; preview: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [emojiPicker, setEmojiPicker] = useState<number | null>(null);
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
    if (pendingImage) {
      setUploading(true);
      try {
        const { uploadUrl, publicUrl } = await getPresignedUrl.mutateAsync({
          fileName: pendingImage.file.name,
          contentType: pendingImage.file.type,
          fileSize: pendingImage.file.size,
        });
        await fetch(uploadUrl, { method: "PUT", body: pendingImage.file, headers: { "Content-Type": pendingImage.file.type } });
        sendMessage.mutate({ roomId: room.id, message: text.trim(), imageUrl: publicUrl });
      } catch (err) {
        console.error("Upload failed", err);
        setUploading(false);
        return;
      }
      setUploading(false);
      setPendingImage(null);
    } else {
      sendMessage.mutate({ roomId: room.id, message: text.trim() });
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
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-sm text-[#00695c] hover:underline flex items-center gap-1">
          <ChevronDown className="w-4 h-4 rotate-90" />
          Back to rooms
        </button>
        <span className="text-[#78909c]">/</span>
        <h3 className="font-semibold text-[#2c3e2d]">{room.name}</h3>
        {room.url && (
          <a href={room.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#00695c] hover:underline ml-auto">
            Join Meeting →
          </a>
        )}
      </div>

      <Card className="clay-card border-0 relative overflow-hidden">
        <CardContent className="p-4 relative">
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
            <svg className="w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
              <defs>
                <pattern id="room-chat" patternUnits="userSpaceOnUse" width="120" height="80" patternTransform="scale(1.5)">
                  <path d="M0,40 Q30,20 60,40 T120,40" fill="none" stroke="#00695c" strokeWidth="2" />
                  <path d="M0,20 Q30,0 60,20 T120,20" fill="none" stroke="#00695c" strokeWidth="1.5" opacity="0.6" />
                  <path d="M0,60 Q30,40 60,60 T120,60" fill="none" stroke="#00695c" strokeWidth="1.5" opacity="0.6" />
                  <path d="M0,0 Q30,-20 60,0 T120,0" fill="none" stroke="#00695c" strokeWidth="1" opacity="0.3" />
                  <path d="M0,80 Q30,60 60,80 T120,80" fill="none" stroke="#00695c" strokeWidth="1" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#room-chat)" />
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
                <p className="text-sm text-[#78909c]">No messages yet in this room.</p>
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
                                      onClick={() => { reactMessage.mutate({ id: msg.id, roomId: room.id, emoji }); setEmojiPicker(null); }}
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
                                onClick={() => deleteMessage.mutate({ id: msg.id, roomId: room.id })}
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
                              onClick={() => reactMessage.mutate({ id: msg.id, roomId: room.id, emoji: r.emoji })}
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
                    </div>
                  </div>
                );
              })
            )}
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

function MeetingRoomsPanel() {
  const { t } = useTranslation();
  const utils = trpc.useUtils();
  const { data: rooms, isLoading } = trpc.meetingRooms.list.useQuery();
  const createRoom = trpc.meetingRooms.create.useMutation({
    onSuccess: () => utils.meetingRooms.list.invalidate(),
  });
  const deleteRoom = trpc.meetingRooms.delete.useMutation({
    onSuccess: () => utils.meetingRooms.list.invalidate(),
  });
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<{ id: number; name: string; url?: string | null } | null>(null);
  const [callRoom, setCallRoom] = useState<string | null>(null);

  const handleCreate = () => {
    if (!name.trim()) return;
    createRoom.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      scheduledAt: scheduledAt || undefined,
    });
    setName("");
    setDescription("");
    setScheduledAt("");
    setShowForm(false);
  };

  if (selectedRoom) {
    return <RoomChat room={selectedRoom} onBack={() => setSelectedRoom(null)} />;
  }

  return (
    <div className="space-y-4">
      <VideoCall roomUrl={callRoom ?? ""} open={!!callRoom} onClose={() => setCallRoom(null)} />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#2c3e2d]">{t("admin.tabMeetingRooms")}</h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="rounded-full bg-[#00695c] hover:bg-[#004d40] font-semibold"
        >
          <Plus className="w-4 h-4 mr-1" />
          {showForm ? "Cancel" : "Add Room"}
        </Button>
      </div>

      {showForm && (
        <Card className="clay-card border-0">
          <CardContent className="p-6 space-y-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Room name (e.g. A1 Conversation Class)"
              className="flex h-11 w-full rounded-xl border border-[#00695c]/15 bg-white px-4 text-sm"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="flex min-h-[80px] w-full rounded-xl border border-[#00695c]/15 bg-white px-4 py-3 text-sm"
            />
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-[#00695c]/15 bg-white px-4 text-sm"
            />
            <Button
              onClick={handleCreate}
              disabled={createRoom.isPending || !name.trim()}
              className="rounded-full bg-[#00695c] hover:bg-[#004d40]"
            >
              {createRoom.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Room"}
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <Card className="clay-card border-0 p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#00695c] mx-auto" />
        </Card>
      ) : !rooms || rooms.length === 0 ? (
        <Card className="clay-card border-0 p-12 text-center">
          <Video className="w-12 h-12 text-[#78909c] mx-auto mb-4" />
          <p className="text-[#78909c]">No meeting rooms yet. Create one to host live sessions.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rooms.map((room) => (
            <Card key={room.id} className="clay-card border-0 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedRoom({ id: room.id, name: room.name, url: room.url })}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#2c3e2d]">{room.name}</h3>
                    {room.description && (
                      <p className="text-sm text-[#78909c] mt-1">{room.description}</p>
                    )}
                    {room.scheduledAt && (
                      <p className="text-xs text-[#78909c] mt-1">
                        Scheduled: {new Date(room.scheduledAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setCallRoom(room.url); }}
                      className="text-xs bg-[#00695c] text-white px-3 py-1.5 rounded-full hover:bg-[#004d40] transition-colors font-medium"
                    >
                      Join Call
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteRoom.mutate({ id: room.id }); }}
                      className="text-red-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

