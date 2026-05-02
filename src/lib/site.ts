export const SITE = {
  name: "The Peng Collection",
  tagline: "Daily Dose of Trend",
  founder: "Fatima Danjuma",
  location: "Minna, Nigeria",
  delivery: "Worldwide Delivery",
  instagram: "the_peng_collection_",
  instagramUrl: "https://instagram.com/the_peng_collection_",
  phones: ["08084614891", "08164878532"],
  whatsappPrimary: "2348084614891", // intl format for wa.me
} as const;

export const waLink = (text: string) =>
  `https://wa.me/${SITE.whatsappPrimary}?text=${encodeURIComponent(text)}`;
