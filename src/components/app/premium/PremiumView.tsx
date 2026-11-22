"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Notice } from "@/components/ui/Notice";
import { PageHeader } from "@/components/ui/PageHeader";
import { api } from "@/lib/api";
import { longDate, premiumView, priceLabel } from "@/lib/premium";
import type { Subscription } from "@/lib/types";
import styles from "./PremiumView.module.css";

const FREE = ["1 plan de tratamiento activo", "Hasta 3 medicamentos", "1 cuidador por plan", "Recordatorios y registro de tomas"];
const PREMIUM = [
  "Planes, medicamentos y cuidadores sin límite",
  "Resumen semanal por correo, redactado con inteligencia artificial",
  "Asistente de IA para consultar tu tratamiento",
  "Todo lo del plan gratis",
];

export function PremiumView() {
  const { me } = useAuth();
  const { data: sub, error, mutate } = useSWR<Subscription>("/me/subscription");
  const [busy, setBusy] = useState<"pay" | "sync" | "cancel" | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [payerEmail, setPayerEmail] = useState(me?.email ?? "");
  const [confirmCancel, setConfirmCancel] = useState(false);

  // Al volver de Mercado Pago se consulta el estado del pago una vez (el aviso automático puede tardar unos segundos).
  useEffect(() => {
    api<Subscription>("/me/subscription/sync", { method: "POST" })
      .then((s) => mutate(s, { revalidate: false }))
      .catch(() => undefined);
  }, [mutate]);

  async function pay() {
    setBusy("pay");
    setMessage(null);
    try {
      const { checkoutUrl } = await api<{ checkoutUrl: string }>("/me/subscription/checkout", { method: "POST", json: { payerEmail: payerEmail.trim() } });
      window.location.assign(checkoutUrl);
    } catch (err) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "No pudimos iniciar el pago." });
      setBusy(null);
    }
  }

  async function refresh() {
    setBusy("sync");
    setMessage(null);
    try {
      const s = await api<Subscription>("/me/subscription/sync", { method: "POST" });
      await mutate(s, { revalidate: false });
      setMessage(
        s.tier === "premium"
          ? { kind: "ok", text: "¡Listo! Tu pago se confirmó y ya sos Premium." }
          : { kind: "error", text: "Todavía no vemos el pago confirmado. Puede demorar unos minutos; probá de nuevo en un rato." },
      );
    } catch (err) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "No pudimos actualizar el estado." });
    } finally {
      setBusy(null);
    }
  }

  async function cancel() {
    setBusy("cancel");
    try {
      const s = await api<Subscription>("/me/subscription", { method: "DELETE" });
      await mutate(s, { revalidate: false });
      setMessage({ kind: "ok", text: "Cancelamos tu suscripción. No se te va a cobrar de nuevo." });
    } catch (err) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "No pudimos cancelar la suscripción." });
    } finally {
      setBusy(null);
      setConfirmCancel(false);
    }
  }

  if (error) return <Notice kind="error">No pudimos cargar tu suscripción. Probá de nuevo en un momento.</Notice>;
  if (!sub) return <p role="status">Cargando…</p>;

  const view = premiumView(sub);
  const until = sub.currentPeriodEnd ? longDate(sub.currentPeriodEnd) : null;

  return (
    <>
      <PageHeader title="Premium" subtitle="Sacale todo el provecho a MediPlan, sin límites." />
      <div className={styles.stack}>
        {message && <Notice kind={message.kind}>{message.text}</Notice>}

        {(view === "premium" || view === "premium-ending") && (
          <Card tone="lavender">
            <h2 className={styles.cardTitle}>Sos Premium</h2>
            <p className={styles.text}>
              {view === "premium"
                ? until
                  ? `Tu suscripción se renueva el ${until}.`
                  : "Tu suscripción está activa."
                : `Cancelaste la suscripción: seguís siendo Premium hasta el ${until ?? "fin del período pagado"} y no se te cobra de nuevo.`}
            </p>
            {view === "premium" && (
              <div>
                <Button variant="light" onClick={() => setConfirmCancel(true)}>
                  Cancelar suscripción
                </Button>
              </div>
            )}
          </Card>
        )}

        {view === "pending" && (
          <Card tone="lavender">
            <h2 className={styles.cardTitle}>Estamos esperando tu pago</h2>
            <p className={styles.text}>Si ya pagaste en Mercado Pago, puede demorar unos minutos en confirmarse. Si no terminaste, podés retomarlo.</p>
            <div className={styles.actions}>
              <Button onClick={() => void refresh()} loading={busy === "sync"}>
                Ya pagué, actualizar
              </Button>
              <Button variant="light" onClick={() => void pay()} loading={busy === "pay"}>
                Retomar el pago
              </Button>
            </div>
          </Card>
        )}

        {view === "unavailable" && <Notice>Los pagos todavía no están habilitados. Mientras tanto podés usar MediPlan con el plan gratis.</Notice>}

        <div className={styles.compare}>
          <Card>
            <h2 className={styles.cardTitle}>Gratis</h2>
            <ul className={styles.list}>
              {FREE.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <p className={styles.usage}>
              Estás usando {sub.usage.activePlans} {sub.usage.activePlans === 1 ? "plan" : "planes"} y {sub.usage.medications} {sub.usage.medications === 1 ? "medicamento" : "medicamentos"}.
            </p>
          </Card>
          <Card tone="lavender">
            <h2 className={styles.cardTitle}>Premium</h2>
            {sub.payments.enabled && <p className={styles.price}>{priceLabel(sub)}</p>}
            <ul className={styles.list}>
              {PREMIUM.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </Card>
        </div>

        {view === "free" && (
          <Card>
            <h2 className={styles.cardTitle}>Pasar a Premium</h2>
            <p className={styles.text}>
              Vas a pagar en Mercado Pago, con la cuenta o la tarjeta que elijas. Se cobra todos los meses y podés cancelar cuando quieras desde esta pantalla. Premium se activa en cuanto se confirma el pago.
            </p>
            <label className={styles.label}>
              Correo de tu cuenta de Mercado Pago
              <input className={styles.input} type="email" value={payerEmail} onChange={(e) => setPayerEmail(e.target.value)} autoComplete="email" />
            </label>
            <div>
              <Button onClick={() => void pay()} loading={busy === "pay"} disabled={!payerEmail.includes("@")}>
                Pagar con Mercado Pago
              </Button>
            </div>
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={confirmCancel}
        title="¿Cancelar tu suscripción?"
        text={`No se te va a cobrar de nuevo. Seguís siendo Premium hasta el ${until ?? "fin del período pagado"}; después volvés al plan gratis y tus datos se conservan.`}
        confirmLabel="Sí, cancelar"
        busy={busy === "cancel"}
        onConfirm={() => void cancel()}
        onCancel={() => setConfirmCancel(false)}
      />
    </>
  );
}
