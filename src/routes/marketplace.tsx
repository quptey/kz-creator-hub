import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { CreatorCard } from "@/components/creator-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CATEGORIES, CATEGORY_LABELS, CITIES, FOLLOWER_RANGES, type Category, type City, type FollowerRange } from "@/lib/constants";

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "Marketplace — creator·kz" },
      { name: "description", content: "Discover Kazakhstan creators across beauty, fashion, fitness, food, lifestyle and tech." },
      { property: "og:title", content: "creator·kz — marketplace" },
      { property: "og:description", content: "Curated creator collections from Almaty, Astana, Shymkent & Aktau." },
    ],
  }),
  component: Marketplace,
});

function Marketplace() {
  const { t } = useTranslation();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [city, setCity] = useState<City | "all">("all");
  const [followers, setFollowers] = useState<FollowerRange | "all">("all");

  const { data: creators = [], isLoading } = useQuery({
    queryKey: ["creators", "marketplace"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, bio, avatar_url, category, city, follower_range, role, approved, onboarded")
        .eq("role", "creator")
        .eq("onboarded", true)
        .eq("approved", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = useMemo(() => creators.filter((c) => {
    if (category !== "all" && c.category !== category) return false;
    if (city !== "all" && c.city !== city) return false;
    if (followers !== "all" && c.follower_range !== followers) return false;
    if (q && !c.display_name.toLowerCase().includes(q.toLowerCase()) && !(c.bio ?? "").toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [creators, category, city, followers, q]);

  const hasFilters = category !== "all" || city !== "all" || followers !== "all" || q.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t("marketplace.eyebrow")}</p>
            <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">{t("marketplace.title")}</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {isLoading ? t("common.loading") : `${filtered.length} ${filtered.length === 1 ? t("marketplace.creator") : t("marketplace.creators")}`}
          </p>
        </div>

        <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_180px_180px_180px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={t("marketplace.searchPlaceholder")} value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
          <Select value={category} onValueChange={(v) => setCategory(v as Category | "all")}>
            <SelectTrigger><SelectValue placeholder={t("marketplace.category")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("marketplace.allCategories")}</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={city} onValueChange={(v) => setCity(v as City | "all")}>
            <SelectTrigger><SelectValue placeholder={t("marketplace.city")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("marketplace.allCities")}</SelectItem>
              {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={followers} onValueChange={(v) => setFollowers(v as FollowerRange | "all")}>
            <SelectTrigger><SelectValue placeholder={t("marketplace.followers")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("marketplace.allSizes")}</SelectItem>
              {FOLLOWER_RANGES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button variant="ghost" onClick={() => { setQ(""); setCategory("all"); setCity("all"); setFollowers("all"); }}>
              {t("marketplace.clear")}
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="editorial-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-3xl bg-warm" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-16 text-center">
            <p className="font-display text-2xl text-foreground">{t("marketplace.empty")}</p>
            <p className="mt-2 text-sm text-muted-foreground">{t("marketplace.emptyHint")}</p>
          </div>
        ) : (
          <div className="editorial-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((c) => (
              <CreatorCard
                key={c.id}
                id={c.id}
                name={c.display_name}
                avatar={c.avatar_url}
                bio={c.bio}
                category={c.category as Category | null}
                city={c.city}
                followerRange={c.follower_range}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
