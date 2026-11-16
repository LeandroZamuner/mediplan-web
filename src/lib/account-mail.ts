import { sendEmailVerification, sendPasswordResetEmail, type User } from "firebase/auth";
import { api } from "@/lib/api";
import { sendResetMail, sendVerificationMail } from "@/lib/account-mail-core";
import { firebaseAuth } from "@/lib/firebase";

/** Envía el correo para elegir una contraseña nueva (con el diseño de MediPlan; si la API no responde, el de Firebase). */
export function requestPasswordReset(email: string): Promise<void> {
  const address = email.trim();
  return sendResetMail(
    () => api("/auth/password-reset", { method: "POST", json: { email: address } }),
    () => sendPasswordResetEmail(firebaseAuth(), address),
  );
}

/** Envía el correo para confirmar la cuenta. Devuelve false si el correo ya estaba verificado (no se envió nada). */
export function requestVerification(user: User): Promise<boolean> {
  return sendVerificationMail(
    () => api<{ sent: boolean }>("/auth/email-verification", { method: "POST" }),
    () => sendEmailVerification(user),
  );
}
