/**
 * Configuración del sitio. Lo que todavía no existe (la app publicada, las redes sociales)
 * se completa con variables de entorno `NEXT_PUBLIC_*`; si falta, la web lo dice en lugar de
 * mandar al usuario a un enlace muerto.
 */
export const site = {
  name: "MediPlan",
  slogan: "Tu plan de medicación siempre bajo control",
  description:
    "Organiza tus medicamentos, recibe recordatorios y notifica a tus seres queridos sobre el cumplimiento de tu tratamiento, todo desde tu celular.",
  /** Enlace a la ficha de Google Play. Vacío hasta que la app esté publicada. */
  playStoreUrl: process.env.NEXT_PUBLIC_PLAY_STORE_URL ?? "",
  social: {
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "",
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "",
    x: process.env.NEXT_PUBLIC_X_URL ?? "",
  },
} as const;
