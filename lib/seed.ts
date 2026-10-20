// Données de départ. Elles servent aussi de repli tant que Supabase n'est pas configuré.
import type { Collection, Product, PieceKey, Settings } from "./types";

type SeedCollection = Omit<Collection, "id"> & { imgKey: string };

const RAW: SeedCollection[] = [
  { slug: "love", imgKey: "love", name: "Love", quote: "À trop vouloir aimer, on finit par détester.", description: "Une phrase au dos, le logo AZ#97 sur le cœur. Blanc sur noir, rose sur blanc, noir sur blanc, blanc sur rose.", cover_image: "/img/love-tees.jpg", sort: 1, active: true, coming_soon: true },
  { slug: "no-signal", imgKey: "nosignal", name: "No Signal", quote: null, description: "Un visage aux yeux masqués, la bouche couverte, les mains sur les oreilles. Le visuel occupe tout le dos, la signature AZ#97 en dessous.", cover_image: "/img/nosignal-tees.jpg", sort: 2, active: true, coming_soon: false },
  { slug: "lips", imgKey: "lips", name: "Lips", quote: null, description: "Des lèvres en trame de points, des étoiles autour et le logo en diagonale.", cover_image: "/img/lips-tees.jpg", sort: 3, active: true, coming_soon: false },
  { slug: "graffiti", imgKey: "graffiti", name: "Graffiti", quote: null, description: "Le logo répété en graffiti sur les épaules et les manches. Petit logo sur le cœur devant, grand logo au centre derrière.", cover_image: "/img/graffiti-tees.jpg", sort: 4, active: true, coming_soon: false },
  { slug: "mona-lisa", imgKey: "mona", name: "Mona Lisa", quote: null, description: "La Joconde dans un cadre baroque au dos. « Mona Lisa » écrit en script le long des manches sur les manches longues et les pulls zippés.", cover_image: "/img/mona-tees.jpg", sort: 5, active: true, coming_soon: false },
];

export const SEED_PRICES: Record<PieceKey, number> = { tee: 10000, ls: 12000, zip: 20000 };

export const SEED_SETTINGS: Settings = { whatsapp: "", currency: "FCFA" };

export const SEED_COLLECTIONS: Collection[] = RAW.map(({ imgKey, ...c }) => ({ ...c, id: c.slug }));

export const SEED_PRODUCTS: Product[] = RAW.flatMap((c, ci) =>
  (["tee", "ls", "zip"] as PieceKey[]).flatMap((piece, pi) =>
    [1, 2, 3, 4].map((n) => ({
      id: `${c.slug}-${piece}-${n}`,
      collection_id: c.slug,
      piece,
      color_index: n,
      price: SEED_PRICES[piece],
      preorder: true,
      active: true,
      image_face: `/img/p/${c.imgKey}-${piece}-${n}-face.jpg`,
      image_back: `/img/p/${c.imgKey}-${piece}-${n}-dos.jpg`,
      sort: ci * 100 + pi * 10 + n,
    }))
  )
);
