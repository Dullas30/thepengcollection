import { createFileRoute } from "@tanstack/react-router";
import { products } from "@/lib/products";

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

// Editorial collage — masonry-ish using existing product imagery
const layout = [
  { img: products[0].image, span: "row-span-2", label: "Bloom" },
  { img: products[2].image, span: "", label: "Crimson" },
  { img: products[4].image, span: "", label: "Sun-soaked" },
  { img: products[1].image, span: "row-span-2", label: "Heritage" },
  { img: products[3].image, span: "", label: "Earth" },
  { img: products[5].image, span: "", label: "Gifted" },
];

function Lookbook() {
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

      <div className="mt-14 grid auto-rows-[180px] grid-cols-2 gap-3 md:auto-rows-[260px] md:grid-cols-3 md:gap-5">
        {layout.map((l, i) => (
          <figure
            key={i}
            className={`group relative overflow-hidden bg-muted ${l.span}`}
          >
            <img
              src={l.img}
              alt={l.label}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <figcaption className="absolute bottom-3 left-3 bg-background/85 px-3 py-1.5 editorial-eyebrow text-primary">
              {l.label}
            </figcaption>
          </figure>
        ))}
      </div>

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
