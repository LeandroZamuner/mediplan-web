/**
 * Rutas con parámetros y direcciones públicas.
 *
 * El sitio puede publicarse como archivos estáticos (GitHub Pages), donde no existen rutas como /planes/123:
 * el id viaja en la dirección como parámetro (/planes/ver?id=123).
 */

/** Subcarpeta donde vive el sitio (por ejemplo "/mediplan" en GitHub Pages). Vacía en desarrollo y con dominio propio. */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const planPath = (id: string) => `/planes/ver?id=${encodeURIComponent(id)}`;

export const invitePath = (token: string) => `/invitacion?token=${encodeURIComponent(token)}`;

/** Dirección completa (con dominio y subcarpeta) para compartir, por ejemplo el enlace de una invitación. */
export const publicUrl = (path: string) => `${window.location.origin}${BASE_PATH}${path}`;
