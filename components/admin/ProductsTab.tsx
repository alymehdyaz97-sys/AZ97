"use client";
import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { COLORS, PIECES } from "@/lib/constants";
import { fmt } from "@/lib/format";
import type { Collection, PieceKey, Product } from "@/lib/types";
import type { Notify } from "./AdminApp";
import { errText, uploadImage } from "./helpers";

type Props = { sb: SupabaseClient; collections: Collection[]; products: Product[]; currency: string; reload: () => Promise<void>; notify: Notify };

function ProductRow({ sb, p, c, currency, reload, notify }: { sb: SupabaseClient; p: Product; c: Collection | undefined; currency: string; reload: () => Promise<void>; notify: Notify }) {
  const [price, setPrice] = useState(String(p.price));
  const [preorder, setPreorder] = useState(p.preorder);
  const [active, setActive] = useState(p.active);
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const piece = PIECES.find((x) => x.key === p.piece);
  const color = COLORS[p.color_index - 1];
  const dirty = Number(price) !== p.price || preorder !== p.preorder || active !== p.active;

  async function save() {
    const n = Math.round(Number(price));
    if (!Number.isFinite(n) || n < 0) { notify("Le prix doit être un nombre.", true); return; }
    setSaving(true);
    const { error } = await sb.from("products").update({ price: n, preorder, active }).eq("id", p.id);
    setSaving(false);
    if (error) { notify(error.message, true); return; }
    notify(`${piece?.name} ${c?.name} ${color?.fr} enregistré.`);
    await reload();
  }

  async function photo(face: "image_face" | "image_back", file: File | undefined) {
    if (!file) return;
    try {
      notify("Envoi de la photo...");
      const url = await uploadImage(sb, file, `products/${p.id}`);
      const { error } = await sb.from("products").update({ [face]: url }).eq("id", p.id);
      if (error) throw error;
      notify("Photo remplacée.");
      await reload();
    } catch (e) { notify(errText(e), true); }
  }

  async function remove() {
    const { error } = await sb.from("products").delete().eq("id", p.id);
    if (error) { notify(error.message, true); return; }
    notify("Pièce supprimée.");
    await reload();
  }

  return (
    <div className="card">
      <div className="prow">
        <div className="thumb">{p.image_face ? <img src={p.image_face} alt="" /> : "Pas de photo"}</div>
        <div style={{ minWidth: 0 }}>
          <p className="ptitle">{piece?.name} · {color?.fr}<small>{c?.name} · prix actuel {fmt(p.price)} {currency}</small></p>
          <div className="fields">
            <label htmlFor={`pr-${p.id}`}>Prix ({currency})
              <input id={`pr-${p.id}`} type="number" inputMode="numeric" min={0} step={500} value={price} onChange={(e) => setPrice(e.target.value)} />
            </label>
            <label className="check"><input type="checkbox" checked={preorder} onChange={(e) => setPreorder(e.target.checked)} /> En précommande</label>
            <label className="check"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Visible sur le site</label>
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn small" type="button" disabled={!dirty || saving} onClick={save}>{saving ? "Enregistrement..." : "Enregistrer"}</button>
            <span className="btn small ghost file">Photo face<input type="file" accept="image/*" onChange={(e) => photo("image_face", e.target.files?.[0])} /></span>
            <span className="btn small ghost file">Photo dos<input type="file" accept="image/*" onChange={(e) => photo("image_back", e.target.files?.[0])} /></span>
            {confirmDel ? (
              <>
                <button className="btn small danger" type="button" onClick={remove}>Oui, supprimer</button>
                <button className="btn small ghost" type="button" onClick={() => setConfirmDel(false)}>Annuler</button>
              </>
            ) : (
              <button className="btn small danger" type="button" onClick={() => setConfirmDel(true)}>Supprimer</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsTab({ sb, collections, products, currency, reload, notify }: Props) {
  const [filter, setFilter] = useState<string>("all");
  const [bulk, setBulk] = useState<Record<PieceKey, string>>({ tee: "", ls: "", zip: "" });
  const [nc, setNc] = useState({ collection: "", piece: "tee" as PieceKey, color: "1", price: "" });
  const colById = new Map(collections.map((c) => [c.id, c]));
  const list = products.filter((p) => filter === "all" || p.collection_id === filter);

  async function applyPrice(piece: PieceKey) {
    const n = Math.round(Number(bulk[piece]));
    if (!Number.isFinite(n) || n <= 0) { notify("Entre un prix valide.", true); return; }
    const { error } = await sb.from("products").update({ price: n }).eq("piece", piece);
    if (error) { notify(error.message, true); return; }
    notify(`Prix ${PIECES.find((x) => x.key === piece)?.plural} : ${fmt(n)} ${currency} partout.`);
    setBulk({ ...bulk, [piece]: "" });
    await reload();
  }

  async function setAllPreorder(v: boolean) {
    const { error } = await sb.from("products").update({ preorder: v }).not("id", "is", null);
    if (error) { notify(error.message, true); return; }
    notify(v ? "Toutes les pièces sont en précommande." : "Plus aucune pièce en précommande.");
    await reload();
  }

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();
    const cid = nc.collection || collections[0]?.id;
    const price = Math.round(Number(nc.price));
    if (!cid) { notify("Crée d'abord une collection.", true); return; }
    if (!Number.isFinite(price) || price < 0) { notify("Entre un prix valide.", true); return; }
    const { error } = await sb.from("products").insert({ collection_id: cid, piece: nc.piece, color_index: Number(nc.color), price, preorder: true, active: true, sort: 9000 + Number(nc.color) });
    if (error) { notify(error.message.includes("duplicate") ? "Cette pièce existe déjà dans cette collection." : error.message, true); return; }
    notify("Pièce ajoutée. Ajoute maintenant ses photos.");
    setNc({ ...nc, price: "" });
    await reload();
  }

  return (
    <>
      <div className="card">
        <h2>Actions rapides</h2>
        <div className="grid2">
          {PIECES.map((pc) => (
            <div key={pc.key}>
              <label htmlFor={`b-${pc.key}`}>Prix de tous les {pc.plural.toLowerCase()}
                <input id={`b-${pc.key}`} type="number" inputMode="numeric" min={0} step={500} placeholder={currency} value={bulk[pc.key]} onChange={(e) => setBulk({ ...bulk, [pc.key]: e.target.value })} />
              </label>
              <button className="btn small" type="button" style={{ marginTop: 8 }} onClick={() => applyPrice(pc.key)}>Appliquer</button>
            </div>
          ))}
        </div>
        <div className="row" style={{ marginTop: 16 }}>
          <button className="btn small" type="button" onClick={() => setAllPreorder(true)}>Tout mettre en précommande</button>
          <button className="btn small ghost" type="button" onClick={() => setAllPreorder(false)}>Retirer la précommande partout</button>
        </div>
      </div>

      <form className="card" onSubmit={addProduct}>
        <h2>Ajouter une pièce</h2>
        <div className="grid2">
          <label htmlFor="n-c">Collection
            <select id="n-c" value={nc.collection || collections[0]?.id || ""} onChange={(e) => setNc({ ...nc, collection: e.target.value })}>
              {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label htmlFor="n-p">Type
            <select id="n-p" value={nc.piece} onChange={(e) => setNc({ ...nc, piece: e.target.value as PieceKey })}>
              {PIECES.map((p) => <option key={p.key} value={p.key}>{p.name}</option>)}
            </select>
          </label>
          <label htmlFor="n-k">Coloris
            <select id="n-k" value={nc.color} onChange={(e) => setNc({ ...nc, color: e.target.value })}>
              {COLORS.map((c, i) => <option key={c.n} value={i + 1}>{c.n} · {c.fr}</option>)}
            </select>
          </label>
          <label htmlFor="n-pr">Prix ({currency})
            <input id="n-pr" type="number" inputMode="numeric" min={0} step={500} value={nc.price} onChange={(e) => setNc({ ...nc, price: e.target.value })} required />
          </label>
        </div>
        <button className="btn small" type="submit" style={{ marginTop: 12 }}>Ajouter</button>
      </form>

      <div className="card">
        <label htmlFor="flt">Afficher
          <select id="flt" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Toutes les collections ({products.length} pièces)</option>
            {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
      </div>

      {list.map((p) => <ProductRow key={p.id + p.price + String(p.preorder) + String(p.active) + p.image_face + p.image_back} sb={sb} p={p} c={colById.get(p.collection_id)} currency={currency} reload={reload} notify={notify} />)}
      {list.length === 0 ? <p className="hint">Aucune pièce ici.</p> : null}
    </>
  );
}
