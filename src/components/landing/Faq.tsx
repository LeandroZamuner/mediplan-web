import { faq } from "@/content/landing";
import styles from "./Faq.module.css";

export function Faq() {
  return (
    <section id="faq" className={styles.section} aria-labelledby="faq-title">
      <div className={styles.header}>
        <h2 id="faq-title" className={styles.title}>
          {faq.title.map((line) => (
            <span key={line} className={styles.titleLine}>
              {line}
            </span>
          ))}
        </h2>
        <p className={styles.text}>{faq.text}</p>
      </div>
      <div className={styles.columns}>
        {faq.columns.map((column, i) => (
          <ul key={i} className={styles.column}>
            {column.map((item) => (
              <li key={item.q} className={styles.card}>
                <h3 className={styles.question}>{item.q}</h3>
                <p className={styles.answer}>{item.a}</p>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
