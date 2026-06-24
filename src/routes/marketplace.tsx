import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
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
      { title: "Discover Kazakhstan's creators — creator·kz" },
      { name: "description", content: "An editorial marketplace where creators publish curated collections and brands discover collaborators across Kazakhstan." },
      { property: "og:title", content: "creator·kz — discover Kazakhstan's creators" },
      { property: "og:description", content: "Curated creator collections from Almaty, Astana, Shymkent & Aktau." },
    ],
  }),
  component: Marketplace,
});

function Marketplace() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [city, setCity] = useState<City | "all">("all");
  const [followers, setFollowers] = useState<FollowerRange | "all">("all");

  const { data: creators = [], isLoading } = useQuery({
    queryKey: ["creators", "marketplace"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, bio, avatar_url, category, city, follower_range, onboarded, role")
        .eq("role", "creator")
        .eq("onboarded", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    return creators.filter((c) => {
      if (category !== "all" && c.category !== category) return false;
      if (city !== "all" && c.city !== city) return false;
      if (followers !== "all" && c.follower_range !== followers) return false;
      if (q && !c.display_name.toLowerCase().includes(q.toLowerCase()) && !(c.bio ?? "").toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
  }, [creators, category, city, followers, q]);

  const hasFilters = category !== "all" || city !== "all" || followers !== "all" || q.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-cream via-background to-warm" />
        <div className="mx-auto max-w-7xl px-6 pb-20 pt-20 sm:pt-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Kazakhstan · MVP
            </span>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
              An editorial marketplace for <em className="font-display italic text-accent">Kazakhstan's</em> creators.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Creators publish curated collections. Brands discover collaborators. No middlemen, no noise — just good taste.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/auth" search={{ mode: "signup" }}>
                <Button size="lg" className="rounded-full px-6">Become a creator</Button>
              </Link>
              <a href="#discover">
                <Button size="lg" variant="outline" className="rounded-full px-6">Browse creators</Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section id="discover" className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">The Directory</p>
            <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">Discover creators</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "creator" : "creators"}`}
          </p>
        </div>

        <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_180px_180px_180px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search creators…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={category} onValueChange={(v) => setCategory(v as Category | "all")}>
            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={city} onValueChange={(v) => setCity(v as City | "all")}>
            <SelectTrigger><SelectValue placeholder="City" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cities</SelectItem>
              {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={followers} onValueChange={(v) => setFollowers(v as FollowerRange | "all")}>
            <SelectTrigger><SelectValue placeholder="Followers" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sizes</SelectItem>
              {FOLLOWER_RANGES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button variant="ghost" onClick={() => { setQ(""); setCategory("all"); setCity("all"); setFollowers("all"); }}>
              Clear
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
            <p className="font-display text-2xl text-foreground">No creators match those filters yet.</p>
            <p className="mt-2 text-sm text-muted-foreground">Try clearing them or come back soon — we're just getting started.</p>
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

      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-6 text-sm text-muted-foreground sm:flex-row sm:items-center">
          <span className="font-display text-base text-foreground">creator·kz</span>
          <span>© {new Date().getFullYear()} — Built for Kazakhstan creators.</span>
        </div>
      </footer>
    </div>
  );
}
