import assert from "node:assert/strict";
import { test } from "node:test";
import { assistantErrorMessage, contextOf, MAX_CONTEXT } from "./assistant.ts";

test("dado un error 429, cuando se traduce, entonces pide esperar", () => {
  assert.match(assistantErrorMessage(Object.assign(new Error("x"), { status: 429 })), /Esperá un momento/);
});
test("dado un error 503, cuando se traduce, entonces avisa que no está disponible", () => {
  assert.match(assistantErrorMessage(Object.assign(new Error("x"), { status: 503 })), /no está disponible/);
});
test("dada una conversación larga, cuando se arma el contexto, entonces se recortan los últimos mensajes y empieza por uno de la persona", () => {
  const history = Array.from({ length: 30 }, (_, i) => ({ role: i % 2 === 0 ? "user" : "assistant", text: String(i) }) as const);
  const ctx = contextOf([...history]);
  assert.ok(ctx.length <= MAX_CONTEXT);
  assert.equal(ctx[0].role, "user");
  assert.equal(ctx.at(-1)?.text, "29");
});
test("dada una conversación sin mensajes de la persona, cuando se arma el contexto, entonces queda vacío", () => {
  assert.deepEqual(contextOf([{ role: "assistant", text: "hola" }]), []);
});
