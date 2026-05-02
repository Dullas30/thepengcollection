import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-editorial.jpg";
import giftbox from "@/assets/giftbox-hero.jpg";
import scarfsEarth from "@/assets/scarfs-earthtone.jpg";
import abayaPaisley from "@/assets/abaya-paisley.jpg";
import sunglasses from "@/assets/sunglasses-collection.jpg";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/ProductCard";
import { SITE, waLink } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Peng Collection — Abayas, Silk Scarfs & Giftboxes" },
      {
        name: "description",
        content:
          "A curated wardrobe of abayas, silk scarfs and signature giftboxes by Fatima Danjuma. Worldwide delivery from Minna, Nigeria.",
      },
      { property: "og:title", content: "The Peng Collection" },
      { property: "og:image", content: heroImg },
    ],
  }),
  component: Index,
});

function Index() {
  const { products } = useProducts();
  const featured = products.slice(0, 4);
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-10 md:grid-cols-12 md:gap-12 md:px-8 md:pb-24 md:pt-16">
          <div className="md:col-span-6 lg:col-span-5">
            <p className="editorial-eyebrow text-primary fade-up">
              ✦ Daily Dose of Trend
            </p>
            <h1 className="mt-5 font-serif text-5xl leading-[1.02] text-balance text-foreground fade-up md:text-7xl lg:text-[5.5rem]">
              Worn by women who <em className="font-serif italic text-primary">arrive</em>.
            </h1>
            <p
              className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground fade-up"
              style={{ animationDelay: "120ms" }}
            >
              Abayas, silk scarfs and ready-to-wear dresses — curated piece by
              piece in Minna by {SITE.founder}. Made for the woman who treats
              every day like a quiet occasion.
            </p>
            <div
              className="mt-9 flex flex-wrap items-center gap-4 fade-up"
              style={{ animationDelay: "240ms" }}
            >
              <Link
                to="/shop"
                className="bg-primary px-7 py-4 editorial-eyebrow text-primary-foreground transition-colors hover:bg-burgundy"
              >
                Shop the Collection
              </Link>
              <a
                href={waLink("Hi Fatima 🌹 I just visited the website — I'd like to order.")}
                target="_blank"
                rel="noreferrer"
                className="border-b border-foreground pb-1 editorial-eyebrow text-foreground hover:text-primary hover:border-primary"
              >
                Order on WhatsApp
              </a>
            </div>

            <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-border pt-6 fade-up" style={{ animationDelay: "320ms" }}>
              <div>
                <dt className="editorial-eyebrow text-muted-foreground">Founded by</dt>
                <dd className="mt-1 font-serif text-lg">Fatima Danjuma</dd>
              </div>
              <div>
                <dt className="editorial-eyebrow text-muted-foreground">Atelier</dt>
                <dd className="mt-1 font-serif text-lg">Minna, NG</dd>
              </div>
              <div>
                <dt className="editorial-eyebrow text-muted-foreground">Delivery</dt>
                <dd className="mt-1 font-serif text-lg">Worldwide</dd>
              </div>
            </dl>
          </div>

          <div className="relative md:col-span-6 lg:col-span-7">
            <div className="relative">
              <div className="absolute -inset-4 -z-10 bg-gradient-to-br from-rose/20 via-transparent to-gold/20 blur-2xl" />
              <img
                src={heroImg}
                alt="Editorial portrait — burgundy abaya with silk hijab"
                className="aspect-[4/5] w-full object-cover shadow-elegant"
                style={{ boxShadow: "var(--shadow-elegant)" }}
              />
              <div className="absolute -bottom-6 -left-6 hidden bg-background p-5 shadow-soft md:block" style={{ boxShadow: "var(--shadow-soft)" }}>
                <p className="editorial-eyebrow text-primary">Issue 01</p>
                <p className="mt-1 font-serif text-2xl">The Burgundy Edit</p>
                <p className="text-xs text-muted-foreground">Spring / Summer 26</p>
              </div>
            </div>
          </div>
        </div>

        {/* marquee */}
        <div className="overflow-hidden border-y border-border bg-secondary/40 py-4">
          <div className="marquee flex w-max gap-12 whitespace-nowrap">
            {Array.from({ length: 2 }).flatMap((_, i) =>
              ["Abayas", "Silk Scarfs", "Ready-to-Wear", "Giftboxes", "Sunglasses", "Worldwide Delivery"].map((w) => (
                <span key={`${i}-${w}`} className="editorial-eyebrow text-foreground/70">
                  ✦ {w}
                </span>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="editorial-eyebrow text-primary">The Wardrobe</p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl">Edits to live in.</h2>
          </div>
          <Link to="/shop" className="hidden editorial-eyebrow text-foreground hover:text-primary md:inline">
            View all →
          </Link>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          <CategoryTile to="/shop" label="Abayas" image={abayaPaisley} eyebrow="Ready to wear" tall />
          <div className="grid gap-5">
            <CategoryTile to="/shop" label="Silk Scarfs" image={scarfsEarth} eyebrow="Featherweight" />
            <CategoryTile to="/shop" label="Giftboxes" image={giftbox} eyebrow="Curated by Fatima" />
          </div>
          <CategoryTile to="/shop" label="Accessories" image={sunglasses} eyebrow="Cat-eye sunglasses" tall />
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8 md:pb-28">
        <div className="flex items-end justify-between">
          <div>
            <p className="editorial-eyebrow text-primary">New In</p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl">This week's arrivals.</h2>
          </div>
        </div>
        <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* QUOTE */}
      <section className="border-y border-border bg-gradient-to-br from-secondary/60 to-background py-24">
        <div className="mx-auto max-w-3xl px-5 text-center md:px-8">
          <p className="editorial-eyebrow text-primary">A note from Fatima</p>
          <blockquote className="mt-6 font-serif text-3xl italic leading-snug text-foreground md:text-4xl">
            "I built The Peng Collection for the everyday queen — pieces that
            feel personal, never disposable, and always a little bit poetic."
          </blockquote>
          <p className="mt-6 editorial-eyebrow text-muted-foreground">
            — {SITE.founder}, Founder
          </p>
        </div>
      </section>
    </>
  );
}

function CategoryTile({
  to,
  label,
  image,
  eyebrow,
  tall = false,
}: {
  to: "/shop";
  label: string;
  image: string;
  eyebrow: string;
  tall?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`group relative block overflow-hidden bg-muted ${tall ? "aspect-[3/4] md:aspect-auto md:h-full" : "aspect-[4/3]"}`}
    >
      <img
        src={image}
        alt={label}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/65 via-foreground/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-5 text-cream">
        <div>
          <p className="editorial-eyebrow text-cream/80">{eyebrow}</p>
          <h3 className="mt-1 font-serif text-2xl text-cream md:text-3xl">{label}</h3>
        </div>
        <span className="editorial-eyebrow opacity-0 transition-opacity group-hover:opacity-100">
          Shop →
        </span>
      </div>
    </Link>
  );
}
