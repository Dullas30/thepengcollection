import { createFileRoute } from "@tanstack/react-router";
import { SITE, waLink } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Order — The Peng Collection" },
      {
        name: "description",
        content:
          "Order via WhatsApp, Instagram DM or phone. The Peng Collection ships worldwide from Minna, Nigeria.",
      },
      { property: "og:title", content: "Contact & Order — The Peng Collection" },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
      <div className="max-w-2xl">
        <p className="editorial-eyebrow text-primary">Get in touch</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl md:text-6xl">
          Let's style something <em className="italic text-primary">together</em>.
        </h1>
        <p className="mt-4 text-muted-foreground">
          The fastest way to order is WhatsApp — Fatima personally replies. You
          can also DM us on Instagram or call any of our lines below.
        </p>
      </div>

      <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <ContactCard
          eyebrow="Fastest"
          title="WhatsApp"
          line="Reply in minutes"
          href={waLink("Hi Fatima 🌹 I'd like to place an order.")}
          cta="Open chat →"
          highlight
        />
        <ContactCard
          eyebrow="Daily updates"
          title="Instagram"
          line={`@${SITE.instagram}`}
          href={SITE.instagramUrl}
          cta="Visit profile →"
        />
        <ContactCard
          eyebrow="Call us"
          title="Phone · Line 1"
          line={SITE.phones[0]}
          href={`tel:${SITE.phones[0]}`}
          cta="Call now →"
        />
        <ContactCard
          eyebrow="Call us"
          title="Phone · Line 2"
          line={SITE.phones[1]}
          href={`tel:${SITE.phones[1]}`}
          cta="Call now →"
        />
      </div>

      <div className="mt-20 grid gap-10 border-t border-border pt-14 md:grid-cols-2">
        <div>
          <p className="editorial-eyebrow text-primary">Studio</p>
          <h2 className="mt-3 font-serif text-3xl">Based in Minna, Nigeria</h2>
          <p className="mt-3 text-muted-foreground">
            By appointment only. Reach out via WhatsApp to schedule a visit
            with {SITE.founder}.
          </p>
        </div>
        <div>
          <p className="editorial-eyebrow text-primary">Shipping</p>
          <h2 className="mt-3 font-serif text-3xl">Worldwide delivery</h2>
          <p className="mt-3 text-muted-foreground">
            Nationwide across Nigeria and international shipping on request.
            Delivery quotes are confirmed when you place your order.
          </p>
        </div>
      </div>
    </div>
  );
}

function ContactCard({
  eyebrow, title, line, href, cta, highlight,
}: {
  eyebrow: string; title: string; line: string; href: string; cta: string; highlight?: boolean;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      className={`group flex flex-col justify-between p-7 transition-colors ${
        highlight
          ? "bg-primary text-primary-foreground hover:bg-burgundy"
          : "border border-border bg-card hover:border-primary"
      }`}
      style={{ minHeight: "12rem" }}
    >
      <div>
        <p className={`editorial-eyebrow ${highlight ? "text-primary-foreground/80" : "text-primary"}`}>
          {eyebrow}
        </p>
        <h3 className="mt-3 font-serif text-2xl">{title}</h3>
        <p className={`mt-2 text-sm ${highlight ? "text-primary-foreground/85" : "text-muted-foreground"}`}>
          {line}
        </p>
      </div>
      <p className="mt-6 editorial-eyebrow">{cta}</p>
    </a>
  );
}
