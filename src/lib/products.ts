import scarfRed from "@/assets/scarf-silk-red.jpg";
import scarfsEarth from "@/assets/scarfs-earthtone.jpg";
import abayaYellow from "@/assets/abaya-yellow-floral.jpg";
import abayaPaisley from "@/assets/abaya-paisley.jpg";
import sunglasses from "@/assets/sunglasses-collection.jpg";
import giftbox from "@/assets/giftbox-hero.jpg";

export type Product = {
  id: string;
  name: string;
  category: "Abayas" | "Scarfs" | "Giftboxes" | "Accessories" | "Dresses";
  price: string;
  image: string;
  caption: string;
  badge?: string;
};

export const products: Product[] = [
  {
    id: "abaya-burgundy-rose",
    name: "Yellow Bloom Abaya",
    category: "Abayas",
    price: "₦25,000",
    image: abayaYellow,
    caption: "Floating chiffon, hand-finished hem. With inner.",
    badge: "New",
  },
  {
    id: "abaya-paisley",
    name: "Paisley Heritage Abaya",
    category: "Abayas",
    price: "₦22,000",
    image: abayaPaisley,
    caption: "Soft chiffon paisley print, relaxed silhouette.",
  },
  {
    id: "scarf-silk-red",
    name: "Crimson Chain Silk Scarf",
    category: "Scarfs",
    price: "₦8,500",
    image: scarfRed,
    caption: "Square satin silk, baroque chain motif.",
    badge: "Bestseller",
  },
  {
    id: "scarf-earthtone",
    name: "Earth Edit Chiffon Hijab",
    category: "Scarfs",
    price: "₦6,000",
    image: scarfsEarth,
    caption: "Premium chiffon — terracotta, honey, blush, cocoa.",
  },
  {
    id: "sunglasses-cateye",
    name: "Cat-Eye Sunglasses Set",
    category: "Accessories",
    price: "₦6,000",
    image: sunglasses,
    caption: "Eight colourways. UV-protected lenses, 140mm frame.",
  },
  {
    id: "giftbox-signature",
    name: "Peng Signature Giftbox",
    category: "Giftboxes",
    price: "From ₦15,000",
    image: giftbox,
    caption: "Curated by Fatima — silk, scarf and a personal note.",
    badge: "Made-to-order",
  },
];

export const categories = ["All", "Abayas", "Scarfs", "Giftboxes", "Accessories"] as const;
export type Category = (typeof categories)[number];
