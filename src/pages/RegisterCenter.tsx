import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Loader2, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CenterRequestForm from "@/components/CenterRequestForm";

export default function RegisterCenter() {
  const { user, isLoading: authLoading } = useAuth({
    redirectOnUnauthenticated: true,
  });
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: existingCenter } = trpc.center.myCenter.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: existingRequest } = trpc.centerRequest.myRequest.useQuery(undefined, {
    enabled: !!user,
  });

  useEffect(() => {
    if (!authLoading && user) {
      setDialogOpen(true);
    }
  }, [authLoading, user]);

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

  const alreadySubmitted = existingRequest && existingRequest.status === "pending";

  return (
    <div className="min-h-screen bg-[#e8f5e9]">
      <Navigation />

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-[600px] mx-auto text-center">
          {alreadySubmitted ? (
            <div className="py-12">
              <div className="w-20 h-20 rounded-full bg-[#B1D4CD] flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-[#182E21]" />
              </div>
              <h1 className="text-3xl font-bold text-[#2c3e2d] mb-3">
                Request Pending
              </h1>
              <p className="text-[#78909c] mb-8 max-w-md mx-auto">
                You already have a pending center registration request. Our team
                will review your application and get back to you within
                24&ndash;48 hours.
              </p>
              <Button
                onClick={() => navigate("/dashboard")}
                className="rounded-full bg-[#00695c] hover:bg-[#004d40] h-11 px-6 font-semibold"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#2c3e2d] mb-2">
                  Register Your Center
                </h1>
                <p className="text-[#78909c]">
                  Submit a request to create a learning portal for your German
                  teaching center. Our team will review and approve it.
                </p>
              </div>

              <Button
                onClick={() => setDialogOpen(true)}
                className="rounded-full bg-[#00695c] hover:bg-[#004d40] h-12 px-8 font-semibold text-base"
              >
                Open Registration Form
              </Button>
            </>
          )}
        </div>
      </div>

      <CenterRequestForm open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
