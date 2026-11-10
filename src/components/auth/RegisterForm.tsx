"use client";

import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";
import { authErrorMessage } from "@/lib/auth-errors";
import { firebaseAuth } from "@/lib/firebase";
import { ROLE_KEY } from "./AuthProvider";
import styles from "./forms.module.css";

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [role, setRole] = useState<"patient" | "caregiver">("patient");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const passwordError = password && password.length < 8 ? "Usá al menos 8 caracteres." : null;
  const repeatError = repeat && repeat !== password ? "Las contraseñas no coinciden." : null;
  const valid = email.includes("@") && password.length >= 8 && repeat === password;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    setError(null);
    try {
      try {
        localStorage.setItem(ROLE_KEY, role);
      } catch {
        /* sin almacenamiento: se registra como paciente */
      }
      const cred = await createUserWithEmailAndPassword(firebaseAuth(), email.trim(), password);
      await sendEmailVerification(cred.user);
      // AuthShell nos lleva a "Revisá tu correo" al detectar el correo sin verificar
    } catch (err) {
      setError(authErrorMessage(err));
      setBusy(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <h1 className={styles.title}>Crear cuenta</h1>
      <p className={styles.subtitle}>Te enviamos un correo para confirmar que es tuyo.</p>
      {error && <Notice kind="error">{error}</Notice>}
      <fieldset className={styles.choices}>
        <legend>¿Cómo vas a usar MediPlan?</legend>
        <label className={styles.choice}>
          <input type="radio" name="role" value="patient" checked={role === "patient"} onChange={() => setRole("patient")} />
          <span className={styles.choiceTitle}>Para mi tratamiento</span>
          <span className={styles.choiceText}>Soy paciente</span>
        </label>
        <label className={styles.choice}>
          <input type="radio" name="role" value="caregiver" checked={role === "caregiver"} onChange={() => setRole("caregiver")} />
          <span className={styles.choiceTitle}>Para cuidar a alguien</span>
          <span className={styles.choiceText}>Soy familiar o cuidador</span>
        </label>
      </fieldset>
      <Field label="Correo electrónico" type="email" autoComplete="email" inputMode="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <Field label="Contraseña" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} hint="Mínimo 8 caracteres." error={passwordError} />
      <Field label="Repetí la contraseña" type="password" autoComplete="new-password" required value={repeat} onChange={(e) => setRepeat(e.target.value)} error={repeatError} />
      <div className={styles.actions}>
        <Button type="submit" fullWidth loading={busy} disabled={!valid}>
          Crear cuenta
        </Button>
      </div>
      <div className={styles.links}>
        <span>¿Ya tenés cuenta?</span>
        <Link href="/iniciar-sesion" className={styles.link}>
          Iniciar sesión
        </Link>
      </div>
    </form>
  );
}
