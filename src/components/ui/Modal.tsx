"use client";

import { IconX } from "@tabler/icons-react";
import { useEffect, useId, useRef } from "react";
import styles from "./Modal.module.css";

/** Ventana emergente con formulario o contenido (usa <dialog>: foco y Escape ya resueltos). */
export function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} className={styles.dialog} aria-labelledby={titleId} onCancel={(e) => { e.preventDefault(); onClose(); }}>
      <div className={styles.head}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar">
          <IconX size={26} />
        </button>
      </div>
      {open && children}
    </dialog>
  );
}
