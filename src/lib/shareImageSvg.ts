import type { SharedScore } from "./share";
function xml(value: string) {
  return Array.from(value)
    .filter((c) => (c.codePointAt(0) || 0) >= 32)
    .join("")
    .replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&apos;",
        })[c]!,
    );
}
export function shareImageSvg(scores: SharedScore[]) {
  const rows = scores
    .slice(0, 3)
    .map((p, i) => {
      const rank = scores.findIndex((s) => s.score === p.score) + 1;
      const label = Array.from(p.name).slice(0, 30).join("");
      return `<g transform="translate(65 ${230 + i * 94})"><rect width="1070" height="83" rx="3" fill="${rank === 1 ? "#dbe1d1" : "#fffcf5"}"/><text x="22" y="52" fill="#ac442a" font-size="22">${String(rank).padStart(2, "0")}</text><text x="85" y="54" font-size="36">${xml(label)}</text><text x="1040" y="54" text-anchor="end" font-size="34">${p.score} pts</text></g>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#f5f2e9"/><g font-family="DM Sans" font-weight="600" fill="#282b25"><text x="65" y="77" font-size="22" letter-spacing="3" fill="#ac442a">WHO SAMPLED THAT?</text><text x="65" y="168" font-size="70">The final cut.</text><g transform="translate(1070 125)" fill="none" stroke="#ac442a"><circle r="48" stroke-width="3"/><circle r="35"/><circle r="25"/><circle r="8" stroke-width="3"/></g>${rows}<path d="M65 555h1070" stroke="#dad9ca"/><text x="65" y="595" font-size="18" fill="#686b5f">Good music. Great company.</text><text x="1135" y="595" text-anchor="end" font-size="18" fill="#686b5f">whosampledthat.com</text></g></svg>`;
}
