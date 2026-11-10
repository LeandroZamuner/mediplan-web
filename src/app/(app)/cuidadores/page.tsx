import type { Metadata } from "next";
import { CaregiversView } from "@/components/app/caregivers/CaregiversView";

export const metadata: Metadata = { title: "Cuidadores — MediPlan" };

export default function Page() {
  return <CaregiversView />;
}
