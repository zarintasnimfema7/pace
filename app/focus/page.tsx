"use client";

import { useState, useEffect } from "react";
import Header from "@/components/header";
import { Play, Pause, RotateCcw, Volume2, Shield, ShieldAlert, Sparkles } from "lucide-react";

export default function FocusSanctuaryPage() {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [audioChannels, setAudioChannels] = useState([
    { name: "Rainfall", volume: 40, active: false },
    { name: "Lo-Fi Beats", volume: 65, active: true },
    { name: "White Noise", volume: 20, active: false },
  ]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => setSecondsLeft(s => s - 1), 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => { setIsActive(false); setSecondsLeft(25 * 60); };

  const formatTime = () => {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <Header title="Isolated Deep Focus Layer" />
      <main className="flex-1 relative flex items-center justify-center p-10">
        <div className="w-full max-w-4xl space-y-12 relative z-10">
          <div className="text-center space-y-2">
            <h2 className="text-[11px] font-bold tracking-[0.3em] text-pace-focus uppercase">Deep Work Block</h2>
            <h1 className="text-4xl font-black text-pace-textMain tracking-tight">Sanctuary</h1>
          </div>

          <div className="grid grid-cols-12 gap-6 w-full items-start">
            {/* The Chrono Display Box */}
            <div className="col-span-12 lg:col-span-8 flex flex-col items-center justify-center p-12 rounded-xl bg-pace-card border border-pace-border relative overflow-hidden">
              <div className="text-8xl font-bold font-mono tracking-tighter text-pace-textMain select-none drop-shadow-[0_0_30px_rgba(244,246,248,0.05)]">
                {formatTime()}
              </div>
              <div className="mt-10 flex items-center gap-4">
                <button className="px-8 py-3.5 bg-pace-textMain text-pace-bg text-xs font-bold rounded-full hover:opacity-95 active:scale-95 transition-all flex items-center gap-2" onClick={toggleTimer}>
                  {isActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  {isActive ? "Pause Session" : "Start Session"}
                </button>
                <button className="p-3.5 border border-pace-border rounded-full text-pace-textMuted hover:text-pace-textMain active:scale-95 transition-all" onClick={resetTimer}>
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Atmosphere Side Column */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
              <div className="p-6 rounded-xl bg-pace-card border border-pace-border space-y-4">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span>Atmospheric Deck</span>
                  <Volume2 className="w-4 h-4 text-pace-textMuted" />
                </div>
                {audioChannels.map((chan, idx) => (
                  <div key={idx} className={`p-4 rounded-lg bg-pace-bg/40 border transition-all ${chan.active ? "border-pace-focus/40 bg-pace-bg" : "border-pace-border/40"}`}>
                    <div className="flex justify-between items-center mb-2.5">
                      <span className={`text-xs font-medium ${chan.active ? "text-pace-focus" : "text-pace-textMuted"}`}>{chan.name}</span>
                      <button className="text-xs font-mono text-pace-textMuted hover:text-pace-textMain" onClick={() => {
                        setAudioChannels(audioChannels.map((c, i) => i === idx ? { ...c, active: !c.active } : c));
                      }}>{chan.active ? "Mute" : "Inject"}</button>
                    </div>
                    <input type="range" min="0" max="100" value={chan.volume} disabled={!chan.active} className="w-full h-1 bg-pace-border rounded appearance-none accent-pace-focus disabled:opacity-20 cursor-pointer" onChange={(e) => {
                      setAudioChannels(audioChannels.map((c, i) => i === idx ? { ...c, volume: parseInt(e.target.value) } : c));
                    }} />
                  </div>
                ))}
              </div>

              {/* Immutable Outcomes Dashboard */}
              <div className="p-6 rounded-xl bg-pace-card border border-pace-border space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-pace-textMuted">Historical Logging</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center border-b border-pace-border/40 pb-2">
                    <span className="flex items-center gap-2 text-pace-success"><Shield className="w-3.5 h-3.5 fill-current" /> Success - 25m</span>
                    <span className="text-pace-textMuted font-mono">09:12 AM</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-pace-border/40 pb-2">
                    <span className="flex items-center gap-2 text-pace-urgent"><ShieldAlert className="w-3.5 h-3.5 fill-current" /> Aborted (Fail)</span>
                    <span className="text-pace-textMuted font-mono">08:30 AM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel border border-pace-border p-5 rounded-xl flex items-center gap-4 text-xs">
            <div className="w-10 h-10 rounded bg-pace-bg border border-pace-border flex items-center justify-center text-pace-focus"><Sparkles className="w-4 h-4" /></div>
            <div>
              <p className="font-semibold text-pace-textMain">Sanctuary Paradigm</p>
              <p className="text-pace-textMuted">Any structural manual cancellation or navigation event outside this view breaks the current success block chain.</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}