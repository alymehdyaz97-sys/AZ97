import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SparkDefs } from "@/components/Sparkle";
import CollectionView from "@/components/CollectionView";
import { getCatalog } from "@/lib/catalog";
import { COLORS, PIECES, SITE_URL } from "@/lib/constants";
import { absUrl } from "@/lib/format";

export const revalidate = 30;

type Props = { params: { slug: string } };

export async function generateStaticParams() {
  const { collections } = await getCatalog();
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collections } = await getCatalog();
  const c = collections.find((x) => x.slug === params.slug);
  if (!c) return {};
  const title = `Collection ${c.name}`;
  const description = c.coming_soon
    ? `${c.description} Collection ${c.name} AZ#97 : bientôt disponible.`
    : `${c.description} T-shirts, manches longues et pulls zippés AZ#97 en 4 coloris, en précommande.`;
  return {
    title,
    description,
    alternates: { canonical: `/collections/${c.slug}` },
    openGraph: { title: `${title} | AZ#97`, description, url: `/collections/${c.slug}`, images: [{ url: c.cover_image }] },
  };
}

export default async function CollectionPage({ params }: Props) {
  const { collections, products, settings } = await getCatalog();
  const index = collections.findIndex((c) => c.slug === params.slug);
  if (index < 0) notFound();
  const c = collections[index];
  const items = products.filter((p) => p.collection_id === c.id);

  const ld = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Collection ${c.name} | AZ#97`,
    itemListElement: items.map((p, i) => {
      const piece = PIECES.find((x) => x.key === p.piece)?.name ?? p.piece;
      const color = COLORS[p.color_index - 1]?.fr ?? "";
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Product",
          name: `${piece} ${c.name} ${color}`.trim(),
          brand: { "@type": "Brand", name: "AZ#97" },
          image: absUrl(SITE_URL, p.image_face),
          color,
          url: `${SITE_URL}/collections/${c.slug}`,
          ...(c.coming_soon
            ? {}
            : {
                offers: {
                  "@type": "Offer",
                  price: p.price,
                  priceCurrency: "XOF",
                  availability: p.preorder ? "https://schema.org/PreOrder" : "https://schema.org/InStock",
                  url: `${SITE_URL}/collections/${c.slug}`,
                },
              }),
        },
      };
    }),
  };

  return (
    <>
      <SparkDefs />
      <div id="site">
        <SiteHeader />
        <main className="wrap cpage">
          <Link className="back" href="/#collections">← Toutes les collections</Link>
          <div className="chead">
            <p className="caps idx">Collection {index + 1} / {collections.length}</p>
            <h1>{c.name}</h1>
            {c.quote ? <p className="quote">« {c.quote} »</p> : null}
            <p className="desc">{c.description}</p>
            <span className="tag2">{c.coming_soon ? "Coming soon · bientôt disponible" : "Pièces en précommande"}</span>
          </div>
          <CollectionView collection={c} products={items} settings={settings} />
        </main>
        <SiteFooter />
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}
