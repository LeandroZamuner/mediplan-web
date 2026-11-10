import Image from "@/components/ui/Image";
import { about } from "@/content/landing";
import styles from "./About.module.css";

export function About() {
  return (
    <section id="nosotros" className={styles.section} aria-labelledby="about-title">
      <div className={styles.left}>
        <div className={styles.intro}>
          <h2 id="about-title" className={styles.title}>
            {about.title}
          </h2>
          <p className={styles.lead}>{about.text}</p>
        </div>
        <div className={styles.team}>
          <h3 className={styles.teamTitle}>{about.teamTitle}</h3>
          <ul className={styles.avatars} aria-label="Fotos de integrantes del equipo">
            {Array.from({ length: about.teamPhotos }, (_, i) => (
              <li key={i} className={styles.avatar}>
                <Image src={`/images/team/team-${i + 1}.png`} alt="" width={120} height={120} />
              </li>
            ))}
          </ul>
          <p className={styles.teamText}>{about.teamText}</p>
        </div>
      </div>
      <figure className={styles.quoteCard}>
        <div className={styles.photo}>
          <Image
            src="/images/ceo.png"
            alt="Martín Bruno, CEO de MediPlan"
            fill
            sizes="(min-width: 1280px) 40vw, 90vw"
            className={styles.photoImg}
          />
        </div>
        <div className={styles.quoteBox}>
          <blockquote className={styles.quote}>{about.quote}</blockquote>
          <figcaption className={styles.author}>{about.author}</figcaption>
        </div>
      </figure>
    </section>
  );
}
