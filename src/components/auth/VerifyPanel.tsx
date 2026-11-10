"use client";

import { sendEmailVerification } from "firebase/auth";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { authErrorMessage } from "@/lib/auth-errors";
import { useAuth } from "./AuthProvider";
import styles from "./forms.module.css";

const COOLDOWN_SECONDS = 60;

export function VerifyPanel() {
  const { firebaseUser, recheck, signOut } = useAuth();
  const [message, setMessage] = useState<{ kind: "ok" | "error" | "info"; text: string } | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [checking, setChecking] = useState(false);

  // Al volver a esta pestaña después de tocar el enlace del correo, se comprueba solo.
  useEffect(() => {
    const onFocus = () => void recheck();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [recheck]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function check() {
    setChecking(true);
    setMessage(null);
    await recheck();
    setChecking(false);
    setMessage({ kind: "info", text: "Todavía no vemos tu correo verificado. Tocá el enlace del mensaje y volvé a probar." });
  }

  async function resend() {
    if (!firebaseUser) return;
    try {
      await sendEmailVerification(firebaseUser);
      setCooldown(COOLDOWN_SECONDS);
      setMessage({ kind: "ok", text: "Listo, te enviamos el correo de nuevo." });
    } catch (err) {
      setMessage({ kind: "error", text: authErrorMessage(err) });
    }
  }

  return (
    <div className={styles.form}>
      <h1 className={styles.title}>Revisá tu correo</h1>
      <p className={styles.subtitle}>
        Te enviamos un enlace a <strong>{firebaseUser?.email}</strong>. Tocalo para confirmar tu cuenta. Si no lo ves, mirá la carpeta de spam.
      </p>
      {message && <Notice kind={message.kind}>{message.text}</Notice>}
      <div className={styles.actions}>
        <Button fullWidth onClick={() => void check()} loading={checking}>
          Ya verifiqué mi correo
        </Button>
        <Button fullWidth variant="light" onClick={() => void resend()} disabled={cooldown > 0}>
          {cooldown > 0 ? `Reenviar correo (${cooldown})` : "Reenviar correo"}
        </Button>
      </div>
      <div className={styles.links}>
        <button type="button" className={`${styles.link} ${styles.linkButton}`} onClick={() => void signOut()}>
          Usar otra cuenta
        </button>
      </div>
    </div>
  );
}
