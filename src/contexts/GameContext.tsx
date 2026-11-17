import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import tracklist from "../data/tracklist.json";
import {
  emptyGame,
  loadGameState,
  saveGameState,
  loadTutorialState,
  saveTutorialState,
  type PersistedGameState,
  type GameSettings,
  type ScoreCategory,
} from "../lib/gameStorage";
export interface Track {
  artist: string;
  trackName: string;
  year: number;
  youtubeVideoId: string;
  startTime?: number;
  duration?: number;
}
const tracks: Array<{ originalSample: Track; newSong: Track }> = tracklist;
type Action =
  | { type: "add"; name: string }
  | { type: "remove"; id: number }
  | { type: "award"; id: number; points: number }
  | { type: "toggle"; id: number; category: ScoreCategory }
  | { type: "start" | "end" | "next" | "previous" | "reset" | "zero" }
  | { type: "settings"; settings: Partial<GameSettings> };
function reducer(
  state: PersistedGameState,
  action: Action,
): PersistedGameState {
  switch (action.type) {
    case "add": {
      const name = action.name.trim().slice(0, 30);
      if (
        state.gamePhase !== "setup" ||
        !name ||
        state.players.length >= 12 ||
        state.players.some(
          (p) => p.name.toLocaleLowerCase() === name.toLocaleLowerCase(),
        )
      )
        return state;
      return {
        ...state,
        players: [
          ...state.players,
          {
            id: Math.max(0, ...state.players.map((p) => p.id)) + 1,
            name,
            score: 0,
          },
        ],
      };
    }
    case "remove":
      return state.gamePhase === "setup"
        ? { ...state, players: state.players.filter((p) => p.id !== action.id) }
        : state;
    case "award":
      return {
        ...state,
        players: state.players.map((p) =>
          p.id === action.id
            ? {
                ...p,
                score: Math.max(0, Math.min(999, p.score + action.points)),
              }
            : p,
        ),
      };
    case "toggle": {
      if (
        state.gamePhase !== "playing" ||
        !state.players.some((p) => p.id === action.id)
      )
        return state;
      const round = state.roundScores?.[state.currentRound] || {};
      const scores = round[action.id] || {};
      const selected = !scores[action.category];
      return {
        ...state,
        roundScores: {
          ...state.roundScores,
          [state.currentRound]: {
            ...round,
            [action.id]: { ...scores, [action.category]: selected },
          },
        },
        players: state.players.map((p) =>
          p.id === action.id
            ? { ...p, score: Math.max(0, p.score + (selected ? 1 : -1)) }
            : p,
        ),
      };
    }
    case "zero": return { ...state, players: state.players.map(p => ({ ...p, score: 0 })), roundScores: {} };
    case "start":
      return state.players.length
        ? {
            ...state,
            gamePhase: "playing",
            currentRound: 1,
            roundScores: {},
            players: state.players.map((p) => ({ ...p, score: 0 })),
          }
        : state;
    case "end":
      return state.gamePhase === "playing"
        ? { ...state, gamePhase: "summary" }
        : state;
    case "next":
      return state.gamePhase === "playing"
        ? {
            ...state,
            currentRound: Math.min(tracklist.length, state.currentRound + 1),
            gamePhase:
              state.currentRound === tracklist.length ? "summary" : "playing",
          }
        : state;
    case "previous":
      return state.gamePhase === "playing"
        ? { ...state, currentRound: Math.max(1, state.currentRound - 1) }
        : state;
    case "reset":
      return { ...emptyGame(), settings: state.settings };
    case "settings":
      return { ...state, settings: { ...state.settings, ...action.settings } };
  }
}
function useGameState() {
  const [state, dispatch] = useReducer(
    reducer,
    undefined,
    () => loadGameState() || emptyGame(),
  );
  const [tutorialCompleted, setTutorialCompleted] = useState(loadTutorialState);
  const markTutorialCompleted = useCallback(() => { setTutorialCompleted(true); saveTutorialState(true); }, []);
  const restartTutorial = useCallback(() => { setTutorialCompleted(false); saveTutorialState(false); }, []);
  const [saveFailed, setSaveFailed] = useState(false);
  useEffect(() => {
    setSaveFailed(!saveGameState(state));
  }, [state]);
  return {
    ...state,
    saveFailed,
    tutorialCompleted,
    isFirstTimeUser: !tutorialCompleted,
    markTutorialCompleted,
    skipTutorial: markTutorialCompleted,
    restartTutorial,
    resetScores: () => dispatch({ type: "zero" }),
    totalRounds: tracklist.length,
    currentTrack: tracks[state.currentRound - 1] || null,
    addPlayer: (name: string) => dispatch({ type: "add", name }),
    removePlayer: (id: number) => dispatch({ type: "remove", id }),
    awardPoints: (id: number, points: number) =>
      dispatch({ type: "award", id, points }),
    togglePoint: (id: number, category: ScoreCategory) =>
      dispatch({ type: "toggle", id, category }),
    startGame: () => {
      if (state.players.length) {
        dispatch({ type: "start" });
      }
    },
    endGame: () => dispatch({ type: "end" }),
    nextRound: () => dispatch({ type: "next" }),
    previousRound: () => dispatch({ type: "previous" }),
    resetGame: () => dispatch({ type: "reset" }),
    updateSettings: (settings: Partial<GameSettings>) =>
      dispatch({ type: "settings", settings }),
  };
}
const GameContext = createContext<ReturnType<typeof useGameState> | undefined>(
  undefined,
);
export function GameProvider({ children }: { children: ReactNode }) {
  return (
    <GameContext.Provider value={useGameState()}>
      {children}
    </GameContext.Provider>
  );
}
// Kept alongside the provider so all consumers share the same context.
// eslint-disable-next-line react-refresh/only-export-components
export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within GameProvider");
  return context;
}
