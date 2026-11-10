"use client";

import { IconFirstAidKit, IconHeartHandshake } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { useMe } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Notice } from "@/components/ui/Notice";
import { PageHeader } from "@/components/ui/PageHeader";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/dates";
import type { CaregiverLink, Plan } from "@/lib/types";
import { planPath } from "@/lib/routes";
import { PlanCaregivers } from "./PlanCaregivers";
import styles from "./CaregiversView.module.css";

export function CaregiversView() {
  const me = useMe();
  const { mutate: globalMutate } = useSWRConfig();
  const { data: plans } = useSWR<Plan[]>("/plans");
  const { data: supervised, mutate: refreshSupervised } = useSWR<Plan[]>("/plans/supervised");
  const { data: invitations, mutate: refreshInvitations } = useSWR<CaregiverLink[]>("/invitations");

  const [leaving, setLeaving] = useState<Plan | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function respond(invitation: CaregiverLink, action: "accept" | "reject") {
    setError(null);
    try {
      await api(`/invitations/${invitation.id}/${action}`, { method: "POST" });
      await Promise.all([refreshInvitations(), refreshSupervised(), globalMutate("/plans/supervised")]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos responder la invitación.");
    }
  }

  async function leave() {
    if (!leaving) return;
    setBusy(true);
    try {
      await api(`/plans/${leaving.id}/follow`, { method: "DELETE" });
      await refreshSupervised();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos dejar de seguir el plan.");
    } finally {
      setBusy(false);
      setLeaving(null);
    }
  }

  return (
    <>
      <PageHeader title="Cuidadores" subtitle="Quién cuida cada uno de tus planes y los planes que cuidás vos." />
      {error && (
        <div className={styles.block}>
          <Notice kind="error">{error}</Notice>
        </div>
      )}

      {invitations && invitations.length > 0 && (
        <section aria-labelledby="invitaciones" className={styles.block}>
          <h2 id="invitaciones" className={styles.sectionTitle}>
            Invitaciones que recibiste
          </h2>
          <ul className={styles.stack}>
            {invitations.map((inv) => (
              <li key={inv.id}>
                <Card tone="lavender" className={styles.invitation}>
                  <div>
                    <p className={styles.invTitle}>Te invitaron a cuidar un plan</p>
                    <p className={styles.invText}>Vence el {formatDate(inv.expiresAt.slice(0, 10))}. Si la aceptás, vas a poder ver el plan, registrar tomas y recibir sus avisos.</p>
                  </div>
                  <div className={styles.invActions}>
                    <Button onClick={() => void respond(inv, "accept")}>Aceptar</Button>
                    <Button variant="light" onClick={() => void respond(inv, "reject")}>
                      Rechazar
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="mis-planes" className={styles.block}>
        <h2 id="mis-planes" className={styles.sectionTitle}>
          Quién cuida mis planes
        </h2>
        {!plans ? (
          <p className={styles.muted}>Cargando…</p>
        ) : plans.length === 0 ? (
          <EmptyState
            icon={<IconFirstAidKit size={48} stroke={1.5} />}
            title="Primero creá un plan"
            text="Los cuidadores se invitan a un plan en particular. Cuando tengas uno, vas a poder invitar a un familiar desde acá."
            action={<Button href="/planes/nuevo">Crear mi primer plan</Button>}
          />
        ) : (
          <ul className={styles.stack}>
            {plans.map((plan) => (
              <li key={plan.id}>
                <Card>
                  <h3 className={styles.planName}>
                    <Link href={planPath(plan.id)} className={styles.planLink}>
                      {plan.name}
                    </Link>
                  </h3>
                  <PlanCaregivers plan={plan} />
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="cuido" className={styles.block}>
        <h2 id="cuido" className={styles.sectionTitle}>
          Planes que cuido
        </h2>
        {!supervised ? (
          <p className={styles.muted}>Cargando…</p>
        ) : supervised.length === 0 ? (
          <EmptyState icon={<IconHeartHandshake size={48} stroke={1.5} />} title="Todavía no cuidás ningún plan" text="Cuando alguien te invite a cuidar su tratamiento y aceptes, el plan aparece acá." />
        ) : (
          <ul className={styles.stack}>
            {supervised.map((plan) => (
              <li key={plan.id}>
                <Card className={styles.supervised}>
                  <div>
                    <h3 className={styles.planName}>
                      <Link href={planPath(plan.id)} className={styles.planLink}>
                        {plan.name}
                      </Link>
                    </h3>
                    <p className={styles.muted}>
                      {plan.medications.length} {plan.medications.length === 1 ? "medicamento" : "medicamentos"}
                    </p>
                  </div>
                  <div className={styles.invActions}>
                    <Chip tone="primary">Cuidando</Chip>
                    <Button variant="light" size="sm" onClick={() => setLeaving(plan)}>
                      Dejar de seguir
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className={styles.footnote}>
        Sesión iniciada como <strong>{me.email}</strong>. Para aceptar una invitación hace falta usar el mismo correo al que fue enviada.
      </p>

      <ConfirmDialog
        open={leaving !== null}
        title="¿Dejar de seguir este plan?"
        text={`Ya no vas a ver «${leaving?.name ?? ""}» ni a recibir sus avisos. Podés volver a cuidarlo si te invitan de nuevo.`}
        confirmLabel="Sí, dejar de seguir"
        busy={busy}
        onConfirm={() => void leave()}
        onCancel={() => setLeaving(null)}
      />
    </>
  );
}
