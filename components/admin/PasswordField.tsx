"use client";
import { useState } from "react";

export default function PasswordField({ id, name, label, autoComplete, minLength, value, onChange }: {
  id: string; name: string; label: string; autoComplete: string; minLength?: number;
  value?: string; onChange?: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <label htmlFor={id}>
      {label}
      <span className="pwwrap">
        <input
          id={id} name={name} type={show ? "text" : "password"} autoComplete={autoComplete}
          minLength={minLength} required autoCapitalize="none" autoCorrect="off" spellCheck={false}
          {...(onChange ? { value: value ?? "", onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value) } : {})}
        />
        <button type="button" className="eye" onClick={() => setShow((s) => !s)} aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"} aria-pressed={show}>
          {show ? (
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 6.1A10.7 10.7 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-3.3 3.9M6.6 7.6C4 9.3 2.5 12 2.5 12S6 18 12 18c1.4 0 2.7-.3 3.8-.8"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>
          ) : (
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6S2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/></svg>
          )}
        </button>
      </span>
    </label>
  );
}
