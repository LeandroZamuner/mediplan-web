"use client";

import Image from "@/components/ui/Image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { Notice } from "@/components/ui/Notice";
import { getPendingInvite } from "@/lib/pending-invite";
import { useAuth } from "./AuthProvider";
import styles from "./AuthShell.module.css";
import { invitePath } from "@/lib/routes";

/**
 * Marco de las pantallas de acceso: panel con la foto y el eslogan de la landing + el formulario.
 * También decide a dónde mandar al usuario según el estado de su sesión.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  const { status, error, recheck } = useAuth();
  const router = useRouter();
  const path = usePathname();

  const goVerify = status === "needsVerification" && path !== "/verificar-correo";
  const goLogin = status === "signedOut" && path === "/verificar-correo";
  const goHome = status === "ready";

  useEffect(() => {
    if (goHome) {
      // Si venía de un enlace de invitación, lo llevamos de vuelta a aceptarla
      const pending = getPendingInvite();
      router.replace(pending ? invitePath(pending) : "/inicio");
    }
    else if (goVerify) router.replace("/verificar-correo");
    else if (goLogin) router.replace("/iniciar-sesion");
  }, [goHome, goVerify, goLogin, router]);

  const waiting = status === "loading" || goHome || goVerify || goLogin;

  return (
    <div className={styles.shell}>
      <aside className={styles.side} aria-hidden="true">
        <Image src="/images/hero.jpg" alt="" fill sizes="50vw" priority className={styles.sideImage} />
        <div className={styles.sideText}>
          <h2>Tu plan de medicación siempre bajo control</h2>
          <p>Organiza tus medicamentos, recibe recordatorios y mantené informados a tus seres queridos.</p>
        </div>
      </aside>
      <main className={styles.main} id="contenido">
        <Link href="/" className={styles.logo} aria-label="MediPlan, volver al inicio">
          <Logo variant="header" />
        </Link>
        <div className={styles.content}>
          {status === "error" ? (
            <div className={styles.errorBox}>
              <Notice kind="error">No pudimos conectar con MediPlan. {error}</Notice>
              <Button onClick={() => void recheck()}>Reintentar</Button>
            </div>
          ) : waiting ? (
            <p className={styles.loading} role="status">
              Cargando…
            </p>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  );
}
