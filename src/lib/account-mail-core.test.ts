import assert from "node:assert/strict";
import { test } from "node:test";
import { sendResetMail, sendVerificationMail } from "./account-mail-core.ts";

const apiError = (status: number) => Object.assign(new Error("x"), { status });

test("dada la API disponible, cuando se pide verificar, entonces no se usa Firebase y se informa que se envió", async () => {
  let fallbacks = 0;
  const sent = await sendVerificationMail(async () => ({ sent: true }), async () => void fallbacks++);
  assert.equal(sent, true);
  assert.equal(fallbacks, 0);
});

test("dado un correo ya verificado, cuando se pide verificar, entonces devuelve false sin usar Firebase", async () => {
  let fallbacks = 0;
  const sent = await sendVerificationMail(async () => ({ sent: false }), async () => void fallbacks++);
  assert.equal(sent, false);
  assert.equal(fallbacks, 0);
});

test("dada la API caída (red, 404 o 503), cuando se pide verificar, entonces se usa el correo de Firebase", async () => {
  for (const failure of [new TypeError("Failed to fetch"), apiError(404), apiError(503), apiError(500)]) {
    let fallbacks = 0;
    const sent = await sendVerificationMail(async () => Promise.reject(failure), async () => void fallbacks++);
    assert.equal(sent, true);
    assert.equal(fallbacks, 1);
  }
});

test("dado demasiados pedidos (429), cuando se pide verificar, entonces se muestra el error y no se reintenta por Firebase", async () => {
  let fallbacks = 0;
  await assert.rejects(sendVerificationMail(async () => Promise.reject(apiError(429)), async () => void fallbacks++));
  assert.equal(fallbacks, 0);
});

test("dada la API disponible, cuando se pide recuperar la contraseña, entonces no se usa Firebase", async () => {
  let fallbacks = 0;
  await sendResetMail(async () => ({ ok: true }), async () => void fallbacks++);
  assert.equal(fallbacks, 0);
});

test("dada la API caída, cuando se pide recuperar la contraseña, entonces se usa Firebase", async () => {
  let fallbacks = 0;
  await sendResetMail(async () => Promise.reject(apiError(503)), async () => void fallbacks++);
  assert.equal(fallbacks, 1);
});

test("dado un email inválido (422) o demasiados pedidos (429), cuando se pide recuperar, entonces falla sin usar Firebase", async () => {
  for (const status of [422, 429]) {
    let fallbacks = 0;
    await assert.rejects(sendResetMail(async () => Promise.reject(apiError(status)), async () => void fallbacks++));
    assert.equal(fallbacks, 0);
  }
});
