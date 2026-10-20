"use client";
import { useEffect, useState } from "react";
import { COLORS, PIECES } from "@/lib/constants";
import { fmt, waLink } from "@/lib/format";
import type { Collection, Product, Settings } from "@/lib/types";

type Face = "face" | "dos";

function imgOf(p: Product, face: Face) {
  return face === "face" ? p.image_face : p.image_back;
}

function ProductCard({ c, p, currency, onOrder, onZoom }: { c: Collection; p: Product; currency: string; onOrder: (p: Product) => void; onZoom: (src: string, alt: string) => void }) {
  const [face, setFace] = useState<Face>("face");
  const piece = PIECES.find((x) => x.key === p.piece);
  const color = COLORS[p.color_index - 1];
  const src = imgOf(p, face) || p.image_face;
  const alt = `${piece?.name ?? ""} ${c.name}, coloris ${color?.fr ?? ""}, ${face === "face" ? "face" : "dos"}`;
  return (
    <article className="prod">
      <div className="pimg">
        {src ? (
          <button className="zoom" type="button" aria-label={`Agrandir : ${alt}`} onClick={() => onZoom(src, alt)}>
            <img src={src} alt={alt} width={600} height={720} loading="lazy" />
          </button>
        ) : (
          <div className="empty">Photo à venir</div>
        )}
        {c.coming_soon ? <span className="pre">Coming soon</span> : p.preorder ? <span className="pre">Précommande</span> : null}
      </div>
      <div className="seg" role="group" aria-label="Face ou dos">
        <button type="button" aria-pressed={face === "face"} onClick={() => setFace("face")}>Face</button>
        <button type="button" aria-pressed={face === "dos"} onClick={() => setFace("dos")}>Dos</button>
      </div>
      <h3>{piece?.name}</h3>
      <p className="cn">{color?.n} · {color?.fr}</p>
      {c.coming_soon ? (
        <p className="soonline">Bientôt disponible</p>
      ) : (
        <div className="buy">
          <span className="price">{fmt(p.price)}<small>{currency}</small></span>
          <button className="btn small" type="button" onClick={() => onOrder(p)}>{p.preorder ? "Précommander" : "Commander"}</button>
        </div>
      )}
    </article>
  );
}

function OrderSheet({ c, p, settings, onClose }: { c: Collection; p: Product; settings: Settings; onClose: () => void }) {
  const [size, setSize] = useState("");
  const [copied, setCopied] = useState("");
  const piece = PIECES.find((x) => x.key === p.piece);
  const color = COLORS[p.color_index - 1];
  const text = `Bonjour AZ#97, je ${p.preorder ? "précommande" : "commande"} : ${piece?.name} collection ${c.name}, coloris ${color?.fr}${size.trim() ? `, taille ${size.trim()}` : ""}. Prix : ${fmt(p.price)} ${settings.currency}.`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied("Message copié");
    } catch {
      setCopied("Sélectionne le message pour le copier");
    }
    window.setTimeout(() => setCopied(""), 1800);
  }

  return (
    <div id="sheet" role="dialog" aria-modal="true" aria-label="Précommande" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sh">
        <button className="x" type="button" aria-label="Fermer" onClick={onClose}>×</button>
        <div className="top">
          {p.image_face ? <img src={p.image_face} alt="" /> : <div className="ph0" />}
          <div>
            <h2>{piece?.name} {c.name}</h2>
            <p className="sub">{color?.n} · {color?.fr}</p>
          </div>
        </div>
        <p className="tot">{fmt(p.price)} <small>{settings.currency}</small></p>
        <label htmlFor="sz">Taille
          <input id="sz" type="text" placeholder="S, M, L, XL..." maxLength={12} autoComplete="off" value={size} onChange={(e) => setSize(e.target.value)} autoFocus />
        </label>
        <output>{text}</output>
        <div className="row">
          <a className="btn" href={waLink(settings.whatsapp, text)} target="_blank" rel="noopener noreferrer">Envoyer sur WhatsApp</a>
          <button className="btn alt" type="button" onClick={copy}>{copied || "Copier le message"}</button>
        </div>
      </div>
    </div>
  );
}

export default function CollectionView({ collection, products, settings }: { collection: Collection; products: Product[]; settings: Settings }) {
  const [order, setOrder] = useState<Product | null>(null);
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (zoom) setZoom(null); else if (order) setOrder(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [zoom, order]);

  return (
    <>
      {PIECES.map((piece) => {
        const list = products.filter((p) => p.piece === piece.key).sort((a, b) => a.color_index - b.color_index);
        if (list.length === 0) return null;
        const prices = list.map((p) => p.price);
        const min = Math.min(...prices), max = Math.max(...prices);
        return (
          <section className="group" key={piece.key} aria-labelledby={`g-${piece.key}`}>
            <h2 id={`g-${piece.key}`}>
              {piece.plural}
              {collection.coming_soon ? null : <small>{min === max ? `${fmt(min)} ${settings.currency}` : `dès ${fmt(min)} ${settings.currency}`}</small>}
            </h2>
            <div className="pgrid">
              {list.map((p) => (
                <ProductCard key={p.id} c={collection} p={p} currency={settings.currency} onOrder={setOrder} onZoom={(src, alt) => setZoom({ src, alt })} />
              ))}
            </div>
          </section>
        );
      })}
      {order ? <OrderSheet c={collection} p={order} settings={settings} onClose={() => setOrder(null)} /> : null}
      {zoom ? (
        <div id="lb" role="dialog" aria-modal="true" aria-label="Photo agrandie" onClick={() => setZoom(null)}>
          <button className="x" type="button" aria-label="Fermer" onClick={() => setZoom(null)}>×</button>
          <img src={zoom.src} alt={zoom.alt} />
        </div>
      ) : null}
    </>
  );
}
