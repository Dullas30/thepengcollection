import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { SITE } from "@/lib/site";

const nav = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/lookbook", label: "Lookbook" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-serif text-xl tracking-tight md:text-2xl">The Peng</span>
          <span className="editorial-eyebrow text-primary">Collection</span>
        </Link>
        <nav className="hidden items-center gap-9 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="editorial-eyebrow text-foreground/75 transition-colors hover:text-primary"
              activeProps={{ className: "editorial-eyebrow text-primary" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <a
          href={SITE.instagramUrl}
          target="_blank"
          rel="noreferrer"
          className="hidden editorial-eyebrow text-primary md:inline-block"
        >
          @{SITE.instagram}
        </a>
        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden"
          aria-label="Toggle menu"
        >
          <div className="space-y-1.5">
            <span className="block h-px w-6 bg-foreground" />
            <span className="block h-px w-6 bg-foreground" />
          </div>
        </button>
      </div>
      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="editorial-eyebrow py-2 text-foreground/80"
                activeProps={{ className: "editorial-eyebrow py-2 text-primary" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
            <a
              href={SITE.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="editorial-eyebrow py-2 text-primary"
            >
              @{SITE.instagram}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
