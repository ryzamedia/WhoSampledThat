import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Plus, Flag, Music2 } from "lucide-react";
import { useGame } from "../contexts/GameContext";
import TrackPlayer from "../components/TrackPlayer";
import type { ScoreCategory } from "../lib/gameStorage";
import jingle from "../assets/who sample that jingle.mp3";
export default function GameRound({ onFinish }: { onFinish: () => void }) {
  const {
    players,
    currentRound,
    currentTrack,
    totalRounds,
    roundScores,
    togglePoint,
    nextRound,
    previousRound,
    settings,
    introPending,
    acknowledgeIntro,
  } = useGame();
  const [active, setActive] = useState<"A" | "B" | null>(null);
  const [playJingle] = useState(settings.jingleEnabled && introPending);
  const [introReady, setIntroReady] = useState(!playJingle);
  const intro = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    acknowledgeIntro();
    if (!playJingle) return;
    const audio = new Audio(jingle);
    intro.current = audio;
    audio.volume = 0.45;
    let cancelled = false;
    const done = () => {
      if (!cancelled) setIntroReady(true);
    };
    audio.addEventListener("ended", done);
    audio.addEventListener("error", done);
    const timeout = window.setTimeout(() => {
      audio.pause();
      done();
    }, 8000);
    audio.play()?.catch(done);
    return () => {
      cancelled = true;
      audio.pause();
      audio.removeEventListener("ended", done);
      audio.removeEventListener("error", done);
      window.clearTimeout(timeout);
    };
  }, [playJingle, acknowledgeIntro]);
  function onActive(side: "A" | "B") {
    intro.current?.pause();
    setActive(side);
  }
  if (!currentTrack) return null;
  const categories: { key: ScoreCategory; label: string }[] = [
    { key: "artist", label: "Artist" },
    { key: "track", label: "Song" },
    { key: "sample", label: "Sample" },
  ];
  return (
    <div className="game-page">
      <div className="round-heading">
        <div>
          <div className="eyebrow">
            <span className="status-dot" />
            NOW SPINNING · ROUND {String(currentRound).padStart(2, "0")} /{" "}
            {totalRounds}
          </div>
          <h1>Sounds familiar?</h1>
          <p>Listen to the roots. Find the hit. Trust your ears.</p>
        </div>
        <button className="text-button" onClick={onFinish}>
          <Flag size={16} />
          Finish game
        </button>
      </div>
      <div
        className="round-progress"
        role="progressbar"
        aria-label="Game progress"
        aria-valuenow={currentRound}
        aria-valuemin={1}
        aria-valuemax={totalRounds}
      >
        {Array.from({ length: totalRounds }, (_, i) => (
          <i key={i} className={i < currentRound ? "complete" : ""} />
        ))}
      </div>
      <div className="tracks-grid">
        <TrackPlayer
          track={currentTrack.originalSample}
          side="A"
          active={active}
          onActive={onActive}
          autoplay={settings.autoPlayEnabled && introReady}
        />
        <div className="connection-mark" aria-hidden="true">
          <Music2 size={21} />
        </div>
        <TrackPlayer
          track={currentTrack.newSong}
          side="B"
          active={active}
          onActive={onActive}
        />
      </div>
      <section className="scoreboard" aria-labelledby="score-heading">
        <div className="scoreboard-heading">
          <div>
            <span className="eyebrow">GIVE CREDIT WHERE IT’S DUE</span>
            <h2 id="score-heading">Who knew it?</h2>
          </div>
          <p>
            One point per correct answer.
            <br />
            Tap again to undo.
          </p>
        </div>
        <div className="score-table">
          <div className="score-table-head">
            <span>THE LISTENERS</span>
            <span>NEW ARTIST</span>
            <span>NEW SONG</span>
            <span>ORIGINAL SAMPLE</span>
            <span>TOTAL</span>
          </div>
          {players.map((p, i) => (
            <div className="score-row" key={p.id}>
              <div className="score-person">
                <span className={`avatar avatar-${i % 4}`}>
                  {p.name.slice(0, 1).toLocaleUpperCase()}
                </span>
                <b>{p.name}</b>
              </div>
              {categories.map((c) => {
                const selected = !!roundScores?.[currentRound]?.[p.id]?.[c.key];
                return (
                  <button
                    key={c.key}
                    className={`point-button ${selected ? "selected" : ""}`}
                    aria-label={`${p.name}: ${c.key === "track" ? "song" : c.key}`}
                    aria-pressed={selected}
                    onClick={() => togglePoint(p.id, c.key)}
                  >
                    {selected ? <Check size={17} /> : <Plus size={17} />}
                    <span>{c.label}</span>
                  </button>
                );
              })}
              <strong
                className="total-score"
                aria-label={`${p.name}: ${p.score} ${p.score === 1 ? "point" : "points"}`}
                aria-live="polite"
              >
                {p.score}
                <small>PTS</small>
              </strong>
            </div>
          ))}
        </div>
      </section>
      <div className="round-navigation">
        <button
          className="button secondary"
          onClick={previousRound}
          disabled={currentRound === 1}
          aria-label="Previous round"
        >
          <ArrowLeft size={17} />
          <span>Previous</span>
        </button>
        <span>
          {currentRound === totalRounds
            ? "The final groove."
            : "There’s more where that came from."}
        </span>
        <button className="button primary" onClick={nextRound}>
          {currentRound === totalRounds ? "See the results" : "Next round"}
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
