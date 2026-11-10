import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import styles from "./StubPage.module.css";

/** Página provisoria para rutas que el diseño enlaza pero todavía no están construidas. */
export function StubPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className={styles.page}>
      <Link href="/" aria-label="MediPlan, volver al inicio">
        <Logo variant="header" />
      </Link>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.text}>{children}</p>
      <Link href="/" className={styles.back}>
        ← Volver al inicio
      </Link>
    </main>
  );
}
