import type { Metadata } from "next";
import { PlansView } from "@/components/app/plans/PlansView";

export const metadata: Metadata = { title: "Mis planes — MediPlan" };

export default function Page() {
  return <PlansView />;
}
