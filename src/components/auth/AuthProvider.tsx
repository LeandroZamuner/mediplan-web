"use client";

import { onAuthStateChanged, signOut as fbSignOut, type User } from "firebase/auth";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ApiError, api } from "@/lib/api";
import { firebaseAuth } from "@/lib/firebase";
import type { Me } from "@/lib/types";

/**
 * Estados de la sesión:
 *  loading           todavía no sabemos (Firebase está leyendo la sesión guardada)
 *  signedOut         sin sesión
 *  needsVerification entró, pero todavía no verificó su correo
 *  ready             sesión válida y usuario registrado en MediPlan (`me` disponible)
 *  error             la API no respondió como esperábamos
 */
export type AuthStatus = "loading" | "signedOut" | "needsVerification" | "ready" | "error";

type AuthContextValue = {
  status: AuthStatus;
  firebaseUser: User | null;
  me: Me | null;
  error: string | null;
  /** Vuelve a leer la sesión (por ejemplo, después de verificar el correo). */
  recheck: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** Preferencia elegida al crear la cuenta: solo decide la pantalla de inicio, no da permisos. */
export const ROLE_KEY = "mediplan.role";

function savedRole(): "patient" | "caregiver" {
  try {
    return localStorage.getItem(ROLE_KEY) === "caregiver" ? "caregiver" : "patient";
  } catch {
    return "patient";
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (user: User | null) => {
    setFirebaseUser(user);
    if (!user) {
      setMe(null);
      setStatus("signedOut");
      return;
    }
    try {
      if (!user.emailVerified) await user.reload();
      if (!user.emailVerified) {
        setMe(null);
        setStatus("needsVerification");
        return;
      }
      await user.getIdToken(true); // refresca el token para que traiga "email verificado"
      let profile: Me;
      try {
        profile = await api<Me>("/me");
      } catch (e) {
        if (e instanceof ApiError && e.status === 403 && /sin registrar/i.test(e.message)) {
          profile = await api<Me>("/auth/register", { method: "POST", json: { role: savedRole() } });
        } else {
          throw e;
        }
      }
      setMe(profile);
      setError(null);
      setStatus("ready");
    } catch (e) {
      if (e instanceof ApiError && e.status === 403 && /sin verificar/i.test(e.message)) {
        setStatus("needsVerification");
        return;
      }
      setError(e instanceof Error ? e.message : "No pudimos conectar con MediPlan");
      setStatus("error");
    }
  }, []);

  useEffect(() => onAuthStateChanged(firebaseAuth(), (user) => void load(user)), [load]);

  const recheck = useCallback(async () => {
    await load(firebaseAuth().currentUser);
  }, [load]);

  const signOut = useCallback(async () => {
    await fbSignOut(firebaseAuth());
  }, []);

  const value = useMemo(
    () => ({ status, firebaseUser, me, error, recheck, signOut }),
    [status, firebaseUser, me, error, recheck, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}

/** Para las pantallas de la app: el usuario ya está validado. */
export function useMe(): Me {
  const { me } = useAuth();
  if (!me) throw new Error("useMe solo se usa en pantallas con sesión iniciada");
  return me;
}
