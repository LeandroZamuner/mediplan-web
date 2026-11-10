"use client";

import { IconFirstAidKit, IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import useSWR from "swr";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { stockLevel } from "@/lib/doses";
import { planPath } from "@/lib/routes";
import { PLAN_STATUS, medicationsLabel } from "@/lib/plans";
import type { Plan } from "@/lib/types";
import styles from "./PlansView.module.css";

export function PlansView() {
  const { data: plans, error } = useSWR<Plan[]>("/plans");

  return (
    <>
      <PageHeader
        title="Mis planes"
        subtitle="Tus tratamientos y los medicamentos de cada uno."
        actions={
          plans && plans.length > 0 ? (
            <Button href="/planes/nuevo" icon="arrow-right" iconPosition="right">
              Nuevo plan
            </Button>
          ) : undefined
        }
      />

      {error ? (
        <p role="alert">No pudimos cargar tus planes. Probá de nuevo en un momento.</p>
      ) : !plans ? (
        <p className={styles.muted}>Cargando…</p>
      ) : plans.length === 0 ? (
        <EmptyState
          icon={<IconFirstAidKit size={48} stroke={1.5} />}
          title="Todavía no tenés ningún plan"
          text="Un plan reúne los medicamentos de un tratamiento, con sus horarios. Creá el primero y te avisamos a la hora de cada toma."
          action={
            <Button href="/planes/nuevo" icon="arrow-right" iconPosition="right">
              Crear mi primer plan
            </Button>
          }
        />
      ) : (
        <ul className={styles.grid}>
          {plans.map((plan) => {
            const low = plan.medications.filter((m) => stockLevel(m.stockUnits, m.stockAlertAt) !== "ok").length;
            const status = PLAN_STATUS[plan.status];
            return (
              <li key={plan.id}>
                <Link href={planPath(plan.id)} className={styles.link}>
                  <Card as="div" className={styles.card}>
                    <div className={styles.top}>
                      <h2 className={styles.name}>{plan.name}</h2>
                      <Chip tone={status.tone}>{status.label}</Chip>
                    </div>
                    <p className={styles.meds}>{medicationsLabel(plan)}</p>
                    <div className={styles.foot}>
                      <span>
                        {plan.medications.length} {plan.medications.length === 1 ? "medicamento" : "medicamentos"}
                      </span>
                      {low > 0 && <Chip tone="warn">{low === 1 ? "1 con poco stock" : `${low} con poco stock`}</Chip>}
                    </div>
                  </Card>
                </Link>
              </li>
            );
          })}
          <li>
            <Link href="/planes/nuevo" className={`${styles.link} ${styles.newLink}`}>
              <IconPlus size={36} aria-hidden="true" />
              <span>Crear otro plan</span>
            </Link>
          </li>
        </ul>
      )}
    </>
  );
}
