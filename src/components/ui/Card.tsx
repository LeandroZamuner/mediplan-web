import styles from "./Card.module.css";

/** Superficie base del panel: la misma tarjeta gris de la landing. `tone="lavender"` para lo destacado. */
export function Card({
  children,
  tone = "grey",
  className,
  as: Tag = "section",
  ...rest
}: {
  children: React.ReactNode;
  tone?: "grey" | "lavender" | "white";
  className?: string;
  as?: "section" | "div" | "article" | "li";
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag className={`${styles.card} ${styles[tone]} ${className ?? ""}`} {...rest}>
      {children}
    </Tag>
  );
}
