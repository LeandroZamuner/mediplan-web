import { navItems } from "@/content/landing";
import { Logo } from "@/components/ui/Logo";
import { NavTabs } from "./NavTabs";
import styles from "./Header.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <a href="#inicio" className={styles.logoLink} aria-label="MediPlan, ir al inicio">
        <Logo variant="header" />
      </a>
      <NavTabs items={navItems} />
    </header>
  );
}
