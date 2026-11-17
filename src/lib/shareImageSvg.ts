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
export function shareImageSvg(scores: SharedScore[], background = "") {
  const displayed = scores.slice(0, 3);
  const top = 540 - (displayed.length * 185 + (displayed.length - 1) * 40) / 2;
  const rows = displayed.map((player, index) => {
    const rank = scores.findIndex(score => score.score === player.score) + 1;
    const medal = ["1st", "2nd", "3rd"][rank - 1];
    const label = Array.from(player.name).slice(0, 30).join("");
    const size = label.length > 18 ? 32 : label.length > 12 ? 42 : 56;
    return `<g transform="translate(190 ${top + index * 225})"><rect width="700" height="185" rx="25" fill="#000" fill-opacity=".8"/><text x="350" y="76" text-anchor="middle" font-size="${size}" fill="#fff">${medal} ${xml(label)}</text><text x="350" y="144" text-anchor="middle" font-size="48" fill="#ffd700">${player.score} pts</text></g>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080"><rect width="1080" height="1080" fill="#2b190f"/>${background ? `<image width="1080" height="1080" href="${xml(background)}"/>` : ""}<g font-family="DM Sans" font-weight="600">${rows}</g></svg>`;
}
