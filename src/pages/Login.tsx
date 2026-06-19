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
import { loginSchema, type LoginForm } from "@/lib/form-schemas";
import { ArrowLeft, Loader2, LogIn } from "lucide-react";

export default function Login() {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const utils = trpc.useUtils();
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      utils.invalidate();
      if (data.role === "admin") navigate("/admin-portal");
      else navigate(data.role === "teacher" ? "/admin" : "/dashboard");
    },
  });

  useEffect(() => {
    if (isAuthenticated && !authLoading && user) {
      if (user.role === "admin") navigate("/admin-portal");
      else navigate(user.role === "teacher" ? "/admin" : "/dashboard");
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#e8f5e9] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#00695c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e8f5e9] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-[#78909c] hover:text-[#00695c] mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center px-4 h-10 rounded-full bg-[#00695c] text-white font-bold text-base mb-4"
            style={{
              boxShadow: "inset 2px 2px 4px rgba(255,255,255,0.2), inset -2px -2px 4px rgba(0,0,0,0.1)",
            }}
          >
            DLZ
          </div>
          <h1 className="text-2xl font-bold text-[#2c3e2d] mb-2">
            {t("login.title")}
          </h1>
          <p className="text-[#78909c]">{t("login.subtitle")}</p>
        </div>

        <Card className="clay-card border-0">
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("login.emailLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("login.emailPlaceholder")}
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
                      <FormLabel>{t("login.passwordLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("login.passwordPlaceholder")}
                          type="password"
                          className="rounded-xl h-11 border-[#00695c]/15"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {loginMutation.error && (
                  <p className="text-sm text-red-500">
                    {loginMutation.error.message}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full rounded-full bg-[#00695c] hover:bg-[#004d40] h-11 font-semibold"
                >
                  {loginMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      {t("login.signInButton")}
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <p className="text-center text-sm text-[#78909c] mt-4">
              {t("login.noAccount")}{" "}
              <Link to="/register" className="text-[#00695c] hover:underline font-medium">
                {t("login.createAccount")}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
