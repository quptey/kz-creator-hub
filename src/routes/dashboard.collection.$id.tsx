import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Trash2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/collection/$id")({
  head: () => ({ meta: [{ title: "Edit collection — creator·kz" }] }),
  component: EditCollection,
});

function EditCollection() {
  const { id } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { mode: "signin" } });
  }, [user, loading, navigate]);

  const { data: collection } = useQuery({
    queryKey: ["collection", id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("collections").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ["collection-products", id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("collection_id", id)
        .order("position", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [cover, setCover] = useState("");

  const [pName, setPName] = useState("");
  const [pImage, setPImage] = useState("");
  const [pLink, setPLink] = useState("");

  useEffect(() => {
    if (collection) {
      setTitle(collection.title);
      setDesc(collection.description ?? "");
      setCover(collection.cover_url ?? "");
    }
  }, [collection]);

  async function saveCollection() {
    const { error } = await supabase
      .from("collections")
      .update({ title, description: desc, cover_url: cover })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Saved.");
    qc.invalidateQueries({ queryKey: ["collection", id] });
    qc.invalidateQueries({ queryKey: ["my-collections"] });
  }

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("products").insert({
      collection_id: id,
      creator_id: user!.id,
      name: pName,
      image_url: pImage,
      external_link: pLink,
      position: products.length,
    });
    if (error) return toast.error(error.message);
    setPName(""); setPImage(""); setPLink("");
    qc.invalidateQueries({ queryKey: ["collection-products", id] });
  }

  async function deleteProduct(pid: string) {
    const { error } = await supabase.from("products").delete().eq("id", pid);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["collection-products", id] });
  }

  if (!collection) {
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
      <div className="mx-auto max-w-5xl px-6 py-12">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_360px]">
          {/* Products */}
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Editing</p>
              <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">{collection.title}</h1>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6">
              <h2 className="mb-4 font-display text-xl font-semibold">Add a product</h2>
              <form onSubmit={addProduct} className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
                <Input placeholder="Product name" required value={pName} onChange={(e) => setPName(e.target.value)} />
                <Input placeholder="Image URL" value={pImage} onChange={(e) => setPImage(e.target.value)} />
                <Input placeholder="Link (Kaspi, etc.)" value={pLink} onChange={(e) => setPLink(e.target.value)} />
                <Button type="submit"><Plus className="h-4 w-4" /></Button>
              </form>
            </div>

            {products.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
                No products yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {products.map((p) => (
                  <div key={p.id} className="group relative overflow-hidden rounded-2xl border border-border bg-card">
                    <div className="aspect-square overflow-hidden bg-warm">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="grid h-full place-items-center text-xs text-muted-foreground">No image</div>
                      )}
                    </div>
                    <div className="space-y-2 p-3">
                      <p className="text-sm font-medium leading-snug">{p.name}</p>
                      <div className="flex items-center justify-between">
                        {p.external_link ? (
                          <a href={p.external_link} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-accent">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : <span />}
                        <button onClick={() => deleteProduct(p.id)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Collection meta */}
          <aside className="space-y-4 rounded-3xl border border-border bg-card p-6 lg:sticky lg:top-24 lg:self-start">
            <h2 className="font-display text-xl font-semibold">Collection details</h2>
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Cover URL</Label>
              <Input value={cover} onChange={(e) => setCover(e.target.value)} />
              {cover && <img src={cover} alt="" className="mt-2 aspect-[16/10] w-full rounded-xl object-cover" />}
            </div>
            <Button onClick={saveCollection} className="w-full">Save details</Button>
          </aside>
        </div>
      </div>
    </div>
  );
}