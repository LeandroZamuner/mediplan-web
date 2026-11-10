"use client";

import { IconCircleCheck, IconAlertTriangle } from "@tabler/icons-react";
import { applyActionCode, confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Logo } from "@/components/ui/Logo";
import { Notice } from "@/components/ui/Notice";
import { firebaseAuth } from "@/lib/firebase";
import styles from "./ActionHandler.module.css";
import forms from "./forms.module.css";

/**
 * Página a la que llegan los enlaces de los correos de Firebase (recuperar contraseña, verificar correo).
 * Reemplaza la pantalla genérica de Firebase por una con el diseño de MediPlan.
 * Se configura en la consola de Firebase: Authentication → Plantillas → "Personalizar URL de acción".
 */
type View =
  | { kind: "loading" }
  | { kind: "reset"; email: string }
  | { kind: "resetDone" }
  | { kind: "verified" }
  | { kind: "error"; title: string; text: string };

function codeOf(error: unknown): string {
  return typeof error === "object" && error && "code" in error ? String((error as { code: unknown }).code) : "";
}

function describeError(error: unknown): { title: string; text: string } {
  switch (codeOf(error)) {
    case "auth/expired-action-code":
      return { title: "El enlace venció", text: "Los enlaces duran poco tiempo. Pedí uno nuevo y usalo enseguida." };
    case "auth/invalid-action-code":
      return { title: "El enlace no es válido", text: "Puede que ya lo hayas usado o que esté incompleto. Pedí uno nuevo." };
    case "auth/user-disabled":
      return { title: "Cuenta deshabilitada", text: "Esta cuenta no puede usarse. Escribinos si creés que es un error." };
    case "auth/network-request-failed":
      return { title: "Sin conexión", text: "Revisá tu internet y volvé a abrir el enlace." };
    default:
      return { title: "No pudimos completar la acción", text: "Probá de nuevo en un momento. Si sigue pasando, pedí un enlace nuevo." };
  }
}

export function ActionHandler() {
  const params = useSearchParams();
  const mode = params.get("mode");
  const code = params.get("oobCode");
  const [loaded, setView] = useState<View>({ kind: "loading" });
  const started = useRef(false);
  // Los casos que se resuelven sin consultar a Firebase se calculan al renderizar (no dentro del efecto).
  const supported = mode === "resetPassword" || mode === "verifyEmail";
  const view: View =
    !mode || !code
      ? { kind: "error", title: "El enlace está incompleto", text: "Abrilo desde el correo que te enviamos, tocando el enlace completo." }
      : !supported
        ? { kind: "error", title: "Acción no disponible", text: "Este tipo de enlace todavía no se puede abrir desde acá." }
        : loaded;

  // El enlace se usa UNA sola vez: en desarrollo React ejecuta los efectos dos veces y la segunda lo daría por inválido.
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const auth = firebaseAuth();

    if (!mode || !code || !supported) return;
    if (mode === "resetPassword") {
      verifyPasswordResetCode(auth, code)
        .then((email) => setView({ kind: "reset", email }))
        .catch((err) => setView({ kind: "error", ...describeError(err) }));
    } else if (mode === "verifyEmail") {
      applyActionCode(auth, code)
        .then(() => setView({ kind: "verified" }))
        .catch((err) => setView({ kind: "error", ...describeError(err) }));
    }
  }, [mode, code, supported]);

  return (
    <main className={styles.page} id="contenido">
      <Link href="/" aria-label="MediPlan, ir al inicio">
        <Logo variant="header" width="min(260px, 70vw)" />
      </Link>
      <div className={styles.card}>
        {view.kind === "loading" && (
          <p role="status" className={styles.loading}>
            Un momento…
          </p>
        )}

        {view.kind === "reset" && <ResetForm email={view.email} code={code!} onDone={() => setView({ kind: "resetDone" })} />}

        {view.kind === "resetDone" && (
          <Result tone="ok" title="Contraseña actualizada" text="Ya podés iniciar sesión con tu contraseña nueva.">
            <Button href="/iniciar-sesion" fullWidth>
              Iniciar sesión
            </Button>
          </Result>
        )}

        {view.kind === "verified" && (
          <Result tone="ok" title="¡Correo verificado!" text="Tu cuenta está confirmada. Ya podés entrar a MediPlan.">
            <Button href="/iniciar-sesion" fullWidth>
              Continuar
            </Button>
          </Result>
        )}

        {view.kind === "error" && (
          <Result tone="error" title={view.title} text={view.text}>
            {mode === "resetPassword" ? (
              <Button href="/recuperar" fullWidth>
                Pedir un enlace nuevo
              </Button>
            ) : (
              <Button href="/iniciar-sesion" fullWidth>
                Ir a iniciar sesión
              </Button>
            )}
          </Result>
        )}
      </div>
    </main>
  );
}

function Result({ tone, title, text, children }: { tone: "ok" | "error"; title: string; text: string; children: React.ReactNode }) {
  return (
    <div className={styles.result}>
      <span className={`${styles.icon} ${tone === "ok" ? styles.iconOk : styles.iconError}`} aria-hidden="true">
        {tone === "ok" ? <IconCircleCheck size={44} stroke={1.5} /> : <IconAlertTriangle size={44} stroke={1.5} />}
      </span>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.text}>{text}</p>
      <div className={styles.actions}>{children}</div>
    </div>
  );
}

function ResetForm({ email, code, onDone }: { email: string; code: string; onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const passwordError = password && password.length < 8 ? "Usá al menos 8 caracteres." : null;
  const repeatError = repeat && repeat !== password ? "Las contraseñas no coinciden." : null;
  const valid = password.length >= 8 && repeat === password;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    setError(null);
    try {
      await confirmPasswordReset(firebaseAuth(), code, password);
      onDone();
    } catch (err) {
      const code = codeOf(err);
      setError(code === "auth/weak-password" ? "La contraseña es muy débil. Probá con una más larga." : describeError(err).text);
      setBusy(false);
    }
  }

  return (
    <form className={forms.form} onSubmit={submit} noValidate>
      <h1 className={forms.title}>Nueva contraseña</h1>
      <p className={forms.subtitle}>
        Elegí una contraseña nueva para <strong>{email}</strong>.
      </p>
      {error && <Notice kind="error">{error}</Notice>}
      <Field label="Contraseña nueva" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} hint="Mínimo 8 caracteres." error={passwordError} />
      <Field label="Repetí la contraseña" type="password" autoComplete="new-password" required value={repeat} onChange={(e) => setRepeat(e.target.value)} error={repeatError} />
      <div className={forms.actions}>
        <Button type="submit" fullWidth loading={busy} disabled={!valid}>
          Guardar contraseña
        </Button>
      </div>
    </form>
  );
}
