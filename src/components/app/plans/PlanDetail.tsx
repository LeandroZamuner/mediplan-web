"use client";

import { IconArrowLeft, IconPlus, IconTrash } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { DoseRow } from "@/components/app/home/DoseRow";
import { useMe } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { Notice } from "@/components/ui/Notice";
import { api, ApiError } from "@/lib/api";
import { recordTaken, useTodayDoses, type TodayDose } from "@/lib/doses";
import { PLAN_STATUS, todayIn } from "@/lib/plans";
import type { CaregiverLink, Medication, Plan } from "@/lib/types";
import { MedicationCard } from "./MedicationCard";
import { MedicationFields } from "./MedicationFields";
import { emptyMedication, fromMedication, isRegularSchedule, toCreateBody, toPatchBody, validateDraft, type DraftErrors, type MedicationDraft } from "./medication-draft";
import styles from "./PlanDetail.module.css";

type Editing = { mode: "add" } | { mode: "edit"; med: Medication } | null;

export function PlanDetail({ id }: { id: string }) {
  const me = useMe();
  const router = useRouter();
  const { mutate: globalMutate } = useSWRConfig();
  const { data: plan, error, mutate } = useSWR<Plan>(`/plans/${id}`);
  const { data: caregivers } = useSWR<CaregiverLink[]>(`/plans/${id}/caregivers`);
  const { data: doses, mutate: refreshDoses } = useTodayDoses(plan ? [plan] : undefined, me.timezone);

  const [editing, setEditing] = useState<Editing>(null);
  const [draft, setDraft] = useState<MedicationDraft | null>(null);
  const [draftErrors, setDraftErrors] = useState<DraftErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<Medication | "plan" | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (error) {
    const forbidden = error instanceof ApiError && error.status === 403;
    return (
      <>
        <BackLink />
        <Notice kind="error">{forbidden ? "No tenés acceso a este plan." : error instanceof ApiError && error.status === 404 ? "No encontramos este plan. Puede que ya se haya eliminado." : "No pudimos cargar el plan."}</Notice>
      </>
    );
  }
  if (!plan) return <p>Cargando…</p>;

  // Permisos por plan: el dueño solo edita/borra si NO tiene cuidador; el cuidador del plan siempre.
  const isOwner = plan.patientId === me.id;
  const acceptedCaregivers = (caregivers ?? []).filter((c) => c.status === "accepted");
  const canModify = isOwner ? caregivers !== undefined && acceptedCaregivers.length === 0 : true;
  const status = PLAN_STATUS[plan.status];

  function openAdd() {
    setEditing({ mode: "add" });
    setDraft(emptyMedication(todayIn(me.timezone)));
    setDraftErrors({});
    setFormError(null);
  }
  function openEdit(med: Medication) {
    setEditing({ mode: "edit", med });
    setDraft(fromMedication(med));
    setDraftErrors({});
    setFormError(null);
  }
  function closeForm() {
    setEditing(null);
    setDraft(null);
  }

  async function saveMedication(e: React.FormEvent) {
    e.preventDefault();
    if (!draft || !editing) return;
    const errors = validateDraft(draft);
    setDraftErrors(errors);
    if (Object.keys(errors).length > 0) {
      setFormError("Revisá los campos marcados en rojo.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (editing.mode === "add") {
        await api(`/plans/${id}/medications`, { method: "POST", json: toCreateBody(draft) });
      } else {
        await api(`/plans/${id}/medications/${editing.med.id}`, { method: "PATCH", json: toPatchBody(draft) });
      }
      await Promise.all([mutate(), globalMutate("/plans")]);
      closeForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No pudimos guardar el medicamento.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    setActionError(null);
    try {
      if (toDelete === "plan") {
        await api(`/plans/${id}`, { method: "DELETE" });
        await globalMutate("/plans");
        router.push("/planes");
        return;
      }
      await api(`/plans/${id}/medications/${toDelete.id}`, { method: "DELETE" });
      await Promise.all([mutate(), globalMutate("/plans")]);
      setToDelete(null);
    } catch (err) {
      setToDelete(null);
      setActionError(err instanceof Error ? err.message : "No pudimos completar la acción.");
    } finally {
      setDeleting(false);
    }
  }

  async function refill(med: Medication, units: number) {
    await api(`/plans/${id}/medications/${med.id}/stock`, { method: "POST", json: { units } });
    await Promise.all([mutate(), globalMutate("/plans")]);
  }

  async function onTake(d: TodayDose) {
    await recordTaken(d.planId, d.medicationId, d.scheduledAt);
    await Promise.all([refreshDoses(), mutate()]); // mutate: el stock bajó
  }

  const editingRegular = editing?.mode === "edit" ? isRegularSchedule(editing.med) : true;

  return (
    <>
      <BackLink />
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{plan.name}</h1>
          <div className={styles.meta}>
            <Chip tone={status.tone}>{status.label}</Chip>
            {!isOwner && <Chip tone="primary">Lo cuidás vos</Chip>}
            {acceptedCaregivers.length > 0 && <Chip tone="primary">{acceptedCaregivers.length === 1 ? "Con 1 cuidador" : `Con ${acceptedCaregivers.length} cuidadores`}</Chip>}
          </div>
        </div>
        <div className={styles.actions}>
          <Button variant="light" onClick={openAdd}>
            <IconPlus size={22} aria-hidden="true" /> Agregar medicamento
          </Button>
          {canModify && (
            <button type="button" className={styles.deletePlan} onClick={() => setToDelete("plan")}>
              <IconTrash size={22} aria-hidden="true" /> Eliminar plan
            </button>
          )}
        </div>
      </header>

      {isOwner && acceptedCaregivers.length > 0 && (
        <div className={styles.notice}>
          <Notice>
            Este plan lo gestiona tu cuidador: solo él puede editar o eliminar medicamentos. Vos podés agregar medicamentos, registrar tomas y reponer stock. Si querés recuperar el control, podés quitar al cuidador desde{" "}
            <Link href="/cuidadores" className={styles.inlineLink}>
              Cuidadores
            </Link>
            .
          </Notice>
        </div>
      )}
      {actionError && (
        <div className={styles.notice}>
          <Notice kind="error">{actionError}</Notice>
        </div>
      )}

      <section aria-labelledby="hoy" className={styles.section}>
        <h2 id="hoy" className={styles.sectionTitle}>
          Tomas de hoy
        </h2>
        {!doses ? (
          <p className={styles.muted}>Cargando…</p>
        ) : doses.length === 0 ? (
          <Card>
            <p className={styles.muted}>Este plan no tiene tomas programadas para hoy.</p>
          </Card>
        ) : (
          <ul className={styles.doses}>
            {doses.map((d) => (
              <DoseRow key={`${d.medicationId}-${d.scheduledAt}`} dose={d} tz={me.timezone} onTake={onTake} />
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="meds" className={styles.section}>
        <h2 id="meds" className={styles.sectionTitle}>
          Medicamentos
        </h2>
        <ul className={styles.meds}>
          {plan.medications.map((med) => (
            <MedicationCard key={med.id} med={med} canModify={canModify} onEdit={() => openEdit(med)} onDelete={() => setToDelete(med)} onRefill={(units) => refill(med, units)} />
          ))}
        </ul>
      </section>

      <Modal open={editing !== null} title={editing?.mode === "edit" ? `Editar ${editing.med.name}` : "Agregar medicamento"} onClose={closeForm}>
        {draft && (
          <form onSubmit={saveMedication} noValidate className={styles.modalForm}>
            {editing?.mode === "edit" && !editingRegular && <Notice kind="info">Este medicamento tiene horarios distintos según el día. Al guardar, se aplicarán los mismos horarios a todos los días que elijas.</Notice>}
            <MedicationFields draft={draft} errors={draftErrors} onChange={setDraft} showStockUnits={editing?.mode === "add"} />
            {formError && <Notice kind="error">{formError}</Notice>}
            <div className={styles.modalActions}>
              <Button variant="light" onClick={closeForm}>
                Cancelar
              </Button>
              <Button type="submit" loading={saving}>
                Guardar
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        title={toDelete === "plan" ? "¿Eliminar este plan?" : `¿Quitar ${toDelete?.name ?? ""}?`}
        text={toDelete === "plan" ? "Se borra el plan con todos sus medicamentos y su historial de tomas. No se puede deshacer." : "Se borra el medicamento con su historial de tomas. No se puede deshacer."}
        confirmLabel={toDelete === "plan" ? "Sí, eliminar el plan" : "Sí, quitar"}
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}

function BackLink() {
  return (
    <Link href="/planes" className={styles.back}>
      <IconArrowLeft size={22} aria-hidden="true" /> Mis planes
    </Link>
  );
}
