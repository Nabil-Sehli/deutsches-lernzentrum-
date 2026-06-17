import { useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/providers/trpc";
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
import { registerSchema, type RegisterForm } from "@/lib/form-schemas";
import { ArrowLeft, Loader2, UserPlus } from "lucide-react";
import { useState } from "react";

export default function Register() {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [role, setRole] = useState<"student" | "teacher">("student");

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      role: "student",
      title: undefined,
      sex: undefined,
      age: undefined,
      city: "",
    },
  });

  const utils = trpc.useUtils();
  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      utils.invalidate();
      navigate(data.role === "teacher" ? "/admin" : "/dashboard");
    },
  });

  useEffect(() => {
    if (isAuthenticated && !authLoading && user) {
      navigate(user.role === "teacher" ? "/admin" : "/dashboard");
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  const onSubmit = (data: RegisterForm) => {
    registerMutation.mutate(data);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#e8f5e9] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#00695c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e8f5e9] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-[#78909c] hover:text-[#00695c] mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>
        <Link
          to="/login"
          className="inline-flex items-center gap-1 text-sm text-[#78909c] hover:text-[#00695c] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("register.backToSignIn")}
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#2c3e2d] mb-2">
            {t("register.title")}
          </h1>
          <p className="text-[#78909c]">
            {t("register.subtitle")}
          </p>
        </div>

        <Card className="clay-card border-0">
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("register.nameLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("register.namePlaceholder")}
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("register.emailLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("register.emailPlaceholder")}
                          type="email"
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
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("register.passwordLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("register.passwordPlaceholder")}
                          type="password"
                          className="rounded-xl h-11 border-[#00695c]/15"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="sex"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("register.sexLabel")}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? ""}
                        >
                          <FormControl>
                            <SelectTrigger className="rounded-xl h-11 border-[#00695c]/15">
                              <SelectValue placeholder={t("register.sexPlaceholder")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">{t("register.male")}</SelectItem>
                            <SelectItem value="female">{t("register.female")}</SelectItem>
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
                        <FormLabel>{t("register.ageLabel")}</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            inputMode="numeric"
                            placeholder={t("register.agePlaceholder")}
                            className="rounded-xl h-11 border-[#00695c]/15"
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "");
                              field.onChange(val ? parseInt(val, 10) : undefined);
                            }}
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
                      <FormLabel>{t("register.cityLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("register.cityPlaceholder")}
                          className="rounded-xl h-11 border-[#00695c]/15"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {role === "teacher" && (
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("register.titleLabel")}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? ""}
                        >
                          <FormControl>
                            <SelectTrigger className="rounded-xl h-11 border-[#00695c]/15">
                              <SelectValue placeholder={t("register.titlePlaceholder")} />
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

                <div>
                  <FormLabel>{t("register.roleLabel")}</FormLabel>
                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setRole("student");
                        form.setValue("role", "student");
                        form.setValue("title", undefined);
                      }}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        role === "student"
                          ? "border-[#00695c] bg-[#00695c]/5 text-[#00695c]"
                          : "border-gray-200 text-[#78909c] hover:border-[#00695c]/20"
                      }`}
                    >
                      {t("register.student")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRole("teacher");
                        form.setValue("role", "teacher");
                      }}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        role === "teacher"
                          ? "border-[#00695c] bg-[#00695c]/5 text-[#00695c]"
                          : "border-gray-200 text-[#78909c] hover:border-[#00695c]/20"
                      }`}
                    >
                      {t("register.teacher")}
                    </button>
                  </div>
                </div>

                {registerMutation.error && (
                  <p className="text-sm text-red-500">
                    {registerMutation.error.message}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="w-full rounded-full bg-[#00695c] hover:bg-[#004d40] h-11 font-semibold"
                >
                  {registerMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      {t("register.createAccount")}
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
