import { expect, it } from "vitest";
import { decodeScores, encodeScores } from "../src/lib/share";
it("round trips Unicode and punctuation without breaking names", () => {
  const scores = [
    { name: "Beyoncé 🎄, DJ:1", score: 5 },
    { name: "山田", score: 5 },
  ];
  expect(decodeScores(encodeScores(scores))).toEqual(scores);
});
it("reads old links", () => {
  expect(decodeScores("SnVsaWE6MTAsRGFuaWVsOjA")).toEqual([
    { name: "Julia", score: 10 },
    { name: "Daniel", score: 0 },
  ]);
});
it.each([
  "../x",
  "!!",
  "",
  btoa("A:4oops"),
  btoa("A:-1"),
  btoa("A:10000"),
  btoa("A:1,B:nope"),
])("rejects invalid links %s", (id) => {
  expect(decodeScores(id)).toBeNull();
});
