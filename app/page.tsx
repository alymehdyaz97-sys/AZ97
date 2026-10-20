import Link from "next/link";
import Intro from "@/components/Intro";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Spark, SparkDefs } from "@/components/Sparkle";
import { getCatalog } from "@/lib/catalog";
import { COLORS, SITE_URL } from "@/lib/constants";

export const revalidate = 30;

export default async function Home() {
  const { collections } = await getCatalog();
  const ticker = [...collections, ...collections, ...collections, ...collections];

  const listLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Collections AZ#97",
    itemListElement: collections.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      url: `${SITE_URL}/collections/${c.slug}`,
    })),
  };

  return (
    <>
      <SparkDefs />
      <Intro />
      <div id="site">
        <SiteHeader />
        <main id="top">
          <div className="wrap">
            <section className="hero">
              <div>
                <h1>
                  <img src="/img/logo-black.png" alt="AZ#97" width={815} height={253} />
                  <span className="vh"> Marque de vêtements streetwear</span>
                </h1>
                <p className="caps tag">Quatre coloris. Une signature.</p>
                <p className="lede">
                  T-shirts, manches longues et pulls zippés. Cinq collections, chacune en noir, blanc et rose, avec le logo AZ#97 sur le cœur. Toutes les pièces sont en précommande.
                </p>
                <div className="cta">
                  <a className="btn" href="#collections">Voir les collections</a>
                  <a className="btn ghost" href="#coloris">Les 4 coloris</a>
                </div>
              </div>
              <div className="collage" aria-hidden="true">
                <img className="c1" src="/img/lips-tees.jpg" alt="" width={800} height={1200} />
                <img className="c2" src="/img/nosignal-tees.jpg" alt="" width={800} height={1200} />
                <img className="c3" src="/img/mona-tees.jpg" alt="" width={800} height={1200} />
              </div>
            </section>
          </div>

          <div className="marq" aria-hidden="true">
            <div className="track">
              {ticker.map((c, i) => (
                <span key={i}>{c.name}<Spark /></span>
              ))}
            </div>
          </div>

          <div className="wrap">
            <section className="sec" id="collections">
              <div className="sec-head">
                <h2>Collections</h2>
                <p>Touche une collection pour voir chaque pièce.</p>
              </div>
              <div className="cgrid">
                {collections.map((c) => (
                  <Link key={c.id} className="ccard" href={`/collections/${c.slug}`}>
                    <span className="ph">
                      {c.coming_soon ? <span className="soon">Coming soon</span> : null}
                      <img src={c.cover_image} alt={`Affiche de la collection ${c.name}`} width={800} height={1200} loading="lazy" />
                    </span>
                    <span className="nm">{c.name}</span>
                    <span className="go">{c.coming_soon ? "Bientôt disponible →" : "Voir les pièces →"}</span>
                  </Link>
                ))}
              </div>
              <div className="note">
                <span style={{ width: 20, height: 20, display: "block", flex: "none", color: "var(--hot)" }}><Spark /></span>
                <p><b>Précommande.</b> Choisis ta pièce, ton coloris et ta taille, puis envoie ta précommande par WhatsApp.</p>
              </div>
            </section>

            <section className="sec" id="coloris" style={{ paddingTop: 0 }}>
              <div className="sec-head">
                <h2>Quatre coloris</h2>
                <p>Couleur du vêtement / couleur de l&apos;impression.</p>
              </div>
              <div className="colors">
                {COLORS.map((c) => (
                  <div className="col" key={c.n}>
                    <span className="no">{c.n}</span>
                    <div className="sw" style={{ background: c.base }}><i style={{ background: c.ink }} /></div>
                    <b>{c.fr}</b>
                    <span>Vêtement / impression</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
        <SiteFooter />
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listLd) }} />
    </>
  );
}
