"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Spark } from "./Sparkle";

const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;
const STAR = "M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z";

type Particle = { x: number; y: number; vx: number; vy: number; s: number; r: number; vr: number; c: string; l: number; m: number };

export default function Intro() {
  const [phase, setPhase] = useState<"wait" | "opening" | "gone">("wait");
  const [stars, setStars] = useState<{ l: number; t: number; s: number; d: number; u: number }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const doc = () => document.documentElement;

  // L'intro ne se rejoue pas quand on revient sur l'accueil pendant la même visite.
  useIso(() => {
    let seen = false;
    try { seen = sessionStorage.getItem("az97-intro") === "1"; } catch {}
    if (seen) { setPhase("gone"); return; }
    doc().classList.add("locked", "intro-active");
    return () => { doc().classList.remove("locked", "intro-active"); };
  }, []);

  useEffect(() => {
    if (phase !== "wait") return;
    setStars(Array.from({ length: 9 }, () => ({ l: Math.random() * 92 + 2, t: Math.random() * 90 + 3, s: 14 + Math.random() * 26, d: Math.random() * 3.2, u: 2.6 + Math.random() * 2.4 })));
    btnRef.current?.focus({ preventScroll: true });
  }, [phase]);

  function burst() {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = (cv.width = innerWidth * dpr), H = (cv.height = innerHeight * dpr);
    const cx = W / 2, cy = H * 0.48;
    const cols = ["#ec2a98", "#ffffff", "#f6c3d6", "#ffffff", "#ec2a98", "#0e0c0d"];
    const star = new Path2D(STAR);
    const n = Math.round(Math.min(90, 40 + innerWidth / 18));
    const P: Particle[] = [];
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = (5 + Math.random() * 17) * dpr;
      P.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, s: (10 + Math.random() * 40) * dpr, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.25, c: cols[i % cols.length], l: 0, m: 80 + Math.random() * 60 });
    }
    const frame = () => {
      ctx.clearRect(0, 0, W, H);
      let alive = false;
      for (const p of P) {
        p.l++;
        if (p.l > p.m) continue;
        alive = true;
        p.x += p.vx; p.y += p.vy; p.vx *= 0.955; p.vy *= 0.955; p.vy += 0.06 * dpr; p.r += p.vr;
        const t = p.l / p.m, grow = t < 0.15 ? t / 0.15 : 1, fade = t > 0.6 ? 1 - (t - 0.6) / 0.4 : 1;
        ctx.save();
        ctx.globalAlpha = Math.max(0, fade);
        ctx.translate(p.x, p.y); ctx.rotate(p.r);
        const sc = (p.s * grow) / 24;
        ctx.scale(sc, sc); ctx.translate(-12, -12);
        ctx.fillStyle = p.c; ctx.fill(star);
        ctx.restore();
      }
      if (alive) requestAnimationFrame(frame); else ctx.clearRect(0, 0, W, H);
    };
    frame();
  }

  function enter() {
    if (phase !== "wait") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setPhase("opening");
    if (!reduce) burst();
    window.setTimeout(() => doc().classList.remove("intro-active"), reduce ? 0 : 550);
    window.setTimeout(() => {
      try { sessionStorage.setItem("az97-intro", "1"); } catch {}
      doc().classList.remove("locked");
      setPhase("gone");
      window.scrollTo(0, 0);
    }, reduce ? 150 : 2100);
  }

  if (phase === "gone") return null;

  return (
    <div id="intro" className={phase === "opening" ? "opening" : ""} role="dialog" aria-label="Bienvenue sur AZ#97" onClick={(e) => { if (e.target !== btnRef.current) enter(); }}>
      <div className="half top" />
      <div className="half bot" />
      <div className="ring" /><div className="ring r2" />
      {stars.map((s, i) => (
        <span key={i} className="twinkle" style={{ left: `${s.l}%`, top: `${s.t}%`, width: s.s, height: s.s, animationDelay: `${s.d}s`, animationDuration: `${s.u}s` }}>
          <Spark />
        </span>
      ))}
      <canvas id="burst" ref={canvasRef} />
      <div className="flash" />
      <div className="core">
        <img className="ilogo" src="/img/logo-white.png" alt="AZ#97" width={815} height={253} />
        <div className="isub">Love · No Signal · Lips · Graffiti · Mona Lisa</div>
        <button ref={btnRef} className="enter" type="button" onClick={enter}>Entrer</button>
      </div>
    </div>
  );
}
