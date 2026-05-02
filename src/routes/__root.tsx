import { Outlet, Link, createRootRoute, HeadContent, Scripts, useRouterState } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { BagDrawer } from "@/components/BagDrawer";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";

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
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovable App" },
      {
        name: "description",
        content:
          "Curated abayas, silk scarfs, ready-to-wear dresses and signature giftboxes by Fatima Danjuma. Worldwide delivery from Minna, Nigeria.",
      },
      { name: "author", content: "The Peng Collection" },
      { property: "og:title", content: "Lovable App" },
      {
        property: "og:description",
        content:
          "Luxury abayas, silk scarfs and curated giftboxes by Fatima Danjuma. Worldwide delivery.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Lovable App" },
      { name: "description", content: "The Peng Collection is an e-commerce website for fashion and gift items." },
      { property: "og:description", content: "The Peng Collection is an e-commerce website for fashion and gift items." },
      { name: "twitter:description", content: "The Peng Collection is an e-commerce website for fashion and gift items." },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
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
