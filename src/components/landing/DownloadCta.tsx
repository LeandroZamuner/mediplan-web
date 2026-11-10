import Image from "@/components/ui/Image";
import { Button } from "@/components/ui/Button";
import { download } from "@/content/landing";
import { site } from "@/config/site";
import styles from "./DownloadCta.module.css";

export function DownloadCta() {
  const available = site.playStoreUrl !== "";
  return (
    <section id="descargar" className={styles.section} aria-labelledby="download-title">
      <div className={styles.photo}>
        <Image
          src="/images/cta-phone.jpg"
          alt=""
          fill
          sizes="(min-width: 1280px) 45vw, 90vw"
          className={styles.photoImg}
        />
      </div>
      <div className={styles.content}>
        <h2 id="download-title" className={styles.title}>
          {download.title}
        </h2>
        <div className={styles.actions}>
          <Button href={site.playStoreUrl} size="lg" icon="download" iconPosition="right" disabled={!available}>
            {download.button}
          </Button>
          {!available && <p className={styles.soon}>{download.soon}</p>}
        </div>
      </div>
    </section>
  );
}
