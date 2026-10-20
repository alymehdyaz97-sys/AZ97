import type { PieceKey } from "./types";

export const SITE_NAME = "AZ#97";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://az97.com").replace(/\/$/, "");

export const PIECES: { key: PieceKey; name: string; plural: string }[] = [
  { key: "tee", name: "T-shirt", plural: "T-shirts" },
  { key: "ls", name: "Manches longues", plural: "Manches longues" },
  { key: "zip", name: "Pull zippé", plural: "Pulls zippés" },
];

export const COLORS = [
  { n: "01", fr: "Noir / Blanc", base: "#0e0c0d", ink: "#ffffff" },
  { n: "02", fr: "Blanc / Rose", base: "#ffffff", ink: "#ec2a98" },
  { n: "03", fr: "Blanc / Noir", base: "#ffffff", ink: "#0e0c0d" },
  { n: "04", fr: "Rose / Blanc", base: "#f4a7c4", ink: "#ffffff" },
];

export function pieceName(key: string) {
  return PIECES.find((p) => p.key === key)?.name ?? key;
}
