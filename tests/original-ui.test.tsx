import { StrictMode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import App from '../src/App';
import { encodeScores } from '../src/lib/share';
import tracklist from '../src/data/tracklist.json';
const boundary = vi.hoisted(() => ({ players: {} as Record<string, Record<string, (event: unknown) => void>> }));
vi.mock('react-youtube', () => ({ default: (props: Record<string, unknown>) => { boundary.players[props.videoId as string] = props as Record<string, (event: unknown) => void>; return <div data-testid="youtube-player" />; } }));
beforeEach(() => {
  localStorage.setItem('whoSampledThatTutorial', JSON.stringify({hasCompletedTutorial:true}));
  Object.defineProperty(window, 'matchMedia', { configurable: true, value: vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })) });
});
afterEach(() => vi.useRealTimers());
it('keeps the approved branding and lets the original screens complete a game', async () => {
  const user = userEvent.setup();
  render(<StrictMode><App /></StrictMode>);
  expect(screen.getByRole('heading', {name:'The Ultimate Music Party Game'})).toBeTruthy();
  expect(screen.getByAltText('Who Sampled That - The Ultimate Music Party Game')).toBeTruthy();
  await user.type(screen.getByLabelText('Player Name'), 'Daniel');
  await user.click(screen.getByRole('button',{name:'Add Player'}));
  await user.click(screen.getByRole('button',{name:'Start Game with 1 Player'}));
  expect(screen.getAllByTestId('youtube-player')).toHaveLength(2);
  await user.click(screen.getAllByLabelText('Daniel: New artist')[0]);
  expect(screen.getAllByLabelText('Daniel: New artist').every(button => button.getAttribute('aria-pressed') === 'true')).toBe(true);
  expect(JSON.parse(localStorage.getItem('whoSampledThatGame')!).players[0].score).toBe(1);
  await user.click(screen.getAllByRole('button',{name:'Next round'})[0]);
  await user.click(screen.getAllByRole('button',{name:'Previous round'})[0]);
  expect(screen.getAllByLabelText('Daniel: New artist')[0].getAttribute('aria-pressed')).toBe('true');
  await user.click(screen.getByRole('button',{name:'End Game'}));
  await user.click(screen.getByRole('button',{name:'Yes, End Game'}));
  expect(screen.getByRole('heading',{name:'Final Scores'})).toBeTruthy();
  await user.click(screen.getByRole('button',{name:/Play Again/}));
  expect(screen.getAllByLabelText('Daniel: New artist')[0].getAttribute('aria-pressed')).toBe('false');
});
it('uses the calendar despite an old theme preference and removes the theme picker', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 11, 25, 12));
  localStorage.setItem('whoSampledThatGame', JSON.stringify({players:[],gamePhase:'setup',currentRound:0,settings:{theme:'halloween'}}));
  render(<App />);
  expect(document.documentElement.dataset.season).toBe('christmas');
  fireEvent.click(screen.getByRole('button',{name:'Game settings'}));
  expect(screen.queryByRole('combobox')).toBeNull();
  expect(screen.queryByLabelText('Festive accents')).toBeNull();
  expect(screen.getByRole('heading',{name:'The Ultimate Music Party Game'})).toBeTruthy();
  expect(screen.getByAltText('Who Sampled That - The Ultimate Music Party Game')).toBeTruthy();
});
it('lets players pause background motion without changing the automatic season', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 11, 25, 12));
  render(<App />);
  fireEvent.click(screen.getByRole('button',{name:'Game settings'}));
  fireEvent.click(screen.getByRole('switch',{name:'Animate background'}));
  expect(document.documentElement.dataset.motion).toBe('paused');
  expect(document.documentElement.dataset.season).toBe('christmas');
  expect(JSON.parse(localStorage.getItem('whoSampledThatGame')!).settings.motionEnabled).toBe(false);
});
it('opens shared results without overwriting the saved guest list', () => {
  localStorage.setItem('whoSampledThatGame',JSON.stringify({players:[{id:1,name:'Local player',score:0}],gamePhase:'setup',currentRound:0,settings:{}}));
  window.history.replaceState({},'','/share/'+encodeScores([{name:'Beyoncé 🎄',score:8}]));
  render(<App />);
  expect(screen.getByRole('heading',{name:'Beyoncé 🎄'})).toBeTruthy();
  expect(JSON.parse(localStorage.getItem('whoSampledThatGame')!).players[0].name).toBe('Local player');
});
it('uses media time for the sample limit and ignores the other player’s pause event', async () => {
  vi.useFakeTimers();
  localStorage.setItem('whoSampledThatGame',JSON.stringify({players:[{id:1,name:'Listener',score:0}],gamePhase:'playing',currentRound:1,settings:{jingleEnabled:false,autoPlayEnabled:false}}));
  render(<App />);
  const api = { playVideo: vi.fn(), pauseVideo: vi.fn(), seekTo: vi.fn(), getCurrentTime: vi.fn().mockReturnValue(15), addEventListener: vi.fn() };
  const id = tracklist[0].originalSample.youtubeVideoId;
  const other = tracklist[0].newSong.youtubeVideoId;
  act(() => { boundary.players[id].onReady({target:api}); boundary.players[other].onReady({target:{...api, pauseVideo:vi.fn()}}); boundary.players[id].onStateChange({data:1}); });
  await act(async () => { await vi.advanceTimersByTimeAsync(500); });
  expect(api.pauseVideo).toHaveBeenCalled();
  act(() => { boundary.players[other].onStateChange({data:1}); boundary.players[id].onStateChange({data:2}); });
  expect(screen.getAllByLabelText('Pause new')).toHaveLength(2);
});
it('lets the complete jingle finish before autoplaying the original sample', async () => {
  vi.useFakeTimers();
  localStorage.setItem('whoSampledThatGame', JSON.stringify({
    players: [{id:1,name:'Listener',score:0}], gamePhase:'playing', currentRound:1,
    settings: {jingleEnabled:true,autoPlayEnabled:true},
  }));
  const { container, unmount } = render(<StrictMode><App /></StrictMode>);
  const audio = container.querySelector('audio')!;
  const pause = vi.spyOn(audio, 'pause').mockClear();
  const api = { playVideo: vi.fn(), pauseVideo: vi.fn(), seekTo: vi.fn(), getCurrentTime: vi.fn().mockReturnValue(0), addEventListener: vi.fn() };
  act(() => boundary.players[tracklist[0].originalSample.youtubeVideoId].onReady({target:api}));

  // The actual jingle is ~11 seconds; buffering must not shorten it either.
  await act(async () => { await vi.advanceTimersByTimeAsync(12000); });
  expect(pause).not.toHaveBeenCalled();
  expect(api.playVideo).not.toHaveBeenCalled();

  fireEvent.ended(audio);
  expect(api.playVideo).toHaveBeenCalledTimes(1);
  unmount();
  expect(pause).toHaveBeenCalledTimes(1);
});
it('makes point toggles reversible and labels the final round action as results', () => {
  localStorage.setItem('whoSampledThatGame', JSON.stringify({players:[{id:1,name:'Listener',score:0}],gamePhase:'playing',currentRound:tracklist.length,settings:{jingleEnabled:false,autoPlayEnabled:false}}));
  render(<App />);
  const artist = screen.getByRole('button',{name:'Listener: New artist'});
  expect(artist.textContent).toContain('+1');
  fireEvent.click(artist);
  expect(artist.getAttribute('aria-pressed')).toBe('true');
  expect(artist.textContent).toContain('1 point');
  expect(screen.getByText('This round: 1 / 3')).toBeTruthy();
  fireEvent.click(artist);
  expect(artist.getAttribute('aria-pressed')).toBe('false');
  expect(screen.getByText('This round: 0 / 3')).toBeTruthy();
  fireEvent.click(screen.getAllByRole('button',{name:'See results'})[0]);
  expect(screen.getByRole('heading',{name:'Final Scores'})).toBeTruthy();
});
