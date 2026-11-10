/**
 * Si alguien abre un enlace de invitación sin tener sesión, guardamos el código para
 * llevarlo de vuelta a la invitación apenas inicie sesión (o cree su cuenta).
 */
const KEY = "mediplan.pendingInvite";

export function setPendingInvite(token: string) {
  try {
    sessionStorage.setItem(KEY, token);
  } catch {
    /* sin almacenamiento: tendrá que volver a abrir el enlace */
  }
}

export function getPendingInvite(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function clearPendingInvite() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* nada que limpiar */
  }
}
