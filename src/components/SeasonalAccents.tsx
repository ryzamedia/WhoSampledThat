import { useEffect, useState, type CSSProperties } from 'react';
import { useGame } from '../contexts/GameContext';
import { getSeason } from '../lib/season';

function CandyCane() {
  const path = 'M14 57V20a12 12 0 0 1 24 0v6';
  return <svg viewBox="0 0 48 64" fill="none" aria-hidden="true" focusable="false">
    <path d={path} stroke="#fff3da" strokeWidth="11" strokeLinecap="round" />
    <path d={path} stroke="#f0445d" strokeWidth="11" strokeDasharray="6 9" />
  </svg>;
}

// Fixed spacing keeps the animation stable across score updates and round changes.
const particles = Array.from({length: 24}, (_, i) => ({
  left: `${(i * 37 + 3) % 100}%`,
  duration: `${20 + (i % 7) * 2}s`,
  delay: `${-((i * 11 + 5) % 28)}s`,
  size: `${28 + (i % 4) * 8}px`,
  rotation: `${i % 2 ? 18 : -22}deg`,
  drift: `${i % 2 ? 40 : -40}px`,
  restingY: `${8 + (i * 17) % 82}%`,
}));

export default function SeasonalAccents() {
  const { settings } = useGame();
  const [date, setDate] = useState(() => new Date());
  const season = getSeason(date);
  useEffect(() => {
    const timer = window.setInterval(() => setDate(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.season = season;
    document.documentElement.dataset.motion = settings.motionEnabled ? 'playing' : 'paused';
  }, [season, settings.motionEnabled]);

  return <div className={`seasonal-accents season-${season}`} aria-hidden="true">
    <div className="seasonal-glow" />
    {season !== 'classic' && <div className="festive-lights">{Array.from({length: 28}, (_, i) => <i key={i} />)}</div>}
    <div className="falling-decorations">
      {particles.map((particle, i) => {
        const candy = season === 'christmas' && i % 3 === 0;
        const symbol = season === 'christmas' && i % 3 === 1 ? '❄' : season === 'new-year' && i % 3 === 0 ? '✧' : season === 'halloween' && i % 3 === 0 ? '✦' : ['♪', '♫', '♬'][i % 3];
        return <span key={i} className={`falling-decoration ${candy ? 'falling-candy' : 'falling-note'} decoration-${i % 3}`}
          style={{left: particle.left, width: particle.size, fontSize: particle.size, animationDuration: particle.duration, animationDelay: particle.delay,
            '--rotation': particle.rotation, '--drift': particle.drift, '--rest-y': particle.restingY} as CSSProperties}>
          {candy ? <CandyCane /> : symbol}
        </span>;
      })}
    </div>
  </div>;
}
