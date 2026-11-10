"use client";

import { IconCheck } from "@tabler/icons-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { formatTime } from "@/lib/dates";
import type { TodayDose } from "@/lib/doses";
import styles from "./DoseRow.module.css";

const STATUS = {
  taken: { label: "Tomada", tone: "ok" },
  pending: { label: "Pendiente", tone: "primary" },
  missed: { label: "Sin registrar", tone: "warn" },
} as const;

export function DoseRow({ dose, tz, onTake }: { dose: TodayDose; tz: string; onTake: (d: TodayDose) => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const status = STATUS[dose.status];

  async function take() {
    setBusy(true);
    try {
      await onTake(dose);
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className={styles.row}>
      <span className={styles.time}>{formatTime(dose.scheduledAt, tz)}</span>
      <div className={styles.info}>
        <p className={styles.med}>
          {dose.medicationName} <span className={styles.dose}>{dose.dose}</span>
        </p>
        <p className={styles.plan}>{dose.planName}</p>
      </div>
      <Chip tone={status.tone}>{status.label}</Chip>
      <div className={styles.action}>
        {dose.status === "taken" ? (
          <span className={styles.done} aria-hidden="true">
            <IconCheck size={26} />
          </span>
        ) : (
          <Button size="sm" onClick={() => void take()} loading={busy}>
            Registrar toma
          </Button>
        )}
      </div>
    </li>
  );
}
