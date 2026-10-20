import type { SupabaseClient } from "@supabase/supabase-js";

export const BUCKET = "product-images";

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Réduit la photo (1400 px max) pour que le site reste rapide, puis l'envoie dans Supabase.
export async function uploadImage(sb: SupabaseClient, file: File, folder: string): Promise<string> {
  let blob: Blob = file;
  try {
    const bmp = await createImageBitmap(file);
    const max = 1400;
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * k);
    canvas.height = Math.round(bmp.height * k);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#efe6dd";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
      const out = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.86));
      if (out) blob = out;
    }
  } catch {
    // Si la réduction échoue, on envoie le fichier tel quel.
  }
  const ext = blob === file ? (file.name.split(".").pop() || "jpg").toLowerCase() : "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await sb.storage.from(BUCKET).upload(path, blob, {
    contentType: blob === file ? file.type || "image/jpeg" : "image/jpeg",
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export function errText(e: unknown): string {
  if (e && typeof e === "object" && "message" in e) return String((e as { message: unknown }).message);
  return String(e);
}
