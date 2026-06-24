import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BUDGET_RANGES, type BudgetRange } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export function ContactCreatorDialog({
  open, onOpenChange, creatorId, creatorName,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  creatorId: string;
  creatorName: string;
}) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [brand, setBrand] = useState("");
  const [contact, setContact] = useState("");
  const [budget, setBudget] = useState<BudgetRange | "">("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      onOpenChange(false);
      navigate({ to: "/auth", search: { mode: "signin" } });
      return;
    }
    if (!budget) return;
    setSubmitting(true);
    const { error } = await supabase.from("brand_requests").insert({
      creator_id: creatorId,
      sender_id: user.id,
      brand_name: brand,
      contact_person: contact,
      budget_range: budget,
      message,
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t("contact.sent"));
    onOpenChange(false);
    setBrand(""); setContact(""); setBudget(""); setMessage("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{t("contact.title", { name: creatorName })}</DialogTitle>
          <DialogDescription>{t("contact.subtitle")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="brand">{t("contact.brand")}</Label>
            <Input id="brand" required value={brand} onChange={(e) => setBrand(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact">{t("contact.contactPerson")}</Label>
            <Input id="contact" required value={contact} onChange={(e) => setContact(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("contact.budget")}</Label>
            <Select value={budget} onValueChange={(v) => setBudget(v as BudgetRange)}>
              <SelectTrigger><SelectValue placeholder={t("contact.pickRange")} /></SelectTrigger>
              <SelectContent>
                {BUDGET_RANGES.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="message">{t("contact.message")}</Label>
            <Textarea id="message" required rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <Button type="submit" disabled={submitting || !budget} className="w-full">
            {submitting ? t("contact.sending") : t("contact.send")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}