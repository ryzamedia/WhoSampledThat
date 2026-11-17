import { useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Headphones,
  Plus,
  X,
  Users,
  Disc3,
  Sparkles,
} from "lucide-react";
import { useGame } from "../contexts/GameContext";
import RecordArt from "../components/RecordArt";
import { seasonCopy, getSeason } from "../lib/season";
export default function GameSetup({
  season,
}: {
  season: ReturnType<typeof getSeason>;
}) {
  const { players, addPlayer, removePlayer, startGame, totalRounds } =
    useGame();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const copy = seasonCopy[season];
  function add(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Add a name to join the guest list.");
      input.current?.focus();
      return;
    }
    if (
      players.some(
        (p) => p.name.toLocaleLowerCase() === name.trim().toLocaleLowerCase(),
      )
    ) {
      setError("That name is already on the list. Try a nickname.");
      return;
    }
    if (players.length >= 12) {
      setError("The guest list is full. You can play in teams, too.");
      return;
    }
    addPlayer(name);
    setName("");
    setError("");
    input.current?.focus();
  }
  function start() {
    if (name.trim()) {
      setError("Add this name with the + button before starting.");
      input.current?.focus();
      return;
    }
    startGame();
  }
  return (
    <>
      <section className="setup-layout">
        <div className="hero">
          <div className="eyebrow">
            <span className="status-dot" />
            {copy.label}
          </div>
          <h1>
            {copy.title}
            <br />
            <em>{copy.accent}</em>
          </h1>
          <p className="hero-description">{copy.subtitle}</p>
          <RecordArt sticker={copy.sticker} />
        </div>
        <section className="guest-card" aria-labelledby="guest-heading">
          <div className="card-meta">
            <span>YOUR NIGHT STARTS HERE</span>
            <span>01 / SET THE TABLE</span>
          </div>
          <div className="guest-heading">
            <h2 id="guest-heading">The guest list.</h2>
            <Users size={25} strokeWidth={1.5} />
          </div>
          <p>
            Add your friends, pick your teams, or go solo.
            <br className="desktop-break" /> Everyone’s invited.
          </p>
          <form onSubmit={add} className="player-form">
            <label htmlFor="player-name">Player name</label>
            <div className="input-row">
              <input
                ref={input}
                id="player-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                maxLength={30}
                autoComplete="off"
                placeholder="Who's listening?"
                aria-invalid={!!error}
                aria-describedby={error ? "name-error" : undefined}
                disabled={players.length >= 12}
              />
              <button
                className="add-button"
                type="submit"
                aria-label="Add player"
                disabled={players.length >= 12}
              >
                <Plus size={23} />
              </button>
            </div>
            <div id="name-error" role="alert" className="field-error">
              {error}
            </div>
          </form>
          <div className="guest-list" aria-live="polite">
            {players.length ? (
              <ol>
                {players.map((p, i) => (
                  <li key={p.id}>
                    <span className={`avatar avatar-${i % 4}`}>
                      {p.name.slice(0, 1).toLocaleUpperCase()}
                    </span>
                    <span className="guest-name">{p.name}</span>
                    <button
                      onClick={() => removePlayer(p.id)}
                      className="icon-button"
                      aria-label={`Remove ${p.name}`}
                    >
                      <X size={17} />
                    </button>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="empty-guests">
                <span className="empty-record">
                  <Disc3 size={27} strokeWidth={1.3} />
                </span>
                <span>
                  A great night starts with a name.
                  <small>Add your first player above.</small>
                </span>
              </div>
            )}
          </div>
          <div className="guest-footer">
            <div className="guest-count">
              <span>
                {players.length
                  ? `${players.length} ${players.length === 1 ? "player" : "players"} on the list`
                  : "Room for 1–12 players"}
              </span>
              <span>TEAMS WELCOME</span>
            </div>
            <button
              className="button primary full"
              disabled={!players.length}
              onClick={start}
            >
              Drop the needle <ArrowRight size={20} />
            </button>
            <div className="setup-fineprint">
              <Headphones size={14} /> One screen. Your favourite people.
            </div>
          </div>
        </section>
      </section>
      <section className="how-strip" aria-label="How the game works">
        <div className="how-intro">
          <span className="eyebrow">THE VERY SIMPLE PLAN</span>
          <h2>
            Big tunes.
            <br />
            Bigger bragging rights.
          </h2>
        </div>
        <div className="how-step">
          <span className="step-number">01</span>
          <div>
            <h3>Listen closely.</h3>
            <p>
              Play the original sample.
              <br />
              That sound familiar?
            </p>
          </div>
        </div>
        <div className="how-step">
          <span className="step-number">02</span>
          <div>
            <h3>Make your call.</h3>
            <p>
              Name the artist, the song,
              <br />
              and where it all began.
            </p>
          </div>
        </div>
        <div className="how-step">
          <span className="step-number">03</span>
          <div>
            <h3>Claim your points.</h3>
            <p>
              {totalRounds} rounds. Three points each.
              <br />
              One very smug winner.
            </p>
          </div>
        </div>
      </section>
      <p className="home-footnote">
        <Sparkles size={14} /> No sign-ups. No downloads. Just press play.
      </p>
    </>
  );
}
