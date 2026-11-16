import assert from "node:assert/strict";
import { test } from "node:test";
import { authErrorMessage } from "./auth-errors.ts";

test("dado un error de la API por demasiados pedidos, cuando se traduce, entonces se muestra su mensaje", () => {
  const e = Object.assign(new Error("demasiados pedidos: esperá un minuto y probá de nuevo"), { status: 429 });
  assert.equal(authErrorMessage(e), "Pediste el correo hace muy poco. Esperá un minuto y probá de nuevo.");
});

test("dado un error de la API por email inválido, cuando se traduce, entonces se muestra su mensaje", () => {
  const e = Object.assign(new Error("email inválido"), { status: 422 });
  assert.equal(authErrorMessage(e), "Revisá el correo: no parece válido.");
});

test("dado un error de Firebase, cuando se traduce, entonces sigue funcionando igual", () => {
  assert.equal(authErrorMessage({ code: "auth/email-already-in-use" }), "Ya existe una cuenta con ese correo. Probá iniciar sesión.");
});
