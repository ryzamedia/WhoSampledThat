import { StrictMode } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import App from "../src/App";
import { encodeScores } from "../src/lib/share";
vi.mock("react-youtube", () => ({
  default: () => <div data-testid="youtube-player" />,
}));
it("takes players through a game, corrects points, and clears selections on replay", async () => {
  const user = userEvent.setup();
  render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  await user.type(screen.getByLabelText("Player name"), "Daniel");
  await user.click(screen.getByRole("button", { name: "Add player" }));
  await user.click(screen.getByRole("button", { name: /Drop the needle/ }));
  expect(screen.getAllByTestId("youtube-player")).toHaveLength(2);
  await user.click(screen.getByRole("button", { name: "Daniel: artist" }));
  expect(
    screen
      .getByRole("button", { name: "Daniel: artist" })
      .getAttribute("aria-pressed"),
  ).toBe("true");
  expect(screen.getByLabelText("Daniel: 1 point")).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Next round" }));
  await user.click(screen.getByRole("button", { name: "Previous round" }));
  expect(
    screen
      .getByRole("button", { name: "Daniel: artist" })
      .getAttribute("aria-pressed"),
  ).toBe("true");
  await user.click(screen.getByRole("button", { name: "Finish game" }));
  await user.click(
    within(screen.getByRole("dialog")).getByRole("button", {
      name: "See the results",
    }),
  );
  expect(
    screen.getByRole("heading", { name: "Daniel takes the crown." }),
  ).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Play again" }));
  expect(
    screen
      .getByRole("button", { name: "Daniel: artist" })
      .getAttribute("aria-pressed"),
  ).toBe("false");
  expect(screen.getByLabelText("Daniel: 0 points")).toBeTruthy();
});
it("shows shared scores without replacing a saved game", () => {
  const saved = {
    players: [{ id: 1, name: "Local player", score: 0 }],
    gamePhase: "setup",
    currentRound: 0,
    settings: {},
  };
  localStorage.setItem("whoSampledThatGame", JSON.stringify(saved));
  window.history.replaceState(
    {},
    "",
    "/share/" + encodeScores([{ name: "Beyoncé 🎄", score: 8 }]),
  );
  render(<App />);
  expect(
    screen.getByRole("heading", { name: "Beyoncé 🎄 takes the crown." }),
  ).toBeTruthy();
  expect(
    JSON.parse(localStorage.getItem("whoSampledThatGame")!).players[0].name,
  ).toBe("Local player");
});
it("previews Christmas from settings and keeps the choice after reload", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: "Settings" }));
  fireEvent.change(screen.getByLabelText("Seasonal accents"), {
    target: { value: "christmas" },
  });
  expect(document.querySelector('[data-season="christmas"]')).toBeTruthy();
  expect(
    JSON.parse(localStorage.getItem("whoSampledThatGame")!).settings.theme,
  ).toBe("christmas");
});
it("returns to the top of the game when moving to another round", async () => {
  localStorage.setItem(
    "whoSampledThatGame",
    JSON.stringify({
      players: [{ id: 1, name: "Listener", score: 0 }],
      gamePhase: "playing",
      currentRound: 2,
      settings: { jingleEnabled: false },
    }),
  );
  const scroll = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  render(<App />);
  scroll.mockClear();
  await userEvent.click(screen.getByRole("button", { name: "Next round" }));
  expect(scroll).toHaveBeenCalledWith({ top: 0, behavior: "instant" });
  scroll.mockClear();
});
it("updates the page title when leaving shared results", async () => {
  window.history.replaceState({}, "", "/share/SnVsaWE6MTAsRGFuaWVsOjA");
  render(<App />);
  await userEvent.click(
    screen.getByRole("button", { name: "Your listening party" }),
  );
  expect(document.title).toBe("Who Sampled That? — The music party game");
});
it("does not replay the opening jingle when revisiting round one", async () => {
  localStorage.setItem(
    "whoSampledThatGame",
    JSON.stringify({
      players: [{ id: 1, name: "Listener", score: 0 }],
      gamePhase: "playing",
      currentRound: 2,
      settings: { jingleEnabled: true },
    }),
  );
  vi.mocked(HTMLMediaElement.prototype.play).mockClear();
  render(<App />);
  await userEvent.click(screen.getByRole("button", { name: "Previous round" }));
  expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
});
