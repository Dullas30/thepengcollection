import { Outlet, Link, createRootRoute, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { BagDrawer } from "@/components/BagDrawer";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import { Toaster } from "sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="editorial-eyebrow text-primary">404</p>
        <h1 className="mt-4 font-serif text-5xl text-foreground">Page not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This piece isn't in the collection. Let's get you back home.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-primary px-6 py-3 editorial-eyebrow text-primary-foreground hover:bg-primary/90"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { title: "The Peng Collection — Abayas, Silk Scarfs & Giftboxes" },
      {
        name: "description",
        content:
          "Curated abayas, silk scarfs, ready-to-wear dresses and signature giftboxes by Fatima Danjuma. Worldwide delivery from Minna, Nigeria.",
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

/**
 * Client-side head sync — applies per-route `head().meta` to the document
 * since we no longer have SSR <HeadContent />.
 */
function useHeadSync() {
  const matches = useRouterState({ select: (s) => s.matches });
  useEffect(() => {
    const metas = matches.flatMap((m) => (m.meta ?? []) as Array<Record<string, string>>);
    // Title
    for (let i = metas.length - 1; i >= 0; i--) {
      if (metas[i]?.title) {
        document.title = metas[i].title;
        break;
      }
    }
    // Remove previously injected meta tags
    document.querySelectorAll("meta[data-tsr]").forEach((el) => el.remove());
    for (const m of metas) {
      if (m.title) continue;
      const tag = document.createElement("meta");
      for (const [k, v] of Object.entries(m)) tag.setAttribute(k, v);
      tag.setAttribute("data-tsr", "");
      document.head.appendChild(tag);
    }
  }, [matches]);
}

function RootComponent() {
  useHeadSync();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isAdminArea = path.startsWith("/admin") || path === "/login";
  return (
    <AuthProvider>
      <CartProvider>
        <div className="flex min-h-screen flex-col">
          {!isAdminArea && <SiteHeader />}
          <main className="flex-1">
            <Outlet />
          </main>
          {!isAdminArea && <SiteFooter />}
          {!isAdminArea && <WhatsAppFab />}
          {!isAdminArea && <BagDrawer />}
          <Toaster position="top-center" richColors />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
