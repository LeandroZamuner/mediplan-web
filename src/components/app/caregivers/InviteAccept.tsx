"use client";

import { IconHeartHandshake } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/ui/Logo";
import { Notice } from "@/components/ui/Notice";
import { api, ApiError } from "@/lib/api";
import { clearPendingInvite, setPendingInvite } from "@/lib/pending-invite";
import type { CaregiverLink } from "@/lib/types";
import styles from "./InviteAccept.module.css";
import { planPath } from "@/lib/routes";

type Preview = { planName: string; expiresAt: string };
type PreviewState = { kind: "loading" } | { kind: "ok"; data: Preview } | { kind: "gone" } | { kind: "expired" } | { kind: "error" };

/** Página a la que llega quien recibe el enlace de invitación a cuidar un plan. */
export function InviteAccept({ token }: { token: string }) {
  const { status, me, signOut } = useAuth();
  const router = useRouter();
  const [preview, setPreview] = useState<PreviewState>({ kind: "loading" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Vista previa pública: solo el nombre del plan, sin necesidad de sesión.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api<Preview>(`/invitations/preview?token=${encodeURIComponent(token)}`);
        if (!cancelled) setPreview({ kind: "ok", data });
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) setPreview({ kind: "gone" });
        else if (err instanceof ApiError && err.status === 410) setPreview({ kind: "expired" });
        else setPreview({ kind: "error" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  // Sin sesión: guardamos el código para volver acá después de entrar.
  useEffect(() => {
    if (status === "signedOut" && preview.kind === "ok") setPendingInvite(token);
  }, [status, preview.kind, token]);

  async function accept() {
    setBusy(true);
    setError(null);
    try {
      const link = await api<CaregiverLink>("/invitations/accept", { method: "POST", json: { token } });
      clearPendingInvite();
      router.push(planPath(link.planId));
    } catch (err) {
      setBusy(false);
      if (err instanceof ApiError && err.status === 403) {
        setError(`Esta invitación es para otro correo. Estás usando ${me?.email ?? "otra cuenta"}: cerrá sesión y entrá con el correo al que te la enviaron.`);
      } else if (err instanceof ApiError && err.status === 404) {
        setError("Este enlace ya se usó o no es válido.");
      } else if (err instanceof ApiError && err.status === 410) {
        setError("Esta invitación venció. Pedile a quien te invitó que te mande una nueva.");
      } else {
        setError(err instanceof Error ? err.message : "No pudimos aceptar la invitación.");
      }
    }
  }

  return (
    <main className={styles.page} id="contenido">
      <Link href="/" aria-label="MediPlan, ir al inicio">
        <Logo variant="header" width={220} />
      </Link>

      <Card tone="lavender" className={styles.card}>
        <span className={styles.icon} aria-hidden="true">
          <IconHeartHandshake size={44} stroke={1.5} />
        </span>

        {preview.kind === "loading" && <p role="status">Cargando…</p>}

        {(preview.kind === "gone" || preview.kind === "expired" || preview.kind === "error") && (
          <>
            <h1 className={styles.title}>{preview.kind === "expired" ? "Esta invitación venció" : preview.kind === "gone" ? "Este enlace no es válido" : "No pudimos abrir la invitación"}</h1>
            <p className={styles.text}>{preview.kind === "expired" ? "Pedile a quien te invitó que te mande una nueva." : preview.kind === "gone" ? "Puede que ya se haya usado o que la persona la haya cancelado." : "Probá de nuevo en un momento."}</p>
            <Button href="/" variant="light">
              Ir al inicio
            </Button>
          </>
        )}

        {preview.kind === "ok" && (
          <>
            <h1 className={styles.title}>Te invitaron a cuidar un plan</h1>
            <p className={styles.plan}>«{preview.data.planName}»</p>
            <p className={styles.text}>Si aceptás, vas a poder ver el plan, registrar tomas y recibir sus avisos.</p>

            {status === "loading" && <p role="status">Verificando tu sesión…</p>}

            {status === "signedOut" && (
              <div className={styles.actions}>
                <Notice>Para aceptar, iniciá sesión (o creá tu cuenta) con el correo al que te llegó la invitación.</Notice>
                <Button href="/iniciar-sesion" fullWidth>
                  Iniciar sesión
                </Button>
                <Button href="/registro" variant="light" fullWidth>
                  Crear cuenta
                </Button>
              </div>
            )}

            {status === "needsVerification" && (
              <div className={styles.actions}>
                <Notice>Primero tenés que confirmar tu correo electrónico.</Notice>
                <Button href="/verificar-correo" fullWidth>
                  Confirmar mi correo
                </Button>
              </div>
            )}

            {status === "ready" && (
              <div className={styles.actions}>
                <p className={styles.as}>
                  Vas a aceptar como <strong>{me?.email}</strong>
                </p>
                {error && <Notice kind="error">{error}</Notice>}
                <Button onClick={() => void accept()} loading={busy} fullWidth>
                  Aceptar invitación
                </Button>
                <Button variant="light" onClick={() => void signOut()} fullWidth>
                  Usar otra cuenta
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </main>
  );
}
