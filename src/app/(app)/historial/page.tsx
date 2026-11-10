import type { Metadata } from "next";
import { HistoryView } from "@/components/app/history/HistoryView";

export const metadata: Metadata = { title: "Historial — MediPlan" };

export default function Page() {
  return <HistoryView />;
}
