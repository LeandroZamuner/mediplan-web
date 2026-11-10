import styles from "./Notice.module.css";

/** Mensaje destacado: error (rojo), ok (verde) o info (lavanda). */
export function Notice({ kind = "info", children }: { kind?: "info" | "error" | "ok"; children: React.ReactNode }) {
  return (
    <div className={`${styles.notice} ${styles[kind]}`} role={kind === "error" ? "alert" : "status"}>
      {children}
    </div>
  );
}
