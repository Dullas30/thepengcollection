import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { resolveImageUrl, type DBProduct } from "@/lib/products-db";

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

    // Realtime sync — refresh when products change
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

  // "Flashing & changing" — rotate the visible window every few seconds
  useEffect(() => {
    if (items.length <= 6) return;
    const id = setInterval(() => setTick((t) => t + 1), 3500);
    return () => clearInterval(id);
  }, [items.length]);

  // Pick a rotating window of items (covers grid)
  const visible = items.length
    ? Array.from({ length: Math.min(9, items.length) }, (_, i) => items[(tick + i) % items.length])
    : [];

  return (
    <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
      <div className="max-w-2xl">
        <p className="editorial-eyebrow text-primary">Lookbook · Vol. I</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl md:text-6xl">
          A diary in fabric.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Slow images of the pieces we love most — styled, layered and worn the
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
        <div className="mt-14 grid auto-rows-[200px] grid-cols-2 gap-3 md:auto-rows-[280px] md:grid-cols-3 md:gap-5">
          {visible.map((p, i) => (
            <figure
              key={`${p.id}-${tick}-${i}`}
              className={`lookbook-tile group relative overflow-hidden bg-muted ${i % 5 === 0 ? "row-span-2" : ""}`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <img
                src={resolveImageUrl(p.image_url)}
                alt={p.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <figcaption className="absolute bottom-3 left-3 bg-background/85 px-3 py-1.5 editorial-eyebrow text-primary">
                {p.name}
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      <div className="mt-16 border-t border-border pt-10 text-center">
        <p className="font-serif text-2xl italic">More moments live on Instagram.</p>
        <a
          href="https://instagram.com/the_peng_collection_"
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block editorial-eyebrow text-primary"
        >
          @the_peng_collection_ →
        </a>
      </div>
    </div>
  );
}
