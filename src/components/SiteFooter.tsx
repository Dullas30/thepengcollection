import { Link } from "@tanstack/react-router";
import { SITE, waLink } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-4 md:px-8">
        <div className="md:col-span-2">
          <h3 className="font-serif text-3xl leading-tight">
            The Peng Collection
          </h3>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            Curated abayas, silk scarfs and giftboxes by {SITE.founder}.
            Worldwide delivery from {SITE.location}.
          </p>
          <a
            href={waLink("Hi Fatima, I'd like to place an order from your website 🌸")}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 border-b border-primary pb-1 text-sm font-medium text-primary"
          >
            Order on WhatsApp →
          </a>
        </div>

        <div>
          <p className="editorial-eyebrow text-muted-foreground">Explore</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/shop" className="hover:text-primary">Shop</Link></li>
            <li><Link to="/lookbook" className="hover:text-primary">Lookbook</Link></li>
            <li><Link to="/about" className="hover:text-primary">About Fatima</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact & Order</Link></li>
          </ul>
        </div>

        <div>
          <p className="editorial-eyebrow text-muted-foreground">Reach Us</p>
          <ul className="mt-4 space-y-2 text-sm">
            {SITE.phones.map((p) => (
              <li key={p}>
                <a href={`tel:${p}`} className="hover:text-primary">{p}</a>
              </li>
            ))}
            <li>
              <a
                href={SITE.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary"
              >
                @{SITE.instagram}
              </a>
            </li>
            <li className="text-muted-foreground">{SITE.location}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-5 py-6 text-xs text-muted-foreground md:flex-row md:items-center md:px-8">
          <p>© {new Date().getFullYear()} The Peng Collection. All rights reserved.</p>
          <p className="editorial-eyebrow">Daily Dose of Trend ✦</p>
        </div>
      </div>
    </footer>
  );
}
