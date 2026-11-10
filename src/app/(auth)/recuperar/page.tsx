import type { Metadata } from "next";
import { ForgotForm } from "@/components/auth/ForgotForm";

export const metadata: Metadata = { title: "Recuperar contraseña — MediPlan" };

export default function Page() {
  return <ForgotForm />;
}
