import { AuthProvider } from "@/components/auth/AuthProvider";
import { AuthShell } from "@/components/auth/AuthShell";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthShell>{children}</AuthShell>
    </AuthProvider>
  );
}
