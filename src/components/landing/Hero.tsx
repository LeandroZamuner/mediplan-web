import Image from "@/components/ui/Image";
import { Button } from "@/components/ui/Button";
import { site } from "@/config/site";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section id="inicio" className={styles.hero} aria-labelledby="hero-title">
      <Image
        src="/images/hero.jpg"
        alt=""
        fill
        priority
        sizes="(min-width: 1960px) 1840px, 100vw"
        className={styles.image}
      />
      <div className={styles.textBox}>
        <h1 id="hero-title" className={styles.title}>
          {site.slogan}
        </h1>
        <p className={styles.text}>{site.description}</p>
      </div>
      <div className={styles.actions}>
        <Button href="/registro" icon="arrow-right" iconPosition="left">
          Registrarme ahora
        </Button>
      </div>
    </section>
  );
}
