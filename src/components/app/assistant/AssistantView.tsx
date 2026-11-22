"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Notice } from "@/components/ui/Notice";
import { PageHeader } from "@/components/ui/PageHeader";
import { api } from "@/lib/api";
import { assistantErrorMessage, contextOf, EMERGENCY_NOTE } from "@/lib/assistant";
import type { ChatMessage, Preferences, Subscription } from "@/lib/types";
import styles from "./AssistantView.module.css";

const SUGGESTIONS = ["¿Qué me toca tomar hoy?", "¿Cómo vengo con mis tomas esta semana?", "¿A qué medicamento le queda poco stock?"];

export function AssistantView() {
  const { data: sub } = useSWR<Subscription>("/me/subscription");
  const { data: prefs, mutate: mutatePrefs } = useSWR<Preferences>("/me/preferences");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [messages, busy]);

  if (!sub || !prefs) return <p role="status">Cargando…</p>;

  async function accept() {
    setBusy(true);
    setError(null);
    try {
      const next = await api<Preferences>("/me/preferences", { method: "PUT", json: { weeklyReport: prefs!.weeklyReport, aiConsent: true } });
      await mutatePrefs(next, { revalidate: false });
    } catch (err) {
      setError(assistantErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function send(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    const next: ChatMessage[] = [...messages, { role: "user", text: q }];
    setMessages(next);
    setText("");
    setBusy(true);
    setError(null);
    try {
      const { reply } = await api<{ reply: string }>("/assistant/chat", { method: "POST", json: { messages: contextOf(next) } });
      setMessages([...next, { role: "assistant", text: reply }]);
    } catch (err) {
      setError(assistantErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const header = <PageHeader title="Asistente" subtitle="Preguntale sobre tu tratamiento: tomas, horarios, stock y cumplimiento." />;

  if (sub.tier !== "premium") {
    return (
      <>
        {header}
        <Card tone="lavender">
          <h2 className={styles.title}>El asistente es parte de Premium</h2>
          <p className={styles.text}>Con Premium podés conversar con un asistente de inteligencia artificial que conoce tu plan de tratamiento, además de planes y medicamentos sin límite.</p>
          <div>
            <Button href="/premium">Ver Premium</Button>
          </div>
        </Card>
      </>
    );
  }
  if (!prefs.assistantAvailable) {
    return (
      <>
        {header}
        <Notice>El asistente todavía no está habilitado. Vamos a avisarte cuando esté listo.</Notice>
      </>
    );
  }
  if (!prefs.aiConsent) {
    return (
      <>
        {header}
        <Card>
          <h2 className={styles.title}>Antes de empezar</h2>
          <p className={styles.text}>
            El asistente usa un modelo de inteligencia artificial de Google (Gemini). Para responderte recibe lo que escribís y los datos de tu tratamiento que necesita consultar (por ejemplo, tus medicamentos y horarios). No guardamos tus conversaciones. Podés retirar el permiso cuando quieras desde Premium.
          </p>
          {error && <Notice kind="error">{error}</Notice>}
          <div>
            <Button onClick={() => void accept()} loading={busy}>
              Acepto y quiero usar el asistente
            </Button>
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      {header}
      <div className={styles.chat}>
        <Notice>{EMERGENCY_NOTE}</Notice>
        <ul className={styles.list} aria-live="polite">
          {messages.length === 0 && (
            <li className={styles.suggestions}>
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" className={styles.chip} onClick={() => void send(s)}>
                  {s}
                </button>
              ))}
            </li>
          )}
          {messages.map((m, i) => (
            <li key={i} className={`${styles.bubble} ${m.role === "user" ? styles.mine : styles.theirs}`}>
              {m.text}
            </li>
          ))}
          {busy && <li className={`${styles.bubble} ${styles.theirs}`}>Pensando…</li>}
        </ul>
        {error && <Notice kind="error">{error}</Notice>}
        <div ref={end} />
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            void send(text);
          }}
        >
          <input className={styles.input} value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} placeholder="Escribí tu pregunta" aria-label="Tu pregunta" disabled={busy} />
          <Button type="submit" disabled={busy || !text.trim()}>
            Enviar
          </Button>
        </form>
      </div>
    </>
  );
}
