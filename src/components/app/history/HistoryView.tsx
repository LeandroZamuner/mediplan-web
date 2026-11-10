"use client";

import { IconReportAnalytics } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { useMe } from "@/components/auth/AuthProvider";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatTime } from "@/lib/dates";
import type { DoseStatus, Occurrence, Plan, Stats } from "@/lib/types";
import styles from "./HistoryView.module.css";

const RANGES = [
  { days: 7, label: "Últimos 7 días" },
  { days: 30, label: "Últimos 30 días" },
  { days: 90, label: "Últimos 90 días" },
] as const;

const STATUS: Record<DoseStatus, { label: string; tone: "ok" | "primary" | "warn" }> = {
  taken: { label: "Tomada", tone: "ok" },
  pending: { label: "Pendiente", tone: "primary" },
  missed: { label: "Omitida", tone: "warn" },
};

export function HistoryView() {
  const me = useMe();
  const tz = me.timezone;
  const { data: mine } = useSWR<Plan[]>("/plans");
  const { data: supervised } = useSWR<Plan[]>("/plans/supervised");
  const all = useMemo(() => [...(mine ?? []), ...(supervised ?? [])], [mine, supervised]);

  const [chosen, setChosen] = useState<string>("");
  const [days, setDays] = useState<number>(30);
  const planId = chosen || all[0]?.id || "";

  // Se fija "ahora" al abrir la pantalla para que las consultas sean estables (y se pueda cachear).
  const [now] = useState(() => new Date());
  const range = useMemo(() => {
    const to = new Date(Math.ceil(now.getTime() / 60_000) * 60_000);
    const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000 + 60_000);
    return `from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`;
  }, [now, days]);

  const { data: stats } = useSWR<Stats>(planId ? `/plans/${planId}/stats?${range}` : null);
  const { data: doses } = useSWR<Occurrence[]>(planId ? `/plans/${planId}/doses?${range}` : null);

  const byDay = useMemo(() => {
    const groups = new Map<string, Occurrence[]>();
    for (const o of [...(doses ?? [])].reverse()) {
      const key = new Intl.DateTimeFormat("es-AR", { timeZone: tz, weekday: "long", day: "numeric", month: "long" }).format(new Date(o.scheduledAt));
      groups.set(key, [...(groups.get(key) ?? []), o]);
    }
    return [...groups.entries()];
  }, [doses, tz]);

  if (mine && supervised && all.length === 0) {
    return (
      <>
        <PageHeader title="Historial" subtitle="Tus tomas realizadas y omitidas, y tu cumplimiento." />
        <EmptyState icon={<IconReportAnalytics size={48} stroke={1.5} />} title="Todavía no hay historial" text="Cuando tengas un plan y empieces a registrar tomas, vas a ver acá tu cumplimiento." />
      </>
    );
  }

  const rate = stats?.adherenceRate;

  return (
    <>
      <PageHeader title="Historial" subtitle="Tus tomas realizadas y omitidas, y tu cumplimiento." />

      <div className={styles.filters}>
        <label className={styles.filter}>
          <span>Plan</span>
          <select value={planId} onChange={(e) => setChosen(e.target.value)} className={styles.select}>
            {(mine ?? []).length > 0 && (
              <optgroup label="Mis planes">
                {mine!.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
            )}
            {(supervised ?? []).length > 0 && (
              <optgroup label="Planes que cuido">
                {supervised!.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </label>
        <label className={styles.filter}>
          <span>Período</span>
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} className={styles.select}>
            {RANGES.map((r) => (
              <option key={r.days} value={r.days}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={styles.stats}>
        <Card tone="lavender">
          <h2 className={styles.statTitle}>Cumplimiento</h2>
          <p className={styles.big}>{!stats ? "…" : rate === null || rate === undefined ? "—" : `${Math.round(rate * 100)}%`}</p>
          <p className={styles.statText}>{stats && (rate === null || rate === undefined) ? "Todavía no venció ninguna toma en este período." : "tomadas sobre las que ya vencieron"}</p>
        </Card>
        <Card>
          <h2 className={styles.statTitle}>Tomadas</h2>
          <p className={styles.big}>{stats?.taken ?? "…"}</p>
        </Card>
        <Card>
          <h2 className={styles.statTitle}>Omitidas</h2>
          <p className={styles.big}>{stats?.missed ?? "…"}</p>
        </Card>
        <Card>
          <h2 className={styles.statTitle}>Pendientes</h2>
          <p className={styles.big}>{stats?.pending ?? "…"}</p>
        </Card>
      </div>

      <section aria-labelledby="detalle" className={styles.detail}>
        <h2 id="detalle" className={styles.sectionTitle}>
          Detalle por día
        </h2>
        {!doses ? (
          <p className={styles.muted}>Cargando…</p>
        ) : byDay.length === 0 ? (
          <Card>
            <p className={styles.muted}>No hay tomas en este período.</p>
          </Card>
        ) : (
          <div className={styles.days}>
            {byDay.map(([day, items]) => (
              <Card key={day} className={styles.day}>
                <h3 className={styles.dayTitle}>{day}</h3>
                <ul className={styles.rows}>
                  {items.map((o) => (
                    <li key={`${o.medicationId}-${o.scheduledAt}`} className={styles.row}>
                      <span className={styles.time}>{formatTime(o.scheduledAt, tz)}</span>
                      <span className={styles.med}>{o.medicationName}</span>
                      <Chip tone={STATUS[o.status].tone}>{STATUS[o.status].label}</Chip>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
