import { useEffect, useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { getSeason } from '../lib/season';
export default function SeasonalAccents() {
  const { settings } = useGame();
  const [date, setDate] = useState(() => new Date());
  const season = getSeason(date, settings.theme);
  useEffect(() => {
    const timer = window.setInterval(() => setDate(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => { document.documentElement.dataset.season = season; }, [season]);
  if (season === 'classic') return null;
  return <div className={`seasonal-accents season-${season}`} aria-hidden="true">
    <div className="festive-lights">{Array.from({length: 24}, (_, i) => <i key={i} />)}</div>
    {season === 'christmas' && <div className="festive-flakes">{['✧', '❄', '✧', '❄', '✧', '❄'].map((s,i) => <span key={i} style={{left: `${6 + i * 17}%`, top: `${22 + (i % 3) * 27}%`}}>{s}</span>)}</div>}
  </div>;
}
