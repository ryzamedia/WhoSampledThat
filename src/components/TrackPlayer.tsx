import { useEffect, useRef, useState } from "react";
import YouTube, { type YouTubePlayer } from "react-youtube";
import { Play, Pause, RotateCcw, Eye, ArrowUpRight, Disc3 } from "lucide-react";
import type { Track } from "../contexts/GameContext";
type Side = "A" | "B";
interface Props {
  track: Track;
  side: Side;
  active: Side | null;
  onActive: (side: Side) => void;
  autoplay?: boolean;
}
export default function TrackPlayer({
  track,
  side,
  active,
  onActive,
  autoplay = false,
}: Props) {
  const player = useRef<YouTubePlayer | null>(null);
  const autoplayAttempted = useRef(false);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [ended, setEnded] = useState(false);
  const [error, setError] = useState<"unavailable" | "loading" | null>(null);
  const [hint, setHint] = useState("");
  const [attempt, setAttempt] = useState(0);
  const start = track.startTime || 0;
  const duration = track.duration || 30;
  const noun = side === "A" ? "sample" : "song";
  const autoplayBlocked = useRef(() =>
    setHint("Press play to start the music."),
  );
  useEffect(() => {
    if (ready || error) return;
    const timeout = window.setTimeout(() => setError("loading"), 15000);
    return () => window.clearTimeout(timeout);
  }, [ready, error, attempt]);
  useEffect(() => {
    if (active && active !== side && playing) {
      player.current?.pauseVideo();
      setPlaying(false);
    }
  }, [active, side, playing]);
  useEffect(() => {
    if (!ready || !autoplay || autoplayAttempted.current) return;
    autoplayAttempted.current = true;
    player.current?.playVideo();
    setHint("If it stays quiet, press play.");
  }, [ready, autoplay]);
  useEffect(() => {
    if (!playing) return;
    let cancelled = false;
    const interval = window.setInterval(async () => {
      const position = await player.current?.getCurrentTime();
      if (cancelled || typeof position !== "number") return;
      const progress = Math.max(0, position - start);
      setElapsed(Math.min(duration, progress));
      if (progress >= duration) {
        player.current?.pauseVideo();
        setPlaying(false);
        setEnded(true);
      }
    }, 250);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [playing, start, duration]);
  function play(restart = false) {
    if (!player.current || !ready || error) return;
    setHint("");
    if (playing && !restart) {
      player.current.pauseVideo();
      setPlaying(false);
      return;
    }
    if (restart || ended) {
      player.current.seekTo(start, true);
      setElapsed(0);
      setEnded(false);
    }
    onActive(side);
    player.current.playVideo();
  }
  function retry() {
    player.current = null;
    setReady(false);
    setPlaying(false);
    setError(null);
    setElapsed(0);
    setEnded(false);
    autoplayAttempted.current = true;
    setAttempt((a) => a + 1);
  }
  return (
    <section
      className={`track-card side-${side}`}
      aria-labelledby={`side-${side}-heading`}
    >
      <div className="track-card-heading">
        <span className="side-badge">{side}</span>
        <div>
          <span className="eyebrow">
            {side === "A" ? "WHERE IT ALL BEGAN" : "THE FAMILIAR FACE"}
          </span>
          <h2 id={`side-${side}-heading`}>
            {side === "A" ? "The original sample" : "The song you know"}
          </h2>
        </div>
        <Disc3 size={22} />
      </div>
      <div className={`track-art ${revealed ? "is-revealed" : ""}`}>
        <div className="player-embed" aria-hidden={!revealed} inert={!revealed}>
          <YouTube
            key={attempt}
            videoId={track.youtubeVideoId}
            title={`Side ${side} music player`}
            opts={{
              width: "100%",
              height: "100%",
              playerVars: {
                controls: 1,
                playsinline: 1,
                rel: 0,
                start,
                origin: window.location.origin,
              },
            }}
            onReady={({ target }) => {
              player.current = target;
              target.addEventListener(
                "onAutoplayBlocked",
                autoplayBlocked.current,
              );
              setError(null);
              setReady(true);
            }}
            onStateChange={({ data }) => {
              if (data === 1) {
                setPlaying(true);
                setHint("");
                onActive(side);
              } else if (data === 2 || data === 0) {
                setPlaying(false);
                if (data === 0) setEnded(true);
              }
            }}
            onError={({ data }) => {
              console.warn(
                JSON.stringify({
                  event: "track_unavailable",
                  side,
                  code: data,
                }),
              );
              setError(
                [100, 101, 150, 153, 2].includes(data)
                  ? "unavailable"
                  : "loading",
              );
              setPlaying(false);
            }}
          />
        </div>
        {!revealed && (
          <div className="mystery-sleeve" aria-hidden="true">
            <span className="mystery-word">
              {side === "A" ? "the" : "who"}
              <br />
              <em>{side === "A" ? "original." : "sampled?"}</em>
            </span>
            <div className={`mini-vinyl ${playing ? "spinning" : ""}`}>
              <div>{side}</div>
            </div>
            <span className="sleeve-corner">
              {side === "A" ? "A LITTLE PIECE OF HISTORY" : "A WHOLE NEW LIFE"}
            </span>
          </div>
        )}
      </div>
      <div className="playback-row">
        <button
          className="play-button"
          onClick={() => play()}
          disabled={!ready || !!error}
          aria-label={`${playing ? "Pause" : ended ? "Replay" : "Play"} ${noun}`}
        >
          {playing ? (
            <Pause size={20} fill="currentColor" />
          ) : (
            <Play size={20} fill="currentColor" />
          )}
        </button>
        <div
          className="waveform"
          aria-label={`${Math.round(elapsed)} of ${duration} seconds`}
          role="img"
        >
          {Array.from({ length: 38 }, (_, i) => (
            <i
              key={i}
              className={i / 38 < elapsed / duration ? "heard" : ""}
              style={{ height: `${20 + ((i * 17 + i * i * 3) % 80)}%` }}
            />
          ))}
        </div>
        <span className="time-label">
          {String(Math.max(0, Math.ceil(duration - elapsed))).padStart(2, "0")}s
        </span>
        <button
          className="icon-button"
          onClick={() => play(true)}
          disabled={!ready || !!error}
          aria-label={`Restart ${noun}`}
        >
          <RotateCcw size={17} />
        </button>
      </div>
      <div className="player-message" role="status">
        {!error &&
          (!ready
            ? "Getting the record ready…"
            : hint || `${duration}-second clip · listen as often as you like`)}
      </div>
      {error && (
        <div className="player-error" role="alert">
          <p>
            {error === "unavailable"
              ? "This track can’t play here. Open it on YouTube or skip to the next round."
              : "We couldn’t load this track. Check your connection, then try again or skip this round."}
          </p>
          <div>
            {error === "loading" && attempt < 1 && (
              <button className="text-button" onClick={retry}>
                Try again <RotateCcw size={14} />
              </button>
            )}
            <a
              href={`https://www.youtube.com/watch?v=${track.youtubeVideoId}&t=${start}s`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                player.current?.pauseVideo();
                setPlaying(false);
              }}
            >
              Open on YouTube <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      )}
      <div className="answer-area">
        {revealed ? (
          <div className="revealed-answer">
            <span className="eyebrow">
              {track.artist} · {track.year}
            </span>
            <h3>{track.trackName}</h3>
          </div>
        ) : (
          <button className="reveal-button" onClick={() => setRevealed(true)}>
            <Eye size={16} />
            Reveal {side === "A" ? "the sample" : "the song"}
            <span>Got your guess?</span>
          </button>
        )}
      </div>
    </section>
  );
}
