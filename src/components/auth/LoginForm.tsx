"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";
import { authErrorMessage } from "@/lib/auth-errors";
import { firebaseAuth } from "@/lib/firebase";
import styles from "./forms.module.css";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(firebaseAuth(), email.trim(), password);
      // el resto lo resuelve AuthShell según el estado de la sesión
    } catch (err) {
      setError(authErrorMessage(err));
      setBusy(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <h1 className={styles.title}>Iniciar sesión</h1>
      <p className={styles.subtitle}>Entrá para ver tu plan de medicación.</p>
      {error && <Notice kind="error">{error}</Notice>}
      <Field label="Correo electrónico" type="email" autoComplete="email" inputMode="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <Field label="Contraseña" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      <div className={styles.actions}>
        <Button type="submit" fullWidth loading={busy} disabled={!email || !password}>
          Entrar
        </Button>
      </div>
      <div className={styles.links}>
        <Link href="/recuperar" className={styles.link}>
          Olvidé mi contraseña
        </Link>
        <Link href="/registro" className={styles.link}>
          Crear una cuenta
        </Link>
      </div>
    </form>
  );
}
