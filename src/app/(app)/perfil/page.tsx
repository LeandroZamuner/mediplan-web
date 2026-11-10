import type { Metadata } from "next";
import { ProfileView } from "@/components/app/profile/ProfileView";

export const metadata: Metadata = { title: "Perfil — MediPlan" };

export default function Page() {
  return <ProfileView />;
}
