"use client";

import { sendPasswordResetEmail } from "firebase/auth";
import { useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Notice } from "@/components/ui/Notice";
import { PageHeader } from "@/components/ui/PageHeader";
import { api } from "@/lib/api";
import { authErrorMessage } from "@/lib/auth-errors";
import { firebaseAuth } from "@/lib/firebase";
import styles from "./ProfileView.module.css";

const COMMON_ZONES = [
  "America/Argentina/Buenos_Aires",
  "America/Argentina/Cordoba",
  "America/Argentina/Mendoza",
  "America/Montevideo",
  "America/Santiago",
  "America/Asuncion",
  "America/Sao_Paulo",
  "America/Lima",
  "America/Bogota",
  "America/Mexico_City",
  "Europe/Madrid",
  "UTC",
];

export function ProfileView() {
  const { me, recheck } = useAuth();
  const [zone, setZone] = useState(me?.timezone ?? "");
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [resetMessage, setResetMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const browserZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const zones = useMemo(() => [...new Set([me?.timezone ?? "", browserZone, ...COMMON_ZONES].filter(Boolean))], [me?.timezone, browserZone]);

  if (!me) return null;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await api("/me", { method: "PATCH", json: { timezone: zone } });
      await recheck();
      setMessage({ kind: "ok", text: "Listo, guardamos tu zona horaria." });
    } catch (err) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "No pudimos guardar los cambios." });
    } finally {
      setSaving(false);
    }
  }

  async function resetPassword() {
    try {
      await sendPasswordResetEmail(firebaseAuth(), me!.email);
      setResetMessage({ kind: "ok", text: `Te enviamos un enlace a ${me!.email} para elegir una contraseña nueva.` });
    } catch (err) {
      setResetMessage({ kind: "error", text: authErrorMessage(err) });
    }
  }

  return (
    <>
      <PageHeader title="Perfil" subtitle="Tus datos y tus preferencias." />

      <div className={styles.stack}>
        <Card>
          <h2 className={styles.cardTitle}>Tu cuenta</h2>
          <dl className={styles.facts}>
            <div>
              <dt>Correo electrónico</dt>
              <dd>{me.email}</dd>
            </div>
            <div>
              <dt>Uso</dt>
              <dd>{me.role === "caregiver" ? "Cuido a otras personas" : "Gestiono mi tratamiento"}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <h2 className={styles.cardTitle}>Zona horaria</h2>
          <p className={styles.text}>Los horarios de tus medicamentos se cuentan en esta zona. Si viajás o cambiás de país, actualizala para que los recordatorios lleguen a la hora correcta.</p>
          <form onSubmit={save} className={styles.form}>
            <label className={styles.label}>
              Zona horaria
              <select value={zone} onChange={(e) => setZone(e.target.value)} className={styles.select}>
                {zones.map((z) => (
                  <option key={z} value={z}>
                    {z.replace(/_/g, " ")}
                    {z === browserZone ? " (la de este dispositivo)" : ""}
                  </option>
                ))}
              </select>
            </label>
            <Button type="submit" loading={saving} disabled={zone === me.timezone}>
              Guardar
            </Button>
          </form>
          {message && <Notice kind={message.kind}>{message.text}</Notice>}
        </Card>

        <Card>
          <h2 className={styles.cardTitle}>Seguridad</h2>
          <p className={styles.text}>Para cambiar tu contraseña te enviamos un enlace por correo.</p>
          <div>
            <Button variant="light" onClick={() => void resetPassword()}>
              Cambiar mi contraseña
            </Button>
          </div>
          {resetMessage && <Notice kind={resetMessage.kind}>{resetMessage.text}</Notice>}
        </Card>

        <Notice>Pronto vas a poder completar tu nombre, tu edad y tus preferencias de avisos por correo.</Notice>
      </div>
    </>
  );
}
