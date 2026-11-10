import type { Metadata } from "next";
import { PlanForm } from "@/components/app/plans/PlanForm";

export const metadata: Metadata = { title: "Nuevo plan — MediPlan" };

export default function Page() {
  return <PlanForm />;
}
