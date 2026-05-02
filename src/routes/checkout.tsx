import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { useCart } from "@/lib/cart";
import { resolveImageUrl } from "@/lib/products-db";
import { waLink, SITE } from "@/lib/site";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — The Peng Collection" },
      { name: "description", content: "Confirm your order details and finish on WhatsApp." },
    ],
  }),
  component: Checkout,
});

const formSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(80),
  phone: z.string().trim().min(7, "Please enter a valid phone number").max(20),
  address: z.string().trim().min(5, "Please enter a delivery address").max(300),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

function Checkout() {
  const { items, count, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", address: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center md:px-8">
        <p className="editorial-eyebrow text-primary">Empty Bag</p>
        <h1 className="mt-3 font-serif text-4xl">Nothing to checkout yet</h1>
        <p className="mt-3 text-muted-foreground">Pop into the shop and pick a piece you love.</p>
        <Link
          to="/shop"
          className="mt-8 inline-block bg-primary px-6 py-3 editorial-eyebrow text-primary-foreground hover:bg-primary/90"
        >
          Go to Shop →
        </Link>
      </div>
    );
  }

  const buildMessage = () => {
    const lines: string[] = [];
    lines.push(`Hi Fatima 🌹 I'd like to order from The Peng Collection:`);
    lines.push("");
    items.forEach((it, i) => {
      lines.push(`${i + 1}. ${it.name} × ${it.qty}  —  ${it.price}`);
    });
    lines.push("");
    lines.push(`👤 Name: ${form.name}`);
    lines.push(`📞 Phone: ${form.phone}`);
    lines.push(`📍 Delivery: ${form.address}`);
    if (form.notes.trim()) lines.push(`📝 Notes: ${form.notes}`);
    lines.push("");
    lines.push("Please confirm total + delivery cost so I can pay. Thank you!");
    return lines.join("\n");
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = formSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((iss) => {
        const k = iss.path[0]?.toString() ?? "form";
        if (!fieldErrors[k]) fieldErrors[k] = iss.message;
      });
      setErrors(fieldErrors);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setErrors({});
    const url = waLink(buildMessage());
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success("Opening WhatsApp — your bag is saved here too");
    // Clear after a short delay so the user sees the toast and can re-open if WA didn't launch
    setTimeout(() => {
      clear();
      navigate({ to: "/shop" });
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
      <p className="editorial-eyebrow text-primary">Checkout</p>
      <h1 className="mt-3 font-serif text-4xl md:text-5xl">Almost there.</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">
        Fill in your details and we'll open WhatsApp with your full order.
        Fatima will confirm total + delivery, then you pay via the number she shares.
      </p>

      <div className="mt-10 grid gap-10 md:grid-cols-5">
        {/* Form */}
        <form onSubmit={onSubmit} className="md:col-span-3 space-y-5 bg-card p-6" style={{ boxShadow: "var(--shadow-soft)" }}>
          <Field label="Full name" error={errors.name}>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              maxLength={80}
              className={inputCls}
              placeholder="Aisha Bello"
            />
          </Field>
          <Field label="Phone number" error={errors.phone}>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              maxLength={20}
              className={inputCls}
              placeholder="08012345678"
              inputMode="tel"
            />
          </Field>
          <Field label="Delivery address" error={errors.address}>
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              rows={3}
              maxLength={300}
              className={inputCls}
              placeholder="Street, city, state, country"
            />
          </Field>
          <Field label="Notes (optional)" error={errors.notes}>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              maxLength={500}
              className={inputCls}
              placeholder="Color preference, gift wrap, anything else…"
            />
          </Field>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 bg-primary py-3 editorial-eyebrow text-primary-foreground hover:bg-primary/90"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
              <path d="M19.05 4.91A10 10 0 0 0 4.1 18.36L3 22l3.74-1.07A10 10 0 1 0 19.05 4.9Zm-7.04 15.27a8.27 8.27 0 0 1-4.22-1.16l-.3-.18-2.22.64.65-2.16-.2-.31a8.29 8.29 0 1 1 6.29 3.17Z" />
            </svg>
            Send order on WhatsApp →
          </button>
          <p className="text-center text-xs text-muted-foreground">
            Goes to {SITE.phones[0]} · Fatima replies in minutes
          </p>
        </form>

        {/* Summary */}
        <aside className="md:col-span-2">
          <div className="bg-secondary/40 p-6">
            <p className="editorial-eyebrow text-primary">Order Summary · {count} {count === 1 ? "item" : "items"}</p>
            <ul className="mt-4 divide-y divide-border">
              {items.map((it) => (
                <li key={it.id} className="flex gap-3 py-3">
                  <div className="h-14 w-14 flex-shrink-0 overflow-hidden bg-muted">
                    {it.image_url && (
                      <img src={resolveImageUrl(it.image_url)} alt={it.name} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="truncate font-serif">{it.name}</p>
                    <p className="text-xs text-muted-foreground">Qty {it.qty} · {it.price}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Total + delivery confirmed by Fatima on WhatsApp.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

const inputCls = "w-full border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="editorial-eyebrow text-foreground">{label}</label>
      <div className="mt-1.5">{children}</div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
