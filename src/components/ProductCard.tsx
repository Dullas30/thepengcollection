import { waLink } from "@/lib/site";
import { resolveImageUrl, type DBProduct } from "@/lib/products-db";

export function ProductCard({ product, index = 0 }: { product: DBProduct; index?: number }) {
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
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <p className="editorial-eyebrow text-muted-foreground">{product.category}</p>
          <h3 className="mt-1 font-serif text-lg leading-tight">{product.name}</h3>
          {product.description && (
            <p className="mt-1 text-xs text-muted-foreground">{product.description}</p>
          )}
        </div>
        <p className="font-serif text-base text-primary whitespace-nowrap">{product.price}</p>
      </div>
      <a
        href={waLink(
          `Hi Fatima 🌹 I'd like to order: ${product.name} (${product.price}). Is it available?`
        )}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-block editorial-eyebrow border-b border-foreground/40 pb-1 text-foreground transition-colors hover:border-primary hover:text-primary"
      >
        Order →
      </a>
    </article>
  );
}
