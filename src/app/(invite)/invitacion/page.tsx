"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { InviteAccept } from "@/components/app/caregivers/InviteAccept";

// El código viaja como parámetro (/invitacion?token=...): así la página funciona también como sitio estático.
function Invite() {
  const token = useSearchParams().get("token");
  if (!token) return <p role="alert">Este enlace está incompleto. Abrilo desde el mensaje que te enviaron.</p>;
  return <InviteAccept token={token} />;
}

export default function Page() {
  return (
    <Suspense fallback={<p role="status">Cargando…</p>}>
      <Invite />
    </Suspense>
  );
}
