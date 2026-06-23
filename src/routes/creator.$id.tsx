import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Instagram } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { ContactCreatorDialog } from "@/components/contact-creator-dialog";
import { ProductTile } from "@/components/product-tile";
import { CATEGORY_LABELS, type Category } from "@/lib/constants";

export const Route = createFileRoute("/creator/$id")({
  head: () => ({ meta: [{ title: "Creator — creator·kz" }] }),
  component: CreatorProfile,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center">
      <div className="text-center">
        <p className="font-display text-3xl">Creator not found</p>
        <Link to="/" className="mt-4 inline-block text-sm text-muted-foreground hover:text-foreground">← Back to discover</Link>
      </div>
    </div>
  ),
  errorComponent: () => <div className="grid min-h-screen place-items-center text-muted-foreground">Something went wrong.</div>,
});

function CreatorProfile() {
  const { id } = Route.useParams();
  const [contactOpen, setContactOpen] = useState(false);

  const { data: creator, isLoading } = useQuery({
    queryKey: ["creator", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

  const { data: collections = [] } = useQuery({
    queryKey: ["creator-collections", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("*, products(*)")
        .eq("creator_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  if (isLoading || !creator) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-5xl px-6 py-20 text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Profile hero */}
      <section className="border-b border-border bg-cream">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid gap-10 sm:grid-cols-[280px_1fr] sm:items-end">
            <div className="aspect-square overflow-hidden rounded-3xl bg-warm">
              {creator.avatar_url ? (
                <img src={creator.avatar_url} alt={creator.display_name} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center font-display text-7xl font-semibold text-foreground/20">
                  {creator.display_name?.[0] ?? "·"}
                </div>
              )}
            </div>
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {creator.category && <span className="font-semibold text-accent">{CATEGORY_LABELS[creator.category as Category]}</span>}
                {creator.city && <><span>·</span><span>{creator.city}</span></>}
                {creator.follower_range && <><span>·</span><span>{creator.follower_range} followers</span></>}
              </div>
              <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
                {creator.display_name}
              </h1>
              {creator.bio && <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">{creator.bio}</p>}
              <div className="flex flex-wrap gap-3 pt-2">
                <Button size="lg" className="rounded-full px-6" onClick={() => setContactOpen(true)}>
                  Contact creator
                </Button>
                {creator.social_link && (
                  <a href={creator.social_link} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" variant="outline" className="rounded-full px-6">
                      <Instagram className="mr-2 h-4 w-4" />
                      Follow
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collections */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">The Collections</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">Curated by {creator.display_name.split(" ")[0]}</h2>
          </div>
          <p className="text-sm text-muted-foreground">{collections.length} {collections.length === 1 ? "collection" : "collections"}</p>
        </div>

        {collections.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-16 text-center text-muted-foreground">
            No collections yet.
          </div>
        ) : (
          <div className="space-y-20">
            {collections.map((col) => (
              <article key={col.id}>
                <header className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <h3 className="font-display text-3xl font-semibold tracking-tight">{col.title}</h3>
                    {col.description && <p className="mt-2 max-w-2xl text-muted-foreground">{col.description}</p>}
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                </header>
                {col.cover_url && (
                  <div className="mb-8 aspect-[16/8] overflow-hidden rounded-3xl bg-warm">
                    <img src={col.cover_url} alt={col.title} className="h-full w-full object-cover" />
                  </div>
                )}
                {col.products && col.products.length > 0 ? (
                  <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                    {col.products
                      .sort((a, b) => a.position - b.position)
                      .map((p) => (
                        <ProductTile key={p.id} name={p.name} imageUrl={p.image_url} externalLink={p.external_link} />
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No products in this collection yet.</p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <ContactCreatorDialog
        open={contactOpen}
        onOpenChange={setContactOpen}
        creatorId={creator.id}
        creatorName={creator.display_name}
      />
    </div>
  );
}