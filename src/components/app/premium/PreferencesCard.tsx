"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card } from "@/components/ui/Card";
import { Notice } from "@/components/ui/Notice";
import { api } from "@/lib/api";
import type { Preferences } from "@/lib/types";
import styles from "./PremiumView.module.css";

/** Preferencias Premium: resumen semanal por correo y uso de IA (consentimiento). Todo arranca apagado. */
export function PreferencesCard() {
  const { data, mutate } = useSWR<Preferences>("/me/preferences");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (!data) return null;

  async function change(patch: Partial<Pick<Preferences, "weeklyReport" | "aiConsent">>) {
    if (!data) return;
    setBusy(true);
    setError(null);
    try {
      const next = await api<Preferences>("/me/preferences", { method: "PUT", json: { weeklyReport: data.weeklyReport, aiConsent: data.aiConsent, ...patch } });
      await mutate(next, { revalidate: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos guardar tu elección.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <h2 className={styles.cardTitle}>Resumen semanal e inteligencia artificial</h2>
      <label className={styles.check}>
        <input type="checkbox" checked={data.aiConsent} disabled={busy} onChange={(e) => void change({ aiConsent: e.target.checked })} />
        <span>
          <strong>Acepto usar inteligencia artificial.</strong> Un modelo de Google (Gemini) redacta el resumen semanal y responde en el asistente. Para el resumen solo recibe números anónimos (sin tu nombre, correo ni medicamentos). En el asistente, para responder, recibe las preguntas que escribís y los datos de tu tratamiento que consulta (por ejemplo, el nombre de tus medicamentos y tus horarios). No guardamos tus conversaciones. Podés retirar el permiso cuando quieras.
        </span>
      </label>
      <label className={styles.check}>
        <input type="checkbox" checked={data.weeklyReport} disabled={busy} onChange={(e) => void change({ weeklyReport: e.target.checked })} />
        <span>
          <strong>Quiero recibir el resumen semanal por correo</strong> (los lunes a la mañana). Sin la IA, el resumen llega igual con un texto fijo.
        </span>
      </label>
      {error && <Notice kind="error">{error}</Notice>}
    </Card>
  );
}
