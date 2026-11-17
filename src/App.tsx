import { useEffect, useRef, useState } from "react";
import {
  CircleHelp,
  Disc3,
  SlidersHorizontal,
  ArrowUpRight,
  Headphones,
  Music2,
  Trophy,
} from "lucide-react";
import { GameProvider, useGame } from "./contexts/GameContext";
import GameSetup from "./pages/GameSetup";
import GameRound from "./pages/GameRound";
import Modal from "./components/Modal";
import Results from "./components/Results";
import PrivacyPolicy from "./components/PrivacyPolicy";
import { getSeason, seasonCopy } from "./lib/season";
import { decodeScores } from "./lib/share";
import { themes, type Theme } from "./lib/gameStorage";
const themeLabels: Record<Theme, string> = {
  auto: "Automatic · follow the seasons",
  classic: "Classic · no seasonal accents",
  christmas: "Christmas",
  "new-year": "New Year",
  halloween: "Halloween",
};
function Shell() {
  const game = useGame();
  const [dialog, setDialog] = useState<"help" | "settings" | "finish" | null>(
    null,
  );
  const [privacy, setPrivacy] = useState(false);
  const [path, setPath] = useState(window.location.pathname);
  const [date, setDate] = useState(() => new Date());
  const main = useRef<HTMLElement>(null);
  const initial = useRef(true);
  const shared = path.startsWith("/share/");
  const scores = shared ? decodeScores(path.slice("/share/".length)) : null;
  const season = getSeason(date, game.settings.theme);
  useEffect(() => {
    const clock = window.setInterval(() => setDate(new Date()), 60000);
    const onHistory = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onHistory);
    return () => {
      window.clearInterval(clock);
      window.removeEventListener("popstate", onHistory);
    };
  }, []);
  useEffect(() => {
    document.documentElement.dataset.season = season;
  }, [season]);
  useEffect(() => {
    if (initial.current) {
      initial.current = false;
      return;
    }
    main.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [game.gamePhase, game.currentRound, path]);
  useEffect(() => {
    document.title =
      shared || game.gamePhase === "summary"
        ? "Who Sampled That? — The results are in."
        : game.gamePhase === "playing"
          ? `Round ${game.currentRound} — Who Sampled That?`
          : "Who Sampled That? — The music party game";
  }, [shared, game.gamePhase, game.currentRound]);
  function leaveShare() {
    window.history.pushState({}, "", "/");
    setPath("/");
  }
  return (
    <div className="app-shell" data-season={season}>
      <a className="skip-link" href="#main">
        Skip to the game
      </a>
      {season !== "classic" && (
        <div className={`season-trim ${season}`} aria-hidden="true">
          {Array.from({ length: 24 }, (_, i) => (
            <span key={i}>
              {season === "christmas" ? "●" : season === "new-year" ? "✧" : "✦"}
            </span>
          ))}
        </div>
      )}
      <header className="site-header">
        <a className="brand" href="/" aria-label="Who Sampled That? Home">
          <Disc3 size={36} strokeWidth={1.5} />
          <span>
            who sampled
            <br />
            <b>that?</b>
          </span>
        </a>
        <span className="header-edition">{seasonCopy[season].edition}</span>
        <nav aria-label="Main navigation">
          <button
            className="text-button help-button"
            onClick={() => setDialog("help")}
          >
            <CircleHelp size={18} />
            <span>How to play</span>
          </button>
          <button
            className="icon-button settings-button"
            onClick={() => setDialog("settings")}
            aria-label="Settings"
          >
            <SlidersHorizontal size={20} />
          </button>
        </nav>
      </header>
      <main id="main" ref={main} tabIndex={-1} className="main-content">
        {game.saveFailed && (
          <div className="save-warning" role="status">
            Your browser couldn’t save this game. You can keep playing, but
            progress may be lost when you close or refresh this page.
          </div>
        )}
        {shared ? (
          scores ? (
            <Results scores={scores} shared leaveShare={leaveShare} />
          ) : (
            <section className="invalid-share">
              <div className="eyebrow">THIS RECORD SKIPS</div>
              <h1>
                That results link
                <br />
                isn’t quite right.
              </h1>
              <p>
                Ask your friend for the full link, or head to your own listening
                party.
              </p>
              <button className="button primary" onClick={leaveShare}>
                Your listening party <ArrowUpRight size={18} />
              </button>
            </section>
          )
        ) : game.gamePhase === "setup" ? (
          <GameSetup season={season} />
        ) : game.gamePhase === "playing" ? (
          <GameRound
            key={game.currentRound}
            onFinish={() => setDialog("finish")}
          />
        ) : (
          <Results scores={game.players} />
        )}
      </main>
      <footer className="site-footer">
        <span>Good music brings people together.</span>
        <div>
          <span>Made for the love of the sample.</span>
          <button onClick={() => setPrivacy(true)}>
            Privacy & terms <ArrowUpRight size={13} />
          </button>
        </div>
      </footer>
      <Modal
        open={dialog === "settings"}
        onClose={() => setDialog(null)}
        title="Set the mood."
      >
        <p className="modal-intro">
          A few little things to make the night yours.
        </p>
        <label className="select-label" htmlFor="season">
          Seasonal accents
        </label>
        <select
          id="season"
          value={game.settings.theme}
          onChange={(e) =>
            game.updateSettings({ theme: e.target.value as Theme })
          }
        >
          {themes.map((t) => (
            <option value={t} key={t}>
              {themeLabels[t]}
            </option>
          ))}
        </select>
        <p className="settings-note">
          Christmas in December, New Year from 31 December–5 January, and
          Halloween from 15–31 October. Based on your local date.
        </p>
        <label className="setting-row">
          <span>
            <b>Opening jingle</b>
            <small>A little fanfare when the game starts.</small>
          </span>
          <input
            type="checkbox"
            checked={game.settings.jingleEnabled}
            onChange={(e) =>
              game.updateSettings({ jingleEnabled: e.target.checked })
            }
          />
        </label>
        <label className="setting-row">
          <span>
            <b>Autoplay samples</b>
            <small>
              Start each round’s sample when it’s ready.
              <br />
              Your browser may still ask you to press play.
            </small>
          </span>
          <input
            type="checkbox"
            checked={game.settings.autoPlayEnabled}
            onChange={(e) =>
              game.updateSettings({ autoPlayEnabled: e.target.checked })
            }
          />
        </label>
        <button className="button primary full" onClick={() => setDialog(null)}>
          Sounds good
        </button>
      </Modal>
      <Modal
        open={dialog === "help"}
        onClose={() => setDialog(null)}
        title="A good ear goes a long way."
      >
        <p className="modal-intro">
          Gather around one screen. Pick a host to play the tracks and keep
          score. Headphones optional; friendly competition encouraged.
        </p>
        <ol className="instructions">
          <li>
            <Headphones />
            <div>
              <b>Start with the sample.</b>
              <p>Play Side A. Can anyone name the original artist or track?</p>
            </div>
          </li>
          <li>
            <Music2 />
            <div>
              <b>Find the connection.</b>
              <p>
                Guess the newer song that sampled it, then play Side B for a
                hint. Reveal each answer when everyone’s had a go.
              </p>
            </div>
          </li>
          <li>
            <Trophy />
            <div>
              <b>Give credit where it’s due.</b>
              <p>
                Tap Artist for the newer artist, Song for the newer song, and
                Sample for the original artist or track. Each is worth one point
                per player, per round. Tap again to undo.
              </p>
            </div>
          </li>
        </ol>
        <p className="settings-note">
          Play all {game.totalRounds} rounds or finish early. You can revisit a
          round to correct scores. Your browser saves progress when local
          storage is available.
        </p>
        <button className="button primary full" onClick={() => setDialog(null)}>
          Let’s hear it
        </button>
      </Modal>
      <Modal
        open={dialog === "finish"}
        onClose={() => setDialog(null)}
        title="Call it a night?"
      >
        <p className="modal-intro">
          Finish at round {game.currentRound} and see who has the best ears in
          the room.
        </p>
        <div className="modal-actions">
          <button className="button secondary" onClick={() => setDialog(null)}>
            Keep playing
          </button>
          <button
            className="button primary"
            onClick={() => {
              game.endGame();
              setDialog(null);
            }}
          >
            See the results
          </button>
        </div>
      </Modal>
      <PrivacyPolicy isOpen={privacy} onClose={() => setPrivacy(false)} />
    </div>
  );
}
export default function App() {
  return (
    <GameProvider>
      <Shell />
    </GameProvider>
  );
}
