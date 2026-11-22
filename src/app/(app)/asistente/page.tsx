import type { Metadata } from "next";
import { AssistantView } from "@/components/app/assistant/AssistantView";

export const metadata: Metadata = { title: "Asistente — MediPlan" };

export default function Page() {
  return <AssistantView />;
}
