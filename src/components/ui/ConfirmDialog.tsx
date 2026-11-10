"use client";

import { useEffect, useRef } from "react";
import { Button } from "./Button";
import styles from "./ConfirmDialog.module.css";

type Props = {
  open: boolean;
  title: string;
  text: string;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Confirmación antes de borrar algo (usa <dialog>: maneja el foco y Escape por sí solo). */
export function ConfirmDialog({ open, title, text, confirmLabel, busy, onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} className={styles.dialog} onCancel={(e) => { e.preventDefault(); onCancel(); }} aria-labelledby="confirm-title">
      <h2 id="confirm-title" className={styles.title}>
        {title}
      </h2>
      <p className={styles.text}>{text}</p>
      <div className={styles.actions}>
        <Button variant="light" onClick={onCancel} disabled={busy}>
          Cancelar
        </Button>
        <Button onClick={onConfirm} loading={busy}>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
