import type { Metadata } from "next";
import { NotificationsView } from "@/components/app/notifications/NotificationsView";

export const metadata: Metadata = { title: "Notificaciones — MediPlan" };

export default function Page() {
  return <NotificationsView />;
}
