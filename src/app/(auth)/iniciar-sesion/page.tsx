import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Iniciar sesión — MediPlan" };

export default function Page() {
  return <LoginForm />;
}
