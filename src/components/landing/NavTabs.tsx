"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./Header.module.css";

type Item = { id: string; label: string };

/** Qué pestaña se marca mientras se ve cada sección (el hero cuenta como "Nuestra Aplicación"). */
const SECTION_TO_TAB: Record<string, string> = {
  inicio: "aplicacion",
  aplicacion: "aplicacion",
  nosotros: "nosotros",
  testimonios: "testimonios",
  faq: "faq",
};

export function NavTabs({ items }: { items: readonly Item[] }) {
  const [active, setActive] = useState(items[0].id);

  useEffect(() => {
    const sections = Object.keys(SECTION_TO_TAB)
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    // La sección que cruza la franja del medio de la pantalla es la "actual".
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(SECTION_TO_TAB[entry.target.id]);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <nav aria-label="Principal" className={styles.tabs}>
      <ul className={styles.tabList}>
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`${styles.tab} ${active === item.id ? styles.tabActive : ""}`}
              aria-current={active === item.id ? "location" : undefined}
            >
              {item.label}
            </a>
          </li>
        ))}
        <li className={styles.loginItem}>
          <Link href="/iniciar-sesion" className={styles.login}>
            Iniciar sesión
          </Link>
        </li>
      </ul>
    </nav>
  );
}
