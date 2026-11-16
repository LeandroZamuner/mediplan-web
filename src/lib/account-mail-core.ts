/**
 * Correos de cuenta (verificar correo, recuperar contraseña): primero se pide a la API de MediPlan, que manda un correo
 * con nuestro diseño; si la API no puede (dormida, caída, sin configurar), se usa el correo estándar de Firebase para
 * que el usuario nunca quede sin su enlace.
 */

/** Errores que la persona puede entender y corregir (pedido inválido, demasiados pedidos): no tiene sentido reintentar por otro lado. */
function isUserFacing(error: unknown): boolean {
  const status = typeof error === "object" && error && "status" in error ? (error as { status: unknown }).status : undefined;
  return status === 422 || status === 429;
}

/** Devuelve false si el correo ya estaba verificado (no se envía nada). */
export async function sendVerificationMail(viaApi: () => Promise<{ sent: boolean }>, fallback: () => Promise<void>): Promise<boolean> {
  try {
    return (await viaApi()).sent;
  } catch (error) {
    if (isUserFacing(error)) throw error;
  }
  await fallback();
  return true;
}

export async function sendResetMail(viaApi: () => Promise<unknown>, fallback: () => Promise<void>): Promise<void> {
  try {
    await viaApi();
    return;
  } catch (error) {
    if (isUserFacing(error)) throw error;
  }
  await fallback();
}
