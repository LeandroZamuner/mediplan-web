"use client";

import { IconMenu2, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SWRConfig } from "swr";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { Notice } from "@/components/ui/Notice";
import { api } from "@/lib/api";
import { Sidebar } from "./Sidebar";
import styles from "./AppShell.module.css";

/** Marco del panel: protege las pantallas (hace falta sesión) y muestra la barra lateral. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { status, error, recheck } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (status === "signedOut") router.replace("/iniciar-sesion");
    else if (status === "needsVerification") router.replace("/verificar-correo");
  }, [status, router]);

  // Con el menú abierto en pantallas chicas, Escape lo cierra.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  if (status === "error") {
    return (
      <div className={styles.center}>
        <Notice kind="error">No pudimos conectar con MediPlan. {error}</Notice>
        <Button onClick={() => void recheck()}>Reintentar</Button>
      </div>
    );
  }
  if (status !== "ready") {
    return (
      <div className={styles.center}>
        <p role="status">Cargando…</p>
      </div>
    );
  }

  return (
    <SWRConfig value={{ fetcher: (path: string) => api(path), revalidateOnFocus: true, shouldRetryOnError: false }}>
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <Link href="/inicio" aria-label="MediPlan, ir al inicio">
            <Logo variant="header" width={200} />
          </Link>
          <button type="button" className={styles.menuButton} onClick={() => setMenuOpen((o) => !o)} aria-expanded={menuOpen} aria-controls="menu-lateral" aria-label={menuOpen ? "Cerrar el menú" : "Abrir el menú"}>
            {menuOpen ? <IconX size={30} /> : <IconMenu2 size={30} />}
          </button>
        </header>

        {menuOpen && <div className={styles.overlay} onClick={() => setMenuOpen(false)} aria-hidden="true" />}
        <aside id="menu-lateral" className={`${styles.aside} ${menuOpen ? styles.asideOpen : ""}`}>
          <Sidebar onNavigate={() => setMenuOpen(false)} />
        </aside>

        <main id="contenido" className={styles.main}>
          {children}
        </main>
      </div>
    </SWRConfig>
  );
}
