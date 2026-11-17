import { decodeScores } from "./lib/share.ts";
import { shareImageSvg } from "./lib/shareImageSvg.ts";

const escapeHtml = (value) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ],
  );

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method !== "GET" && request.method !== "HEAD")
      return new Response("Method not allowed", {
        status: 405,
        headers: { Allow: "GET, HEAD" },
      });
    if (url.pathname.startsWith("/api/share-image/")) {
      const scores = decodeScores(
        url.pathname.slice("/api/share-image/".length),
      );
      if (!scores) return new Response("Invalid results link", { status: 400 });
      return handleShareImage(request, env, scores);
    }
    if (url.pathname.startsWith("/share/")) {
      const id = url.pathname.slice("/share/".length);
      const scores = decodeScores(id);
      const homepage = await env.ASSETS.fetch(
        new Request(new URL("/", url), request),
      );
      if (!homepage.ok || !scores) return homepage;
      // This is our own, bounded index.html asset, not an arbitrary remote body.
      let html = await homepage.text();
      const title = "Who Sampled That? — The results are in.";
      const description = scores
        .slice(0, 3)
        .map((p) => `${p.name}: ${p.score} pts`)
        .join(" · ");
      const canonical = `${url.origin}/share/${id}`;
      const image = `${url.origin}/api/share-image/${id}`;
      html = html
        .replace(
          /<meta\s+(?:property|name)="(?:og:|twitter:)[^"]*"[^>]*>/gi,
          "",
        )
        .replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`)
        .replace(
          /<link rel="canonical"[^>]*>/i,
          `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
        );
      const metadata = `<meta property="og:type" content="website" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:url" content="${escapeHtml(canonical)}" />
<meta property="og:image" content="${escapeHtml(image)}" />
<meta property="og:image:width" content="1080" />
<meta property="og:image:height" content="1080" />
<meta property="og:image:alt" content="Who Sampled That game results" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:image" content="${escapeHtml(image)}" />`;
      html = html.replace("</head>", `${metadata}</head>`);
      return new Response(request.method === "HEAD" ? null : html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=300",
          "X-Content-Type-Options": "nosniff",
          "Referrer-Policy": "strict-origin-when-cross-origin",
        },
      });
    }
    return env.ASSETS.fetch(request);
  },
};

async function handleShareImage(request, env, scores) {
  try {
    const [font, background] = await Promise.all([
      env.ASSETS.fetch(new Request(new URL("/fonts/share-sans.ttf", request.url))),
      env.ASSETS.fetch(new Request(new URL("/social-share-card-base-square.png", request.url))),
    ]);
    if (!font.ok || !background.ok) throw new Error("Share assets unavailable");
    const backgroundBytes = new Uint8Array(await background.arrayBuffer());
    let binary = "";
    for (let i = 0; i < backgroundBytes.length; i += 8192) {
      binary += String.fromCharCode(...backgroundBytes.subarray(i, i + 8192));
    }
    const backgroundUrl = `data:image/png;base64,${btoa(binary)}`;
    const { renderShareImage } = await import("./lib/renderShareImage.js");
    const bytes = await renderShareImage(
      shareImageSvg(scores, backgroundUrl),
      await font.arrayBuffer(),
    );
    return new Response(request.method === "HEAD" ? null : bytes, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    console.warn(JSON.stringify({ event: "share_image_fallback" }));
    const fallback = await env.ASSETS.fetch(
      new Request(new URL("/social-share-card-normal.png", request.url)),
    );
    return new Response(request.method === "HEAD" ? null : fallback.body, {
      status: fallback.status,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=300",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }
}
