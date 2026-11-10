"use client";

import {
  IconBell,
  IconFirstAidKit,
  IconHeartHandshake,
  IconHome2,
  IconLogout,
  IconReportAnalytics,
  IconUser,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import { useAuth } from "@/components/auth/AuthProvider";
import { Logo } from "@/components/ui/Logo";
import type { AppNotification } from "@/lib/types";
import styles from "./Sidebar.module.css";

const items = [
  { href: "/inicio", label: "Inicio", Icon: IconHome2 },
  { href: "/planes", label: "Mis planes", Icon: IconFirstAidKit },
  { href: "/cuidadores", label: "Cuidadores", Icon: IconHeartHandshake },
  { href: "/historial", label: "Historial", Icon: IconReportAnalytics },
  { href: "/notificaciones", label: "Notificaciones", Icon: IconBell },
  { href: "/perfil", label: "Perfil", Icon: IconUser },
] as const;

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { me, signOut } = useAuth();
  const { data: notifications } = useSWR<AppNotification[]>("/notifications", { refreshInterval: 30_000 });
  const unread = notifications?.filter((n) => !n.readAt).length ?? 0;

  return (
    <div className={styles.sidebar}>
      <Link href="/inicio" className={styles.logo} onClick={onNavigate} aria-label="MediPlan, ir al inicio">
        <Logo variant="header" width="calc(236 * var(--k))" />
      </Link>

      <nav aria-label="Secciones" className={styles.nav}>
        <ul className={styles.list}>
          {items.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link href={href} onClick={onNavigate} className={`${styles.item} ${active ? styles.active : ""}`} aria-current={active ? "page" : undefined}>
                  <Icon size={28} stroke={1.75} aria-hidden="true" />
                  <span className={styles.label}>{label}</span>
                  {href === "/notificaciones" && unread > 0 && (
                    <span className={styles.badge} aria-label={`${unread} sin leer`}>
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.user}>
        <p className={styles.email} title={me?.email}>
          {me?.email}
        </p>
        <button type="button" className={styles.logout} onClick={() => void signOut()}>
          <IconLogout size={22} stroke={1.75} aria-hidden="true" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
