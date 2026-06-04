"use client"

import React, { useState, useTransition, useOptimistic } from "react"
import { createHabit, toggleHabitStatus, deleteHabit } from "@/app/actions/habit-actions"
import { Check, Square, Trash2, Calendar, ShieldCheck, Flame, BarChart2, X } from "lucide-react"

interface HabitWithLogs {
  id: string
  name: string
  description: string | null
  frequency: string
  customCount: number | null
  logs: { date: Date }[]
}

interface HabitsPageProps {
  initialHabits: HabitWithLogs[]
}

// ─── Analytics Modal ────────────────────────────────────────────────────────

function AnalyticsModal({ habit, onClose }: { habit: HabitWithLogs; onClose: () => void }) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  // All days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthDays: Date[] = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(year, month, i + 1)
    d.setHours(0, 0, 0, 0)
    return d
  })

  const logSet = new Set(habit.logs.map(l => new Date(l.date).toDateString()))
  const isLogged = (d: Date) => logSet.has(d.toDateString())

  const monthName = now.toLocaleString("default", { month: "long", year: "numeric" })

  // Week helpers — ISO-style weeks starting Monday
  const getWeekOfMonth = (d: Date) => {
    const firstDay = new Date(year, month, 1).getDay() // 0=Sun
    return Math.ceil((d.getDate() + ((firstDay + 6) % 7)) / 7)
  }

  const weekCount = getWeekOfMonth(monthDays[monthDays.length - 1])
  const weeks: Date[][] = Array.from({ length: weekCount }, () => [])
  monthDays.forEach(d => weeks[getWeekOfMonth(d) - 1].push(d))

  // ── DAILY VIEW ──
  const renderDaily = () => {
    const firstDow = (new Date(year, month, 1).getDay() + 6) % 7 // Mon=0
    const cells: (Date | null)[] = [
      ...Array(firstDow).fill(null),
      ...monthDays,
    ]
    const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const completedCount = monthDays.filter(isLogged).length
    const pct = Math.round((completedCount / daysInMonth) * 100)

    return (
      <div className="space-y-5">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400 font-mono">{completedCount}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-300 font-mono">{daysInMonth - completedCount}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Missed</div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-[10px] text-slate-500 mb-1 uppercase tracking-widest">
              <span>Completion rate</span>
              <span className="text-emerald-400 font-bold">{pct}%</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        <div>
          <div className="grid grid-cols-7 mb-1">
            {dayLabels.map(l => (
              <div key={l} className="text-center text-[9px] font-bold text-slate-600 uppercase tracking-widest py-1">{l}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) =>
              d === null ? (
                <div key={`empty-${i}`} />
              ) : (
                <div
                  key={d.toDateString()}
                  title={d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                  className={`aspect-square rounded-md flex items-center justify-center text-[11px] font-bold transition-all
                    ${isLogged(d)
                      ? "bg-emerald-600 text-white shadow shadow-emerald-900/50"
                      : d > now
                      ? "bg-slate-900 text-slate-700 border border-slate-800/50"
                      : "bg-slate-900 text-slate-500 border border-slate-800"
                    }
                    ${d.toDateString() === now.toDateString() ? "ring-1 ring-emerald-400 ring-offset-1 ring-offset-slate-950" : ""}
                  `}
                >
                  {d.getDate()}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── WEEKLY VIEW ──
  const renderWeekly = () => {
    return (
      <div className="space-y-3">
        {weeks.map((week, wi) => {
          const anyLogged = week.some(isLogged)
          const weekLabel = `Week ${wi + 1}`
          const rangeLabel = `${week[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${week[week.length - 1].toLocaleDateString(undefined, { month: "short", day: "numeric" })}`

          return (
            <div key={wi} className="flex items-center gap-4 bg-slate-900/60 border border-slate-800 rounded-lg px-5 py-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all
                ${anyLogged ? "bg-emerald-600 text-white shadow shadow-emerald-900" : "bg-slate-800 text-slate-500"}`}>
                {anyLogged ? <Check className="w-4 h-4 stroke-[3]" /> : <Square className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-200">{weekLabel}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{rangeLabel}</span>
                </div>
                <div className="flex gap-1 mt-2">
                  {week.map(d => (
                    <div
                      key={d.toDateString()}
                      title={d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                      className={`flex-1 h-1.5 rounded-full transition-all
                        ${isLogged(d) ? "bg-emerald-500" : d > now ? "bg-slate-800/50" : "bg-slate-700"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // ── CUSTOM VIEW ──
  const renderCustom = () => {
    const target = habit.customCount ?? 3

    return (
      <div className="space-y-3">
        {weeks.map((week, wi) => {
          const completedDays = week.filter(isLogged).length
          const pastDays = week.filter(d => d <= now).length
          const pct = pastDays > 0 ? Math.round((completedDays / target) * 100) : 0
          const clampedPct = Math.min(pct, 100)
          const goalMet = completedDays >= target
          const weekLabel = `Week ${wi + 1}`
          const rangeLabel = `${week[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${week[week.length - 1].toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
          const isFuture = week.every(d => d > now)

          return (
            <div key={wi} className="bg-slate-900/60 border border-slate-800 rounded-lg px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-slate-200">{weekLabel}</span>
                  <span className="text-[10px] text-slate-500 font-mono ml-3">{rangeLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold font-mono ${goalMet ? "text-emerald-400" : isFuture ? "text-slate-600" : "text-amber-400"}`}>
                    {completedDays}/{target}
                  </span>
                  {!isFuture && (
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider
                      ${goalMet ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-amber-950/50 text-amber-400 border border-amber-900/50"}`}>
                      {goalMet ? "Goal Met" : "In Progress"}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${goalMet ? "bg-emerald-500" : "bg-amber-500"}`}
                  style={{ width: `${clampedPct}%` }}
                />
              </div>

              {/* Day dots */}
              <div className="flex gap-1.5">
                {week.map((d, di) => {
                  const logged = isLogged(d)
                  const past = d <= now
                  return (
                    <div
                      key={di}
                      title={d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
                      className={`flex-1 rounded py-1.5 flex flex-col items-center gap-0.5
                        ${logged ? "bg-emerald-600/20 border border-emerald-600/40" : past ? "bg-slate-800/60 border border-slate-700/40" : "bg-slate-900/40 border border-slate-800/30"}`}
                    >
                      <span className="text-[8px] text-slate-500 font-bold uppercase">
                        {d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2)}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${logged ? "bg-emerald-400" : past ? "bg-slate-600" : "bg-slate-800"}`} />
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart2 className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Analytics</span>
            </div>
            <h3 className="text-lg font-semibold text-white">{habit.name}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">{monthName}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold font-mono px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-400 uppercase tracking-wider">
              {habit.frequency === "CUSTOM" ? `${habit.customCount}×/wk` : habit.frequency}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {habit.frequency === "DAILY" && renderDaily()}
          {habit.frequency === "WEEKLY" && renderWeekly()}
          {habit.frequency === "CUSTOM" && renderCustom()}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function HabitsDashboardClient({ initialHabits = [] }: HabitsPageProps) {
  const [isPending, startTransition] = useTransition()
  const [analyticsHabit, setAnalyticsHabit] = useState<HabitWithLogs | null>(null)

  // State elements for creation parameters
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [frequency, setFrequency] = useState("DAILY")
  const [customCount, setCustomCount] = useState(3)

  // UseOptimistic manages the active habits interface for rapid toggle states
  const [optimisticHabits, setOptimisticHabits] = useOptimistic(
    initialHabits,
    (state, update: { type: "toggle" | "delete"; habitId: string; dateStr?: string; completed?: boolean }) => {
      if (update.type === "delete") {
        return state.filter(h => h.id !== update.habitId)
      }
      if (update.type === "toggle") {
        return state.map(h => {
          if (h.id !== update.habitId) return h
          const cleanDate = new Date(update.dateStr!)
          cleanDate.setHours(0, 0, 0, 0)

          const logExists = h.logs.some(l => new Date(l.date).toDateString() === cleanDate.toDateString())
          let newLogs = [...h.logs]

          if (update.completed) {
            if (!logExists) newLogs.push({ date: cleanDate })
          } else {
            newLogs = newLogs.filter(l => new Date(l.date).toDateString() !== cleanDate.toDateString())
          }
          return { ...h, logs: newLogs }
        })
      }
      return state
    }
  )

  const getPastSevenDays = () => {
    const trackingDays = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      d.setHours(0,0,0,0)
      trackingDays.push(d)
    }
    return trackingDays
  }
  const pastSevenDays = getPastSevenDays()
  const todayStr = new Date().toDateString()

  const handleCreateProtocol = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    startTransition(async () => {
      const res = await createHabit({
        name,
        description,
        frequency,
        customCount: frequency === "CUSTOM" ? customCount : undefined
      })
      if (res.success) {
        setName("")
        setDescription("")
        setFrequency("DAILY")
      }
    })
  }

  const handleToggleCompletion = (habitId: string, targetDate: Date, currentlyCompleted: boolean) => {
    const dateStr = targetDate.toISOString()
    const nextState = !currentlyCompleted

    startTransition(async () => {
      setOptimisticHabits({ type: "toggle", habitId, dateStr, completed: nextState })
      await toggleHabitStatus(habitId, dateStr, nextState)
    })
  }

  const handleDeleteProtocol = (habitId: string) => {
    if (!confirm("Are you sure you want to delete this habit?")) return
    startTransition(async () => {
      setOptimisticHabits({ type: "delete", habitId })
      await deleteHabit(habitId)
    })
  }

  // When opening analytics, pull the latest optimistic state for that habit
  const openAnalytics = (habit: HabitWithLogs) => {
    setAnalyticsHabit(habit)
  }

  // Keep analytics modal in sync with optimistic state
  const analyticsHabitLive = analyticsHabit
    ? optimisticHabits.find(h => h.id === analyticsHabit.id) ?? analyticsHabit
    : null

  return (
    <div className="max-w-7xl mx-auto p-10 space-y-12 text-slate-100 w-full">

      {/* Analytics Modal */}
      {analyticsHabitLive && (
        <AnalyticsModal habit={analyticsHabitLive} onClose={() => setAnalyticsHabit(null)} />
      )}

      {/* CARD TOP: Initialize Protocol */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl backdrop-blur-md w-full max-w-full">
        <div className="flex items-center gap-2 mb-6 text-emerald-500">
          <ShieldCheck className="w-5 h-5" />
          <h3 className="text-lg font-medium tracking-tight text-white">Create new Habit</h3>
        </div>
        
        <form onSubmit={handleCreateProtocol} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1">Habit Name</label>
              <input 
                type="text" 
                placeholder="name of habit to track" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2.5 text-sm text-slate-200 focus:border-emerald-500 outline-none transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1">Habit Description</label>
              <input 
                type="text" 
                placeholder="Brief breakdown" 
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2.5 text-sm text-slate-200 focus:border-emerald-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-6 flex flex-col justify-between">
            <div>
              <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">Frequency</label>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-1 p-1 bg-slate-950 border border-slate-800 rounded w-fit">
                  {["DAILY", "WEEKLY", "CUSTOM"].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFrequency(f)}
                      className={`px-4 py-1.5 rounded text-xs font-semibold transition-all ${
                        frequency === f 
                          ? "bg-slate-100 text-slate-950 shadow" 
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {f.charAt(0) + f.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>

                {frequency === "CUSTOM" && (
                  <div className="flex items-center gap-2 animate-fadeIn">
                    <input 
                      type="number" 
                      min="1" 
                      max="7" 
                      value={customCount}
                      onChange={e => setCustomCount(parseInt(e.target.value) || 1)}
                      className="w-12 text-center bg-slate-950 border border-slate-800 rounded py-1 text-xs text-emerald-400 font-bold focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Days / Wk</span>
                  </div>
                )}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isPending || !name.trim()}
              className="w-full py-3 bg-slate-100 text-slate-950 text-sm font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-40"
            >
              Create
            </button>
          </div>
        </form>
      </div>

      <hr className="border-slate-800" />

      {/* CARD BOTTOM: Habits Grid */}
      <div className="space-y-6">
        <div>
          <h2 className="text-base font-semibold text-white">Habits</h2>
          <p className="text-xs text-slate-400 mt-1">Track your daily routines and build positive habits</p>
        </div>

        {optimisticHabits.length === 0 ? (
          <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-xl p-12 text-center">
            <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No active habits registered inside database arrays.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {optimisticHabits.map((habit) => {
              const isCompletedToday = habit.logs.some(l => new Date(l.date).toDateString() === todayStr)

              return (
                <div 
                  key={habit.id} 
                  className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between space-y-6 min-h-[220px]"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className={`text-base font-semibold mb-1 transition-all ${isCompletedToday ? "line-through text-slate-500" : "text-white"}`}>
                          {habit.name}
                        </h4>
                        <span className="text-[10px] font-bold font-mono uppercase tracking-wider px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-slate-400 inline-block">
                          {habit.frequency === "CUSTOM" ? `${habit.customCount}x / Wk` : habit.frequency.toLowerCase()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        {/* Analytics button */}
                        <button
                          type="button"
                          onClick={() => openAnalytics(habit)}
                          className="p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-sky-400 hover:border-sky-900/60 transition-all"
                          title="View Analytics"
                        >
                          <BarChart2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleCompletion(habit.id, new Date(), isCompletedToday)}
                          className={`p-1.5 rounded border transition-all ${
                            isCompletedToday 
                              ? "bg-emerald-950/40 border-emerald-500 text-emerald-400" 
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                          title={isCompletedToday ? "Mark Incomplete Today" : "Mark Complete Today"}
                        >
                          {isCompletedToday ? <Check className="w-4 h-4 stroke-[3]" /> : <Square className="w-4 h-4" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteProtocol(habit.id)}
                          className="p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-950/40 transition-all"
                          title="Delete Habit"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {habit.description && (
                      <p className="text-xs text-slate-400 leading-relaxed font-light line-clamp-3">{habit.description}</p>
                    )}
                  </div>

                  {/* Consistency Matrix */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">Consistency Matrix</span>
                      <div className="flex items-center gap-0.5 text-orange-400 font-mono text-xs font-bold">
                        <Flame className="w-3 h-3 fill-current" />
                        <span>{habit.logs.length}d</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-1.5 flex-wrap pt-1">
                      {pastSevenDays.map((day, idx) => {
                        const dayLogged = habit.logs.some(l => new Date(l.date).toDateString() === day.toDateString())
                        const isDayToday = day.toDateString() === todayStr

                        return (
                          <button
                            key={idx}
                            type="button"
                            title={day.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                            onClick={() => handleToggleCompletion(habit.id, day, dayLogged)}
                            className={`w-7 h-7 rounded text-[10px] font-bold transition-all flex items-center justify-center border ${
                              dayLogged 
                                ? "bg-emerald-600 border-emerald-500 text-white shadow-sm shadow-emerald-900" 
                                : isDayToday 
                                ? "border-slate-600 bg-slate-950 text-slate-200 font-extrabold" 
                                : "border-slate-800/80 bg-slate-950 text-slate-500 hover:border-slate-700"
                            }`}
                          >
                            {day.getDate()}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}