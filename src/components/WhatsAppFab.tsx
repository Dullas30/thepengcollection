import { waLink } from "@/lib/site";

export function WhatsAppFab() {
  return (
    <a
      href={waLink("Hi Fatima 🌹 I'd like to ask about an item from The Peng Collection.")}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-elegant transition-transform hover:scale-105"
      style={{ boxShadow: "var(--shadow-elegant)" }}
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden>
        <path d="M19.05 4.91A10 10 0 0 0 4.1 18.36L3 22l3.74-1.07A10 10 0 1 0 19.05 4.9Zm-7.04 15.27a8.27 8.27 0 0 1-4.22-1.16l-.3-.18-2.22.64.65-2.16-.2-.31a8.29 8.29 0 1 1 6.29 3.17Zm4.55-6.2c-.25-.13-1.47-.73-1.7-.81-.23-.09-.4-.13-.56.13-.17.25-.65.81-.79.97-.15.17-.29.19-.54.06-.25-.13-1.05-.39-2-1.23a7.5 7.5 0 0 1-1.39-1.72c-.14-.25 0-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.13-.56-1.36-.77-1.86-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.06 0 1.21.88 2.39 1 2.55.13.17 1.74 2.66 4.21 3.73.59.26 1.05.41 1.41.52.59.19 1.13.16 1.55.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.31Z" />
      </svg>
    </a>
  );
}
