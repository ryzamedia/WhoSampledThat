import tracklist from "../data/tracklist.json";
export type Theme = "auto" | "classic" | "christmas" | "new-year" | "halloween";
export type ScoreCategory = "artist" | "track" | "sample";
export interface Player {
  id: number;
  name: string;
  score: number;
}
export interface GameSettings {
  jingleEnabled: boolean;
  autoPlayEnabled: boolean;
  theme: Theme;
}
export type RoundScores = Record<
  number,
  Record<number, Partial<Record<ScoreCategory, boolean>>>
>;
export interface PersistedGameState {
  version?: 2;
  players: Player[];
  gamePhase: "setup" | "playing" | "summary";
  currentRound: number;
  settings: GameSettings;
  roundScores?: RoundScores;
}
export const defaultSettings: GameSettings = {
  jingleEnabled: true,
  autoPlayEnabled: false,
  theme: "auto",
};
export const emptyGame = (): PersistedGameState => ({
  version: 2,
  players: [],
  gamePhase: "setup",
  currentRound: 0,
  settings: { ...defaultSettings },
  roundScores: {},
});
const STORAGE_KEY = "whoSampledThatGame";
export const themes: Theme[] = [
  "auto",
  "classic",
  "christmas",
  "new-year",
  "halloween",
];
export function saveGameState(state: PersistedGameState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
function validLedger(value: unknown, players: Player[]): RoundScores {
  const result: RoundScores = {};
  if (!value || typeof value !== "object") return result;
  for (let round = 1; round <= tracklist.length; round++) {
    const entries = (value as RoundScores)[round];
    if (!entries || typeof entries !== "object") continue;
    result[round] = {};
    for (const player of players) {
      const scores = entries[player.id];
      if (scores && typeof scores === "object") {
        result[round][player.id] = {
          artist: scores.artist === true,
          track: scores.track === true,
          sample: scores.sample === true,
        };
      }
    }
  }
  return result;
}
export function loadGameState(): PersistedGameState | null {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (
      !saved ||
      !Array.isArray(saved.players) ||
      saved.players.length > 12 ||
      !["setup", "playing", "summary"].includes(saved.gamePhase) ||
      !Number.isInteger(saved.currentRound) ||
      saved.currentRound < 0 ||
      saved.currentRound > tracklist.length ||
      (saved.gamePhase !== "setup" &&
        (!saved.players.length || saved.currentRound < 1))
    )
      return null;
    const ids = new Set<number>();
    for (const player of saved.players) {
      if (
        !player ||
        !Number.isSafeInteger(player.id) ||
        ids.has(player.id) ||
        typeof player.name !== "string" ||
        !player.name.trim() ||
        player.name.length > 50 ||
        !Number.isInteger(player.score) ||
        player.score < 0 ||
        player.score > 999
      )
        return null;
      ids.add(player.id);
    }
    let ledger = saved.roundScores;
    if (!ledger && saved.version !== 2) {
      try {
        ledger = JSON.parse(
          localStorage.getItem("whoSampledThatRoundScores") || "{}",
        );
      } catch {
        ledger = {};
      }
    }
    return {
      version: 2,
      players: saved.players,
      gamePhase: saved.gamePhase,
      currentRound: saved.currentRound,
      roundScores: validLedger(ledger, saved.players),
      settings: {
        jingleEnabled:
          typeof saved.settings?.jingleEnabled === "boolean"
            ? saved.settings.jingleEnabled
            : defaultSettings.jingleEnabled,
        autoPlayEnabled:
          typeof saved.settings?.autoPlayEnabled === "boolean"
            ? saved.settings.autoPlayEnabled
            : defaultSettings.autoPlayEnabled,
        theme: themes.includes(saved.settings?.theme)
          ? saved.settings.theme
          : "auto",
      },
    };
  } catch {
    return null;
  }
}

export function saveTutorialState(completed: boolean) {
  try { localStorage.setItem('whoSampledThatTutorial', JSON.stringify({ hasCompletedTutorial: completed })); } catch { /* Optional preference. */ }
}
export function loadTutorialState(): boolean {
  try { return JSON.parse(localStorage.getItem('whoSampledThatTutorial') || 'null')?.hasCompletedTutorial === true; } catch { return false; }
}
