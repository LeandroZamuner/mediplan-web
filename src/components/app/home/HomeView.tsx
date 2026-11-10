"use client";

import { IconAlertTriangle, IconBell, IconClock, IconPackage, IconPercentage } from "@tabler/icons-react";
import Link from "next/link";
import useSWR from "swr";
import { useMe } from "@/components/auth/AuthProvider";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatTime } from "@/lib/dates";
import { recordTaken, stockLevel, useTodayDoses, type TodayDose } from "@/lib/doses";
import { planPath } from "@/lib/routes";
import type { AppNotification, Plan } from "@/lib/types";
import { DoseRow } from "./DoseRow";
import styles from "./HomeView.module.css";

export function HomeView() {
  const me = useMe();
  const tz = me.timezone;
  const { data: plans } = useSWR<Plan[]>("/plans");
  const { data: supervised } = useSWR<Plan[]>("/plans/supervised");
  const { data: notifications } = useSWR<AppNotification[]>("/notifications");
  const { data: doses, mutate: refreshDoses } = useTodayDoses(plans, tz);

  const today = new Intl.DateTimeFormat("es-AR", { timeZone: tz, weekday: "long", day: "numeric", month: "long" }).format(new Date());
  const taken = doses?.filter((d) => d.status === "taken").length ?? 0;
  const missed = doses?.filter((d) => d.status === "missed").length ?? 0;
  const due = taken + missed;
  const rate = due > 0 ? Math.round((taken / due) * 100) : null;
  const next = doses?.find((d) => d.status === "pending");
  const unread = notifications?.filter((n) => !n.readAt).length ?? 0;

  const lowStock = (plans ?? [])
    .filter((p) => p.status === "active")
    .flatMap((p) => p.medications.map((m) => ({ plan: p, med: m, level: stockLevel(m.stockUnits, m.stockAlertAt) })))
    .filter((x) => x.level !== "ok");

  async function onTake(d: TodayDose) {
    await recordTaken(d.planId, d.medicationId, d.scheduledAt);
    await refreshDoses();
  }

  return (
    <>
      <PageHeader title="Hola 👋" subtitle={`Hoy es ${today}.`} />

      <div className={styles.summary}>
        <Card tone="lavender" className={styles.next}>
          <span className={styles.cardIcon}>
            <IconClock size={32} aria-hidden="true" />
          </span>
          <h2 className={styles.cardTitle}>Próxima toma</h2>
          {next ? (
            <>
              <p className={styles.big}>{formatTime(next.scheduledAt, tz)}</p>
              <p className={styles.cardText}>
                {next.medicationName} {next.dose}
              </p>
            </>
          ) : (
            <p className={styles.cardText}>{doses ? "No tenés más tomas pendientes para hoy." : "Cargando…"}</p>
          )}
        </Card>

        <Card>
          <span className={styles.cardIcon}>
            <IconPercentage size={32} aria-hidden="true" />
          </span>
          <h2 className={styles.cardTitle}>Cumplimiento de hoy</h2>
          <p className={styles.big}>{rate === null ? "—" : `${rate}%`}</p>
          <p className={styles.cardText}>{rate === null ? "Todavía no venció ninguna toma." : `${taken} de ${due} tomas registradas`}</p>
        </Card>

        <Card>
          <span className={styles.cardIcon}>
            <IconPackage size={32} aria-hidden="true" />
          </span>
          <h2 className={styles.cardTitle}>Stock</h2>
          <p className={lowStock.length === 0 ? styles.bigText : styles.big}>{lowStock.length === 0 ? "Todo bien" : lowStock.length}</p>
          <p className={styles.cardText}>{lowStock.length === 0 ? "Ningún medicamento con poco stock." : lowStock.length === 1 ? "medicamento con poco stock" : "medicamentos con poco stock"}</p>
        </Card>

        <Card>
          <span className={styles.cardIcon}>
            <IconBell size={32} aria-hidden="true" />
          </span>
          <h2 className={styles.cardTitle}>Alertas</h2>
          <p className={styles.big}>{unread}</p>
          <p className={styles.cardText}>
            {unread === 0 ? "No tenés alertas sin leer." : (
              <Link href="/notificaciones" className={styles.link}>
                Ver {unread === 1 ? "la alerta" : "las alertas"}
              </Link>
            )}
          </p>
        </Card>
      </div>

      <section aria-labelledby="hoy-titulo" className={styles.section}>
        <h2 id="hoy-titulo" className={styles.sectionTitle}>
          Tomas de hoy
        </h2>
        {!doses ? (
          <p className={styles.muted}>Cargando…</p>
        ) : doses.length === 0 ? (
          <Card>
            <p className={styles.muted}>
              {plans && plans.length === 0 ? (
                <>
                  Todavía no tenés ningún plan. <Link href="/planes/nuevo" className={styles.link}>Creá el primero</Link> para empezar a recibir recordatorios.
                </>
              ) : (
                "No tenés tomas programadas para hoy."
              )}
            </p>
          </Card>
        ) : (
          <ul className={styles.doses}>
            {doses.map((d) => (
              <DoseRow key={`${d.planId}-${d.medicationId}-${d.scheduledAt}`} dose={d} tz={tz} onTake={onTake} />
            ))}
          </ul>
        )}
      </section>

      {lowStock.length > 0 && (
        <section aria-labelledby="stock-titulo" className={styles.section}>
          <h2 id="stock-titulo" className={styles.sectionTitle}>
            Para reponer
          </h2>
          <ul className={styles.stockList}>
            {lowStock.map(({ plan, med, level }) => (
              <li key={med.id}>
                <Link href={planPath(plan.id)} className={styles.stockItem}>
                  <IconAlertTriangle size={26} aria-hidden="true" />
                  <span className={styles.stockText}>
                    <strong>{med.name}</strong> · {plan.name}
                  </span>
                  <Chip tone={level === "out" ? "danger" : "warn"}>{level === "out" ? "Se agotó" : `Quedan ${med.stockUnits}`}</Chip>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {supervised && supervised.length > 0 && (
        <section aria-labelledby="cuido-titulo" className={styles.section}>
          <h2 id="cuido-titulo" className={styles.sectionTitle}>
            Planes que cuidás
          </h2>
          <ul className={styles.stockList}>
            {supervised.map((p) => (
              <li key={p.id}>
                <Link href={planPath(p.id)} className={styles.stockItem}>
                  <span className={styles.stockText}>
                    <strong>{p.name}</strong> · {p.medications.length} {p.medications.length === 1 ? "medicamento" : "medicamentos"}
                  </span>
                  <Chip tone="primary">Cuidando</Chip>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
