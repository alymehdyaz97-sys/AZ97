export type PieceKey = "tee" | "ls" | "zip";

export type Collection = {
  id: string;
  slug: string;
  name: string;
  description: string;
  quote: string | null;
  cover_image: string;
  sort: number;
  active: boolean;
  coming_soon: boolean;
};

export type Product = {
  id: string;
  collection_id: string;
  piece: PieceKey;
  color_index: number; // 1 à 4
  price: number;
  preorder: boolean;
  active: boolean;
  image_face: string;
  image_back: string;
  sort: number;
};

export type Settings = {
  whatsapp: string;
  currency: string;
};

export type Catalog = {
  collections: Collection[];
  products: Product[];
  settings: Settings;
  source: "supabase" | "seed";
};
