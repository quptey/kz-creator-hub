import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

const searchSchema = z.object({
  mode: fallback(z.enum(["signin", "signup"]), "signin").default("signin"),
  role: fallback(z.enum(["creator", "brand"]), "creator").default("creator"),
});

export const Route = createFileRoute("/auth")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({ meta: [{ title: "Sign in — creator·kz" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { mode, role } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { display_name: name, role },
        },
      });
      setLoading(false);
      if (error) return toast.error(error.message);
      toast.success("Welcome aboard.");
      navigate({ to: "/onboarding" });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) return toast.error(error.message);
      navigate({ to: "/dashboard" });
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-foreground p-12 text-background lg:flex">
        <div className="absolute inset-0 -z-0 bg-gradient-to-br from-foreground via-foreground to-accent/30" />
        <Link to="/" className="relative font-display text-xl font-semibold">creator·kz</Link>
        <div className="relative space-y-5">
          <p className="font-display text-4xl font-medium leading-tight">
            "I built my first three brand collabs the week I joined."
          </p>
          <p className="text-sm text-background/60">— Aiymzhan, beauty creator · Almaty</p>
        </div>
        <div className="relative text-sm text-background/50">
          A curated marketplace for creators and brands in Kazakhstan.
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div>
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back</Link>
            <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight">
              {mode === "signup" ? "Create your account" : "Welcome back"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {mode === "signup" ? "Join the editorial marketplace." : "Sign in to your dashboard."}
            </p>
          </div>

          {mode === "signup" && (
            <div className="grid grid-cols-2 gap-2 rounded-full border border-border bg-secondary/40 p-1">
              <button
                type="button"
                onClick={() => navigate({ to: "/auth", search: { mode: "signup", role: "creator" } })}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${role === "creator" ? "bg-foreground text-background" : "text-muted-foreground"}`}
              >
                I'm a creator
              </button>
              <button
                type="button"
                onClick={() => navigate({ to: "/auth", search: { mode: "signup", role: "brand" } })}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${role === "brand" ? "bg-foreground text-background" : "text-muted-foreground"}`}
              >
                I'm a brand
              </button>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">{role === "creator" ? "Display name" : "Brand name"}</Label>
                <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? "…" : mode === "signup" ? "Create account" : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
            <Link
              to="/auth"
              search={{ mode: mode === "signup" ? "signin" : "signup", role }}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              {mode === "signup" ? "Sign in" : "Create an account"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}