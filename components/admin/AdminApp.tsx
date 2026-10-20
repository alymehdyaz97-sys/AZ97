"use client";
import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase-browser";
import type { Collection, Product, Settings } from "@/lib/types";
import ProductsTab from "./ProductsTab";
import CollectionsTab from "./CollectionsTab";
import SettingsTab from "./SettingsTab";
import { errText } from "./helpers";

export type Notify = (text: string, error?: boolean) => void;
type Tab = "products" | "collections" | "settings";

export default function AdminApp() {
  const [sb, setSb] = useState<SupabaseClient | null>(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tab, setTab] = useState<Tab>("products");
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings>({ whatsapp: "", currency: "FCFA" });
  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);
  const [loginErr, setLoginErr] = useState("");
  const [busy, setBusy] = useState(false);

  const notify: Notify = useCallback((text, error = false) => {
    setMsg({ text, error });
    window.setTimeout(() => setMsg((m) => (m && m.text === text ? null : m)), error ? 7000 : 3500);
  }, []);

  const checkUser = useCallback(async (client: SupabaseClient) => {
    const { data } = await client.auth.getSession();
    const user = data.session?.user;
    if (!user) { setEmail(null); setIsAdmin(false); setReady(true); return; }
    setEmail(user.email ?? "");
    const { data: row } = await client.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
    setIsAdmin(!!row);
    setReady(true);
  }, []);

  const reload = useCallback(async (client?: SupabaseClient | null) => {
    const c = client ?? sb;
    if (!c) return;
    const [col, prod, set] = await Promise.all([
      c.from("collections").select("*").order("sort"),
      c.from("products").select("*").order("sort"),
      c.from("settings").select("key,value"),
    ]);
    if (col.error || prod.error) { notify(errText(col.error ?? prod.error), true); return; }
    setCollections((col.data ?? []) as Collection[]);
    setProducts((prod.data ?? []) as Product[]);
    const s: Settings = { whatsapp: "", currency: "FCFA" };
    for (const r of (set.data ?? []) as { key: string; value: string }[]) {
      if (r.key === "whatsapp") s.whatsapp = r.value;
      if (r.key === "currency" && r.value) s.currency = r.value;
    }
    setSettings(s);
  }, [sb, notify]);

  useEffect(() => {
    const client = supabaseBrowser();
    setSb(client);
    if (!client) { setReady(true); return; }
    checkUser(client);
    const { data: sub } = client.auth.onAuthStateChange(() => { checkUser(client); });
    return () => sub.subscription.unsubscribe();
  }, [checkUser]);

  useEffect(() => { if (sb && isAdmin) reload(sb); }, [sb, isAdmin, reload]);

  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!sb) return;
    const f = new FormData(e.currentTarget);
    setBusy(true); setLoginErr("");
    const { error } = await sb.auth.signInWithPassword({ email: String(f.get("email")), password: String(f.get("password")) });
    setBusy(false);
    if (error) setLoginErr("Email ou mot de passe incorrect.");
  }

  async function logout() {
    if (!sb) return;
    await sb.auth.signOut();
    setIsAdmin(false); setEmail(null);
  }

  if (!ready) return <div className="adm"><p className="hint">Chargement...</p></div>;

  if (!sb) {
    return (
      <div className="adm">
        <h1>Administration</h1>
        <p className="hint">Le site n&apos;est pas encore relié à Supabase. Ajoute NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans les variables du site, puis redéploie.</p>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="adm">
        <div className="login">
          <h1>AZ#97</h1>
          <p className="hint">Espace administrateur</p>
          <form onSubmit={login}>
            <label htmlFor="em">Email<input id="em" name="email" type="email" autoComplete="username" required /></label>
            <label htmlFor="pw">Mot de passe<input id="pw" name="password" type="password" autoComplete="current-password" required /></label>
            {loginErr ? <div className="msg err">{loginErr}</div> : null}
            <button className="btn" type="submit" disabled={busy}>{busy ? "Connexion..." : "Se connecter"}</button>
          </form>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="adm">
        <div className="login">
          <h1>Accès refusé</h1>
          <p className="hint">Le compte {email} n&apos;est pas administrateur de ce site. Demande à la personne qui gère le site de l&apos;ajouter.</p>
          <button className="btn" type="button" onClick={logout}>Se déconnecter</button>
        </div>
      </div>
    );
  }

  return (
    <div className="adm">
      <div className="topbar">
        <div>
          <h1>Administration AZ#97</h1>
          <p className="hint" style={{ margin: 0 }}>Connecté : {email}. Les changements apparaissent sur le site en moins d&apos;une minute.</p>
        </div>
        <div className="row">
          <a className="btn ghost small" href="/" target="_blank" rel="noopener noreferrer">Voir le site</a>
          <button className="btn small" type="button" onClick={logout}>Déconnexion</button>
        </div>
      </div>
      {msg ? <div className={`msg${msg.error ? " err" : ""}`} role="status">{msg.text}</div> : null}
      <div className="tabs" role="tablist">
        <button className="tab" role="tab" aria-selected={tab === "products"} onClick={() => setTab("products")}>Produits et prix</button>
        <button className="tab" role="tab" aria-selected={tab === "collections"} onClick={() => setTab("collections")}>Collections</button>
        <button className="tab" role="tab" aria-selected={tab === "settings"} onClick={() => setTab("settings")}>Réglages</button>
      </div>
      {tab === "products" ? <ProductsTab sb={sb} collections={collections} products={products} currency={settings.currency} reload={() => reload(sb)} notify={notify} /> : null}
      {tab === "collections" ? <CollectionsTab sb={sb} collections={collections} reload={() => reload(sb)} notify={notify} /> : null}
      {tab === "settings" ? <SettingsTab sb={sb} settings={settings} reload={() => reload(sb)} notify={notify} /> : null}
    </div>
  );
}
