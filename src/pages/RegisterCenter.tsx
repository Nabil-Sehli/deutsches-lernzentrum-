import { useState } from "react";
import { useNavigate, Link } from "react-router";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  GraduationCap,
  Loader2,
  Globe,
  Check,
  Sparkles,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerCenterSchema, type RegisterCenterForm } from "@/lib/form-schemas";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

export default function RegisterCenter() {
  const { user, isLoading: authLoading } = useAuth({
    redirectOnUnauthenticated: true,
  });
  const navigate = useNavigate();
  const [step, setStep] = useState<"form" | "success">("form");
  const [submittedName, setSubmittedName] = useState("");

  const utils = trpc.useUtils();
  const { data: existingCenter } = trpc.center.myCenter.useQuery(undefined, {
    enabled: !!user,
  });

  const form = useForm<RegisterCenterForm>({
    resolver: zodResolver(registerCenterSchema),
    defaultValues: {
      name: "",
      description: "",
      slug: "",
    },
  });

  const createMutation = trpc.center.create.useMutation({
    onSuccess: async (_, vars) => {
      await utils.invalidate();
      setSubmittedName(vars.name);
      setStep("success");
    },
  });

  const onSubmit = (data: RegisterCenterForm) => {
    createMutation.mutate({
      ...data,
      slug: data.slug.toLowerCase().replace(/\s+/g, "-"),
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#e8f5e9] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#00695c] animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  if (existingCenter) {
    navigate("/admin");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#e8f5e9]">
      <Navigation />

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-[600px] mx-auto">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-[#78909c] hover:text-[#00695c] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>

          {step === "form" ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#2c3e2d] mb-2">
                  Register Your Center
                </h1>
                <p className="text-[#78909c]">
                  Create a private learning portal for your German teaching
                  center.
                </p>
              </div>

              <Card className="clay-card border-0">
                <CardContent className="p-8">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Center Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. Berlin German School"
                                className="rounded-xl h-12 border-[#00695c]/15 focus:border-[#00695c]"
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
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell students about your center..."
                                className="rounded-xl min-h-[100px] border-[#00695c]/15 focus:border-[#00695c]"
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
                        name="slug"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL Slug</FormLabel>
                            <div className="relative">
                              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78909c]" />
                              <FormControl>
                                <Input
                                  placeholder="berlin-german-school"
                                  className="rounded-xl h-12 pl-10 border-[#00695c]/15 focus:border-[#00695c]"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value
                                        .toLowerCase()
                                        .replace(/[^a-z0-9-]/g, "")
                                    )
                                  }
                                />
                              </FormControl>
                            </div>
                            <p className="text-xs text-[#78909c] mt-1.5">
                              This will be your center&apos;s unique URL identifier.
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {createMutation.error && (
                        <p className="text-sm text-red-500">
                          {createMutation.error.message}
                        </p>
                      )}

                      <Button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="w-full rounded-full bg-[#00695c] hover:bg-[#004d40] h-12 font-semibold text-base"
                      >
                        {createMutation.isPending ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <GraduationCap className="w-5 h-5 mr-2" />
                            Create Center
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-[#81c784]/20 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-[#00695c]" />
              </div>
              <h2 className="text-2xl font-bold text-[#2c3e2d] mb-3">
                Center Created!
              </h2>
              <p className="text-[#78909c] mb-8 max-w-md mx-auto">
                Your center <strong className="text-[#2c3e2d]">{submittedName}</strong>{" "}
                is now live. Start creating lessons and invite students.
              </p>
              <div className="flex gap-3 justify-center">
                <Link to="/admin">
                  <Button className="rounded-full bg-[#00695c] hover:bg-[#004d40] h-11 px-6 font-semibold">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Go to Admin
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
