import assert from "node:assert/strict";
import { test } from "node:test";
import { authTarget } from "./auth-route.ts";

// En GitHub Pages el sitio se exporta con trailingSlash: la ruta llega como "/verificar-correo/".
for (const verify of ["/verificar-correo", "/verificar-correo/"]) {
  test(`dado un correo sin verificar y la ruta ${verify}, entonces se queda ahí y muestra la pantalla`, () => {
    assert.equal(authTarget("needsVerification", verify), null);
  });
  test(`dada una sesión cerrada en ${verify}, entonces se manda a iniciar sesión`, () => {
    assert.equal(authTarget("signedOut", verify), "login");
  });
}

for (const login of ["/iniciar-sesion", "/iniciar-sesion/"]) {
  test(`dado un correo sin verificar en ${login}, entonces se manda a verificar`, () => {
    assert.equal(authTarget("needsVerification", login), "verify");
  });
  test(`dada una sesión cerrada en ${login}, entonces se queda ahí`, () => {
    assert.equal(authTarget("signedOut", login), null);
  });
}

test("dada una sesión lista, entonces se manda al inicio desde cualquier pantalla de acceso", () => {
  assert.equal(authTarget("ready", "/registro/"), "home");
});

test("mientras se lee la sesión no se redirige", () => {
  assert.equal(authTarget("loading", "/verificar-correo/"), null);
});
