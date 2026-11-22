import { Button } from "./Button";
import { Notice } from "./Notice";
import { isPlanLimitMessage } from "@/lib/premium";
import styles from "./ErrorNotice.module.css";

/** Aviso de error. Si es por el tope del plan gratis, ofrece pasar a Premium. */
export function ErrorNotice({ message }: { message: string }) {
  if (!isPlanLimitMessage(message)) return <Notice kind="error">{message}</Notice>;
  return (
    <Notice kind="info">
      <div className={styles.paywall}>
        <p>{message}</p>
        <Button href="/premium" size="sm">
          Ver Premium
        </Button>
      </div>
    </Notice>
  );
}
