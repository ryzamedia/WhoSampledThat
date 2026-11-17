import { useState } from "react";
import {
  ArrowRight,
  RotateCcw,
  Share2,
  Trophy,
  Check,
  Copy,
} from "lucide-react";
import { useGame } from "../contexts/GameContext";
import { encodeScores, type SharedScore } from "../lib/share";
export default function Results({
  scores,
  shared = false,
  leaveShare,
}: {
  scores: SharedScore[];
  shared?: boolean;
  leaveShare?: () => void;
}) {
  const { startGame, resetGame } = useGame();
  const [notice, setNotice] = useState("");
  const [manual, setManual] = useState(false);
  const [busy, setBusy] = useState(false);
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const winners = sorted.filter((p) => p.score === sorted[0]?.score);
  const title =
    winners.length > 1
      ? "A shared taste for victory."
      : `${sorted[0]?.name || "Nobody"} takes the crown.`;
  const url = `${window.location.origin}/share/${encodeScores(sorted)}`;
  async function share() {
    setBusy(true);
    setNotice("");
    const data = {
      title: "Who Sampled That? — The results are in.",
      text: `${title} Think you can beat that?`,
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
        setNotice("Results shared.");
      } else {
        await navigator.clipboard.writeText(url);
        setNotice("Results link copied.");
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setManual(true);
        setNotice("Copy the link below to share your results.");
      }
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="results">
      <div className="eyebrow">
        {shared ? "STRAIGHT FROM THE LISTENING PARTY" : "THAT’S A WRAP"}
      </div>
      <div className="trophy-stamp">
        <Trophy size={32} strokeWidth={1.4} />
      </div>
      <h1>{title}</h1>
      <p>
        {winners.length > 1
          ? "Some things are too good not to share. Including first place."
          : "Excellent ears. Impeccable taste. Bragging rights secured."}
      </p>
      <div className="result-card">
        <div className="card-meta">
          <span>THE FINAL CUT</span>
          <span>OFFICIAL BRAGGING RIGHTS</span>
        </div>
        <ol>
          {sorted.map((p, i) => {
            const rank = sorted.findIndex((s) => s.score === p.score) + 1;
            return (
              <li key={i} className={rank === 1 ? "first-place" : ""}>
                <span className="rank">{String(rank).padStart(2, "0")}</span>
                <span className="result-name">
                  {p.name}
                  {rank === 1 && (
                    <small>THE HEADLINER{winners.length > 1 ? "S" : ""}</small>
                  )}
                </span>
                <span className="result-score">
                  {p.score}
                  <small>PTS</small>
                </span>
              </li>
            );
          })}
        </ol>
        <div className="result-actions">
          {shared ? (
            <button className="button primary" onClick={leaveShare}>
              Your listening party <ArrowRight size={18} />
            </button>
          ) : (
            <>
              <button className="button primary" onClick={startGame}>
                <RotateCcw size={17} />
                Play again
              </button>
              <button
                className="button secondary"
                onClick={share}
                disabled={busy}
              >
                {notice === "Results link copied." ? (
                  <Check size={17} />
                ) : (
                  <Share2 size={17} />
                )}
                {busy ? "Sharing…" : "Share results"}
              </button>
            </>
          )}
        </div>
        {!shared && (
          <>
            <div className="share-notice" role="status">
              {notice}
            </div>
            {manual && (
              <label className="manual-share">
                <Copy size={16} />
                <input
                  aria-label="Results link"
                  value={url}
                  readOnly
                  onFocus={(e) => e.target.select()}
                />
              </label>
            )}
            <p className="share-hint">
              Shared links include player names and scores.
            </p>
          </>
        )}
      </div>
      {!shared && (
        <button className="text-button" onClick={resetGame}>
          New guest list <ArrowRight size={16} />
        </button>
      )}
    </section>
  );
}
