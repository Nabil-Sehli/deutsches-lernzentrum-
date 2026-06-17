import { Link } from "react-router";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
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
import { profileSchema, adminProfileSchema, type ProfileForm, type AdminProfileForm } from "@/lib/form-schemas";
import { ArrowLeft, Loader2, Save, User, Upload } from "lucide-react";
import { useState, useRef } from "react";

export default function Profile() {
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuth({
    redirectOnUnauthenticated: true,
  });

  const isAdmin = user?.role === "admin";

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: {
      name: user?.name ?? "",
      title: (user?.title as "Mr" | "Mrs" | null) ?? null,
      sex: (user?.sex as "male" | "female" | null) ?? null,
      age: user?.age ?? null,
      city: user?.city ?? "",
      bio: user?.bio ?? "",
      avatar: user?.avatar ?? "",
    },
  });

  const adminForm = useForm<AdminProfileForm>({
    resolver: zodResolver(adminProfileSchema),
    values: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      password: "",
    },
  });

  const utils = trpc.useUtils();
  const getUploadUrl = trpc.upload.getUrl.useMutation();
  const hiddenInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const updateAvatarMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: () => utils.auth.me.invalidate(),
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
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
      if (isAdmin) {
        updateAvatarMutation.mutate({
          name: user?.name ?? "",
          avatar: publicUrl,
        });
      } else {
        form.setValue("avatar", publicUrl);
      }
    } finally {
      setUploading(false);
      if (hiddenInput.current) hiddenInput.current.value = "";
    }
  };

  const updateMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
    },
  });

  const updateAdminMutation = trpc.auth.updateAdminProfile.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      adminForm.reset({}, { keepValues: true });
    },
  });

  const onSubmit = (data: ProfileForm) => {
    updateMutation.mutate(data);
  };

  const onAdminSubmit = (data: AdminProfileForm) => {
    updateAdminMutation.mutate(data);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#e8f5e9] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#00695c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#e8f5e9]">
      <Navigation />

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-[600px] mx-auto">
          <Link
            to={user.role === "admin" ? "/admin-portal" : user.role === "teacher" ? "/admin" : "/dashboard"}
            className="inline-flex items-center gap-1 text-sm text-[#78909c] hover:text-[#00695c] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("profile.back")}
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#2c3e2d] mb-2">
              {t("profile.title")}
            </h1>
            <p className="text-[#78909c]">
              {t("profile.subtitle")}
            </p>
          </div>

          <Card className="clay-card border-0">
            <CardContent className="p-8">
              <div className="flex items-start gap-5 mb-8 pb-6 border-b border-[#00695c]/8">
                <div className="relative shrink-0">
                  <div className="w-20 h-20 rounded-full bg-[#00695c]/10 flex items-center justify-center overflow-hidden">
                    {form.watch("avatar") ? (
                      <img
                        src={form.watch("avatar")}
                        alt=""
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-[#00695c]" />
                    )}
                  </div>
                  <input
                    ref={hiddenInput}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => hiddenInput.current?.click()}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#00695c] text-white flex items-center justify-center shadow-md hover:bg-[#004d40] transition-colors disabled:opacity-50"
                  >
                    {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="pt-1">
                  <h2 className="text-lg font-semibold text-[#2c3e2d]">
                    {user.title ? `${user.title}. ` : ""}{user.name}
                  </h2>
                  <p className="text-sm text-[#78909c]">
                    {user.email} &middot; {user.role === "admin" ? "Admin" : user.role === "teacher" ? t("profile.teacher") : t("profile.student")}
                  </p>
                </div>
              </div>

              {isAdmin ? (
                <Form {...adminForm}>
                  <form onSubmit={adminForm.handleSubmit(onAdminSubmit)} className="space-y-5">
                    <FormField
                      control={adminForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input className="rounded-xl h-11 border-[#00695c]/15" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={adminForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" className="rounded-xl h-11 border-[#00695c]/15" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={adminForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Leave blank to keep current" className="rounded-xl h-11 border-[#00695c]/15" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {updateAdminMutation.error && (
                      <p className="text-sm text-red-500">{updateAdminMutation.error.message}</p>
                    )}
                    {updateAdminMutation.isSuccess && (
                      <p className="text-sm text-green-600 font-medium">Profile updated</p>
                    )}
                    <Button
                      type="submit"
                      disabled={updateAdminMutation.isPending}
                      className="w-full rounded-full bg-[#00695c] hover:bg-[#004d40] h-11 font-semibold"
                    >
                      {updateAdminMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                    </Button>
                  </form>
                </Form>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("profile.fullNameLabel")}</FormLabel>
                          <FormControl>
                            <Input
                              className="rounded-xl h-11 border-[#00695c]/15"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {user.role === "teacher" && (
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("profile.titleLabel")}</FormLabel>
                            <Select
                              onValueChange={(v) => field.onChange(v || null)}
                              value={field.value ?? ""}
                            >
                              <FormControl>
                                <SelectTrigger className="rounded-xl h-11 border-[#00695c]/15">
                                  <SelectValue placeholder={t("profile.titlePlaceholder")} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Mr">Mr</SelectItem>
                                <SelectItem value="Mrs">Mrs</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="sex"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("profile.sexLabel")}</FormLabel>
                            <Select
                              onValueChange={(v) => field.onChange(v || null)}
                              value={field.value ?? ""}
                            >
                              <FormControl>
                                <SelectTrigger className="rounded-xl h-11 border-[#00695c]/15">
                                  <SelectValue placeholder={t("profile.sexPlaceholder")} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="male">{t("profile.male")}</SelectItem>
                                <SelectItem value="female">{t("profile.female")}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("profile.ageLabel")}</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                className="rounded-xl h-11 border-[#00695c]/15"
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      ? parseInt(e.target.value)
                                      : null,
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("profile.cityLabel")}</FormLabel>
                          <FormControl>
                            <Input
                              className="rounded-xl h-11 border-[#00695c]/15"
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
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("profile.bioLabel")}</FormLabel>
                          <FormControl>
                            <Textarea
                              className="rounded-xl min-h-[100px] border-[#00695c]/15"
                              placeholder={user.role === "teacher" ? t("profile.bioTeacherPlaceholder") : t("profile.bioStudentPlaceholder")}
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {updateMutation.error && (
                      <p className="text-sm text-red-500">
                        {updateMutation.error.message}
                      </p>
                    )}
                    {updateMutation.isSuccess && (
                      <p className="text-sm text-green-600 font-medium">
                        {t("profile.updatedSuccess")}
                      </p>
                    )}

                    <Button
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="w-full rounded-full bg-[#00695c] hover:bg-[#004d40] h-11 font-semibold"
                    >
                      {updateMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {t("profile.saveChanges")}
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
