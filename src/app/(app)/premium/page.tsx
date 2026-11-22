import type { Metadata } from "next";
import { PremiumView } from "@/components/app/premium/PremiumView";

export const metadata: Metadata = { title: "Premium — MediPlan" };

export default function Page() {
  return <PremiumView />;
}
