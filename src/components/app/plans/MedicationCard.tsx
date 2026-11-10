"use client";

import { IconPencil, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Field } from "@/components/ui/Field";
import { formatDate, summarizeSchedules } from "@/lib/dates";
import { stockLevel } from "@/lib/doses";
import type { Medication } from "@/lib/types";
import styles from "./MedicationCard.module.css";

type Props = {
  med: Medication;
  canModify: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onRefill: (units: number) => Promise<void>;
};

export function MedicationCard({ med, canModify, onEdit, onDelete, onRefill }: Props) {
  const level = stockLevel(med.stockUnits, med.stockAlertAt);
  const [units, setUnits] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refill(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(units);
    if (!Number.isInteger(n) || n <= 0) {
      setError("Ingresá cuántas unidades sumás (un número mayor a 0).");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onRefill(n);
      setUnits("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos reponer el stock.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className={styles.card}>
      <div className={styles.head}>
        <div>
          <h3 className={styles.name}>{med.name}</h3>
          <p className={styles.dose}>{med.dose}</p>
        </div>
        {canModify && (
          <div className={styles.tools}>
            <button type="button" className={styles.tool} onClick={onEdit} aria-label={`Editar ${med.name}`}>
              <IconPencil size={22} />
            </button>
            <button type="button" className={`${styles.tool} ${styles.danger}`} onClick={onDelete} aria-label={`Quitar ${med.name}`}>
              <IconTrash size={22} />
            </button>
          </div>
        )}
      </div>

      <dl className={styles.facts}>
        <div>
          <dt>Horarios</dt>
          <dd>{summarizeSchedules(med.schedules)}</dd>
        </div>
        <div>
          <dt>Período</dt>
          <dd>
            {formatDate(med.startDate)} {med.endDate ? `→ ${formatDate(med.endDate)}` : "· sin fecha de fin"}
          </dd>
        </div>
        <div>
          <dt>Stock</dt>
          <dd className={styles.stock}>
            <strong>{med.stockUnits}</strong> {med.stockUnits === 1 ? "unidad" : "unidades"}
            {level === "out" && <Chip tone="danger">Se agotó</Chip>}
            {level === "low" && <Chip tone="warn">Poco stock</Chip>}
          </dd>
        </div>
      </dl>

      <form className={styles.refill} onSubmit={refill} noValidate>
        <Field label="Reponer stock" type="number" min={1} inputMode="numeric" value={units} onChange={(e) => setUnits(e.target.value)} placeholder="Unidades que sumás" error={error} />
        <Button type="submit" variant="light" size="sm" loading={busy} disabled={!units}>
          Sumar
        </Button>
      </form>
    </li>
  );
}
