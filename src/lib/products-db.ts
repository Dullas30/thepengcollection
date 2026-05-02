import { supabase } from "@/integrations/supabase/client";

export type DBProduct = {
  id: string;
  name: string;
  category: string;
  price: string;
  description: string | null;
  image_url: string | null;
  badge: string | null;
  sort_order: number;
  stock: number;
  active: boolean;
};

// Resolve image URL: storage paths go through public storage, seeded paths use bundled assets, http stays as-is
import scarfRed from "@/assets/scarf-silk-red.jpg";
import scarfsEarth from "@/assets/scarfs-earthtone.jpg";
import abayaYellow from "@/assets/abaya-yellow-floral.jpg";
import abayaPaisley from "@/assets/abaya-paisley.jpg";
import sunglasses from "@/assets/sunglasses-collection.jpg";
import giftbox from "@/assets/giftbox-hero.jpg";

const seedMap: Record<string, string> = {
  "/seed/scarf-silk-red.jpg": scarfRed,
  "/seed/scarfs-earthtone.jpg": scarfsEarth,
  "/seed/abaya-yellow-floral.jpg": abayaYellow,
  "/seed/abaya-paisley.jpg": abayaPaisley,
  "/seed/sunglasses-collection.jpg": sunglasses,
  "/seed/giftbox-hero.jpg": giftbox,
};

export function resolveImageUrl(image_url: string | null): string {
  if (!image_url) return "";
  if (image_url.startsWith("http")) return image_url;
  if (image_url.startsWith("/seed/")) return seedMap[image_url] ?? "";
  const { data } = supabase.storage.from("product-images").getPublicUrl(image_url);
  return data.publicUrl;
}

export const CATEGORIES = ["Abayas", "Scarfs", "Giftboxes", "Accessories", "Dresses"] as const;
