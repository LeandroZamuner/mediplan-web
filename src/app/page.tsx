import { About } from "@/components/landing/About";
import { DownloadCta } from "@/components/landing/DownloadCta";
import { Faq } from "@/components/landing/Faq";
import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Testimonials } from "@/components/landing/Testimonials";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <div className={styles.page}>
        <Header />
        <main id="contenido" className={styles.main}>
          <Hero />
          <Features />
          <About />
          <Testimonials />
          <Faq />
          <DownloadCta />
        </main>
        <Footer />
      </div>
    </>
  );
}
