import { describe, expect, it, vi } from "vitest";
import {
  loadGameState,
  saveGameState,
  defaultSettings,
} from "../src/lib/gameStorage";
describe("saved games", () => {
  it.each([
    {},
    [],
    { players: "oops" },
    {
      players: [{ id: 1, name: "A", score: -4 }],
      gamePhase: "playing",
      currentRound: 500,
      settings: {},
    },
  ])("rejects malformed state %j without crashing", (value) => {
    localStorage.setItem("whoSampledThatGame", JSON.stringify(value));
    expect(loadGameState()).toBeNull();
  });
  it("reports a failed save instead of claiming progress was saved", () => {
    const spy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("quota");
      });
    expect(
      saveGameState({
        players: [],
        currentRound: 0,
        gamePhase: "setup",
        settings: defaultSettings,
      }),
    ).toBe(false);
    spy.mockRestore();
  });
});
