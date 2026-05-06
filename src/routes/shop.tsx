import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { CATEGORIES } from "@/lib/products-db";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/ProductCard";
import { Search, X } from "lucide-react";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — The Peng Collection" },
      {
        name: "description",
        content:
          "Browse abayas, silk scarfs, giftboxes and accessories from The Peng Collection. Worldwide delivery.",
      },
      { property: "og:title", content: "Shop — The Peng Collection" },
    ],
  }),
  component: Shop,
});

const FILTERS = ["All", ...CATEGORIES] as const;
type Filter = (typeof FILTERS)[number];
type Sort = "featured" | "newest" | "name";

function Shop() {
  const { products, loading } = useProducts();
  const [active, setActive] = useState<Filter>("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("featured");

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: products.length };
    for (const p of products) map[p.category] = (map[p.category] ?? 0) + 1;
    return map;
  }, [products]);

  const filtered = useMemo(() => {
    let list = active === "All" ? products : products.filter((p) => p.category === active);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q)
      );
    }
    if (sort === "newest") {
      list = [...list].sort((a, b) => (b.sort_order ?? 0) - (a.sort_order ?? 0));
    } else if (sort === "name") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [active, products, query, sort]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
      <div className="max-w-2xl">
        <p className="editorial-eyebrow text-primary">The Shop</p>
        <h1 className="mt-3 font-serif text-5xl leading-tight md:text-6xl">
          Every piece, hand-picked.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Tap any item to send Fatima a quick order note. We confirm availability,
          colourways and shipping in minutes.
        </p>
      </div>

      {/* Search + sort */}
      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search abayas, scarfs, gifts…"
            className="w-full border border-border bg-background py-2.5 pl-10 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <label className="flex items-center gap-3 editorial-eyebrow text-muted-foreground">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="border border-border bg-background px-3 py-2 text-xs uppercase tracking-wider text-foreground focus:border-primary focus:outline-none"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="name">A → Z</option>
          </select>
        </label>
      </div>

      {/* Category filter */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border pb-4">
        {FILTERS.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`editorial-eyebrow px-4 py-2 transition-colors ${
              active === c
                ? "bg-primary text-primary-foreground"
                : "text-foreground/70 hover:text-primary"
            }`}
          >
            {c} {counts[c] ? <span className="opacity-60">({counts[c]})</span> : null}
          </button>
        ))}
      </div>

      {!loading && (
        <p className="mt-6 editorial-eyebrow text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
          {active !== "All" && <> in {active}</>}
          {query && <> matching "{query}"</>}
        </p>
      )}

      {loading ? (
        <p className="mt-20 text-center text-muted-foreground">Loading the collection…</p>
      ) : (
        <div className="mt-8 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="mt-20 text-center">
          <p className="text-muted-foreground">
            {query
              ? `No pieces match "${query}" right now.`
              : "More pieces dropping soon. Follow @the_peng_collection_ on Instagram for first access."}
          </p>
          {(query || active !== "All") && (
            <button
              onClick={() => { setQuery(""); setActive("All"); }}
              className="mt-4 editorial-eyebrow border-b border-foreground pb-1 text-foreground hover:border-primary hover:text-primary"
            >
              Reset filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
