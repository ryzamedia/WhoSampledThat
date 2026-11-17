import { expect, it } from "vitest";
import { shareImageSvg } from "../src/lib/shareImageSvg";
it("renders player names as plain XML text, never SVG markup", () => {
  const name = '<script>"&</script>';
  const svg = shareImageSvg([{ name, score: 5 }]);
  const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
  expect(doc.querySelector("parsererror")).toBeNull();
  expect(doc.querySelector("script")).toBeNull();
  expect(doc.documentElement.textContent).toContain(name);
  expect(doc.documentElement.textContent).toContain("5 pts");
});
