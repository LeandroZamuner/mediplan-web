import Image from "@/components/ui/Image";
import Link from "next/link";
import styles from "./Button.module.css";

type Props = {
  children: React.ReactNode;
  href?: string;
  /** primary = índigo con texto blanco · light = lavanda con texto índigo */
  variant?: "primary" | "light";
  size?: "md" | "lg" | "sm";
  icon?: "arrow-right" | "download";
  iconPosition?: "left" | "right";
  /** Deshabilitado: o no tiene destino todavía (la app aún no está en Google Play) o está ocupado. */
  disabled?: boolean;
  /** Para botones que no son enlaces: enviar un formulario o ejecutar una acción. */
  type?: "button" | "submit";
  onClick?: () => void;
  fullWidth?: boolean;
  /** Muestra "..." y bloquea mientras se espera una respuesta. */
  loading?: boolean;
};

export function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  disabled,
  type = "button",
  onClick,
  fullWidth,
  loading,
}: Props) {
  const className = `${styles.button} ${styles[variant]} ${styles[size]} ${fullWidth ? styles.full : ""}`;
  const iconEl = icon ? (
    <span className={styles.icon} aria-hidden="true">
      <Image src={`/icons/${icon}.svg`} alt="" fill sizes="36px" unoptimized />
    </span>
  ) : null;
  const content = (
    <>
      {iconPosition === "left" && iconEl}
      <span>{children}</span>
      {iconPosition === "right" && iconEl}
    </>
  );

  if (!href || disabled) {
    return (
      <button type={type} className={className} disabled={disabled || loading} onClick={onClick} aria-busy={loading || undefined}>
        {loading ? <span>Un momento…</span> : content}
      </button>
    );
  }
  const external = /^https?:\/\//.test(href);
  return external ? (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      {content}
    </a>
  ) : (
    <Link className={className} href={href}>
      {content}
    </Link>
  );
}
