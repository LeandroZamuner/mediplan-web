"use client";

import { IconCheck, IconCopy, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Field } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/dates";
import type { CaregiverLink, Plan } from "@/lib/types";
import styles from "./PlanCaregivers.module.css";
import { invitePath, publicUrl } from "@/lib/routes";

type Share = { url: string; email: string };

/** Cuidadores de UN plan (los gestiona el dueño del plan). */
export function PlanCaregivers({ plan }: { plan: Plan }) {
  const { data: links, mutate } = useSWR<CaregiverLink[]>(`/plans/${plan.id}/caregivers`);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [share, setShare] = useState<Share | null>(null);
  const [copied, setCopied] = useState(false);
  const [toRemove, setToRemove] = useState<CaregiverLink | null>(null);
  const [removing, setRemoving] = useState(false);

  const visible = (links ?? []).filter((l) => l.status !== "rejected");

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setShare(null);
    try {
      const link = await api<CaregiverLink>(`/plans/${plan.id}/caregivers`, { method: "POST", json: { email: email.trim() } });
      setShare({ url: publicUrl(invitePath(link.token ?? "")), email: link.email });
      setEmail("");
      await mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos crear la invitación.");
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!share) return;
    try {
      await navigator.clipboard.writeText(share.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setError("No pudimos copiar el enlace. Seleccionalo y copialo a mano.");
    }
  }

  async function remove() {
    if (!toRemove) return;
    setRemoving(true);
    try {
      await api(`/plans/${plan.id}/caregivers/${toRemove.id}`, { method: "DELETE" });
      if (share?.email === toRemove.email) setShare(null); // el enlace que se mostró ya no sirve
      await mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos quitar al cuidador.");
    } finally {
      setRemoving(false);
      setToRemove(null);
    }
  }

  return (
    <div className={styles.wrap}>
      {links === undefined ? (
        <p className={styles.muted}>Cargando…</p>
      ) : visible.length === 0 ? (
        <p className={styles.muted}>Nadie cuida este plan todavía. Invitá a un familiar o cuidador para que pueda seguirlo.</p>
      ) : (
        <ul className={styles.list}>
          {visible.map((l) => (
            <li key={l.id} className={styles.row}>
              <span className={styles.email}>{l.email}</span>
              {l.status === "accepted" ? <Chip tone="ok">Cuida este plan</Chip> : <Chip tone="warn">Invitación pendiente · vence el {formatDate(l.expiresAt.slice(0, 10))}</Chip>}
              <button type="button" className={styles.remove} onClick={() => setToRemove(l)} aria-label={l.status === "accepted" ? `Quitar a ${l.email}` : `Cancelar la invitación a ${l.email}`}>
                <IconTrash size={22} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form className={styles.invite} onSubmit={invite} noValidate>
        <Field label="Invitar a alguien (correo electrónico)" type="email" inputMode="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="familiar@correo.com" />
        <Button type="submit" variant="light" loading={busy} disabled={!email.includes("@")}>
          Invitar
        </Button>
      </form>

      {error && <Notice kind="error">{error}</Notice>}

      {share && (
        <Notice kind="ok">
          <p className={styles.shareTitle}>Invitación lista. Compartí este enlace con {share.email}:</p>
          <div className={styles.shareRow}>
            <input className={styles.shareInput} readOnly value={share.url} aria-label="Enlace de invitación" onFocus={(e) => e.currentTarget.select()} />
            <button type="button" className={styles.copy} onClick={() => void copy()}>
              {copied ? <IconCheck size={22} aria-hidden="true" /> : <IconCopy size={22} aria-hidden="true" />}
              {copied ? "Copiado" : "Copiar"}
            </button>
            <a className={styles.whatsapp} href={`https://wa.me/?text=${encodeURIComponent(`Te invito a cuidar mi plan de medicación en MediPlan: ${share.url}`)}`} target="_blank" rel="noopener noreferrer">
              Enviar por WhatsApp
            </a>
          </div>
          <p className={styles.shareNote}>El enlace sirve solo para {share.email} y vence en 7 días. Si lo perdés, cancelá la invitación y creá otra.</p>
        </Notice>
      )}

      <ConfirmDialog
        open={toRemove !== null}
        title={toRemove?.status === "accepted" ? "¿Quitar a este cuidador?" : "¿Cancelar la invitación?"}
        text={toRemove?.status === "accepted" ? `${toRemove.email} dejará de ver este plan y de recibir sus avisos. Vos recuperás el control para editarlo.` : "El enlace que enviaste dejará de funcionar."}
        confirmLabel={toRemove?.status === "accepted" ? "Sí, quitar" : "Sí, cancelar"}
        busy={removing}
        onConfirm={() => void remove()}
        onCancel={() => setToRemove(null)}
      />
    </div>
  );
}
