import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Sparkles, Search, Send, Heart, BarChart3, Inbox, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Creator Marketplace KZ — Where creators and brands collaborate beautifully" },
      { name: "description", content: "An editorial marketplace built for Kazakhstan. Creators curate collections, brands discover collaborators." },
      { property: "og:title", content: "Creator Marketplace KZ" },
      { property: "og:description", content: "Where creators and brands collaborate beautifully." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Hero />
      <Features />
      <HowItWorks />
      <CreatorBenefits />
      <BrandBenefits />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );

  function Hero() {
    return (
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-cream via-background to-warm" />
        <div className="absolute -right-32 top-20 -z-10 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="mx-auto max-w-7xl px-6 pb-28 pt-20 sm:pt-32">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> {t("landing.badge")}
            </span>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
              {t("landing.heroTitle")}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{t("landing.heroSubtitle")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/auth" search={{ mode: "signup" }}>
                <Button size="lg" className="rounded-full px-7">{t("landing.ctaPrimary")}</Button>
              </Link>
              <Link to="/marketplace">
                <Button size="lg" variant="outline" className="rounded-full px-7">{t("landing.ctaSecondary")}</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  function Features() {
    const items = [
      { icon: Sparkles, title: t("landing.featureCurationTitle"), body: t("landing.featureCurationBody") },
      { icon: Search, title: t("landing.featureDiscoveryTitle"), body: t("landing.featureDiscoveryBody") },
      { icon: Send, title: t("landing.featureDirectTitle"), body: t("landing.featureDirectBody") },
    ];
    return (
      <section className="mx-auto max-w-7xl px-6 py-24">
        <Eyebrow>{t("landing.featuresEyebrow")}</Eyebrow>
        <h2 className="mt-2 max-w-2xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">{t("landing.featuresTitle")}</h2>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-3xl border border-border bg-card p-8 hover-lift">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent"><f.icon className="h-5 w-5" /></div>
              <h3 className="mt-6 font-display text-xl font-semibold">{f.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>
    );
  }

  function HowItWorks() {
    const steps = [
      { n: "01", title: t("landing.howStep1Title"), body: t("landing.howStep1Body") },
      { n: "02", title: t("landing.howStep2Title"), body: t("landing.howStep2Body") },
      { n: "03", title: t("landing.howStep3Title"), body: t("landing.howStep3Body") },
    ];
    return (
      <section className="border-y border-border bg-cream">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <Eyebrow>{t("landing.howEyebrow")}</Eyebrow>
          <h2 className="mt-2 max-w-2xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">{t("landing.howTitle")}</h2>
          <div className="mt-14 grid gap-12 lg:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n}>
                <p className="font-display text-5xl text-accent">{s.n}</p>
                <h3 className="mt-4 font-display text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  function CreatorBenefits() {
    return (
      <BenefitSection
        eyebrow={t("landing.creatorBenefitsEyebrow")}
        title={t("landing.creatorBenefitsTitle")}
        items={[t("landing.creatorBenefit1"), t("landing.creatorBenefit2"), t("landing.creatorBenefit3")]}
        accent={Heart}
        cta={{ label: t("nav.joinCreator"), to: "/auth", search: { mode: "signup", role: "creator" } }}
      />
    );
  }

  function BrandBenefits() {
    return (
      <BenefitSection
        eyebrow={t("landing.brandBenefitsEyebrow")}
        title={t("landing.brandBenefitsTitle")}
        items={[t("landing.brandBenefit1"), t("landing.brandBenefit2"), t("landing.brandBenefit3")]}
        accent={BarChart3}
        cta={{ label: t("landing.ctaSecondary"), to: "/marketplace" }}
        reverse
      />
    );
  }

  function Testimonials() {
    const items = [
      { quote: "Three brand collaborations in my first week. The dashboard is gorgeous.", author: "Aiymzhan", role: "Beauty creator · Almaty" },
      { quote: "We replaced a whole agency with this. Direct lines to real creators.", author: "Sayasat", role: "Founder · skincare brand" },
      { quote: "Finally a marketplace that feels editorial, not transactional.", author: "Dana", role: "Fashion editor · Astana" },
    ];
    return (
      <section className="mx-auto max-w-7xl px-6 py-24">
        <Eyebrow>{t("landing.testimonialsEyebrow")}</Eyebrow>
        <h2 className="mt-2 max-w-2xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">{t("landing.testimonialsTitle")}</h2>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {items.map((tt, i) => (
            <motion.figure key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-3xl border border-border bg-card p-8">
              <blockquote className="font-display text-xl leading-snug">"{tt.quote}"</blockquote>
              <figcaption className="mt-6 text-sm">
                <p className="font-semibold">{tt.author}</p>
                <p className="text-muted-foreground">{tt.role}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </section>
    );
  }

  function Pricing() {
    const plans = [
      { name: t("landing.planFree"), price: t("landing.planFreePrice"), desc: t("landing.planFreeDesc"), features: [t("landing.creatorBenefit1"), t("landing.creatorBenefit3")] },
      { name: t("landing.planPro"), price: t("landing.planProPrice"), desc: t("landing.planProDesc"), features: [t("landing.creatorBenefit2"), t("landing.featureCurationTitle")], featured: true },
      { name: t("landing.planBrand"), price: t("landing.planBrandPrice"), desc: t("landing.planBrandDesc"), features: [t("landing.brandBenefit2"), t("landing.brandBenefit3")] },
    ];
    return (
      <section className="border-y border-border bg-cream">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <Eyebrow>{t("landing.pricingEyebrow")}</Eyebrow>
          <h2 className="mt-2 max-w-2xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">{t("landing.pricingTitle")}</h2>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {plans.map((p) => (
              <div key={p.name} className={`rounded-3xl border p-8 ${p.featured ? "border-foreground bg-foreground text-background" : "border-border bg-card"}`}>
                <p className={`text-xs font-semibold uppercase tracking-wider ${p.featured ? "text-background/60" : "text-accent"}`}>{p.name}</p>
                <p className="mt-3 font-display text-4xl font-semibold">{p.price}</p>
                <p className={`mt-2 text-sm ${p.featured ? "text-background/70" : "text-muted-foreground"}`}>{p.desc}</p>
                <ul className="mt-6 space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/auth" search={{ mode: "signup" }} className="mt-8 block">
                  <Button variant={p.featured ? "secondary" : "default"} className="w-full rounded-full">{t("landing.ctaPrimary")}</Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  function FAQ() {
    const items = [
      { q: t("landing.faqQ1"), a: t("landing.faqA1") },
      { q: t("landing.faqQ2"), a: t("landing.faqA2") },
      { q: t("landing.faqQ3"), a: t("landing.faqA3") },
      { q: t("landing.faqQ4"), a: t("landing.faqA4") },
    ];
    return (
      <section className="mx-auto max-w-3xl px-6 py-24">
        <Eyebrow>{t("landing.faqEyebrow")}</Eyebrow>
        <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">{t("landing.faqTitle")}</h2>
        <Accordion type="single" collapsible className="mt-10">
          {items.map((f, i) => (
            <AccordionItem key={i} value={`f${i}`}>
              <AccordionTrigger className="text-left font-display text-lg">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    );
  }

  function Footer() {
    return (
      <footer className="border-t border-border bg-cream">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-12 sm:grid-cols-2">
          <div>
            <p className="font-display text-xl font-semibold">creator·kz</p>
            <p className="mt-2 text-sm text-muted-foreground">{t("landing.footerTagline")}</p>
          </div>
          <div className="flex items-end justify-start sm:justify-end text-sm text-muted-foreground">
            © {new Date().getFullYear()} Creator Marketplace KZ
          </div>
        </div>
      </footer>
    );
  }
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{children}</p>;
}

function BenefitSection({
  eyebrow, title, items, accent: Icon, cta, reverse,
}: {
  eyebrow: string; title: string; items: string[]; accent: typeof Inbox;
  cta: { label: string; to: string; search?: Record<string, string> }; reverse?: boolean;
}) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className={`grid items-center gap-12 lg:grid-cols-2 ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h2>
          <ul className="mt-8 space-y-3">
            {items.map((it) => (
              <li key={it} className="flex items-start gap-3 text-base">
                <Check className="mt-1 h-4 w-4 shrink-0 text-accent" />
                <span>{it}</span>
              </li>
            ))}
          </ul>
          <Link to={cta.to as never} search={cta.search as never} className="mt-8 inline-block">
            <Button size="lg" className="rounded-full px-6">{cta.label} <ArrowRight className="ml-1 h-4 w-4" /></Button>
          </Link>
        </div>
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-warm via-cream to-background p-12">
          <div className="absolute inset-8 grid place-items-center rounded-2xl bg-card shadow-xl">
            <Icon className="h-20 w-20 text-accent/40" />
          </div>
        </div>
      </div>
    </section>
  );
}