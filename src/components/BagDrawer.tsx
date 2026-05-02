import { useNavigate } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { resolveImageUrl } from "@/lib/products-db";

export function BagDrawer() {
  const { items, open, setOpen, setQty, remove, count } = useCart();
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Overlay */}
      <button
        aria-label="Close bag"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
      />
      {/* Panel */}
      <aside
        role="dialog"
        aria-label="Your bag"
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background shadow-elegant"
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="editorial-eyebrow text-primary">Your Bag</p>
            <h2 className="font-serif text-2xl">{count} {count === 1 ? "piece" : "pieces"}</h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-2xl text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="editorial-eyebrow text-primary">Empty</p>
              <h3 className="mt-3 font-serif text-2xl">Your bag is waiting</h3>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                Add a piece from the shop and it'll show up here.
              </p>
              <button
                onClick={() => { setOpen(false); navigate({ to: "/shop" }); }}
                className="mt-6 bg-primary px-6 py-3 editorial-eyebrow text-primary-foreground hover:bg-primary/90"
              >
                Browse the Shop →
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((it) => (
                <li key={it.id} className="flex gap-3 py-4">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden bg-muted">
                    {it.image_url && (
                      <img src={resolveImageUrl(it.image_url)} alt={it.name} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="editorial-eyebrow text-muted-foreground">{it.category}</p>
                    <h4 className="truncate font-serif text-base">{it.name}</h4>
                    <p className="text-xs text-primary">{it.price}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => setQty(it.id, it.qty - 1)}
                        className="h-7 w-7 border border-input text-sm hover:border-primary"
                        aria-label="Decrease"
                      >−</button>
                      <span className="min-w-6 text-center text-sm">{it.qty}</span>
                      <button
                        onClick={() => setQty(it.id, it.qty + 1)}
                        className="h-7 w-7 border border-input text-sm hover:border-primary"
                        aria-label="Increase"
                      >+</button>
                      <button
                        onClick={() => remove(it.id)}
                        className="ml-auto text-xs text-muted-foreground hover:text-destructive"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="border-t border-border px-5 py-4">
            <p className="text-xs text-muted-foreground">
              Total is confirmed on WhatsApp (delivery & any custom items).
            </p>
            <button
              onClick={() => { setOpen(false); navigate({ to: "/checkout" }); }}
              className="mt-3 w-full bg-primary py-3 editorial-eyebrow text-primary-foreground hover:bg-primary/90"
            >
              Checkout on WhatsApp →
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
}
