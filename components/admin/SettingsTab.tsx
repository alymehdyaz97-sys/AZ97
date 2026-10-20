"use client";
import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Settings } from "@/lib/types";
import type { Notify } from "./AdminApp";

export default function SettingsTab({ sb, settings, reload, notify }: { sb: SupabaseClient; settings: Settings; reload: () => Promise<void>; notify: Notify }) {
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp);
  const [currency, setCurrency] = useState(settings.currency);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const digits = whatsapp.replace(/\D/g, "");
    const { error } = await sb.from("settings").upsert([
      { key: "whatsapp", value: digits },
      { key: "currency", value: currency.trim() || "FCFA" },
    ]);
    if (error) { notify(error.message, true); return; }
    setWhatsapp(digits);
    notify("Réglages enregistrés.");
    await reload();
  }

  return (
    <form className="card" onSubmit={save}>
      <h2>Réglages du site</h2>
      <div className="grid2">
        <label htmlFor="s-wa">Numéro WhatsApp des commandes
          <input id="s-wa" type="text" inputMode="tel" placeholder="2250700000000" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
        </label>
        <label htmlFor="s-cur">Monnaie affichée
          <input id="s-cur" type="text" value={currency} onChange={(e) => setCurrency(e.target.value)} maxLength={8} />
        </label>
      </div>
      <p className="hint" style={{ marginTop: 10 }}>Numéro au format international, sans le + ni espaces. Exemple pour la Côte d&apos;Ivoire : 225 puis le numéro.</p>
      <button className="btn small" type="submit">Enregistrer</button>
    </form>
  );
}
