import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { site } from "@/config/site";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins-loaded",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter-loaded",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${site.name} — ${site.slogan}`,
  description: site.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${poppins.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
