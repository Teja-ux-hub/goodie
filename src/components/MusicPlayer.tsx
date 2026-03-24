import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Music } from 'lucide-react';
import { motion } from 'motion/react';

interface Track {
  id: number;
  name: string;
  artist: string;
  type: 'arpeggio' | 'bass' | 'glitch';
}

const TRACKS: Track[] = [
  { id: 0, name: 'NEON_ARPS_01', artist: 'AI_SYNTH_CORE', type: 'arpeggio' },
  { id: 1, name: 'VOID_DRONE_X', artist: 'DEEP_GRID_OS', type: 'bass' },
  { id: 2, name: 'BIT_GLITCH_ERR', artist: 'NULL_POINTER', type: 'glitch' },
];

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [visualizerData, setVisualizerData] = useState<number[]>(new Array(32).fill(0));
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  const stopAudio = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const playArpeggio = (ctx: AudioContext, analyser: AnalyserNode) => {
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    let noteIndex = 0;

    intervalRef.current = setInterval(() => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(notes[noteIndex], ctx.currentTime);
      
      g.gain.setValueAtTime(0.2, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      
      osc.connect(g);
      g.connect(analyser);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
      
      noteIndex = (noteIndex + 1) % notes.length;
    }, 250);
  };

  const playBass = (ctx: AudioContext, analyser: AnalyserNode) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(55, ctx.currentTime); // A1
    
    // LFO for movement
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.5;
    lfoGain.gain.value = 10;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start();

    g.gain.value = 0.3;
    
    osc.connect(g);
    g.connect(analyser);
    
    osc.start();
    sourceRef.current = osc;
  };

  const playGlitch = (ctx: AudioContext, analyser: AnalyserNode) => {
    intervalRef.current = setInterval(() => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      
      osc.type = Math.random() > 0.5 ? 'square' : 'sawtooth';
      osc.frequency.setValueAtTime(Math.random() * 2000 + 100, ctx.currentTime);
      
      g.gain.setValueAtTime(0.1, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      
      osc.connect(g);
      g.connect(analyser);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    }, 100);
  };

  const startAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 64;
      analyserRef.current.connect(audioCtxRef.current.destination);
    }

    const ctx = audioCtxRef.current;
    const analyser = analyserRef.current!;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    stopAudio();

    switch (currentTrack.type) {
      case 'arpeggio':
        playArpeggio(ctx, analyser);
        break;
      case 'bass':
        playBass(ctx, analyser);
        break;
      case 'glitch':
        playGlitch(ctx, analyser);
        break;
    }

    const updateVisualizer = () => {
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);
      setVisualizerData(Array.from(dataArray));
      animationRef.current = requestAnimationFrame(updateVisualizer);
    };
    updateVisualizer();
  }, [currentTrack, stopAudio]);

  useEffect(() => {
    if (isPlaying) {
      startAudio();
    } else {
      stopAudio();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      setVisualizerData(new Array(32).fill(0));
    }
    return () => {
      stopAudio();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, currentTrackIndex, startAudio, stopAudio]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const nextTrack = () => setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  const prevTrack = () => setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);

  return (
    <div className="w-full max-w-md glass rounded-2xl p-6 neon-border-magenta flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-lg bg-slate-800 flex items-center justify-center relative overflow-hidden group">
          <Music className={`w-8 h-8 ${isPlaying ? 'neon-magenta animate-pulse' : 'text-slate-600'}`} />
          {isPlaying && (
            <div className="absolute inset-0 bg-magenta-500/10 animate-pulse" />
          )}
        </div>
        <div className="flex-1 overflow-hidden">
          <h3 className="text-lg font-mono neon-magenta truncate">{currentTrack.name}</h3>
          <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">{currentTrack.artist}</p>
        </div>
      </div>

      {/* Visualizer */}
      <div className="h-16 flex items-end justify-between gap-1 px-2">
        {visualizerData.slice(0, 32).map((value, i) => (
          <motion.div
            key={i}
            animate={{ height: `${(value / 255) * 100}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`w-full rounded-t-sm ${i % 2 === 0 ? 'bg-magenta-500' : 'bg-cyan-500'} opacity-80`}
            style={{ 
              boxShadow: i % 2 === 0 ? '0 0 10px rgba(217,70,239,0.5)' : '0 0 10px rgba(6,182,212,0.5)'
            }}
          />
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {/* Progress bar (fake) */}
        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
          <motion.div 
            animate={{ width: isPlaying ? '100%' : '0%' }}
            transition={{ duration: isPlaying ? 30 : 0, ease: 'linear' }}
            className="h-full bg-gradient-to-r from-magenta-500 to-cyan-500" 
          />
        </div>

        <div className="flex items-center justify-center gap-8">
          <button 
            onClick={prevTrack}
            className="p-2 text-slate-400 hover:text-magenta-400 transition-colors active:scale-90"
          >
            <SkipBack className="w-6 h-6 fill-current" />
          </button>
          
          <button 
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-magenta-500/20 border border-magenta-500/50 flex items-center justify-center text-magenta-400 hover:bg-magenta-500/30 transition-all active:scale-95 shadow-[0_0_20px_rgba(217,70,239,0.2)]"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-1" />
            )}
          </button>

          <button 
            onClick={nextTrack}
            className="p-2 text-slate-400 hover:text-magenta-400 transition-colors active:scale-90"
          >
            <SkipForward className="w-6 h-6 fill-current" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <Volume2 className="w-3 h-3" />
          <span>Output: Stereo</span>
        </div>
        <span>Bitrate: 320kbps</span>
      </div>
    </div>
  );
}
