import Image from "@/components/ui/Image";
import { testimonials } from "@/content/landing";
import styles from "./Testimonials.module.css";

export function Testimonials() {
  return (
    <section id="testimonios" className={styles.section} aria-labelledby="testimonials-title">
      <div className={styles.header}>
        <h2 id="testimonials-title" className={styles.title}>
          {testimonials.title}
        </h2>
        <p className={styles.text}>{testimonials.text}</p>
      </div>
      <ul className={styles.grid}>
        {testimonials.items.map((t) => (
          <li key={t.author} className={styles.card}>
            <Image src={t.photo} alt={`Foto de ${t.author.split(",")[0]}`} width={120} height={120} className={styles.photo} />
            <figure className={styles.figure}>
              <blockquote className={styles.quote}>{`"${t.quote}"`}</blockquote>
              <figcaption className={styles.author}>{t.author}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
