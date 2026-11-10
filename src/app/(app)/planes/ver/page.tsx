"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PlanDetail } from "@/components/app/plans/PlanDetail";

// El id viaja como parámetro (/planes/ver?id=...): así la página funciona también como sitio estático (GitHub Pages).
function Detail() {
  const id = useSearchParams().get("id");
  if (!id) return <p role="alert">Falta indicar qué plan abrir.</p>;
  return <PlanDetail id={id} />;
}

export default function Page() {
  return (
    <Suspense fallback={<p role="status">Cargando…</p>}>
      <Detail />
    </Suspense>
  );
}
