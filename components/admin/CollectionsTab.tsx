"use client";
import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Collection } from "@/lib/types";
import type { Notify } from "./AdminApp";
import { errText, slugify, uploadImage } from "./helpers";

type Props = { sb: SupabaseClient; collections: Collection[]; reload: () => Promise<void>; notify: Notify };

function CollectionRow({ sb, c, reload, notify }: { sb: SupabaseClient; c: Collection; reload: () => Promise<void>; notify: Notify }) {
  const [name, setName] = useState(c.name);
  const [description, setDescription] = useState(c.description);
  const [quote, setQuote] = useState(c.quote ?? "");
  const [sort, setSort] = useState(String(c.sort));
  const [active, setActive] = useState(c.active);
  const [soon, setSoon] = useState(c.coming_soon);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const { error } = await sb.from("collections").update({ name: name.trim(), description, quote: quote.trim() || null, sort: Number(sort) || 0, active, coming_soon: soon }).eq("id", c.id);
    setSaving(false);
    if (error) { notify(error.message, true); return; }
    notify(`Collection ${name} enregistrée.`);
    await reload();
  }

  async function cover(file: File | undefined) {
    if (!file) return;
    try {
      notify("Envoi de la photo...");
      const url = await uploadImage(sb, file, `collections/${c.id}`);
      const { error } = await sb.from("collections").update({ cover_image: url }).eq("id", c.id);
      if (error) throw error;
      notify("Photo de couverture remplacée.");
      await reload();
    } catch (e) { notify(errText(e), true); }
  }

  return (
    <div className="card">
      <div className="prow">
        <div className="thumb">{c.cover_image ? <img src={c.cover_image} alt="" /> : "Pas de photo"}</div>
        <div style={{ minWidth: 0 }}>
          <div className="grid2">
            <label htmlFor={`cn-${c.id}`}>Nom<input id={`cn-${c.id}`} type="text" value={name} onChange={(e) => setName(e.target.value)} /></label>
            <label htmlFor={`cs-${c.id}`}>Ordre<input id={`cs-${c.id}`} type="number" value={sort} onChange={(e) => setSort(e.target.value)} /></label>
          </div>
          <label htmlFor={`cd-${c.id}`} style={{ marginTop: 10 }}>Description<textarea id={`cd-${c.id}`} value={description} onChange={(e) => setDescription(e.target.value)} /></label>
          <label htmlFor={`cq-${c.id}`} style={{ marginTop: 10 }}>Phrase mise en avant (facultatif)<input id={`cq-${c.id}`} type="text" value={quote} onChange={(e) => setQuote(e.target.value)} /></label>
          <label className="check" style={{ marginTop: 6 }}><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Visible sur le site</label>
          <label className="check"><input type="checkbox" checked={soon} onChange={(e) => setSoon(e.target.checked)} /> Coming soon (photos visibles, prix et commande cachés)</label>
          <p className="hint" style={{ margin: "4px 0 10px" }}>Adresse de la page : /collections/{c.slug}</p>
          <div className="row">
            <button className="btn small" type="button" disabled={saving} onClick={save}>{saving ? "Enregistrement..." : "Enregistrer"}</button>
            <span className="btn small ghost file">Photo de couverture<input type="file" accept="image/*" onChange={(e) => cover(e.target.files?.[0])} /></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CollectionsTab({ sb, collections, reload, notify }: Props) {
  const [name, setName] = useState("");

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const slug = slugify(name);
    if (!slug) { notify("Entre un nom.", true); return; }
    const sort = (collections.reduce((m, c) => Math.max(m, c.sort), 0) || 0) + 1;
    const { error } = await sb.from("collections").insert({ name: name.trim(), slug, description: "", sort, active: false });
    if (error) { notify(error.message.includes("duplicate") ? "Une collection avec ce nom existe déjà." : error.message, true); return; }
    notify("Collection créée, masquée pour l'instant. Complète-la puis coche « Visible sur le site ».");
    setName("");
    await reload();
  }

  return (
    <>
      <form className="card" onSubmit={add}>
        <h2>Nouvelle collection</h2>
        <div className="row">
          <label htmlFor="nc-name" style={{ flex: "1 1 220px" }}>Nom<input id="nc-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required /></label>
          <button className="btn small" type="submit" style={{ alignSelf: "end" }}>Créer</button>
        </div>
      </form>
      {collections.map((c) => <CollectionRow key={c.id + c.name + c.cover_image + String(c.active) + String(c.coming_soon)} sb={sb} c={c} reload={reload} notify={notify} />)}
    </>
  );
}
