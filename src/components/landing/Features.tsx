import Image from "@/components/ui/Image";
import { features } from "@/content/landing";
import styles from "./Features.module.css";

export function Features() {
  return (
    <section id="aplicacion" className={styles.section} aria-labelledby="features-title">
      <h2 id="features-title" className={styles.title}>
        ¿Qué podés hacer con MediPlan?
      </h2>
      <ul className={styles.grid}>
        {features.map((f, i) => (
          <li key={f.title} className={styles.card}>
            <span className={styles.icon}>
              <Image src={f.icon} alt="" width={112} height={112} unoptimized />
            </span>
            <div className={styles.textBox}>
              <h3 className={styles.cardTitle}>{f.title}</h3>
              <p className={styles.cardText}>{f.text}</p>
            </div>
            <span className={`${styles.shape} ${styles[`shape-${f.shape}`]}`} aria-hidden="true">
              <span className={styles.shapeInner}>
                <Image src={`/shapes/union-${i + 1}.svg`} alt="" fill sizes="288px" unoptimized />
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
