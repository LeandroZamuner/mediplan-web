import type { Metadata } from "next";
import { StubPage } from "@/components/ui/StubPage";

export const metadata: Metadata = { title: "Política de privacidad — MediPlan" };

export default function Page() {
  return <StubPage title="Política de privacidad">Este documento está en elaboración. Va a describir qué datos de salud se guardan, para qué se usan y cómo pedir su eliminación.</StubPage>;
}
