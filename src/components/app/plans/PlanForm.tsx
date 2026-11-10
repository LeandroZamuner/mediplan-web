"use client";

import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { useMe } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";
import { PageHeader } from "@/components/ui/PageHeader";
import { api } from "@/lib/api";
import { todayIn } from "@/lib/plans";
import type { Plan } from "@/lib/types";
import { MedicationFields } from "./MedicationFields";
import { emptyMedication, toCreateBody, validateDraft, type DraftErrors, type MedicationDraft } from "./medication-draft";
import styles from "./PlanForm.module.css";
import { planPath } from "@/lib/routes";

export function PlanForm() {
  const me = useMe();
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const [name, setName] = useState("");
  const [drafts, setDrafts] = useState<MedicationDraft[]>(() => [emptyMedication(todayIn(me.timezone))]);
  const [nameError, setNameError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, DraftErrors>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const update = (key: string, next: MedicationDraft) => setDrafts((ds) => ds.map((d) => (d.key === key ? next : d)));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const allErrors = Object.fromEntries(drafts.map((d) => [d.key, validateDraft(d)]));
    const nameProblem = name.trim() ? null : "Poné un nombre para reconocer el plan (por ejemplo, Hipertensión).";
    setErrors(allErrors);
    setNameError(nameProblem);
    setFormError(null);
    if (nameProblem || Object.values(allErrors).some((er) => Object.keys(er).length > 0)) {
      setFormError("Revisá los campos marcados en rojo.");
      return;
    }
    setBusy(true);
    try {
      const plan = await api<Plan>("/plans", { method: "POST", json: { name: name.trim(), medications: drafts.map(toCreateBody) } });
      await mutate("/plans");
      router.push(planPath(plan.id));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No pudimos crear el plan.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className={styles.form}>
      <PageHeader title="Nuevo plan" subtitle="Cargá el tratamiento y todos sus medicamentos en una sola pantalla." />

      <Card>
        <Field label="Nombre del plan" value={name} onChange={(e) => setName(e.target.value)} error={nameError} placeholder="Hipertensión" autoComplete="off" />
      </Card>

      {drafts.map((draft, i) => (
        <Card key={draft.key} aria-label={`Medicamento ${i + 1}`}>
          <div className={styles.medHead}>
            <h2 className={styles.medTitle}>Medicamento {i + 1}</h2>
            {drafts.length > 1 && (
              <button type="button" className={styles.remove} onClick={() => setDrafts((ds) => ds.filter((d) => d.key !== draft.key))}>
                <IconTrash size={22} aria-hidden="true" /> Quitar
              </button>
            )}
          </div>
          <MedicationFields draft={draft} errors={errors[draft.key] ?? {}} onChange={(next) => update(draft.key, next)} />
        </Card>
      ))}

      <button type="button" className={styles.addMed} onClick={() => setDrafts((ds) => [...ds, emptyMedication(todayIn(me.timezone))])}>
        <IconPlus size={26} aria-hidden="true" /> Agregar otro medicamento
      </button>

      {formError && <Notice kind="error">{formError}</Notice>}

      <div className={styles.actions}>
        <Button variant="light" href="/planes">
          Cancelar
        </Button>
        <Button type="submit" loading={busy}>
          Guardar plan
        </Button>
      </div>
    </form>
  );
}
