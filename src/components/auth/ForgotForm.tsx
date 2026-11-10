"use client";

import { sendPasswordResetEmail } from "firebase/auth";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";
import { authErrorMessage } from "@/lib/auth-errors";
import { firebaseAuth } from "@/lib/firebase";
import styles from "./forms.module.css";

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await sendPasswordResetEmail(firebaseAuth(), email.trim());
      setSent(true);
    } catch (err) {
      // Si el correo no existe no lo decimos (no revelamos quién tiene cuenta): mismo mensaje de éxito.
      const code = (err as { code?: string }).code;
      if (code === "auth/user-not-found") setSent(true);
      else setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <h1 className={styles.title}>Recuperar contraseña</h1>
      <p className={styles.subtitle}>Ingresá tu correo y te enviamos un enlace para elegir una contraseña nueva.</p>
      {error && <Notice kind="error">{error}</Notice>}
      {sent ? (
        <Notice kind="ok">Si hay una cuenta con ese correo, te enviamos un enlace. Revisá tu bandeja de entrada y la carpeta de spam.</Notice>
      ) : (
        <>
          <Field label="Correo electrónico" type="email" autoComplete="email" inputMode="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <div className={styles.actions}>
            <Button type="submit" fullWidth loading={busy} disabled={!email.includes("@")}>
              Enviar enlace
            </Button>
          </div>
        </>
      )}
      <div className={styles.links}>
        <Link href="/iniciar-sesion" className={styles.link}>
          ← Volver a iniciar sesión
        </Link>
      </div>
    </form>
  );
}
