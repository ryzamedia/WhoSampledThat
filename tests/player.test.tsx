import { act, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import TrackPlayer from "../src/components/TrackPlayer";
const boundary = vi.hoisted(() => ({
  props: {} as Record<string, (event: unknown) => void>,
}));
vi.mock("react-youtube", () => ({
  default: (props: Record<string, (event: unknown) => void>) => {
    boundary.props = props;
    return <div data-testid="youtube-player" />;
  },
}));
const track = {
  artist: "The Chi-Lites",
  trackName: "Are You My Woman",
  year: 1970,
  youtubeVideoId: "IEZAC9B7MFQ",
  startTime: 10,
  duration: 15,
};
const player = () => ({
  playVideo: vi.fn(),
  pauseVideo: vi.fn(),
  seekTo: vi.fn(),
  getCurrentTime: vi.fn().mockReturnValue(10),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
});
afterEach(() => vi.useRealTimers());
it("bounds playback to the excerpt and restarts from its start", async () => {
  vi.useFakeTimers();
  render(
    <TrackPlayer track={track} side="A" active={null} onActive={() => {}} />,
  );
  expect(screen.getByRole("button", { name: "Play sample" })).toBeTruthy();
  const api = player();
  act(() => boundary.props.onReady({ target: api }));
  fireEvent.click(screen.getByRole("button", { name: "Play sample" }));
  expect(api.playVideo).toHaveBeenCalledTimes(1);
  api.getCurrentTime.mockReturnValue(25);
  act(() => boundary.props.onStateChange({ data: 1, target: api }));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(500);
  });
  expect(api.pauseVideo).toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Replay sample" }));
  expect(api.seekTo).toHaveBeenLastCalledWith(10, true);
});
it("provides a useful fallback when an embedded track is unavailable", () => {
  render(
    <TrackPlayer track={track} side="A" active={null} onActive={() => {}} />,
  );
  expect(screen.getByRole("button", { name: "Play sample" })).toBeTruthy();
  act(() => boundary.props.onError({ data: 150 }));
  expect(screen.getByRole("alert").textContent).toContain("can’t play here");
  expect(
    screen.getByRole("link", { name: /Open on YouTube/ }).getAttribute("href"),
  ).toContain("IEZAC9B7MFQ");
  expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
});
it("does not start or seek playback just because a player has loaded", () => {
  render(
    <TrackPlayer track={track} side="A" active={null} onActive={() => {}} />,
  );
  const api = player();
  act(() => boundary.props.onReady({ target: api }));
  expect(api.playVideo).not.toHaveBeenCalled();
  expect(api.seekTo).not.toHaveBeenCalled();
});
