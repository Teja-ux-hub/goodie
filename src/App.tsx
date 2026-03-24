import React from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';
import { motion } from 'motion/react';
import { Terminal, Cpu, Zap, Radio } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex items-center justify-center p-4 md:p-8">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-magenta-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none">
          <div className="w-full h-full grid grid-cols-[repeat(20,1fr)] grid-rows-[repeat(20,1fr)] border-slate-500">
            {Array.from({ length: 400 }).map((_, i) => (
              <div key={i} className="border-[0.5px] border-slate-500/20" />
            ))}
          </div>
        </div>
      </div>

      <main className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 items-start">
        {/* Left Column: Game Console */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col gap-6"
        >
          <div className="flex items-center gap-3 px-2">
            <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
              <Terminal className="w-5 h-5 neon-cyan" />
            </div>
            <div>
              <h1 className="text-xl font-mono font-bold tracking-tighter neon-cyan">CYBER_SNAKE.EXE</h1>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">Neural Interface Active</p>
            </div>
          </div>

          <SnakeGame />

          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Cpu, label: 'CPU LOAD', value: '42%' },
              { icon: Zap, label: 'VOLTAGE', value: '1.2V' },
              { icon: Radio, label: 'SIGNAL', value: 'STABLE' },
            ].map((stat, i) => (
              <div key={i} className="glass p-3 rounded-xl border border-slate-800/50 flex flex-col gap-1">
                <div className="flex items-center gap-2 text-slate-500">
                  <stat.icon className="w-3 h-3" />
                  <span className="text-[8px] font-mono uppercase tracking-widest">{stat.label}</span>
                </div>
                <span className="text-xs font-mono text-slate-300">{stat.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Column: Music & Info */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col gap-8"
        >
          <div className="flex flex-col gap-2 px-2">
            <h2 className="text-sm font-mono text-slate-400 uppercase tracking-[0.3em]">Audio_Engine</h2>
            <div className="h-px w-full bg-gradient-to-r from-slate-800 to-transparent" />
          </div>

          <MusicPlayer />

          <div className="glass p-6 rounded-2xl border border-slate-800/50 flex flex-col gap-4">
            <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest">System Logs</h3>
            <div className="flex flex-col gap-2 font-mono text-[10px]">
              <div className="flex gap-2 text-cyan-500/70">
                <span>[09:57:57]</span>
                <span>INITIALIZING_NEURAL_LINK...</span>
              </div>
              <div className="flex gap-2 text-magenta-500/70">
                <span>[09:57:58]</span>
                <span>AUDIO_BUFFER_LOADED_SUCCESSFULLY</span>
              </div>
              <div className="flex gap-2 text-lime-500/70">
                <span>[09:57:59]</span>
                <span>SNAKE_PROTOCOL_READY</span>
              </div>
              <div className="flex gap-2 text-slate-600 animate-pulse">
                <span>[09:58:00]</span>
                <span>AWAITING_USER_INPUT_</span>
              </div>
            </div>
          </div>

          <div className="px-4 py-2 rounded-full border border-slate-800/50 bg-slate-900/20 text-center">
            <span className="text-[9px] font-mono text-slate-600 uppercase tracking-[0.4em]">Built for AI Studio Build</span>
          </div>
        </motion.div>
      </main>

      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none scanline opacity-10 z-50" />
    </div>
  );
}
