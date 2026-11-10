import styles from "./Chip.module.css";

/** Etiqueta corta de estado. */
export function Chip({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "primary" | "ok" | "warn" | "danger" }) {
  return <span className={`${styles.chip} ${styles[tone]}`}>{children}</span>;
}
