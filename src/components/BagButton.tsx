import { useCart } from "@/lib/cart";

export function BagButton({ className = "" }: { className?: string }) {
  const { count, setOpen } = useCart();
  return (
    <button
      onClick={() => setOpen(true)}
      aria-label={`Open bag (${count} items)`}
      className={`relative inline-flex h-9 items-center gap-2 border border-foreground/20 bg-background px-3 editorial-eyebrow text-foreground transition-colors hover:border-primary hover:text-primary ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M5 8h14l-1.2 11.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9L5 8Z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </svg>
      Bag
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
          {count}
        </span>
      )}
    </button>
  );
}
