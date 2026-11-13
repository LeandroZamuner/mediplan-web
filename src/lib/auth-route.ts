export type AuthStatus = "loading" | "signedOut" | "needsVerification" | "ready" | "error";

const VERIFY = "/verificar-correo";

/** Sin la barra final: el sitio publicado en GitHub Pages usa `trailingSlash` y la ruta llega como "/verificar-correo/". */
const clean = (path: string) => (path.length > 1 ? path.replace(/\/+$/, "") : path);

/**
 * A dónde hay que mandar a la persona desde una pantalla de acceso según su sesión (null = quedarse).
 * Tiene que dar lo mismo con y sin barra final: si no, "Revisá tu correo" se redirigía a sí misma y quedaba en "Cargando…".
 */
export function authTarget(status: AuthStatus, path: string): "home" | "verify" | "login" | null {
  const here = clean(path);
  if (status === "ready") return "home";
  if (status === "needsVerification" && here !== VERIFY) return "verify";
  if (status === "signedOut" && here === VERIFY) return "login";
  return null;
}
