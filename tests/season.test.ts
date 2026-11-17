import { expect, it } from "vitest";
import { getSeason } from "../src/lib/season";
it.each([
  [2026, 10, 17, "classic"],
  [2026, 11, 1, "christmas"],
  [2026, 11, 25, "christmas"],
  [2026, 11, 30, "christmas"],
  [2026, 11, 31, "new-year"],
  [2027, 0, 5, "new-year"],
  [2027, 0, 6, "classic"],
  [2026, 9, 15, "halloween"],
  [2026, 9, 31, "halloween"],
  [2026, 10, 1, "classic"],
])(
  "selects the right seasonal accent on %i/%i/%i",
  (year, month, day, theme) => {
    expect(
      getSeason(new Date(year as number, month as number, day as number)),
    ).toBe(theme);
  },
);
it("lets people preview a season or turn seasonal accents off", () => {
  expect(getSeason(new Date(2026, 10, 17), "christmas")).toBe("christmas");
  expect(getSeason(new Date(2026, 11, 25), "classic")).toBe("classic");
});
