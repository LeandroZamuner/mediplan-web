import assert from "node:assert/strict";
import { test } from "node:test";
import { isPlanLimitMessage, premiumView } from "./premium.ts";
import type { Subscription } from "./types.ts";

const base: Subscription = {
  tier: "free",
  cancelled: false,
  pending: false,
  currentPeriodEnd: null,
  limits: { maxActivePlans: 1, maxMedications: 3, maxCaregiversPerPlan: 1 },
  usage: { activePlans: 0, medications: 0 },
  payments: { enabled: true, priceArs: 2999, currency: "ARS", period: "month" },
};

test("dada una cuenta gratis con pagos habilitados, cuando se muestra Premium, entonces se ofrece pasar a Premium", () => {
  assert.equal(premiumView(base), "free");
});
test("dada una cuenta gratis con un pago iniciado, cuando se muestra Premium, entonces figura pendiente", () => {
  assert.equal(premiumView({ ...base, pending: true }), "pending");
});
test("dada una cuenta gratis sin pagos habilitados, cuando se muestra Premium, entonces no se puede pagar todavía", () => {
  assert.equal(premiumView({ ...base, payments: { enabled: false } }), "unavailable");
});
test("dada una cuenta Premium, cuando se muestra, entonces figura activa; si se dio de baja, figura por terminar", () => {
  assert.equal(premiumView({ ...base, tier: "premium" }), "premium");
  assert.equal(premiumView({ ...base, tier: "premium", cancelled: true }), "premium-ending");
});
test("dado el aviso de tope de la API, cuando se evalúa el mensaje, entonces se reconoce", () => {
  assert.equal(isPlanLimitMessage("Llegaste al límite del plan gratuito: podés cargar hasta 3 medicamentos. Pasate a Premium para quitar el límite."), true);
  assert.equal(isPlanLimitMessage("No pudimos crear el plan."), false);
});
