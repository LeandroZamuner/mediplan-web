import Image from "@/components/ui/Image";
import styles from "./Logo.module.css";

/** Medidas del logo en Figma (símbolo + palabra "MediPlan"), en px sobre el lienzo de cada versión. */
const variants = {
  header: {
    w: 388,
    h: 79.998,
    symbol: { src: "/brand/symbol.svg", x: 4, y: 4.71, w: 70.586, h: 70.586 },
    word: { src: "/brand/wordmark.svg", x: 88.7, y: 11.18, w: 295.472, h: 51.763 },
  },
  footer: {
    w: 548,
    h: 112.001,
    symbol: { src: "/brand/symbol-white.svg", x: 8, y: 6.59, w: 98.825, h: 98.824 },
    word: { src: "/brand/wordmark-white.svg", x: 126.59, y: 15.65, w: 413.677, h: 72.471 },
  },
} as const;

type Part = { src: string; x: number; y: number; w: number; h: number };

export function Logo({ variant = "header", width }: { variant?: keyof typeof variants; width?: number | string }) {
  const v = variants[variant];
  const place = (p: Part) => ({
    left: `${(p.x / v.w) * 100}%`,
    top: `${(p.y / v.h) * 100}%`,
    width: `${(p.w / v.w) * 100}%`,
    height: `${(p.h / v.h) * 100}%`,
  });
  return (
    <span
      className={`${styles.logo} ${styles[variant]}`}
      style={{ aspectRatio: `${v.w} / ${v.h}`, ...(width !== undefined ? { width } : {}) }}
      role="img"
      aria-label="MediPlan"
    >
      {[v.symbol, v.word].map((p) => (
        <span key={p.src} className={styles.part} style={place(p)}>
          <Image src={p.src} alt="" fill sizes="400px" unoptimized />
        </span>
      ))}
    </span>
  );
}
