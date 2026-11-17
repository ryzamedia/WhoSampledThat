export interface SharedScore {
  name: string;
  score: number;
}
export function encodeScores(scores: SharedScore[]): string {
  const bytes = new TextEncoder().encode(
    JSON.stringify(scores.map(({ name, score }) => ({ name, score }))),
  );
  return btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(""))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
export function decodeScores(id: string): SharedScore[] | null {
  try {
    if (!id || id.length > 5000 || !/^[A-Za-z0-9_-]+$/.test(id)) return null;
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(
      Uint8Array.from(atob(id.replace(/-/g, "+").replace(/_/g, "/")), (c) =>
        c.charCodeAt(0),
      ),
    );
    const scores: unknown = decoded.startsWith("[")
      ? JSON.parse(decoded)
      : decoded.split(",").map((pair) => {
          const match = pair.match(/^(.+):(\d+)$/);
          return match ? { name: match[1], score: Number(match[2]) } : null;
        });
    if (
      !Array.isArray(scores) ||
      !scores.length ||
      scores.length > 12 ||
      scores.some(
        (p) =>
          !p ||
          typeof p.name !== "string" ||
          !p.name.trim() ||
          p.name.length > 50 ||
          !Number.isInteger(p.score) ||
          p.score < 0 ||
          p.score > 999,
      )
    )
      return null;
    return scores
      .map((p) => ({ name: p.name, score: p.score }))
      .sort((a, b) => b.score - a.score);
  } catch {
    return null;
  }
}
