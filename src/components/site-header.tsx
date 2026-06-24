import { Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { NotificationsBell } from "@/components/notifications-bell";

export function SiteHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-foreground text-background">
            <span className="font-display text-sm font-semibold">c.</span>
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">
            creator<span className="text-accent">·</span>kz
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <Link to="/" activeProps={{ className: "text-foreground" }} activeOptions={{ exact: true }} className="transition-colors hover:text-foreground">
            {t("nav.home")}
          </Link>
          <Link to="/marketplace" activeProps={{ className: "text-foreground" }} className="transition-colors hover:text-foreground">
            {t("nav.marketplace")}
          </Link>
          {user && (
            <Link to="/dashboard" activeProps={{ className: "text-foreground" }} className="transition-colors hover:text-foreground">
              {t("nav.dashboard")}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <NotificationsBell />
          {user ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await signOut();
                  navigate({ to: "/" });
                }}
              >
                {t("nav.signOut")}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/auth", search: { mode: "signin" } })}>
                {t("nav.signIn")}
              </Button>
              <Button size="sm" onClick={() => navigate({ to: "/auth", search: { mode: "signup" } })}>
                {t("nav.getStarted")}
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}