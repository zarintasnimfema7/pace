"use client"

import React, { useState, useEffect, useRef, useTransition } from "react"
import Header from "@/components/header"
import { logFocusSession } from "@/app/actions/focus-actions"
import { FocusStatus } from "@prisma/client"
import { Play, Square, Volume2, VolumeX, ShieldCheck, AlertTriangle, CloudRain, Music, Radio, HelpCircle } from "lucide-react"

interface SessionLog {
  id: string
  duration: number
  status: FocusStatus
  createdAt: Date
}

interface FocusSanctuaryClientProps {
  initialHistory: SessionLog[]
}

// Sound options registry matching our technical engines
type SoundPreset = "BROWN_NOISE" | "RAIN" | "AMBIENT_PAD" | "LOFI_CHORDS"

export default function FocusSanctuaryClient({ initialHistory }: FocusSanctuaryClientProps) {
  const [isPending, startTransition] = useTransition()
  const [history, setHistory] = useState<SessionLog[]>(initialHistory)

  // Configuration and Control States
  const [selectedDuration, setSelectedDuration] = useState<number>(25)
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false)
  const [activeSound, setActiveSound] = useState<SoundPreset>("BROWN_NOISE")

  // Web Audio API Persistent References
  const audioCtxRef = useRef<AudioContext | null>(null)
  const activeNodesRef = useRef<AudioNode[]>([]) // Tracking array to safely tear down complex multi-node audio graphs
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(selectedDuration * 60)
    }
  }, [selectedDuration, isRunning])

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionEnd(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRunning])

  // Clear up all audio graphs if user exits the viewport mid-session
  useEffect(() => {
    return () => {
      stopAllAudio()
      if (audioCtxRef.current) audioCtxRef.current.close()
    }
  }, [])

  // Instantly recalculate audio properties if the user changes channels on the fly
  useEffect(() => {
    if (isAudioPlaying) {
      stopAllAudio()
      startProceduralAudio()
    }
  }, [activeSound])

  // --- AUDIO SYNTHESIS PIPELINES ---

  const stopAllAudio = () => {
    activeNodesRef.current.forEach((node) => {
      try {
        // Stop any running sound sources safely
        if ("stop" in node) (node as any).stop()
        node.disconnect()
      } catch (e) {}
    })
    activeNodesRef.current = []
    setIsAudioPlaying(false)
  }

  const initAudioContext = (): AudioContext => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }

  const startProceduralAudio = () => {
    const ctx = initAudioContext()
    setIsAudioPlaying(true)

    // Global Master Volume Limiter for Ear Safety
    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(0.4, ctx.currentTime)
    masterGain.connect(ctx.destination)
    activeNodesRef.current.push(masterGain)

    switch (activeSound) {
      case "BROWN_NOISE":
        generateBrownNoise(ctx, masterGain)
        break
      case "RAIN":
        generateRainfall(ctx, masterGain)
        break
      case "AMBIENT_PAD":
        generateAmbientPad(ctx, masterGain)
        break
      case "LOFI_CHORDS":
        generateLofiChords(ctx, masterGain)
        break
    }
  }

  // Engine 1: Pure Mathematical Brown Noise[cite: 2]
  const generateBrownNoise = (ctx: AudioContext, outputNode: AudioNode) => {
    const bufferSize = 2 * ctx.sampleRate
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let lastOut = 0.0

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      data[i] = (lastOut + 0.02 * white) / 1.02
      lastOut = data[i]
      data[i] *= 3.5
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const filter = ctx.createBiquadFilter()
    filter.type = "lowpass"
    filter.frequency.setValueAtTime(400, ctx.currentTime)

    source.connect(filter)
    filter.connect(outputNode)
    source.start()

    activeNodesRef.current.push(source, filter)
  }

  // Engine 2: Cozy Natural Rainfall
  const generateRainfall = (ctx: AudioContext, outputNode: AudioNode) => {
    // Channel A: Continuous Pitter-Patter (Filtered Pink/White Noise Blend)
    const bufferSize = 2 * ctx.sampleRate
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const noiseData = noiseBuffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      noiseData[i] = Math.random() * 2 - 1
    }

    const staticRain = ctx.createBufferSource()
    staticRain.buffer = noiseBuffer
    staticRain.loop = true

    const rainFilter = ctx.createBiquadFilter()
    rainFilter.type = "bandpass"
    rainFilter.frequency.setValueAtTime(800, ctx.currentTime)
    rainFilter.Q.setValueAtTime(1, ctx.currentTime)

    staticRain.connect(rainFilter)
    rainFilter.connect(outputNode)
    staticRain.start()

    activeNodesRef.current.push(staticRain, rainFilter)

    // Channel B: Individual Raindrop Clicks (Procedural impulses)
    const dropletOsc = ctx.createOscillator()
    dropletOsc.type = "sine"
    dropletOsc.frequency.setValueAtTime(1200, ctx.currentTime)

    const dropletGain = ctx.createGain()
    dropletGain.gain.setValueAtTime(0, ctx.currentTime)

    // Animate randomized droplets via standard intervals
    const dropInterval = setInterval(() => {
      if (!isAudioPlaying) {
        clearInterval(dropInterval)
        return
      }
      const randomPitch = 800 + Math.random() * 600
      dropletOsc.frequency.setValueAtTime(randomPitch, ctx.currentTime)
      dropletGain.gain.setValueAtTime(0.08, ctx.currentTime)
      dropletGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)
    }, 120)

    dropletOsc.connect(dropletGain)
    dropletGain.connect(outputNode)
    dropletOsc.start()

    activeNodesRef.current.push(dropletOsc, dropletGain)
  }

  // Engine 3: Deep Cinematic Synthesizer Drone (Ambient Pad)
  const generateAmbientPad = (ctx: AudioContext, outputNode: AudioNode) => {
    // Generate sweeping chords via 3 detuned multi-frequency notes (Fundamental, 5th, Minor 7th)
    const frequencies = [110.00, 164.81, 196.00] // A2, E3, G3
    
    frequencies.forEach((freq) => {
      const osc = ctx.createOscillator()
      osc.type = "triangle"
      osc.frequency.setValueAtTime(freq + (Math.random() * 0.5 - 0.25), ctx.currentTime) // Natural detune chorus effect

      const oscFilter = ctx.createBiquadFilter()
      oscFilter.type = "lowpass"
      oscFilter.frequency.setValueAtTime(250, ctx.currentTime)

      // Slow dynamic sweeping filter envelope to simulate evolving cinematic pads
      const sweep = () => {
        if (!isAudioPlaying) return
        oscFilter.frequency.linearRampToValueAtTime(180 + Math.random() * 140, ctx.currentTime + 4)
      }
      sweep()
      const sweepTimer = setInterval(sweep, 4000)

      osc.connect(oscFilter)
      oscFilter.connect(outputNode)
      osc.start()

      activeNodesRef.current.push(osc, oscFilter)
    })
  }

  // Engine 4: Lo-Fi Chill Study Chords
  const generateLofiChords = (ctx: AudioContext, outputNode: AudioNode) => {
    // Lo-Fi Chord Progressions (Am7 -> D7 -> Gmaj7)
    const chordProgression = [
      [220.00, 261.63, 329.63, 392.00], // Am7
      [293.66, 349.23, 440.00, 523.25], // D7
      [196.00, 246.94, 293.66, 392.00], // Gmaj7
    ]

    let currentChordIdx = 0

    const playChord = () => {
      if (!isAudioPlaying) return

      const now = ctx.currentTime
      const chord = chordProgression[currentChordIdx]

      chord.forEach((freq) => {
        const osc = ctx.createOscillator()
        osc.type = "sine"
        osc.frequency.setValueAtTime(freq, now)

        const envelope = ctx.createGain()
        envelope.gain.setValueAtTime(0, now)
        envelope.gain.linearRampToValueAtTime(0.12, now + 0.4) // Smooth attack
        envelope.gain.exponentialRampToValueAtTime(0.001, now + 4.8) // Long vintage decay

        // Subtle vintage vibrato modulations
        const vibrato = ctx.createOscillator()
        const vibratoGain = ctx.createGain()
        vibrato.frequency.value = 4.5 
        vibratoGain.gain.value = 1.8 
        
        vibrato.connect(vibratoGain)
        vibratoGain.connect(osc.frequency)
        
        osc.connect(envelope)
        envelope.connect(outputNode)
        
        vibrato.start()
        osc.start()
        
        osc.stop(now + 5.0)
        vibrato.stop(now + 5.0)
      })

      currentChordIdx = (currentChordIdx + 1) % chordProgression.length
    }

    playChord()
    const progressionTimer = setInterval(playChord, 5000)

    // Append artificial warm analog record vinyl crackle in background
    const bufferSize = 1 * ctx.sampleRate
    const crackleBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const crackleData = crackleBuffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      crackleData[i] = Math.random() > 0.992 ? Math.random() * 0.15 : 0
    }
    const crackleSource = ctx.createBufferSource()
    crackleSource.buffer = crackleBuffer
    crackleSource.loop = true
    
    const crackleGain = ctx.createGain()
    crackleGain.gain.setValueAtTime(0.04, ctx.currentTime)
    
    crackleSource.connect(crackleGain)
    crackleGain.connect(outputNode)
    crackleSource.start()

    activeNodesRef.current.push(crackleSource, crackleGain)
  }

  const togglePlaybackToggle = () => {
    if (isAudioPlaying) {
      stopAllAudio()
    } else {
      startProceduralAudio()
    }
  }

  // --- TIMEOUT TERMINATIONS & AGGREGATIONS ---
  const startSession = () => {
    setIsRunning(true)
    if (!isAudioPlaying) startProceduralAudio()
  }

  const abortSession = () => {
    if (!confirm("Are you sure you want to exit your sanctuary focus window? Progress will be lost.")) return
    handleSessionEnd(false)
  }

  const handleSessionEnd = (completedSuccessfully: boolean) => {
    setIsRunning(false)
    if (timerRef.current) clearInterval(timerRef.current)
    stopAllAudio()

    const targetStatus: FocusStatus = completedSuccessfully ? "SUCCESS" : "FAILED"
    const sessionMinutes = selectedDuration

    const pseudoId = Math.random().toString()
    const optimisticLog: SessionLog = {
      id: pseudoId,
      duration: sessionMinutes,
      status: targetStatus,
      createdAt: new Date()
    }

    setHistory((prev) => [optimisticLog, ...prev])
    setTimeLeft(selectedDuration * 60)

    startTransition(async () => {
      await logFocusSession(sessionMinutes, targetStatus)
    })
  }

  const formatTimeDisplay = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const successfulBlocks = history.filter(log => log.status === "SUCCESS")
  const completedFocusMinutes = successfulBlocks.reduce((acc, current) => acc + current.duration, 0)

  // Decorative presets directory map for rendering selections
  const soundTracks: { id: SoundPreset; label: string; icon: React.ReactNode }[] = [
    { id: "BROWN_NOISE", label: "Brown Noise", icon: <Radio className="w-3.5 h-3.5" /> },
    { id: "RAIN", label: "Slight Rain", icon: <CloudRain className="w-3.5 h-3.5" /> },
    { id: "AMBIENT_PAD", label: "Cinema Drone", icon: <HelpCircle className="w-3.5 h-3.5" /> },
    { id: "LOFI_CHORDS", label: "Lo-Fi Study", icon: <Music className="w-3.5 h-3.5" /> },
  ]

  return (
    <>
      <Header />
      <main className="flex-1 p-10 max-w-7xl mx-auto w-full text-slate-100">
        
        {/* Module Header */}
        <div className="mb-12">
          <p className="text-xs font-semibold tracking-widest text-emerald-400 uppercase mb-2">Isolation Engine</p>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-1">Focus Sanctuary</h1>
          <p className="text-sm text-slate-400 font-mono">
            Procedural, client-side synthesized acoustics engineered for alpha wave synchronization.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-8">
          
          {/* Main Control Interface Block */}
          <div className="col-span-12 lg:col-span-7 bg-slate-900 border border-slate-800 p-8 rounded-xl flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[500px]">
            
            {isAudioPlaying && (
              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-full text-[10px] uppercase font-bold tracking-widest animate-pulse">
                <Volume2 className="w-3 h-3" /> Broadcast Active
              </div>
            )}

            {/* Time Display */}
            <div className="space-y-2 mb-6 select-none">
              <h2 className="text-8xl font-black font-mono tracking-tighter text-white tabular-nums drop-shadow-[0_4px_12px_rgba(255,255,255,0.05)]">
                {formatTimeDisplay(timeLeft)}
              </h2>
              <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">
                {isRunning ? "Deep Block In Progress" : "Awaiting Operational Initialization"}
              </p>
            </div>

            {/* Configuration Selectors */}
            {!isRunning && (
              <div className="flex gap-2 p-1 bg-slate-950 border border-slate-800 rounded mb-6">
                {[15, 25, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setSelectedDuration(mins)}
                    className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${
                      selectedDuration === mins ? "bg-slate-100 text-slate-950 shadow" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            )}

            {/* PREMIUM SOUND DECK CHANNELS CONTAINER */}
            <div className="w-full max-w-sm bg-slate-950 border border-slate-800/80 p-2 rounded-xl space-y-1 mb-8">
              <span className="text-[9px] font-bold tracking-widest text-slate-500 uppercase block text-left px-2 pt-1 pb-1.5">Acoustic Station Select</span>
              <div className="grid grid-cols-2 gap-1">
                {soundTracks.map((track) => (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => setActiveSound(track.id)}
                    className={`flex items-center gap-2 px-3 py-2 text-xs rounded transition-all font-medium ${
                      activeSound === track.id
                        ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/60 font-semibold"
                        : "text-slate-400 hover:text-slate-200 border border-transparent hover:bg-slate-900/50"
                    }`}
                  >
                    {track.icon}
                    <span>{track.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Matrix Links */}
            <div className="flex items-center gap-4">
              {/* Sound Masking Trigger */}
              <button
                onClick={togglePlaybackToggle}
                className={`p-3.5 rounded-full border transition-all ${
                  isAudioPlaying
                    ? "bg-emerald-950 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-950"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
                title={isAudioPlaying ? "Mute Acoustic Synthesizer" : "Activate Ambient Masking Sound"}
              >
                {isAudioPlaying ? <Volume2 className="w-5 h-5 stroke-[2.5]" /> : <VolumeX className="w-5 h-5" />}
              </button>

              {/* Core Execution Controls */}
              {!isRunning ? (
                <button
                  onClick={startSession}
                  className="flex items-center gap-2 px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-950 text-sm font-bold rounded-full shadow-lg transition-all"
                >
                  <Play className="w-4 h-4 fill-current" /> Enter Sanctuary
                </button>
              ) : (
                <button
                  onClick={abortSession}
                  className="flex items-center gap-2 px-8 py-3.5 bg-rose-950/60 border border-rose-800/80 text-rose-400 text-sm font-bold rounded-full shadow-lg transition-all"
                >
                  <Square className="w-4 h-4 fill-current" /> Terminate Session
                </button>
              )}
            </div>
          </div>

          {/* Metric Ecosystem Blocks[cite: 2] */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase block mb-1">Blocks Secured</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-emerald-400 font-mono">{successfulBlocks.length}</span>
                  <span className="text-xs text-slate-400">sessions</span>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase block mb-1">Time Isolated</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-sky-400 font-mono">{completedFocusMinutes}</span>
                  <span className="text-xs text-slate-400">mins</span>
                </div>
              </div>
            </div>

            {/* Daily History Activity Stream[cite: 2] */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex-1 flex flex-col justify-between max-h-[350px]">
              <div>
                <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-4">Sanctuary History Stream</h3>
                <div className="space-y-2 overflow-y-auto pr-1 max-h-[250px] scrollbar-thin">
                  {history.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-6 text-center">No focus sessions logged within this operational matrix.</p>
                  ) : (
                    history.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-3 bg-slate-950/50 border border-slate-800/60 rounded-lg text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1 rounded border ${log.status === "SUCCESS" ? "bg-emerald-950 border-emerald-800 text-emerald-400" : "bg-rose-950 border-rose-900 text-rose-400"}`}>
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-200">{log.duration} Minute Focus Block</p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider font-mono ${log.status === "SUCCESS" ? "text-emerald-400" : "text-rose-400"}`}>
                          {log.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  )
}