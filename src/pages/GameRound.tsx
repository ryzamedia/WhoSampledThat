import { useState, useEffect, useRef } from 'react';
import { Button } from '@headlessui/react';
import { Eye, EyeOff, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Music, Users, Award, Star, X, Check } from 'lucide-react';
import YouTube from 'react-youtube';
import { useGame } from '../contexts/GameContext';
import WaveformPlayer from '../components/WaveformPlayer';
import roundStartSound from '../assets/who sample that jingle.mp3';
import { createTutorial, tutorialStyles } from '../lib/tutorial';

type Side = 'original' | 'new';
const scoreCategories = [
  { key: 'artist', label: 'New artist', icon: '🎤' },
  { key: 'track', label: 'New song', icon: '🎵' },
  { key: 'sample', label: 'Sample bonus', icon: '🎼' },
] as const;
function GameRound() {
  const { players, currentRound, currentTrack, totalRounds, nextRound, previousRound, togglePoint, roundScores: allRoundScores, settings, isFirstTimeUser, skipTutorial, markTutorialCompleted } = useGame();
  const roundScores = allRoundScores?.[currentRound] || {};
  const [playingVideo, setPlayingVideo] = useState<Side | null>(null);
  const playingRef = useRef<Side | null>(null);
  const [playersReady, setPlayersReady] = useState<Record<string, boolean>>({});
  const [originalRevealed, setOriginalRevealed] = useState(false);
  const [newSongRevealed, setNewSongRevealed] = useState(false);
  const [jingleEnabled] = useState(settings.jingleEnabled);
  const [introDone, setIntroDone] = useState(!jingleEnabled);
  const [showTutorialBanner, setShowTutorialBanner] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 768px)').matches);
  const [elapsed, setElapsed] = useState<Record<Side, number>>({original: 0, new: 0});
  const [errors, setErrors] = useState<Partial<Record<Side, string>>>({});
  const [hint, setHint] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);
  const playerRef = useRef<Record<string, YT.Player>>({});
  const autoplayAttempted = useRef(false);
  const tutorialRef = useRef<ReturnType<typeof createTutorial> | null>(null);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)');
    const change = () => {
      Object.values(playerRef.current).forEach(player => player.pauseVideo());
      playerRef.current = {}; setPlayersReady({}); setPlayingVideo(null); playingRef.current = null;
      setElapsed({ original: 0, new: 0 }); setIsDesktop(media.matches);
    };
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    const audio = audioRef.current;
    if (!jingleEnabled || !audio) return;
    let cancelled = false;
    const done = () => { if (!cancelled) setIntroDone(true); };
    audio.play()?.catch(done);
    // The ~11-second jingle must finish naturally; buffering can extend that.
    // onEnded/onError and a rejected play() release autoplay without a cutoff.
    return () => { cancelled = true; audio.pause(); };
  }, [jingleEnabled]);
  useEffect(() => {
    if (!currentTrack || !introDone || !settings.autoPlayEnabled || autoplayAttempted.current || !playersReady[currentTrack.originalSample.youtubeVideoId]) return;
    autoplayAttempted.current = true;
    playerRef.current[currentTrack.originalSample.youtubeVideoId]?.playVideo();
  }, [currentTrack, introDone, settings.autoPlayEnabled, playersReady]);
  useEffect(() => {
    if (!playingVideo || !currentTrack) return;
    const side = playingVideo;
    const track = side === 'original' ? currentTrack.originalSample : currentTrack.newSong;
    const timer = window.setInterval(() => {
      const player = playerRef.current[track.youtubeVideoId];
      if (!player) return;
      const time = Math.max(0, player.getCurrentTime() - (track.startTime || 0));
      setElapsed(prev => ({...prev, [side]: track.duration ? Math.min(time, track.duration) : time}));
      if (track.duration && time >= track.duration) {
        player.pauseVideo(); playingRef.current = null; setPlayingVideo(null);
      }
    }, 250);
    return () => window.clearInterval(timer);
  }, [playingVideo, currentTrack]);
  useEffect(() => {
    if (!currentTrack) return;
    const timer = window.setTimeout(() => {
      setErrors(prev => ({ ...prev,
        ...(!playerRef.current[currentTrack.originalSample.youtubeVideoId] ? {original: 'The original sample did not load. Check your connection or open it on YouTube.'} : {}),
        ...(!playerRef.current[currentTrack.newSong.youtubeVideoId] ? {new: 'The new track did not load. Check your connection or open it on YouTube.'} : {}),
      }));
    }, 15000);
    return () => window.clearTimeout(timer);
  }, [currentTrack, isDesktop]);
  useEffect(() => {
    if (!isFirstTimeUser || !currentTrack) return;
    const style = document.createElement('style'); style.textContent = tutorialStyles; document.head.appendChild(style);
    const timer = window.setTimeout(() => {
      setShowTutorialBanner(true);
      tutorialRef.current = createTutorial(
        () => { skipTutorial(); setShowTutorialBanner(false); },
        () => { markTutorialCompleted(); setShowTutorialBanner(false); },
        () => {},
      );
      tutorialRef.current?.drive();
    }, 200);
    return () => { window.clearTimeout(timer); tutorialRef.current?.destroy(); tutorialRef.current = null; style.remove(); };
  }, [isFirstTimeUser, currentTrack, skipTutorial, markTutorialCompleted]);
  function stopJingle() { audioRef.current?.pause(); setIntroDone(true); }
  function playVideo(side: Side) {
    if (!currentTrack) return;
    autoplayAttempted.current = true; stopJingle();
    const track = side === 'original' ? currentTrack.originalSample : currentTrack.newSong;
    const player = playerRef.current[track.youtubeVideoId];
    if (!player) return;
    if (track.duration && elapsed[side] >= track.duration) { player.seekTo(track.startTime || 0, true); setElapsed(p => ({...p, [side]: 0})); }
    player.playVideo();
  }
  function pauseVideo(side: Side) {
    if (!currentTrack) return;
    playerRef.current[(side === 'original' ? currentTrack.originalSample : currentTrack.newSong).youtubeVideoId]?.pauseVideo();
  }
  function restartVideo(side: Side) {
    if (!currentTrack) return;
    autoplayAttempted.current = true; stopJingle();
    const track = side === 'original' ? currentTrack.originalSample : currentTrack.newSong;
    setElapsed(prev => ({...prev, [side]: 0}));
    playerRef.current[track.youtubeVideoId]?.seekTo(track.startTime || 0, true);
    playerRef.current[track.youtubeVideoId]?.playVideo();
  }
  const onReady = (event: { target: YT.Player }, videoId: string) => {
    playerRef.current[videoId] = event.target;
    const side = videoId === currentTrack?.originalSample.youtubeVideoId ? "original" : "new";
    setErrors(prev => ({...prev, [side]: undefined}));
    event.target.addEventListener('onAutoplayBlocked', () => setHint('Your browser paused autoplay. Press Play to start the music.'));
    setPlayersReady(prev => ({ ...prev, [videoId]: true }));
  };
  const onStateChange = (event: { data: number }, side: Side) => {
    if (!currentTrack) return;
    if (event.data === 1) {
      playingRef.current = side; setPlayingVideo(side); setHint('');
      const otherTrack = side === 'original' ? currentTrack.newSong : currentTrack.originalSample;
      playerRef.current[otherTrack.youtubeVideoId]?.pauseVideo();
    } else if ((event.data === 2 || event.data === 0) && playingRef.current === side) {
      playingRef.current = null; setPlayingVideo(null);
    }
  };
  const onPlayerError = (side: Side) => { if (playingRef.current === side) { playingRef.current = null; setPlayingVideo(null); } setErrors(prev => ({...prev, [side]: `${side === 'original' ? 'The original sample' : 'The new track'} can’t play here. Open it on YouTube or move to the next round.`})); };
  const handleNextRound = () => { stopJingle(); tutorialRef.current?.destroy(); if (showTutorialBanner) markTutorialCompleted(); nextRound(); window.scrollTo({top: 0, behavior: 'instant'}); };
  const handlePreviousRound = () => { stopJingle(); previousRound(); window.scrollTo({top: 0, behavior: 'instant'}); };
  const opts = { height: '100%', width: '100%', playerVars: { autoplay: 0, controls: 0, rel: 0, playsinline: 1, origin: window.location.origin } };
  if (!currentTrack) {
    return (
      <div className="flex items-center justify-center h-64 modern-card max-w-md mx-auto p-8">
        <div className="text-center">
          <Music className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-pulse" />
          <div className="text-2xl text-white font-bold">Loading track...</div>
          <div className="text-gray-400 mt-2">Getting ready to test your music knowledge! 🎵</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto relative">
      {/* Floating retro musical notes for atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 left-10 text-5xl retro-note-neon-pink animate-float-1">♪</div>
        <div className="absolute top-40 right-16 text-4xl retro-note-neon-cyan animate-float-2">♫</div>
        <div className="absolute top-80 left-20 text-3xl retro-note-neon-yellow animate-float-3">♬</div>
        <div className="absolute top-96 right-8 text-6xl retro-note-neon-purple animate-float-4">♩</div>
        <div className="absolute bottom-40 left-16 text-4xl retro-note-neon-green animate-float-5">♪</div>
        <div className="absolute bottom-20 right-20 text-5xl retro-note-neon-orange animate-float-6">♫</div>
        <div className="absolute top-60 left-5 text-3xl retro-note-neon-cyan animate-float-1" style={{animationDelay: '2s'}}>♬</div>
        <div className="absolute bottom-60 right-5 text-4xl retro-note-neon-pink animate-float-3" style={{animationDelay: '3s'}}>♩</div>
      </div>

      <audio ref={audioRef} src={roundStartSound} preload="auto" onEnded={() => setIntroDone(true)} onError={() => setIntroDone(true)} />
      {hint && <p className="modern-card p-3 text-gray-300 text-sm mb-4" role="status">{hint}</p>}
      {(['original', 'new'] as const).map(side => errors[side] && <div key={side} className="playback-notice modern-card p-3 text-amber-200 text-sm mb-4 relative z-30" role="alert">{errors[side]} <a target="_blank" rel="noopener noreferrer" href={`https://www.youtube.com/watch?v=${(side === 'original' ? currentTrack.originalSample : currentTrack.newSong).youtubeVideoId}`} onClick={() => pauseVideo(side)}>Open on YouTube ↗</a></div>)}

      {/* Tutorial Banner */}
      {showTutorialBanner && (
        <div className="tutorial-welcome fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md mx-auto">
          <div className="modern-card p-4 bg-gradient-to-r from-blue-600 to-purple-600 border-2 border-blue-400">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex flex-col gap-1 items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-white font-bold text-sm">Tutorial Active</div>
                  <div className="text-blue-100 text-xs">Learning how to play!</div>
                </div>
              </div>
              <Button
                aria-label="Skip tutorial"
                onClick={() => {
                  if (tutorialRef.current) {
                    tutorialRef.current.destroy();
                  }
                  skipTutorial();
                  setShowTutorialBanner(false);
                }}
                className="text-white/70 hover:text-white hover:bg-white/10 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Game Round Container */}
      <div className="relative">
        {/* Round Header - positioned to connect with border */}
        <div className="absolute top-0 left-4 z-10 -mt-3">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-2 rounded-lg text-sm font-bold text-white shadow-lg">
            Round {currentRound} of {totalRounds}
          </div>
        </div>
        
        <div className="border border-gray-700/30 rounded-lg p-3 sm:p-8 pt-12 relative">

      <div className="round-instructions text-center relative z-10 mb-6">
        <p className="text-sm sm:text-base text-white font-semibold">Listen <span aria-hidden="true" className="text-cyan-300 px-1">→</span> Guess out loud <span aria-hidden="true" className="text-cyan-300 px-1">→</span> Reveal <span aria-hidden="true" className="text-cyan-300 px-1">→</span> Score</p>
        <p className="text-xs sm:text-sm text-gray-300 mt-2">Play the original sample. Which new artist and song used it?</p>
      </div>
      {/* Video Players */}
      <div className="tutorial-reveal-buttons-container-desktop relative z-10 mb-12">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-center gap-8 mb-10">
          {/* Original Sample Player */}
          <div className="tutorial-original-sample-desktop video-container relative">
            <div className="relative w-[400px] max-w-[38vw] aspect-square">
              {isDesktop && <YouTube
                videoId={currentTrack.originalSample.youtubeVideoId}
                opts={{ ...opts, playerVars: { ...opts.playerVars, start: currentTrack.originalSample.startTime } }}
                title="original music player"
                onError={() => onPlayerError('original')}
                onReady={(e) => onReady(e, currentTrack.originalSample.youtubeVideoId)}
                onStateChange={(e) => onStateChange(e, 'original')}
                className="absolute top-0 left-0 pointer-events-none rounded-t-24 w-full h-full"
              />}
              
              {/* Thumbnail Overlay */}
              {(playingVideo !== 'original' || !playersReady[currentTrack.originalSample.youtubeVideoId]) && (
                <div className="absolute inset-0 z-20 bg-black rounded-t-24">
                  <img 
                    src={`https://img.youtube.com/vi/${currentTrack.originalSample.youtubeVideoId}/maxresdefault.jpg`}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover rounded-t-24"
                    onError={(e) => {
                      if (e.currentTarget.src.endsWith("/hqdefault.jpg")) { e.currentTarget.style.visibility = "hidden"; return; }
                      e.currentTarget.src = `https://img.youtube.com/vi/${currentTrack.originalSample.youtubeVideoId}/hqdefault.jpg`;
                    }}
                  />
                </div>
              )}
              
              {/* Blur Overlay */}
              {!originalRevealed && (
                <div className="absolute inset-0 z-25 bg-black/60 backdrop-blur-xl rounded-t-24"></div>
              )}
              
              {/* Control Buttons */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 flex gap-3">
                <div className="tutorial-play-restart-buttons-desktop flex gap-3">
                  <Button
                    aria-label={playingVideo === 'original' ? 'Pause original' : 'Play original'}
                    disabled={!playersReady[currentTrack.originalSample.youtubeVideoId] || !!errors.original}
                    onClick={() => playingVideo === 'original' ? pauseVideo('original') : playVideo('original')}
                    className="modern-button primary w-16 h-16 rounded-full flex flex-col gap-1 items-center justify-center"
                  >
                    {playingVideo === 'original' ? <Pause size={24} /> : <Play size={24} />}
                    <span className="audio-control-label">{playingVideo === 'original' ? 'Pause' : 'Play'}</span>
                  </Button>
                  <Button
                    aria-label="Replay original"
                    onClick={() => restartVideo('original')}
                    className="modern-button w-16 h-16 rounded-full flex flex-col gap-1 items-center justify-center"
                  >
                    <RotateCcw size={20} />
                    <span className="audio-control-label">Replay</span>
                  </Button>
                </div>
                <Button
                  aria-label={originalRevealed ? "Hide original answer" : "Reveal original answer"}
                  onClick={() => setOriginalRevealed(!originalRevealed)}
                  className="tutorial-reveal-button modern-button w-16 h-16 rounded-full flex flex-col gap-1 items-center justify-center"
                >
                  {originalRevealed ? <EyeOff size={20} /> : <Eye size={20} />}
                  <span className="audio-control-label">{originalRevealed ? 'Hide' : 'Reveal'}</span>
                </Button>
              </div>
              
              {/* Label */}
              <div className="absolute top-4 left-4 z-30">
                <div className="modern-button px-4 py-2 text-sm retro-tech font-bold chrome-border">
                  🎵 ORIGINAL SAMPLE
                </div>
              </div>
              
              {/* Waveform Player */}
              <div className="tutorial-waveform absolute top-4 right-8 z-30">
                <WaveformPlayer
                  isPlaying={playingVideo === 'original'}
                  duration={currentTrack.originalSample.duration}
                  currentTime={elapsed.original}
                />
              </div>
              
              {/* Song Details */}
              {originalRevealed && (
                <div className="absolute bottom-4 right-8 z-30 max-w-[250px]">
                  <div className="track-details px-6 py-2">
                    <div className="font-black text-white text-lg">{currentTrack.originalSample.artist}</div>
                    <div className="text-gray-300 text-sm font-medium">{currentTrack.originalSample.trackName}</div>
                    <div className="text-cyan-300 text-xs font-medium">({currentTrack.originalSample.year})</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* New Song Player */}
          <div className="tutorial-new-song-desktop video-container relative">
            <div className="relative w-[400px] max-w-[38vw] aspect-square">
              {isDesktop && <YouTube
                videoId={currentTrack.newSong.youtubeVideoId}
                opts={{ ...opts, playerVars: { ...opts.playerVars, start: currentTrack.newSong.startTime } }}
                title="new music player"
                onError={() => onPlayerError('new')}
                onReady={(e) => onReady(e, currentTrack.newSong.youtubeVideoId)}
                onStateChange={(e) => onStateChange(e, 'new')}
                className="absolute top-0 left-0 pointer-events-none rounded-t-24 w-full h-full"
              />}
              
              {/* Thumbnail Overlay */}
              {(playingVideo !== 'new' || !playersReady[currentTrack.newSong.youtubeVideoId]) && (
                <div className="absolute inset-0 z-20 bg-black rounded-t-24">
                  <img 
                    src={`https://img.youtube.com/vi/${currentTrack.newSong.youtubeVideoId}/maxresdefault.jpg`}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover rounded-t-24"
                    onError={(e) => {
                      if (e.currentTarget.src.endsWith("/hqdefault.jpg")) { e.currentTarget.style.visibility = "hidden"; return; }
                      e.currentTarget.src = `https://img.youtube.com/vi/${currentTrack.newSong.youtubeVideoId}/hqdefault.jpg`;
                    }}
                  />
                </div>
              )}
              
              {/* Blur Overlay */}
              {!newSongRevealed && (
                <div className="absolute inset-0 z-25 bg-black/60 backdrop-blur-xl rounded-t-24"></div>
              )}
              
              {/* Control Buttons */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 flex gap-3">
                <div className="flex gap-3">
                  <Button
                    aria-label={playingVideo === 'new' ? 'Pause new' : 'Play new'}
                    disabled={!playersReady[currentTrack.newSong.youtubeVideoId] || !!errors.new}
                    onClick={() => playingVideo === 'new' ? pauseVideo('new') : playVideo('new')}
                    className="modern-button primary w-16 h-16 rounded-full flex flex-col gap-1 items-center justify-center"
                  >
                    {playingVideo === 'new' ? <Pause size={24} /> : <Play size={24} />}
                    <span className="audio-control-label">{playingVideo === 'new' ? 'Pause' : 'Play'}</span>
                  </Button>
                  <Button
                    aria-label="Replay new"
                    onClick={() => restartVideo('new')}
                    className="modern-button w-16 h-16 rounded-full flex flex-col gap-1 items-center justify-center"
                  >
                    <RotateCcw size={20} />
                    <span className="audio-control-label">Replay</span>
                  </Button>
                </div>
                <Button
                  aria-label={newSongRevealed ? "Hide new answer" : "Reveal new answer"}
                  onClick={() => setNewSongRevealed(!newSongRevealed)}
                  className="tutorial-reveal-button modern-button w-16 h-16 rounded-full flex flex-col gap-1 items-center justify-center"
                >
                  {newSongRevealed ? <EyeOff size={20} /> : <Eye size={20} />}
                  <span className="audio-control-label">{newSongRevealed ? 'Hide' : 'Reveal'}</span>
                </Button>
              </div>
              
              {/* Label */}
              <div className="absolute top-4 left-4 z-30">
                <div className="modern-button px-4 py-2 text-sm retro-tech font-bold chrome-border">
                  🎤 NEW SONG
                </div>
              </div>
              
              {/* Waveform Player */}
              <div className="absolute top-4 right-8 z-30">
                <WaveformPlayer
                  isPlaying={playingVideo === 'new'}
                  duration={currentTrack.newSong.duration}
                  currentTime={elapsed.new}
                />
              </div>
              
              {/* Song Details */}
              {newSongRevealed && (
                <div className="absolute bottom-4 right-8 z-30 max-w-[250px]">
                  <div className="track-details px-6 py-2">
                    <div className="font-black text-white text-lg">{currentTrack.newSong.artist}</div>
                    <div className="text-gray-300 text-sm font-medium">{currentTrack.newSong.trackName}</div>
                    <div className="text-cyan-300 text-xs font-medium">({currentTrack.newSong.year})</div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Mobile Layout - Stacked */}
        <div className="tutorial-reveal-buttons-container-mobile md:hidden space-y-8">
          {/* Original Sample Player */}
          <div className="tutorial-original-sample-mobile video-container relative mx-auto max-w-sm">
            <div className="relative w-full aspect-square max-w-[350px] mx-auto">
              {!isDesktop && <YouTube
                videoId={currentTrack.originalSample.youtubeVideoId}
                opts={{ ...opts, playerVars: { ...opts.playerVars, start: currentTrack.originalSample.startTime }, width: '100%', height: '100%' }}
                title="original music player"
                onError={() => onPlayerError('original')}
                onReady={(e) => onReady(e, currentTrack.originalSample.youtubeVideoId)}
                onStateChange={(e) => onStateChange(e, 'original')}
                className="absolute top-0 left-0 pointer-events-none rounded-t-24 w-full h-full"
              />}
              
              {/* Thumbnail Overlay */}
              {(playingVideo !== 'original' || !playersReady[currentTrack.originalSample.youtubeVideoId]) && (
                <div className="absolute inset-0 z-20 bg-black rounded-t-24">
                  <img 
                    src={`https://img.youtube.com/vi/${currentTrack.originalSample.youtubeVideoId}/maxresdefault.jpg`}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover rounded-t-24"
                    onError={(e) => {
                      if (e.currentTarget.src.endsWith("/hqdefault.jpg")) { e.currentTarget.style.visibility = "hidden"; return; }
                      e.currentTarget.src = `https://img.youtube.com/vi/${currentTrack.originalSample.youtubeVideoId}/hqdefault.jpg`;
                    }}
                  />
                </div>
              )}
              
              {/* Blur Overlay */}
              {!originalRevealed && (
                <div className="absolute inset-0 z-25 bg-black/60 backdrop-blur-xl rounded-t-24"></div>
              )}
              
              {/* Control Buttons */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 flex gap-2">
                <div className="tutorial-play-restart-buttons-mobile flex gap-2">
                  <Button
                    aria-label={playingVideo === 'original' ? 'Pause original' : 'Play original'}
                    disabled={!playersReady[currentTrack.originalSample.youtubeVideoId] || !!errors.original}
                    onClick={() => playingVideo === 'original' ? pauseVideo('original') : playVideo('original')}
                    className="modern-button primary w-12 h-12 rounded-full flex flex-col gap-1 items-center justify-center"
                  >
                    {playingVideo === 'original' ? <Pause size={20} /> : <Play size={20} />}
                    <span className="audio-control-label">{playingVideo === 'original' ? 'Pause' : 'Play'}</span>
                  </Button>
                  <Button
                    aria-label="Replay original"
                    onClick={() => restartVideo('original')}
                    className="modern-button w-12 h-12 rounded-full flex flex-col gap-1 items-center justify-center"
                  >
                    <RotateCcw size={16} />
                    <span className="audio-control-label">Replay</span>
                  </Button>
                </div>
                <Button
                  aria-label={originalRevealed ? "Hide original answer" : "Reveal original answer"}
                  onClick={() => setOriginalRevealed(!originalRevealed)}
                  className="tutorial-reveal-button modern-button w-12 h-12 rounded-full flex flex-col gap-1 items-center justify-center"
                >
                  {originalRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
                  <span className="audio-control-label">{originalRevealed ? 'Hide' : 'Reveal'}</span>
                </Button>
              </div>
              
              {/* Label */}
              <div className="absolute top-3 left-3 z-30">
                <div className="modern-button px-3 py-1 text-xs retro-tech font-bold chrome-border">
                  🎵 ORIGINAL
                </div>
              </div>
              
              {/* Waveform Player */}
              <div className="tutorial-waveform absolute top-3 right-3 z-30">
                <WaveformPlayer
                  isPlaying={playingVideo === 'original'}
                  duration={currentTrack.originalSample.duration}
                  currentTime={elapsed.original}
                />
              </div>
              
              {/* Song Details */}
              {originalRevealed && (
                <div className="absolute bottom-3 right-3 z-30 max-w-[200px]">
                  <div className="track-details px-3 py-2">
                    <div className="font-black text-white text-sm">{currentTrack.originalSample.artist}</div>
                    <div className="text-gray-300 text-xs font-medium">{currentTrack.originalSample.trackName}</div>
                    <div className="text-cyan-300 text-xs font-medium">({currentTrack.originalSample.year})</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* New Song Player */}
          <div className="tutorial-new-song-mobile video-container relative mx-auto max-w-sm">
            <div className="relative w-full aspect-square max-w-[350px] mx-auto">
              {!isDesktop && <YouTube
                videoId={currentTrack.newSong.youtubeVideoId}
                opts={{ ...opts, playerVars: { ...opts.playerVars, start: currentTrack.newSong.startTime }, width: '100%', height: '100%' }}
                title="new music player"
                onError={() => onPlayerError('new')}
                onReady={(e) => onReady(e, currentTrack.newSong.youtubeVideoId)}
                onStateChange={(e) => onStateChange(e, 'new')}
                className="absolute top-0 left-0 pointer-events-none rounded-t-24 w-full h-full"
              />}
              
              {/* Thumbnail Overlay */}
              {(playingVideo !== 'new' || !playersReady[currentTrack.newSong.youtubeVideoId]) && (
                <div className="absolute inset-0 z-20 bg-black rounded-t-24">
                  <img 
                    src={`https://img.youtube.com/vi/${currentTrack.newSong.youtubeVideoId}/maxresdefault.jpg`}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover rounded-t-24"
                    onError={(e) => {
                      if (e.currentTarget.src.endsWith("/hqdefault.jpg")) { e.currentTarget.style.visibility = "hidden"; return; }
                      e.currentTarget.src = `https://img.youtube.com/vi/${currentTrack.newSong.youtubeVideoId}/hqdefault.jpg`;
                    }}
                  />
                </div>
              )}
              
              {/* Blur Overlay */}
              {!newSongRevealed && (
                <div className="absolute inset-0 z-25 bg-black/60 backdrop-blur-xl rounded-t-24"></div>
              )}
              
              {/* Control Buttons */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 flex gap-2">
                <div className="flex gap-2">
                  <Button
                    aria-label={playingVideo === 'new' ? 'Pause new' : 'Play new'}
                    disabled={!playersReady[currentTrack.newSong.youtubeVideoId] || !!errors.new}
                    onClick={() => playingVideo === 'new' ? pauseVideo('new') : playVideo('new')}
                    className="modern-button primary w-12 h-12 rounded-full flex flex-col gap-1 items-center justify-center"
                  >
                    {playingVideo === 'new' ? <Pause size={20} /> : <Play size={20} />}
                    <span className="audio-control-label">{playingVideo === 'new' ? 'Pause' : 'Play'}</span>
                  </Button>
                  <Button
                    aria-label="Replay new"
                    onClick={() => restartVideo('new')}
                    className="modern-button w-12 h-12 rounded-full flex flex-col gap-1 items-center justify-center"
                  >
                    <RotateCcw size={16} />
                    <span className="audio-control-label">Replay</span>
                  </Button>
                </div>
                <Button
                  aria-label={newSongRevealed ? "Hide new answer" : "Reveal new answer"}
                  onClick={() => setNewSongRevealed(!newSongRevealed)}
                  className="tutorial-reveal-button modern-button w-12 h-12 rounded-full flex flex-col gap-1 items-center justify-center"
                >
                  {newSongRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
                  <span className="audio-control-label">{newSongRevealed ? 'Hide' : 'Reveal'}</span>
                </Button>
              </div>
              
              {/* Label */}
              <div className="absolute top-3 left-3 z-30">
                <div className="modern-button px-3 py-1 text-xs retro-tech font-bold chrome-border">
                  🎤 NEW SONG
                </div>
              </div>
              
              {/* Waveform Player */}
              <div className="absolute top-3 right-3 z-30">
                <WaveformPlayer
                  isPlaying={playingVideo === 'new'}
                  duration={currentTrack.newSong.duration}
                  currentTime={elapsed.new}
                />
              </div>
              
              {/* Song Details */}
              {newSongRevealed && (
                <div className="absolute bottom-3 right-3 z-30 max-w-[200px]">
                  <div className="track-details px-3 py-2">
                    <div className="font-black text-white text-sm">{currentTrack.newSong.artist}</div>
                    <div className="text-gray-300 text-xs font-medium">{currentTrack.newSong.trackName}</div>
                    <div className="text-cyan-300 text-xs font-medium">({currentTrack.newSong.year})</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Players & Scoring */}
      <div className="tutorial-players-section relative z-10">
        <div className="text-center mb-6 md:mb-8">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
            <Users className="w-6 h-6 md:w-8 md:h-8 text-green-400" />
            <h3 className="shrikhand-regular text-xl md:text-3xl text-white">Who got it right?</h3>
            <Award className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />
          </div>
          <p id="scoring-help" className="text-gray-300 text-sm md:text-base">Tap a correct guess to add 1 point. Tap again to undo.</p>
          <p className="text-gray-400 text-xs md:text-sm mt-2">Up to 3 points each round. Bonus: name the original sample.</p>
        </div>
        
        <div className="space-y-4 md:space-y-6">
          {players.map((player, index) => (
            <div key={player.id} className="player-card p-4 md:p-6 relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-black text-lg">{index + 1}</div>
                  <div className="min-w-0 text-left">
                    <div className="text-white font-black text-lg md:text-2xl break-words">{player.name}</div>
                    <div className="flex items-center gap-2 mt-1"><span className="text-gray-400 text-sm">Total:</span><span className="score-badge">{player.score} pts</span></div>
                    <p className="text-cyan-200 text-xs mt-2" aria-live="polite">This round: {scoreCategories.filter(({key}) => roundScores[player.id]?.[key]).length} / 3</p>
                  </div>
                </div>
                <div className="tutorial-scoring-buttons grid grid-cols-3 gap-2 md:gap-3 shrink-0">
                  {scoreCategories.map(({key, label, icon}) => {
                    const selected = !!roundScores[player.id]?.[key];
                    return <Button key={key} aria-label={`${player.name}: ${label}`} aria-pressed={selected} aria-describedby="scoring-help"
                      onClick={() => togglePoint(player.id, key)}
                      className={`score-toggle modern-button chrome-border px-2 md:px-4 py-3 flex flex-col items-center gap-1 ${selected ? 'success' : ''}`}>
                      <span aria-hidden="true">{icon}</span>
                      <span className="font-semibold text-xs md:text-sm">{label}</span>
                      <span className="score-toggle-value flex items-center justify-center gap-1 text-xs font-bold">{selected ? <><Check className="w-3 h-3" aria-hidden="true" />1 point</> : '+1'}</span>
                    </Button>;
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons - Bottom */}
      <div className="relative z-10 mt-8 pt-6 border-t border-gray-700/30">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-between">
          <Button 
            aria-label="Previous round" onClick={handlePreviousRound}
            disabled={currentRound <= 1}
            className="modern-button px-6 py-4 text-lg retro-tech font-bold flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed chrome-border"
          >
            <ChevronLeft className="w-5 h-5" />
            PREVIOUS
          </Button>
          <div className="text-center">
            <div className="retro-tech text-cyan-300 text-sm font-medium tracking-wider">JUKEBOX NAVIGATION</div>
            <div className="shrikhand-regular text-white text-lg font-bold">ROUND {currentRound} OF {totalRounds}</div>
          </div>
          <Button 
            aria-label={currentRound === totalRounds ? "See results" : "Next round"} onClick={handleNextRound}
            className="tutorial-next-round-desktop modern-button primary px-6 py-4 text-lg retro-tech font-bold flex items-center gap-3 chrome-border"
          >
            {currentRound === totalRounds ? "SEE RESULTS" : "NEXT ROUND"}
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="text-center mb-4">
            <div className="shrikhand-regular text-cyan-300 text-sm font-medium tracking-wider">ROUND {currentRound} OF {totalRounds}</div>
          </div>
          <div className="flex justify-between items-center gap-4">
            <Button 
              aria-label="Previous round" onClick={handlePreviousRound}
              disabled={currentRound <= 1}
              className="modern-button px-4 py-3 text-xs whitespace-nowrap retro-tech font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed flex-1 chrome-border"
            >
              <ChevronLeft className="w-4 h-4" />
              PREVIOUS
            </Button>
            <Button 
              aria-label={currentRound === totalRounds ? "See results" : "Next round"} onClick={handleNextRound}
              className="tutorial-next-round-mobile modern-button primary px-4 py-3 text-xs whitespace-nowrap retro-tech font-bold flex items-center gap-2 flex-1 chrome-border"
            >
              {currentRound === totalRounds ? "RESULTS" : "NEXT ROUND"}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}

export default GameRound; 