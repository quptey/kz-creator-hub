import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Heart, Send, Sparkles, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/brand")({
  head: () => ({ meta: [{ title: "Brand dashboard — creator·kz" }] }),
  component: BrandDashboard,
});

function BrandDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const qc = useQueryClient();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { mode: "signin" } });
  }, [user, loading, navigate]);

  const { data: saved = [] } = useQuery({
    queryKey: ["saved-creators", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_creators")
        .select("id, creator_id, profiles!saved_creators_creator_id_fkey(id, display_name, avatar_url, category, city)")
        .eq("brand_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: requests = [] } = useQuery({
    queryKey: ["sent-requests", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_requests")
        .select("*")
        .eq("sender_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ["campaigns", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("brand_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const [campaignOpen, setCampaignOpen] = useState(false);
  const [cTitle, setCTitle] = useState("");
  const [cBrief, setCBrief] = useState("");
  const [cBudget, setCBudget] = useState("");

  async function unsave(id: string) {
    const { error } = await supabase.from("saved_creators").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(t("toasts.creatorUnsaved"));
    qc.invalidateQueries({ queryKey: ["saved-creators"] });
  }

  async function createCampaign(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("campaigns").insert({
      brand_id: user!.id, title: cTitle, brief: cBrief, budget_range: cBudget,
    });
    if (error) return toast.error(error.message);
    setCampaignOpen(false); setCTitle(""); setCBrief(""); setCBudget("");
    qc.invalidateQueries({ queryKey: ["campaigns"] });
  }

  async function removeCampaign(id: string) {
    if (!confirm("Delete campaign?")) return;
    const { error } = await supabase.from("campaigns").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["campaigns"] });
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t("dashboard.welcome")}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">{t("brand.title")}</h1>
        </div>

        <Tabs defaultValue="saved" className="space-y-8">
          <TabsList className="bg-secondary/40">
            <TabsTrigger value="saved"><Heart className="mr-2 h-4 w-4" />{t("brand.saved")}</TabsTrigger>
            <TabsTrigger value="requests"><Send className="mr-2 h-4 w-4" />{t("brand.requests")}</TabsTrigger>
            <TabsTrigger value="campaigns"><Sparkles className="mr-2 h-4 w-4" />{t("brand.campaigns")}</TabsTrigger>
          </TabsList>

          <TabsContent value="saved" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold">{t("brand.saved")}</h2>
              <Link to="/marketplace"><Button variant="outline" size="sm">{t("brand.browseMarketplace")}</Button></Link>
            </div>
            {saved.length === 0 ? (
              <EmptyState text={t("brand.noSaved")} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {saved.map((s: any) => (
                  <div key={s.id} className="overflow-hidden rounded-3xl border border-border bg-card">
                    <Link to="/creator/$id" params={{ id: s.creator_id }} className="block">
                      <div className="aspect-[4/5] bg-warm">
                        {s.profiles?.avatar_url ? (
                          <img src={s.profiles.avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="grid h-full w-full place-items-center font-display text-5xl text-foreground/20">
                            {s.profiles?.display_name?.[0] ?? "·"}
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-display text-lg">{s.profiles?.display_name}</p>
                        <p className="text-xs text-muted-foreground">{s.profiles?.city}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => unsave(s.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests">
            <h2 className="mb-6 font-display text-2xl font-semibold">{t("brand.requests")}</h2>
            {requests.length === 0 ? (
              <EmptyState text={t("brand.noRequestsSent")} />
            ) : (
              <div className="space-y-3">
                {requests.map((r) => (
                  <div key={r.id} className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-xl">{r.brand_name}</p>
                        <p className="text-sm text-muted-foreground">{r.contact_person}</p>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="mt-4 whitespace-pre-wrap text-sm">{r.message}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="campaigns">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold">{t("brand.campaigns")}</h2>
              <Button onClick={() => setCampaignOpen(true)}><Plus className="mr-2 h-4 w-4" />{t("brand.newCampaign")}</Button>
            </div>
            {campaigns.length === 0 ? (
              <EmptyState text={t("brand.noCampaigns")} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {campaigns.map((c) => (
                  <div key={c.id} className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-xl">{c.title}</p>
                        <p className="mt-1 text-xs uppercase tracking-wider text-accent">{c.status}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeCampaign(c.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    {c.brief && <p className="mt-3 text-sm text-muted-foreground">{c.brief}</p>}
                    {c.budget_range && <p className="mt-2 text-xs text-muted-foreground">{c.budget_range}</p>}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={campaignOpen} onOpenChange={setCampaignOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display text-2xl">{t("brand.newCampaign")}</DialogTitle></DialogHeader>
          <form onSubmit={createCampaign} className="space-y-4">
            <div className="space-y-1.5"><Label>{t("brand.campaignTitle")}</Label><Input required value={cTitle} onChange={(e) => setCTitle(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>{t("brand.brief")}</Label><Textarea rows={4} value={cBrief} onChange={(e) => setCBrief(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>{t("brand.budget")}</Label><Input value={cBudget} onChange={(e) => setCBudget(e.target.value)} /></div>
            <Button type="submit" className="w-full">{t("common.create")}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-3xl border border-dashed border-border bg-card p-16 text-center text-muted-foreground">{text}</div>;
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: t("dashboard.statusPending"), cls: "bg-secondary text-muted-foreground" },
    accepted: { label: t("dashboard.statusAccepted"), cls: "bg-accent/10 text-accent" },
    rejected: { label: t("dashboard.statusRejected"), cls: "bg-destructive/10 text-destructive" },
  };
  const s = map[status] ?? map.pending;
  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${s.cls}`}>{s.label}</span>;
}