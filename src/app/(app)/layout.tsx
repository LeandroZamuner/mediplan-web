import { AppShell } from "@/components/app/AppShell";
import { AuthProvider } from "@/components/auth/AuthProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
