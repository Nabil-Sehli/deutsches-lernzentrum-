import { useEffect, useRef, useState } from "react";
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
import { ArrowLeft, Loader2, UserPlus, Mail, ShieldCheck } from "lucide-react";

export default function Register() {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);

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
      if (data.requiresVerification) {
        setRegisteredEmail(data.email);
        setTimeout(() => codeInputRef.current?.focus(), 100);
      }
    },
  });

  const verifyMutation = trpc.auth.verifyEmail.useMutation({
    onSuccess: (data) => {
      utils.invalidate();
      navigate(data.role === "teacher" ? "/admin" : "/dashboard");
    },
    onError: (err) => {
      setVerifyError(err.message);
    },
  });

  const resendMutation = trpc.auth.resendVerificationCode.useMutation();

  useEffect(() => {
    if (isAuthenticated && !authLoading && user) {
      navigate(user.role === "teacher" ? "/admin" : "/dashboard");
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  const onSubmit = (data: RegisterForm) => {
    registerMutation.mutate(data);
  };

  const handleVerify = () => {
    if (!registeredEmail || code.length !== 6) return;
    setVerifyError(null);
    verifyMutation.mutate({ email: registeredEmail, code });
  };

  const handleResend = () => {
    if (registeredEmail) {
      resendMutation.mutate({ email: registeredEmail });
    }
  };

  const handleCodeChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 6);
    setCode(digits);
    setVerifyError(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#e8f5e9] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#00695c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (registeredEmail) {
    return (
      <div className="min-h-screen bg-[#e8f5e9] flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#00695c]/10 mb-4">
              <Mail className="w-8 h-8 text-[#00695c]" />
            </div>
            <h1 className="text-2xl font-bold text-[#2c3e2d] mb-2">Verify your email</h1>
            <p className="text-[#78909c]">
              We sent a verification code to{" "}
              <span className="font-medium text-[#2c3e2d]">{registeredEmail}</span>
            </p>
            <p className="text-xs text-amber-600 mt-2">
              Check your spam folder if you don't see it within a minute.
            </p>
          </div>

          <Card className="clay-card border-0">
            <CardContent className="p-8">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[#2c3e2d]">Verification Code</label>
                  <Input
                    ref={codeInputRef}
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    className="rounded-xl h-14 border-[#00695c]/15 text-center text-2xl tracking-[8px] font-bold mt-1.5"
                    value={code}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && code.length === 6) handleVerify(); }}
                  />
                  <p className="text-xs text-[#78909c] mt-1.5">Enter the 6-digit code sent to your email</p>
                </div>

                {verifyError && (
                  <p className="text-sm text-red-500">{verifyError}</p>
                )}

                {verifyMutation.error && (
                  <p className="text-sm text-red-500">{verifyMutation.error.message}</p>
                )}

                <Button
                  className="w-full rounded-full bg-[#00695c] hover:bg-[#004d40] h-11 font-semibold"
                  disabled={code.length !== 6 || verifyMutation.isPending}
                  onClick={handleVerify}
                >
                  {verifyMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      Verify Email
                    </>
                  )}
                </Button>

                <p className="text-center text-sm text-[#78909c]">
                  Did not receive the code?{" "}
                  <button
                    type="button"
                    className="text-[#00695c] hover:underline font-medium disabled:opacity-50"
                    disabled={resendMutation.isPending}
                    onClick={handleResend}
                  >
                    {resendMutation.isPending ? "Sending..." : "Resend"}
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
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
