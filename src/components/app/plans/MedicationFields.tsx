"use client";

import { IconPlus, IconTrash } from "@tabler/icons-react";
import { Field } from "@/components/ui/Field";
import { WEEKDAYS, WEEKDAYS_SHORT } from "@/lib/dates";
import type { DraftErrors, MedicationDraft } from "./medication-draft";
import styles from "./MedicationFields.module.css";

type Props = {
  draft: MedicationDraft;
  errors: DraftErrors;
  onChange: (next: MedicationDraft) => void;
  /** En la edición el stock se maneja aparte ("Reponer"), así que no se pide acá. */
  showStockUnits?: boolean;
};

const ORDER = [1, 2, 3, 4, 5, 6, 0]; // semana que empieza en lunes

export function MedicationFields({ draft, errors, onChange, showStockUnits = true }: Props) {
  const set = <K extends keyof MedicationDraft>(key: K, value: MedicationDraft[K]) => onChange({ ...draft, [key]: value });

  const toggleDay = (day: number) => set("days", draft.days.includes(day) ? draft.days.filter((d) => d !== day) : [...draft.days, day]);
  const setTime = (i: number, value: string) => set("times", draft.times.map((t, idx) => (idx === i ? value : t)));
  const allDays = draft.days.length === 7;

  return (
    <div className={styles.fields}>
      <div className={styles.row}>
        <Field label="Nombre del medicamento" value={draft.name} onChange={(e) => set("name", e.target.value)} error={errors.name} placeholder="Enalapril" autoComplete="off" />
        <Field label="Dosis" value={draft.dose} onChange={(e) => set("dose", e.target.value)} error={errors.dose} placeholder="10 mg" autoComplete="off" />
      </div>

      <fieldset className={styles.group}>
        <legend>¿Qué días lo tomás?</legend>
        <div className={styles.days}>
          {ORDER.map((day) => (
            <button key={day} type="button" className={`${styles.day} ${draft.days.includes(day) ? styles.dayOn : ""}`} aria-pressed={draft.days.includes(day)} aria-label={WEEKDAYS[day]} onClick={() => toggleDay(day)}>
              {WEEKDAYS_SHORT[day]}
            </button>
          ))}
          <button type="button" className={styles.all} onClick={() => set("days", allDays ? [] : [1, 2, 3, 4, 5, 6, 0])}>
            {allDays ? "Quitar todos" : "Todos los días"}
          </button>
        </div>
        {errors.days && (
          <p className={styles.error} role="alert">
            {errors.days}
          </p>
        )}
      </fieldset>

      <fieldset className={styles.group}>
        <legend>¿A qué hora?</legend>
        <ul className={styles.times}>
          {draft.times.map((t, i) => (
            <li key={i} className={styles.time}>
              <input type="time" value={t} onChange={(e) => setTime(i, e.target.value)} aria-label={`Horario ${i + 1}`} className={styles.timeInput} />
              {draft.times.length > 1 && (
                <button type="button" className={styles.iconButton} onClick={() => set("times", draft.times.filter((_, idx) => idx !== i))} aria-label={`Quitar el horario ${t}`}>
                  <IconTrash size={22} />
                </button>
              )}
            </li>
          ))}
        </ul>
        <button type="button" className={styles.add} onClick={() => set("times", [...draft.times, "20:00"])}>
          <IconPlus size={22} aria-hidden="true" /> Agregar otro horario
        </button>
        {errors.times && (
          <p className={styles.error} role="alert">
            {errors.times}
          </p>
        )}
      </fieldset>

      <div className={styles.row}>
        <Field label="Desde" type="date" value={draft.startDate} onChange={(e) => set("startDate", e.target.value)} error={errors.startDate} />
        <Field label="Hasta (opcional)" type="date" value={draft.endDate} onChange={(e) => set("endDate", e.target.value)} error={errors.endDate} hint="Dejalo vacío si es un tratamiento sin fecha de fin." />
      </div>

      <div className={styles.row}>
        {showStockUnits && <Field label="Unidades en stock" type="number" min={0} inputMode="numeric" value={draft.stockUnits} onChange={(e) => set("stockUnits", e.target.value)} error={errors.stockUnits} hint="Cuántas dosis tenés ahora." />}
        <Field label="Avisarme cuando queden" type="number" min={0} inputMode="numeric" value={draft.stockAlertAt} onChange={(e) => set("stockAlertAt", e.target.value)} error={errors.stockAlertAt} hint="Te avisamos al llegar a esa cantidad." />
      </div>
    </div>
  );
}
