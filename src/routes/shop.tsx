import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { products, categories, type Category } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — The Peng Collection" },
      {
        name: "description",
        content:
          "Browse abayas, silk scarfs, giftboxes and accessories from The Peng Collection. Order via WhatsApp with worldwide delivery.",
      },
      { property: "og:title", content: "Shop — The Peng Collection" },
      {
        property: "og:description",
        content: "Abayas, scarfs, giftboxes and accessories. Worldwide delivery.",
      },
    ],
  }),
  component: Shop,
});

function Shop() {
  const [active, setActive] = useState<Category>("All");
  const filtered = active === "All" ? products : products.filter((p) => p.category === active);

  return (
    <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
      <div className="max-w-2xl">
        <p className="editorial-eyebrow text-primary">The Shop</p>
        <h1 className="mt-3 font-serif text-5xl leading-tight md:text-6xl">
          Every piece, hand-picked.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Tap any item to send Fatima a WhatsApp note. We confirm availability,
          colourways and shipping in minutes.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-2 border-b border-border pb-4">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`editorial-eyebrow px-4 py-2 transition-colors ${
              active === c
                ? "bg-primary text-primary-foreground"
                : "text-foreground/70 hover:text-primary"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-12 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-20 text-center text-muted-foreground">
          More pieces dropping soon. Follow @the_peng_collection_ on Instagram for first access.
        </p>
      )}
    </div>
  );
}
