import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginForm } from "@/lib/form-schemas";
import {
  Card, CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from "@/components/ui/form";
import {
  ArrowLeft, Loader2, LogIn, Check, X, ExternalLink, Clock, Building2, Shield, Mail,
  ChevronDown, ChevronUp, FileText, Image,
} from "lucide-react";

function AdminLoginForm() {
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const utils = trpc.useUtils();
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      utils.invalidate();
    },
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-[#e8f5e9] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-[#78909c] hover:text-[#00695c] mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 h-10 rounded-full bg-[#00695c] text-white font-bold text-base mb-4">
            DLZ
          </div>
          <h1 className="text-2xl font-bold text-[#2c3e2d] mb-2">Admin Portal</h1>
          <p className="text-[#78909c]">Sign in with your admin account</p>
        </div>
        <Card className="clay-card border-0">
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="admin@example.com" type="email" className="rounded-xl h-11 border-[#00695c]/15" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="••••••••" type="password" className="rounded-xl h-11 border-[#00695c]/15" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                {loginMutation.error && <p className="text-sm text-red-500">{loginMutation.error.message}</p>}
                <Button type="submit" disabled={loginMutation.isPending} className="w-full rounded-full bg-[#00695c] hover:bg-[#004d40] h-11 font-semibold">
                  {loginMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><LogIn className="w-4 h-4 mr-2" /> Sign In</>}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RequestDetailCard({
  req,
  onApprove,
  onReject,
}: {
  req: NonNullable<ReturnType<typeof useAdminData>["pending"]>[number];
  onApprove: (id: number) => void;
  onReject: (id: number, notes: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const [showReject, setShowReject] = useState(false);

  return (
    <Card className="clay-card border-0">
      <CardContent className="p-5">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#00695c]/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#00695c]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#2c3e2d]">{req.centerName}</h3>
                <p className="text-xs text-[#78909c]">
                  by {req.teacher?.name ?? "Unknown"} &middot; {new Date(req.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                Pending
              </span>
              {expanded ? <ChevronUp className="w-4 h-4 text-[#78909c]" /> : <ChevronDown className="w-4 h-4 text-[#78909c]" />}
            </div>
          </div>
        </button>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-[#00695c]/8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {req.logo && (
                <div>
                  <p className="text-xs font-medium text-[#78909c] mb-1">Logo</p>
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#00695c]/10">
                    <img src={req.logo} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-[#78909c] mb-1">Teacher</p>
                <p className="text-sm text-[#2c3e2d]">{req.teacher?.name ?? "Unknown"}</p>
                <p className="text-xs text-[#78909c]">{req.teacher?.email}</p>
              </div>
              {req.centerBio && (
                <div className="sm:col-span-2">
                  <p className="text-xs font-medium text-[#78909c] mb-1">Bio</p>
                  <p className="text-sm text-[#2c3e2d]">{req.centerBio}</p>
                </div>
              )}
            </div>

            {req.emails && req.emails.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[#78909c] mb-2 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Emails
                </p>
                <div className="flex flex-wrap gap-2">
                  {req.emails.map((e: { id: number; email: string }) => (
                    <span key={e.id} className="px-3 py-1 rounded-full bg-[#00695c]/6 text-xs text-[#2c3e2d]">{e.email}</span>
                  ))}
                </div>
              </div>
            )}

            {req.locations && req.locations.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[#78909c] mb-2 flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> Locations
                </p>
                <div className="space-y-1">
                  {req.locations.map((l: { id: number; country: string; city: string; address: string }) => (
                    <p key={l.id} className="text-sm text-[#2c3e2d]">
                      {l.country} &rsaquo; {l.city} &rsaquo; {l.address}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {req.phones && req.phones.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[#78909c] mb-2">Phone Numbers</p>
                <div className="space-y-1">
                  {req.phones.map((p: { id: number; countryCode: string; number: string }) => (
                    <p key={p.id} className="text-sm text-[#2c3e2d]">+{p.countryCode} {p.number}</p>
                  ))}
                </div>
              </div>
            )}

            {req.albums && req.albums.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[#78909c] mb-2 flex items-center gap-1">
                  <Image className="w-3 h-3" /> Photo Album ({req.albums.length})
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {req.albums.map((a: { id: number; imageUrl: string }) => (
                    <div key={a.id} className="aspect-square rounded-xl overflow-hidden border border-[#00695c]/10">
                      <img src={a.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {req.documents && req.documents.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[#78909c] mb-2 flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Documents ({req.documents.length})
                </p>
                <div className="space-y-1">
                  {req.documents.map((d: { id: number; documentUrl: string; documentType: string | null }) => (
                    <a
                      key={d.id}
                      href={d.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-[#00695c] hover:underline"
                    >
                      <FileText className="w-3 h-3" />
                      Document {d.documentType ? `.${d.documentType}` : ""}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={() => onApprove(req.id)}
                className="rounded-full bg-[#00695c] hover:bg-[#004d40] font-semibold"
              >
                <Check className="w-4 h-4 mr-1" /> Approve
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowReject(!showReject)}
                className="rounded-full border-red-200 text-red-600 hover:bg-red-50 font-semibold"
              >
                <X className="w-4 h-4 mr-1" /> Reject
              </Button>
            </div>

            {showReject && (
              <div className="space-y-2">
                <Textarea
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  placeholder="Reason for rejection (optional)..."
                  className="rounded-xl min-h-[80px] border-red-200"
                />
                <Button
                  onClick={() => onReject(req.id, rejectNotes)}
                  className="rounded-full bg-red-600 hover:bg-red-700 font-semibold"
                >
                  Confirm Reject
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function statusBadge(status: string) {
  if (status === "approved") return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Approved</span>;
  if (status === "rejected") return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Rejected</span>;
  return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Pending</span>;
}

function HistoryCard({
  req,
}: {
  req: NonNullable<ReturnType<typeof useAdminData>["history"]>[number];
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="clay-card border-0">
      <CardContent className="p-5">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#00695c]/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#00695c]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#2c3e2d]">{req.centerName}</h3>
                <p className="text-xs text-[#78909c]">
                  by {req.teacher?.name ?? "Unknown"} &middot; {new Date(req.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {statusBadge(req.status)}
              {expanded ? <ChevronUp className="w-4 h-4 text-[#78909c]" /> : <ChevronDown className="w-4 h-4 text-[#78909c]" />}
            </div>
          </div>
        </button>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-[#00695c]/8 space-y-3">
            <p className="text-xs text-[#78909c]">Teacher: {req.teacher?.name ?? "Unknown"} ({req.teacher?.email})</p>
            {req.adminNotes && (
              <div>
                <p className="text-xs font-medium text-[#78909c] mb-1">Admin Notes</p>
                <p className="text-sm text-[#2c3e2d]">{req.adminNotes}</p>
              </div>
            )}
            {req.reviewedAt && (
              <p className="text-xs text-[#78909c]">Reviewed: {new Date(req.reviewedAt).toLocaleString()}</p>
            )}
            {req.status === "approved" && req.slug && (
              <a
                href={`/c/${req.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-[#00695c] hover:underline font-medium"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Center Page
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function useAdminData() {
  const all = trpc.centerRequest.listAll.useQuery(undefined, { refetchInterval: 5000 });
  const allData = all.data ?? [];
  const pending = allData.filter((r) => r.status === "pending");
  const history = allData.filter((r) => r.status !== "pending");
  return { pending, all: allData, history };
}

function AdminDashboard() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [activeTab, setActiveTab] = useState("pending");

  const approveMutation = trpc.centerRequest.approve.useMutation({
    onSuccess: () => {
      utils.centerRequest.listPending.invalidate();
      utils.centerRequest.listAll.invalidate();
    },
  });

  const rejectMutation = trpc.centerRequest.reject.useMutation({
    onSuccess: () => {
      utils.centerRequest.listPending.invalidate();
      utils.centerRequest.listAll.invalidate();
    },
  });

  const { pending, history } = useAdminData();

  const handleApprove = (id: number) => {
    if (confirm("Are you sure you want to approve this request?")) {
      approveMutation.mutate({ requestId: id });
    }
  };

  const handleReject = (id: number, notes: string) => {
    rejectMutation.mutate({ requestId: id, notes: notes || undefined });
  };

  return (
    <div className="min-h-screen bg-[#e8f5e9]">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F8F4EB]/90 backdrop-blur-xl border-b border-[#E6DFD3] shadow-sm">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-serif text-[#182E21] font-bold text-base tracking-tight">
            DLZ Admin
          </Link>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { utils.invalidate(); navigate("/admin-portal"); }}
              className="rounded-full border-[#00695c]/15 text-xs"
            >
              <Clock className="w-3 h-3 mr-1" /> Refresh
            </Button>
            <Link to="/" className="text-sm text-[#78909c] hover:text-[#00695c] transition-colors">
              Back to Site
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#2c3e2d]">Center Requests</h1>
            <p className="text-[#78909c] mt-1">Review and manage center registration requests</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white rounded-full p-1 h-auto">
              <TabsTrigger value="pending" className="rounded-full px-5 py-2 data-[state=active]:bg-[#00695c] data-[state=active]:text-white">
                <Clock className="w-4 h-4 mr-2" />
                Pending ({pending.length})
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-full px-5 py-2 data-[state=active]:bg-[#00695c] data-[state=active]:text-white">
                <Shield className="w-4 h-4 mr-2" />
                History ({history.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {pending.length === 0 ? (
                <Card className="clay-card border-0 p-12 text-center">
                  <Building2 className="w-12 h-12 text-[#78909c] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[#2c3e2d] mb-2">No Pending Requests</h3>
                  <p className="text-[#78909c]">All center registration requests have been reviewed.</p>
                </Card>
              ) : (
                pending.map((req) => (
                  <RequestDetailCard
                    key={req.id}
                    req={req}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))
              )}
              {approveMutation.isPending && (
                <div className="flex items-center justify-center gap-2 text-sm text-[#00695c]">
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {history.length === 0 ? (
                <Card className="clay-card border-0 p-12 text-center">
                  <Shield className="w-12 h-12 text-[#78909c] mx-auto mb-4" />
                  <p className="text-[#78909c]">No requests have been processed yet.</p>
                </Card>
              ) : (
                history.map((req) => <HistoryCard key={req.id} req={req} />)
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default function AdminPortal() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#e8f5e9] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#00695c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <AdminLoginForm />;
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#e8f5e9] flex items-center justify-center px-6">
        <Card className="clay-card border-0 max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-[#2c3e2d] mb-2">Access Denied</h1>
            <p className="text-[#78909c] mb-4">You need an admin account to access this portal.</p>
            <Button onClick={() => navigate("/")} className="rounded-full bg-[#00695c] hover:bg-[#004d40] font-semibold">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <AdminDashboard />;
}
