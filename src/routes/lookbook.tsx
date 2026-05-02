import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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

type LookbookImage = {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
};

function publicUrl(path: string) {
  if (path.startsWith("http")) return path;
  return supabase.storage.from("lookbook").getPublicUrl(path).data.publicUrl;
}

function Lookbook() {
  const [items, setItems] = useState<LookbookImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("lookbook_images")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (cancelled) return;
        setItems((data ?? []) as LookbookImage[]);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
      <div className="max-w-2xl">
        <p className="editorial-eyebrow text-primary">Lookbook · Vol. I</p>
        <h1 className="mt-3 font-serif text-5xl leading-tight md:text-6xl">
          A diary in fabric.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Slow images of the pieces we love most — styled, layered and worn the
          way they were meant to be.
        </p>
      </div>

      {loading ? (
        <p className="mt-20 text-center text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <p className="mt-20 text-center text-muted-foreground">
          New looks dropping soon. Follow @the_peng_collection_ on Instagram for first access.
        </p>
      ) : (
        <div className="mt-14 grid auto-rows-[200px] grid-cols-2 gap-3 md:auto-rows-[280px] md:grid-cols-3 md:gap-5">
          {items.map((img, i) => (
            <figure
              key={img.id}
              className={`group relative overflow-hidden bg-muted ${i % 5 === 0 ? "row-span-2" : ""}`}
            >
              <img
                src={publicUrl(img.image_url)}
                alt={img.caption ?? "Lookbook image"}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {img.caption && (
                <figcaption className="absolute bottom-3 left-3 bg-background/85 px-3 py-1.5 editorial-eyebrow text-primary">
                  {img.caption}
                </figcaption>
              )}
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
