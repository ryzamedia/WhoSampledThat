import { expect, it } from "vitest";
import worker from "../src/worker.js";
import { encodeScores } from "../src/lib/share";
const env = {
  ASSETS: {
    fetch: async () =>
      new Response(
        '<html><head><title>Original</title><meta property="og:title" content="Original" /></head><body><div id="root"></div></body></html>',
        { headers: { "Content-Type": "text/html" } },
      ),
  },
};
it("renders Unicode shared scores in crawler metadata", async () => {
  const id = encodeScores([{ name: "Beyoncé 🎄", score: 5 }]);
  const response = await worker.fetch(
    new Request(`https://whosampledthat.com/share/${id}`),
    env,
  );
  const html = await response.text();
  expect(html).toContain("Beyoncé 🎄");
  expect(html).toContain("5 pts");
  expect((html.match(/property="og:title"/g) || []).length).toBe(1);
});
it("escapes names and removes query strings from share metadata URLs", async () => {
  const id = encodeScores([{ name: '<script>"&', score: 1 }]);
  const response = await worker.fetch(
    new Request(`https://whosampledthat.com/share/${id}?x="onload="oops`),
    env,
  );
  const html = await response.text();
  expect(html).toContain("&lt;script&gt;&quot;&amp;");
  expect(html).not.toContain("onload=");
});
it("rejects invalid social images without running image generation", async () => {
  const response = await worker.fetch(
    new Request("https://whosampledthat.com/api/share-image/!!!"),
    env,
  );
  expect(response.status).toBe(400);
});
