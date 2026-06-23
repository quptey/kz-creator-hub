import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, CATEGORY_LABELS, CITIES, FOLLOWER_RANGES, type Category, type City, type FollowerRange } from "@/lib/constants";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Set up your profile — creator·kz" }] }),
  component: Onboarding,
});

function Onboarding() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      return data;
    },
  });

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [social, setSocial] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [city, setCity] = useState<City | "">("");
  const [followers, setFollowers] = useState<FollowerRange | "">("");
  const [contactPerson, setContactPerson] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { mode: "signin" } });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setName(profile.display_name ?? "");
      setBio(profile.bio ?? "");
      setAvatar(profile.avatar_url ?? "");
      setSocial(profile.social_link ?? "");
      setCategory((profile.category as Category) ?? "");
      setCity((profile.city as City) ?? "");
      setFollowers((profile.follower_range as FollowerRange) ?? "");
      setContactPerson(profile.contact_person ?? "");
    }
  }, [profile]);

  if (!profile) return <div className="grid min-h-screen place-items-center text-muted-foreground">Loading…</div>;

  const isCreator = profile.role === "creator";

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload: Record<string, unknown> = {
      display_name: name,
      bio,
      avatar_url: avatar,
      social_link: social,
      onboarded: true,
    };
    if (isCreator) {
      payload.category = category || null;
      payload.city = city || null;
      payload.follower_range = followers || null;
    } else {
      payload.brand_name = name;
      payload.contact_person = contactPerson;
    }
    const { error } = await supabase.from("profiles").update(payload).eq("id", user!.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile saved.");
    navigate({ to: isCreator ? "/dashboard" : "/" });
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Step 1 of 1</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
          {isCreator ? "Set up your creator profile" : "Set up your brand"}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {isCreator ? "This is what brands will see when they discover you." : "Tell creators a bit about your brand."}
        </p>

        <form onSubmit={save} className="mt-10 space-y-6 rounded-3xl border border-border bg-card p-8">
          <div className="space-y-1.5">
            <Label htmlFor="name">{isCreator ? "Display name" : "Brand name"}</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bio">{isCreator ? "Short bio" : "About"}</Label>
            <Textarea id="bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder={isCreator ? "Beauty editor obsessed with skincare routines…" : "What does your brand do?"} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="avatar">Photo URL</Label>
            <Input id="avatar" placeholder="https://…" value={avatar} onChange={(e) => setAvatar(e.target.value)} />
          </div>
          {isCreator ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="social">Instagram or TikTok link</Label>
                <Input id="social" placeholder="https://instagram.com/…" value={social} onChange={(e) => setSocial(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                    <SelectTrigger><SelectValue placeholder="Pick" /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>City</Label>
                  <Select value={city} onValueChange={(v) => setCity(v as City)}>
                    <SelectTrigger><SelectValue placeholder="Pick" /></SelectTrigger>
                    <SelectContent>
                      {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Followers</Label>
                  <Select value={followers} onValueChange={(v) => setFollowers(v as FollowerRange)}>
                    <SelectTrigger><SelectValue placeholder="Pick" /></SelectTrigger>
                    <SelectContent>
                      {FOLLOWER_RANGES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="contact">Contact person</Label>
              <Input id="contact" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
            </div>
          )}
          <Button type="submit" size="lg" className="w-full" disabled={saving}>
            {saving ? "Saving…" : "Save & continue"}
          </Button>
        </form>
      </div>
    </div>
  );
}