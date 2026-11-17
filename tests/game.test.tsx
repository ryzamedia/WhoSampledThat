import { StrictMode } from "react";
import { act, renderHook } from "@testing-library/react";
import { expect, it } from "vitest";
import { GameProvider, useGame } from "../src/contexts/GameContext";
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <StrictMode>
    <GameProvider>{children}</GameProvider>
  </StrictMode>
);
it("starts a fresh replay with zero points", () => {
  const { result } = renderHook(useGame, { wrapper });
  act(() => result.current.addPlayer("Daniel"));
  act(() => result.current.startGame());
  act(() => result.current.awardPoints(result.current.players[0].id, 3));
  act(() => result.current.endGame());
  act(() => result.current.startGame());
  expect(result.current.players[0].score).toBe(0);
});
it("does not add duplicate names with different spaces or case", () => {
  const { result } = renderHook(useGame, { wrapper });
  act(() => result.current.addPlayer("Daniel"));
  act(() => result.current.addPlayer(" daniel "));
  expect(result.current.players).toHaveLength(1);
});
it("awards one point per selection in StrictMode and remembers each round", () => {
  const { result, unmount } = renderHook(useGame, { wrapper });
  act(() => result.current.addPlayer("Julia"));
  act(() => result.current.startGame());
  const id = result.current.players[0].id;
  act(() => result.current.togglePoint(id, "artist"));
  expect(result.current.players[0].score).toBe(1);
  act(() => result.current.nextRound());
  act(() => result.current.togglePoint(id, "sample"));
  act(() => result.current.previousRound());
  expect(result.current.roundScores?.[1][id].artist).toBe(true);
  act(() => result.current.togglePoint(id, "artist"));
  expect(result.current.players[0].score).toBe(1);
  unmount();
  const resumed = renderHook(useGame, { wrapper });
  expect(resumed.result.current.players[0].score).toBe(1);
  act(() => resumed.result.current.startGame());
  expect(resumed.result.current.roundScores).toEqual({});
});
