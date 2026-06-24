import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Users, FolderOpen, Package, Inbox, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — creator·kz" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const qc = useQueryClient();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { mode: "signin" } });
  }, [user, loading, navigate]);

  const { data: isAdmin, isLoading: roleLoading } = useQuery({
    queryKey: ["is-admin", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", user!.id).eq("role", "admin").maybeSingle();
      if (error) throw error;
      return !!data;
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-profiles"],
    enabled: !!isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: counts } = useQuery({
    queryKey: ["admin-counts"],
    enabled: !!isAdmin,
    queryFn: async () => {
      const [c1, c2, c3] = await Promise.all([
        supabase.from("collections").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("brand_requests").select("id", { count: "exact", head: true }),
      ]);
      return { collections: c1.count ?? 0, products: c2.count ?? 0, requests: c3.count ?? 0 };
    },
  });

  const signupsByWeek = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of profiles) {
      const d = new Date(p.created_at);
      const monday = new Date(d);
      monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      const key = monday.toISOString().slice(0, 10);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)).slice(-8).map(([week, count]) => ({ week: week.slice(5), count }));
  }, [profiles]);

  if (loading || roleLoading) return <div className="min-h-screen bg-background"><SiteHeader /><div className="p-20 text-center text-muted-foreground">{t("common.loading")}</div></div>;
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="grid place-items-center px-6 py-32 text-center">
          <div>
            <h1 className="font-display text-3xl">{t("admin.notAdmin")}</h1>
            <Button className="mt-6" onClick={() => navigate({ to: "/" })}>{t("nav.home")}</Button>
          </div>
        </div>
      </div>
    );
  }

  const creators = profiles.filter((p) => p.role === "creator");
  const brands = profiles.filter((p) => p.role === "brand");

  async function toggleApproved(id: string, current: boolean) {
    const { error } = await supabase.from("profiles").update({ approved: !current }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-profiles"] });
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="font-display text-4xl font-semibold tracking-tight">{t("admin.title")}</h1>

        <Tabs defaultValue="overview" className="mt-10 space-y-8">
          <TabsList className="bg-secondary/40">
            <TabsTrigger value="overview"><BarChart3 className="mr-2 h-4 w-4" />{t("admin.overview")}</TabsTrigger>
            <TabsTrigger value="users"><Users className="mr-2 h-4 w-4" />{t("admin.users")}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label={t("admin.totalUsers")} value={profiles.length} icon={Users} />
              <Metric label={t("admin.creators")} value={creators.length} icon={Users} />
              <Metric label={t("admin.brands")} value={brands.length} icon={Users} />
              <Metric label={t("admin.collections")} value={counts?.collections ?? 0} icon={FolderOpen} />
              <Metric label={t("admin.products")} value={counts?.products ?? 0} icon={Package} />
              <Metric label={t("admin.requests")} value={counts?.requests ?? 0} icon={Inbox} />
            </div>

            <div className="rounded-3xl border border-border bg-card p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t("admin.signupsByWeek")}</p>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={signupsByWeek}>
                    <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                    <Bar dataKey="count" fill="var(--accent)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">City</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((p) => (
                    <tr key={p.id} className="border-t border-border">
                      <td className="px-4 py-3 font-medium">{p.display_name}</td>
                      <td className="px-4 py-3 capitalize text-muted-foreground">{p.role}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.city ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs ${p.approved ? "bg-accent/10 text-accent" : "bg-secondary text-muted-foreground"}`}>
                          {p.approved ? t("admin.approved") : t("admin.pending")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="outline" size="sm" onClick={() => toggleApproved(p.id, p.approved)}>
                          {p.approved ? t("admin.unapprove") : t("admin.approve")}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Users }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs uppercase tracking-wider">{label}</span>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-2 font-display text-3xl font-semibold">{value}</p>
    </div>
  );
}