import { useId } from "react";
import styles from "./Field.module.css";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string | null;
};

/** Campo de formulario accesible: etiqueta visible, ayuda y error asociados al input. */
export function Field({ label, hint, error, id, className, ...input }: Props) {
  const auto = useId();
  const fieldId = id ?? auto;
  const describedBy = [hint ? `${fieldId}-hint` : "", error ? `${fieldId}-error` : ""].filter(Boolean).join(" ") || undefined;
  return (
    <div className={`${styles.field} ${className ?? ""}`}>
      <label htmlFor={fieldId} className={styles.label}>
        {label}
      </label>
      <input id={fieldId} className={styles.input} aria-invalid={error ? true : undefined} aria-describedby={describedBy} {...input} />
      {hint && !error && (
        <p id={`${fieldId}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={`${fieldId}-error`} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
