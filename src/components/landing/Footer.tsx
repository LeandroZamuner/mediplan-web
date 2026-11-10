import Image from "@/components/ui/Image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { footer } from "@/content/landing";
import { site } from "@/config/site";
import styles from "./Footer.module.css";

const socials = [
  { key: "facebook", label: "Facebook", url: site.social.facebook },
  { key: "instagram", label: "Instagram", url: site.social.instagram },
  { key: "x", label: "X (Twitter)", url: site.social.x },
] as const;

function FooterLinks({ title, links }: { title: string; links: readonly { label: string; href: string }[] }) {
  return (
    <div className={styles.linkGroup}>
      <h2 className={styles.groupTitle}>{title}</h2>
      <ul className={styles.links}>
        {links.map((l) => (
          <li key={l.label}>
            {l.href.startsWith("#") ? <a href={l.href}>{l.label}</a> : <Link href={l.href}>{l.label}</Link>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const downloadAvailable = site.playStoreUrl !== "";
  return (
    <footer className={styles.footer}>
      <div className={styles.textures} aria-hidden="true">
        <Image src="/shapes/footer-textures.svg" alt="" fill sizes="1420px" unoptimized />
      </div>

      <div className={styles.main}>
        <div className={styles.brand}>
          <div className={styles.brandTop}>
            <Logo variant="footer" />
            <p className={styles.slogan}>
              {footer.slogan.map((line) => (
                <span key={line} className={styles.sloganLine}>
                  {line}
                </span>
              ))}
            </p>
          </div>

          <div className={styles.brandBottom}>
            <ul className={styles.social} aria-label="Redes sociales">
              {socials.map((s) => {
                const icon = <Image src={`/icons/${s.key}.svg`} alt="" width={36} height={36} unoptimized />;
                return (
                  <li key={s.key}>
                    {s.url ? (
                      <a className={styles.socialItem} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                        {icon}
                      </a>
                    ) : (
                      <span className={styles.socialItem} aria-hidden="true">
                        {icon}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className={styles.newsletter}>
              <label htmlFor="newsletter" className={styles.newsletterLabel}>
                {footer.newsletterLabel}
              </label>
              {/* El diseño no incluye botón de envío y todavía no hay servicio: queda deshabilitado hasta definirlo. */}
              <div className={styles.input}>
                <Image src="/icons/mail.svg" alt="" width={24} height={24} unoptimized />
                <input id="newsletter" type="email" placeholder={footer.newsletterPlaceholder} disabled title="Próximamente" />
              </div>
            </div>
          </div>
        </div>

        <nav className={styles.sections} aria-label="Enlaces del pie de página">
          <FooterLinks {...footer.main} />
          <FooterLinks {...footer.legal} />
        </nav>
      </div>

      <div className={styles.actions}>
        <Button href={site.playStoreUrl} variant="light" size="sm" disabled={!downloadAvailable}>
          {footer.downloadButton}
        </Button>
        <Button href="/registro" size="sm">
          {footer.registerButton}
        </Button>
      </div>
    </footer>
  );
}
