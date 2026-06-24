import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, Pencil, Inbox, FolderOpen, UserCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CATEGORIES, CATEGORY_LABELS, CITIES, FOLLOWER_RANGES, type Category, type City, type FollowerRange } from "@/lib/constants";
import { toast } from "sonner";
import type { TablesUpdate } from "@/integrations/supabase/types";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Dashboard — creator·kz" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { t } = useTranslation();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { mode: "signin" } });
  }, [user, loading, navigate]);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: collections = [] } = useQuery({
    queryKey: ["my-collections", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("*, products(count)")
        .eq("creator_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: requests = [] } = useQuery({
    queryKey: ["my-requests", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_requests")
        .select("*")
        .eq("creator_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function setStatus(id: string, status: "accepted" | "rejected") {
    const { error } = await supabase.from("brand_requests").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(status === "accepted" ? t("toasts.requestAccepted") : t("toasts.requestRejected"));
    qc.invalidateQueries({ queryKey: ["my-requests"] });
  }

  const [newColOpen, setNewColOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCover, setNewCover] = useState("");

  async function createCollection(e: React.FormEvent) {
    e.preventDefault();
    const { data, error } = await supabase
      .from("collections")
      .insert({ creator_id: user!.id, title: newTitle, description: newDesc, cover_url: newCover })
      .select()
      .single();
    if (error) return toast.error(error.message);
    setNewColOpen(false);
    setNewTitle(""); setNewDesc(""); setNewCover("");
    qc.invalidateQueries({ queryKey: ["my-collections"] });
    if (data) navigate({ to: "/dashboard/collection/$id", params: { id: data.id } });
  }

  async function deleteCollection(id: string) {
    if (!confirm("Delete this collection?")) return;
    const { error } = await supabase.from("collections").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["my-collections"] });
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-5xl px-6 py-20 text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!profile.onboarded) {
    navigate({ to: "/onboarding" });
    return null;
  }

  const isCreator = profile.role === "creator";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Welcome back</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">{profile.display_name}</h1>
        </div>

        <Tabs defaultValue={isCreator ? "collections" : "requests"} className="space-y-8">
          <TabsList className="bg-secondary/40">
            {isCreator && <TabsTrigger value="collections"><FolderOpen className="mr-2 h-4 w-4" />Collections</TabsTrigger>}
            <TabsTrigger value="requests"><Inbox className="mr-2 h-4 w-4" />Brand requests {requests.length > 0 && <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">{requests.length}</span>}</TabsTrigger>
            <TabsTrigger value="profile"><UserCircle2 className="mr-2 h-4 w-4" />Profile</TabsTrigger>
          </TabsList>

          {isCreator && (
            <TabsContent value="collections" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-semibold">Your collections</h2>
                <Button onClick={() => setNewColOpen(true)}><Plus className="mr-2 h-4 w-4" />New collection</Button>
              </div>
              {collections.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border bg-card p-16 text-center">
                  <p className="font-display text-2xl">Start your first collection</p>
                  <p className="mt-2 text-muted-foreground">Curate products you love. Brands will discover you through them.</p>
                  <Button onClick={() => setNewColOpen(true)} className="mt-6">Create collection</Button>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {collections.map((c) => {
                    const count = (c.products as { count: number }[] | null)?.[0]?.count ?? 0;
                    return (
                      <div key={c.id} className="overflow-hidden rounded-3xl border border-border bg-card">
                        <div className="aspect-[16/10] overflow-hidden bg-warm">
                          {c.cover_url ? (
                            <img src={c.cover_url} alt={c.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="grid h-full place-items-center bg-gradient-to-br from-warm to-cream font-display text-2xl text-foreground/30">{c.title}</div>
                          )}
                        </div>
                        <div className="space-y-3 p-5">
                          <div>
                            <h3 className="font-display text-xl font-semibold leading-tight">{c.title}</h3>
                            <p className="mt-1 text-xs text-muted-foreground">{count} {count === 1 ? "product" : "products"}</p>
                          </div>
                          <div className="flex gap-2">
                            <Link to="/dashboard/collection/$id" params={{ id: c.id }} className="flex-1">
                              <Button variant="outline" size="sm" className="w-full"><Pencil className="mr-2 h-3.5 w-3.5" />Manage</Button>
                            </Link>
                            <Button variant="ghost" size="sm" onClick={() => deleteCollection(c.id)}>
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          )}

          <TabsContent value="requests" className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">{t("dashboard.requests")}</h2>
            {requests.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-card p-16 text-center text-muted-foreground">
                {t("dashboard.noRequests")} {isCreator && t("dashboard.noRequestsHint")}
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((r) => (
                  <div key={r.id} className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-xl font-semibold">{r.brand_name}</p>
                        <p className="text-sm text-muted-foreground">{r.contact_person}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 text-right">
                        <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">{r.budget_range}</span>
                        <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
                        <span className="mt-1 rounded-full bg-secondary px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{r.status}</span>
                      </div>
                    </div>
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">{r.message}</p>
                    {isCreator && r.status === "pending" && (
                      <div className="mt-4 flex gap-2">
                        <Button size="sm" onClick={() => setStatus(r.id, "accepted")}>{t("dashboard.accept")}</Button>
                        <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "rejected")}>{t("dashboard.reject")}</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile">
            <ProfileEditor profile={profile} onSaved={() => qc.invalidateQueries({ queryKey: ["profile"] })} />
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={newColOpen} onOpenChange={setNewColOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display text-2xl">New collection</DialogTitle></DialogHeader>
          <form onSubmit={createCollection} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="t">Title</Label>
              <Input id="t" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Winter Essentials" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="d">Description</Label>
              <Textarea id="d" rows={3} value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cov">Cover image URL</Label>
              <Input id="cov" value={newCover} onChange={(e) => setNewCover(e.target.value)} placeholder="https://…" />
            </div>
            <Button type="submit" className="w-full">Create</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProfileEditor({ profile, onSaved }: { profile: any; onSaved: () => void }) {
  const isCreator = profile.role === "creator";
  const [name, setName] = useState(profile.display_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatar, setAvatar] = useState(profile.avatar_url ?? "");
  const [social, setSocial] = useState(profile.social_link ?? "");
  const [category, setCategory] = useState<Category | "">(profile.category ?? "");
  const [city, setCity] = useState<City | "">(profile.city ?? "");
  const [followers, setFollowers] = useState<FollowerRange | "">(profile.follower_range ?? "");
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload: TablesUpdate<"profiles"> = {
      display_name: name, bio, avatar_url: avatar, social_link: social,
    };
    if (isCreator) {
      payload.category = category || null;
      payload.city = city || null;
      payload.follower_range = followers || null;
    }
    const { error } = await supabase.from("profiles").update(payload).eq("id", profile.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated.");
    onSaved();
  }

  return (
    <form onSubmit={save} className="max-w-2xl space-y-6 rounded-3xl border border-border bg-card p-8">
      <h2 className="font-display text-2xl font-semibold">Edit profile</h2>
      <div className="space-y-1.5">
        <Label htmlFor="pn">{isCreator ? "Display name" : "Brand name"}</Label>
        <Input id="pn" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pb">Bio</Label>
        <Textarea id="pb" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pa">Photo URL</Label>
        <Input id="pa" value={avatar} onChange={(e) => setAvatar(e.target.value)} />
      </div>
      {isCreator && (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="ps">Instagram / TikTok link</Label>
            <Input id="ps" value={social} onChange={(e) => setSocial(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger><SelectValue placeholder="Pick" /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>City</Label>
              <Select value={city} onValueChange={(v) => setCity(v as City)}>
                <SelectTrigger><SelectValue placeholder="Pick" /></SelectTrigger>
                <SelectContent>{CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Followers</Label>
              <Select value={followers} onValueChange={(v) => setFollowers(v as FollowerRange)}>
                <SelectTrigger><SelectValue placeholder="Pick" /></SelectTrigger>
                <SelectContent>{FOLLOWER_RANGES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </>
      )}
      <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
    </form>
  );
}