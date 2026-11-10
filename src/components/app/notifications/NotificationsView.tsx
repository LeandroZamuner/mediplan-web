"use client";

import { IconAlertTriangle, IconBell, IconPackage } from "@tabler/icons-react";
import Link from "next/link";
import useSWR from "swr";
import { useMe } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/dates";
import type { AppNotification } from "@/lib/types";
import { planPath } from "@/lib/routes";
import styles from "./NotificationsView.module.css";

function iconFor(kind: string) {
  if (kind === "low_stock") return <IconPackage size={28} aria-hidden="true" />;
  return <IconAlertTriangle size={28} aria-hidden="true" />;
}

export function NotificationsView() {
  const me = useMe();
  const { data, error, mutate } = useSWR<AppNotification[]>("/notifications", { refreshInterval: 30_000 });
  const unread = data?.filter((n) => !n.readAt) ?? [];

  async function markRead(n: AppNotification) {
    if (n.readAt) return;
    await api(`/notifications/${n.id}/read`, { method: "POST" });
    await mutate();
  }

  async function markAll() {
    await Promise.all(unread.map((n) => api(`/notifications/${n.id}/read`, { method: "POST" })));
    await mutate();
  }

  return (
    <>
      <PageHeader
        title="Notificaciones"
        subtitle="Avisos de tomas sin registrar y de stock bajo."
        actions={
          unread.length > 0 ? (
            <Button variant="light" onClick={() => void markAll()}>
              Marcar todas como leídas
            </Button>
          ) : undefined
        }
      />

      {error ? (
        <p role="alert">No pudimos cargar tus notificaciones. Probá de nuevo en un momento.</p>
      ) : !data ? (
        <p className={styles.muted}>Cargando…</p>
      ) : data.length === 0 ? (
        <EmptyState icon={<IconBell size={48} stroke={1.5} />} title="No tenés notificaciones" text="Cuando una toma quede sin registrar o un medicamento tenga poco stock, te lo avisamos acá." />
      ) : (
        <ul className={styles.list}>
          {data.map((n) => {
            const content = (
              <>
                <span className={styles.icon}>{iconFor(n.kind)}</span>
                <span className={styles.text}>
                  <span className={styles.title}>{n.title}</span>
                  <span className={styles.body}>{n.body}</span>
                  <span className={styles.time}>{formatDateTime(n.createdAt, me.timezone)}</span>
                </span>
                {!n.readAt && <Chip tone="primary">Nueva</Chip>}
              </>
            );
            const className = `${styles.item} ${n.readAt ? "" : styles.unread}`;
            return (
              <li key={n.id}>
                {n.data?.planId ? (
                  <Link href={planPath(n.data.planId)} className={className} onClick={() => void markRead(n)}>
                    {content}
                  </Link>
                ) : (
                  <button type="button" className={className} onClick={() => void markRead(n)}>
                    {content}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
