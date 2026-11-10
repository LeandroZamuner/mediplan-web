import type { Metadata } from "next";
import { Suspense } from "react";
import { ActionHandler } from "@/components/auth/ActionHandler";

export const metadata: Metadata = { title: "MediPlan", robots: { index: false } };

// useSearchParams() necesita un <Suspense>: los parámetros del enlace no existen al prerenderizar.
export default function Page() {
  return (
    <Suspense fallback={<p role="status">Un momento…</p>}>
      <ActionHandler />
    </Suspense>
  );
}
