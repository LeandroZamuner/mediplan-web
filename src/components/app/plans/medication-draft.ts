import type { Medication, Schedule } from "@/lib/types";

/** Borrador de un medicamento tal como se edita en el formulario. */
export type MedicationDraft = {
  key: string;
  name: string;
  dose: string;
  startDate: string; // AAAA-MM-DD
  endDate: string; // "" = sin fecha de fin
  days: number[]; // 0 = domingo ... 6 = sábado
  times: string[]; // "HH:MM"
  stockUnits: string;
  stockAlertAt: string;
};

let counter = 0;
const newKey = () => `med-${Date.now()}-${counter++}`;

export function emptyMedication(startDate: string): MedicationDraft {
  return { key: newKey(), name: "", dose: "", startDate, endDate: "", days: [1, 2, 3, 4, 5, 6, 0], times: ["08:00"], stockUnits: "30", stockAlertAt: "5" };
}

export function fromMedication(m: Medication): MedicationDraft {
  return {
    key: m.id,
    name: m.name,
    dose: m.dose,
    startDate: m.startDate,
    endDate: m.endDate ?? "",
    days: [...new Set(m.schedules.map((s) => s.dayOfWeek))],
    times: [...new Set(m.schedules.map((s) => s.timeOfDay))].sort(),
    stockUnits: String(m.stockUnits),
    stockAlertAt: String(m.stockAlertAt),
  };
}

/** ¿Los horarios del medicamento son "los mismos horarios todos los días elegidos"? (si no, el formulario no puede representarlos) */
export function isRegularSchedule(m: Medication): boolean {
  const days = new Set(m.schedules.map((s) => s.dayOfWeek));
  const times = new Set(m.schedules.map((s) => s.timeOfDay));
  return days.size * times.size === m.schedules.length;
}

export type DraftErrors = Partial<Record<"name" | "dose" | "startDate" | "endDate" | "days" | "times" | "stockUnits" | "stockAlertAt", string>>;

const wholeNumber = (v: string) => /^\d+$/.test(v.trim());

export function validateDraft(d: MedicationDraft): DraftErrors {
  const e: DraftErrors = {};
  if (!d.name.trim()) e.name = "Escribí el nombre del medicamento.";
  if (!d.dose.trim()) e.dose = "Indicá la dosis (por ejemplo, 10 mg).";
  if (!d.startDate) e.startDate = "Elegí desde cuándo se toma.";
  if (d.endDate && d.startDate && d.endDate < d.startDate) e.endDate = "La fecha de fin no puede ser anterior al inicio.";
  if (d.days.length === 0) e.days = "Elegí al menos un día.";
  if (d.times.length === 0 || d.times.some((t) => !/^\d{2}:\d{2}$/.test(t))) e.times = "Agregá al menos un horario.";
  else if (new Set(d.times).size !== d.times.length) e.times = "Hay horarios repetidos.";
  if (!wholeNumber(d.stockUnits)) e.stockUnits = "Ingresá un número entero (0 o más).";
  if (!wholeNumber(d.stockAlertAt)) e.stockAlertAt = "Ingresá un número entero (0 o más).";
  return e;
}

export function schedulesOf(d: MedicationDraft): Schedule[] {
  return [...d.days]
    .sort((a, b) => a - b)
    .flatMap((day) => [...d.times].sort().map((time) => ({ dayOfWeek: day, timeOfDay: time })));
}

/** Cuerpo para crear un medicamento (POST). */
export function toCreateBody(d: MedicationDraft) {
  return {
    name: d.name.trim(),
    dose: d.dose.trim(),
    startDate: d.startDate,
    ...(d.endDate ? { endDate: d.endDate } : {}),
    schedules: schedulesOf(d),
    stockUnits: Number(d.stockUnits),
    stockAlertAt: Number(d.stockAlertAt),
  };
}

/** Cuerpo para editar (PATCH): no incluye el stock, que se maneja con "Reponer". */
export function toPatchBody(d: MedicationDraft) {
  return {
    name: d.name.trim(),
    dose: d.dose.trim(),
    startDate: d.startDate,
    endDate: d.endDate || null,
    schedules: schedulesOf(d),
    stockAlertAt: Number(d.stockAlertAt),
  };
}
