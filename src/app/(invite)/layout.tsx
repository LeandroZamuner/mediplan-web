import { AuthProvider } from "@/components/auth/AuthProvider";

/** La página de invitación necesita saber si hay sesión, pero no redirige a nadie por su estado. */
export default function InviteLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
