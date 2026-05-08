import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { resolveImageUrl, type DBProduct } from "@/lib/products-db";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useCart } from "@/lib/cart";
import { waLink } from "@/lib/site";
import { toast } from "sonner";

export const Route = createFileRoute("/lookbook")({
  head: () => ({
    meta: [
      { title: "Lookbook — The Peng Collection" },
      {
        name: "description",
        content:
          "A visual diary of The Peng Collection — abayas, silk scarfs and styling moments curated by Fatima Danjuma.",
      },
      { property: "og:title", content: "Lookbook — The Peng Collection" },
    ],
  }),
  component: Lookbook,
});

function Lookbook() {
  const [items, setItems] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const [selected, setSelected] = useState<DBProduct | null>(null);
  const { add, setOpen } = useCart();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .not("image_url", "is", null)
        .order("created_at", { ascending: false });
      if (cancelled) return;
      setItems((data ?? []) as DBProduct[]);
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel("lookbook-products")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => load(),
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (items.length <= 6) return;
    const id = setInterval(() => setTick((t) => t + 1), 3500);
    return () => clearInterval(id);
  }, [items.length]);

  const visible = items.length
    ? Array.from({ length: Math.min(9, items.length) }, (_, i) => items[(tick + i) % items.length])
    : [];

  const outOfStock = selected?.stock !== undefined && (selected?.stock ?? 0) <= 0;

  const onAddToBag = () => {
    if (!selected) return;
    if (outOfStock) {
      toast.info("This piece is currently sold out — check back soon.");
      return;
    }
    add({
      id: selected.id,
      name: selected.name,
      category: selected.category,
      price: selected.price,
      image_url: selected.image_url,
    });
    toast.success(`${selected.name} added to bag`, {
      action: { label: "View Bag", onClick: () => setOpen(true) },
    });
    setSelected(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:py-14 md:px-8 md:py-20">
      <div className="max-w-2xl">
        <p className="editorial-eyebrow text-primary">Lookbook · Vol. I</p>
        <h1 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
          A diary in fabric.
        </h1>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground">
          Tap any piece to see details and order — styled, layered and worn the
          way they were meant to be. Updates live as new pieces drop.
        </p>
      </div>

      {loading ? (
        <p className="mt-20 text-center text-muted-foreground">Loading…</p>
      ) : visible.length === 0 ? (
        <p className="mt-20 text-center text-muted-foreground">
          New looks dropping soon. Follow @the_peng_collection_ on Instagram for first access.
        </p>
      ) : (
        <div className="mt-10 sm:mt-14 grid auto-rows-[160px] grid-cols-2 gap-2.5 sm:auto-rows-[220px] sm:gap-3 md:auto-rows-[280px] md:grid-cols-3 md:gap-5">
          {visible.map((p, i) => (
            <button
              key={`${p.id}-${tick}-${i}`}
              onClick={() => setSelected(p)}
              aria-label={`View ${p.name}`}
              className={`lookbook-tile group relative block overflow-hidden bg-muted text-left focus:outline-none focus:ring-2 focus:ring-primary ${i % 5 === 0 ? "row-span-2" : ""}`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <img
                src={resolveImageUrl(p.image_url)}
                alt={p.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <figcaption className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-background/85 px-2 py-1 sm:px-3 sm:py-1.5 editorial-eyebrow text-[10px] sm:text-xs text-primary">
                {p.name}
              </figcaption>
            </button>
          ))}
        </div>
      )}

      <div className="mt-12 sm:mt-16 border-t border-border pt-8 sm:pt-10 text-center">
        <p className="font-serif text-xl sm:text-2xl italic">More moments live on Instagram.</p>
        <a
          href="https://instagram.com/the_peng_collection_"
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block editorial-eyebrow text-primary"
        >
          @the_peng_collection_ →
        </a>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden gap-0 sm:rounded-md">
          {selected && (
            <div className="grid md:grid-cols-2">
              <div className="relative aspect-[4/5] md:aspect-auto bg-muted">
                <img
                  src={resolveImageUrl(selected.image_url)}
                  alt={selected.name}
                  className="h-full w-full object-cover"
                />
                {selected.badge && (
                  <span className="editorial-eyebrow absolute left-3 top-3 bg-background/90 px-2.5 py-1 text-primary">
                    {selected.badge}
                  </span>
                )}
              </div>
              <div className="flex flex-col p-5 sm:p-7">
                <p className="editorial-eyebrow text-muted-foreground">{selected.category}</p>
                <DialogTitle className="mt-2 font-serif text-2xl sm:text-3xl leading-tight">
                  {selected.name}
                </DialogTitle>
                <p className="mt-3 font-serif text-lg text-primary">{selected.price}</p>
                {selected.description && (
                  <DialogDescription className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {selected.description}
                  </DialogDescription>
                )}
                {outOfStock && (
                  <p className="mt-4 editorial-eyebrow text-foreground/70">Sold out — check back soon</p>
                )}
                <div className="mt-auto pt-6 flex flex-col gap-3">
                  <button
                    onClick={onAddToBag}
                    disabled={outOfStock}
                    className="bg-primary px-6 py-3.5 editorial-eyebrow text-primary-foreground transition-colors hover:bg-burgundy disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {outOfStock ? "Sold out" : "Add to Bag"}
                  </button>
                  <a
                    href={waLink(`Hi Fatima 🌹 I'd like to order: ${selected.name} (${selected.price}).`)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-center border border-foreground px-6 py-3.5 editorial-eyebrow text-foreground transition-colors hover:bg-foreground hover:text-background"
                  >
                    Order on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
