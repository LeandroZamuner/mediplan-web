import type { Metadata } from "next";
import { VerifyPanel } from "@/components/auth/VerifyPanel";

export const metadata: Metadata = { title: "Revisá tu correo — MediPlan" };

export default function Page() {
  return <VerifyPanel />;
}
