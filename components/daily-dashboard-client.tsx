"use client";

import { useState } from "react";
import Header from "@/components/header";
import { Check, CheckCircle2, Clock, Plus, Zap } from "lucide-react";

// TypeScript interfaces ensuring type-safety from database rows
interface Habit {
  id: string;
  name: string;
  frequency: string;
}

interface DailyDashboardClientProps {
  initialHabits: Habit[];
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export default function DailyDashboardClient({ initialHabits, user }: DailyDashboardClientProps) {
  // Initialize state with real habits pulled from PostgreSQL
  const [habits, setHabits] = useState(
    initialHabits.map((h) => ({ ...h, completed: false }))
  );

  // Stand-in state for tasks (we will bind this to database rows next)
  const [tasks, setTasks] = useState([
    { id: 1, title: "Finalize architectural review for Project Zenith", priority: "High", time: "10:00 AM", completed: false },
    { id: 2, title: "Morning sync with design lead", priority: "Meeting", time: "11:30 AM", completed: true },
    { id: 3, title: "Write documentation for core API endpoints", priority: "None", time: "Est: 2h", completed: false },
  ]);

  const toggleHabit = (id: string) => {
    setHabits(habits.map(h => h.id === id ? { ...h, completed: !h.completed } : h));
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const completedHabitsCount = habits.filter(h => h.completed).length;

  return (
    <>
      <Header />
      <main className="flex-1 p-10 max-w-7xl mx-auto w-full">
        {/* Dynamic Welcome Context */}
        <div className="mb-12">
          <p className="text-xs font-semibold tracking-widest text-pace-success uppercase mb-2">Current Ritual Cycle</p>
          <h1 className="text-4xl font-extrabold text-pace-textMain tracking-tight mb-1">
            Welcome back, {user.name || "Executor"}
          </h1>
          <p className="text-sm text-pace-textMuted font-mono">
            Cycle Matrix Date: {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Habits Bento Block */}
          <div className="col-span-12 bg-pace-card border border-pace-border p-8 rounded-xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-medium tracking-tight">Habit Momentum</h3>
              <span className="text-xs text-pace-textMuted font-mono font-bold tracking-wider uppercase bg-pace-bg px-3 py-1 border border-pace-border rounded">
                {completedHabitsCount}/{habits.length} Completed
              </span>
            </div>

            {habits.length === 0 ? (
              <p className="text-sm text-pace-textMuted italic py-4">No active protocols loaded in database. Initialize habits in the inventory map.</p>
            ) : (
              <div className="flex flex-wrap gap-8 items-center">
                {habits.map((habit) => (
                  <div key={habit.id} className="flex flex-col items-center gap-3 cursor-pointer group" onClick={() => toggleHabit(habit.id)}>
                    <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all active:scale-95 duration-300 ${
                      habit.completed 
                        ? "bg-pace-success/20 border-pace-success shadow-[0_0_15px_rgba(118,200,162,0.2)] text-pace-success" 
                        : "border-pace-border text-pace-textMuted group-hover:border-pace-textMuted"
                    }`}>
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className={`text-xs ${habit.completed ? "text-pace-textMain" : "text-pace-textMuted"}`}>{habit.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Core Tasks Panel */}
          <div className="col-span-12 lg:col-span-8 bg-pace-card border border-pace-border p-8 rounded-xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-medium tracking-tight">Today's Focus Stack</h3>
              <button className="bg-pace-textMain text-pace-bg px-4 py-2 text-xs font-bold rounded hover:opacity-90 transition-opacity flex items-center gap-2">
                <Plus className="w-3.5 h-3.5" /> Add Task
              </button>
            </div>
            <div className="space-y-2">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-4 p-4 rounded-lg bg-pace-bg/40 border border-pace-border/40 hover:bg-pace-bg/80 hover:border-pace-border transition-colors cursor-pointer" onClick={() => toggleTask(task.id)}>
                  <div className={`w-5 h-5 border rounded flex items-center justify-center transition-all ${
                    task.completed ? "bg-pace-success border-pace-success" : "border-pace-border"
                  }`}>
                    {task.completed && <Check className="w-3 h-3 text-pace-bg font-extrabold" />}
                  </div>
                  <div className="flex-1">
                    <span className={`text-sm ${task.completed ? "line-through opacity-40 text-pace-textMuted" : "text-pace-textMain"}`}>{task.title}</span>
                    <div className="flex gap-2 mt-1.5 items-center">
                      {task.priority === "High" && (
                        <span className="bg-pace-urgent/10 text-pace-urgent px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-pace-urgent/20">High Priority</span>
                      )}
                      {task.priority === "Meeting" && (
                        <span className="bg-pace-focus/10 text-pace-focus px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-pace-focus/20">Meeting</span>
                      )}
                      <span className="text-pace-textMuted text-[11px] flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" /> {task.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Summary Grid */}
          <div className="col-span-12 lg:col-span-4 bg-pace-card border border-pace-border p-8 rounded-xl flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="text-lg font-medium tracking-tight">Productivity Matrix</h3>
              
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[11px] font-bold tracking-wider text-pace-textMuted uppercase">Task Completion</span>
                  <span className="text-base font-bold font-mono text-pace-success">75%</span>
                </div>
                <div className="h-1.5 w-full bg-pace-bg rounded-full overflow-hidden border border-pace-border/50">
                  <div className="h-full bg-pace-success" style={{ width: "75%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[11px] font-bold tracking-wider text-pace-textMuted uppercase">Focus Blocks Spent</span>
                  <span className="text-base font-bold font-mono text-pace-focus">3.2h</span>
                </div>
                <div className="h-1.5 w-full bg-pace-bg rounded-full overflow-hidden border border-pace-border/50">
                  <div className="h-full bg-pace-focus" style={{ width: "45%" }}></div>
                </div>
              </div>

              <div className="pt-6 border-t border-pace-border/40">
                <div className="flex items-center gap-2 mb-3 text-pace-urgent">
                  <Zap className="w-4 h-4 fill-current" />
                  <span className="text-sm font-semibold text-pace-textMain">Streak: 12 Cycles</span>
                </div>
                <p className="text-xs text-pace-textMuted leading-relaxed italic">
                  "Focus operates like a muscle. You are building exceptional operational consistency inside your morning system blocks."
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}