import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/catalog";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { collections } = await getCatalog();
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    ...collections.map((c) => ({ url: `${SITE_URL}/collections/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
