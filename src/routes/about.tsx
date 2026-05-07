import { createFileRoute } from "@tanstack/react-router";
import giftbox from "@/assets/giftbox-hero.jpg";
import { SITE, waLink } from "@/lib/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Fatima Danjuma — The Peng Collection" },
      {
        name: "description",
        content:
          "The story behind The Peng Collection — a curated fashion house founded by Fatima Danjuma in Minna, Nigeria.",
      },
      { property: "og:title", content: "About Fatima — The Peng Collection" },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-14 md:grid-cols-12 md:gap-16 md:px-8 md:py-20">
        <div className="md:col-span-7">
          <p className="editorial-eyebrow text-primary">Our Story</p>
          <h1 className="mt-3 font-serif text-5xl leading-[1.05] md:text-6xl">
            Pieces with a <em className="italic text-primary">pulse</em>.
          </h1>
          <div className="mt-8 space-y-5 text-base leading-relaxed text-muted-foreground md:text-lg">
            <p>
              The Peng Collection began as a small Instagram corner where{" "}
              <span className="text-foreground">{SITE.founder}</span> shared the
              fabrics, silhouettes and silks she wore herself. What started as
              a daily dose of trend has become a quiet little fashion house —
              one giftbox, one abaya, one scarf at a time.
            </p>
            <p>
              We believe in slow, considered curation. Every abaya is chosen
              for the way it falls. Every silk scarf for the way it catches
              light. Every giftbox is hand-tied in {SITE.location} and shipped
              with a personal note — anywhere in the world.
            </p>
            <p>
              You won't find disposable trends here. You'll find pieces meant
              to be worn often, layered freely and remembered fondly.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-6 border-t border-border pt-8 md:grid-cols-4">
            <Stat n="2,440" l="Followers" />
            <Stat n="326" l="Pieces shared" />
            <Stat n="100%" l="Hand-curated" />
            <Stat n="🌍" l="Worldwide ship" />
          </div>

          <a
            href={waLink("Hi Fatima 🌹 I read your story — I'd love to order.")}
            target="_blank"
            rel="noreferrer"
            className="mt-10 inline-block bg-primary px-7 py-4 editorial-eyebrow text-primary-foreground hover:bg-burgundy"
          >
            Talk to Fatima
          </a>
        </div>

        <div className="md:col-span-5">
          <div className="relative">
            <img
              src={giftbox}
              alt="Peng Signature Giftbox"
              className="aspect-[4/5] w-full object-cover"
              style={{ boxShadow: "var(--shadow-elegant)" }}
            />
            <div className="absolute -bottom-6 -right-6 hidden bg-background p-5 md:block" style={{ boxShadow: "var(--shadow-soft)" }}>
              <p className="editorial-eyebrow text-primary">Signature</p>
              <p className="mt-1 font-serif text-2xl">The Giftbox</p>
              <p className="text-xs text-muted-foreground">Curated by Fatima</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-secondary/40 py-20">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <p className="editorial-eyebrow text-primary text-center">The Values</p>
          <h2 className="mt-3 text-center font-serif text-4xl md:text-5xl">What we promise.</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { t: "Considered", d: "We choose each piece by hand — never bulk, never throwaway." },
              { t: "Personal", d: "Every order is confirmed by Fatima herself. Real conversations, real care." },
              { t: "Everywhere", d: "From Minna to Lagos, London or Dubai — we deliver worldwide." },
            ].map((v) => (
              <div key={v.t} className="border-t border-border bg-background p-7">
                <p className="editorial-eyebrow text-primary">·</p>
                <h3 className="mt-2 font-serif text-2xl">{v.t}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <p className="font-serif text-3xl text-primary">{n}</p>
      <p className="editorial-eyebrow mt-1 text-muted-foreground">{l}</p>
    </div>
  );
}
