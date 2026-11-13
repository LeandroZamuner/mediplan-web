import assert from "node:assert/strict";
import { test } from "node:test";
import { latestOnly } from "./latest.ts";

test("dada una sola carga, cuando termina, entonces no está vieja", () => {
  const begin = latestOnly();
  const stale = begin();
  assert.equal(stale(), false);
});

test("dadas dos cargas seguidas, entonces la primera queda vieja y la segunda vale", () => {
  const begin = latestOnly();
  const first = begin();
  const second = begin();
  assert.equal(first(), true);
  assert.equal(second(), false);
});

test("una carga que ya quedó vieja sigue vieja aunque lleguen más", () => {
  const begin = latestOnly();
  const first = begin();
  begin();
  begin();
  assert.equal(first(), true);
});
