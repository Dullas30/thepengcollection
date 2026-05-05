import { useCart } from "@/lib/cart";
import { resolveImageUrl, type DBProduct } from "@/lib/products-db";
import { toast } from "sonner";

export function ProductCard({ product, index = 0 }: { product: DBProduct; index?: number }) {
  const { add, setOpen } = useCart();
  const outOfStock = product.stock !== undefined && product.stock <= 0;

  const onAdd = () => {
    if (outOfStock) {
      toast.info("This piece is currently sold out — check back soon.");
      return;
    }
    add({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      image_url: product.image_url,
    });
    toast.success(`${product.name} added to bag`, {
      action: { label: "View Bag", onClick: () => setOpen(true) },
    });
  };

  return (
    <article
      className="group fade-up"
      style={{ animationDelay: `${Math.min(index, 6) * 70}ms` }}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {product.image_url ? (
          <img
            src={resolveImageUrl(product.image_url)}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground">
            <span className="editorial-eyebrow">No image yet</span>
          </div>
        )}
        {product.badge && (
          <span className="editorial-eyebrow absolute left-3 top-3 bg-background/90 px-2.5 py-1 text-primary">
            {product.badge}
          </span>
        )}
        {outOfStock && (
          <span className="editorial-eyebrow absolute right-3 top-3 bg-foreground/90 px-2.5 py-1 text-background">
            Sold out
          </span>
        )}
      </div>
      <div className="mt-4 flex flex-col gap-1">
        <p className="editorial-eyebrow text-muted-foreground">{product.category}</p>
        <h3 className="font-serif text-lg leading-tight">{product.name}</h3>
        {product.description && (
          <p className="text-xs text-muted-foreground">{product.description}</p>
        )}
        <p className="mt-1 font-serif text-sm text-primary break-words">{product.price}</p>
      </div>
      <button
        onClick={onAdd}
        disabled={outOfStock}
        className="mt-3 inline-flex items-center gap-2 editorial-eyebrow border-b border-foreground/40 pb-1 text-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        {outOfStock ? "Sold out" : "Add to Bag +"}
      </button>
    </article>
  );
}
