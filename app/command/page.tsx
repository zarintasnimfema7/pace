"use client";

import { useState } from "react";
import Header from "@/components/header";
import { Plus, Check, AlertCircle, Calendar, MoreVertical } from "lucide-react";

export default function CommandCenterPage() {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Architect modular notification service engine", group: "Engineering", priority: "High", due: "Due Today", completed: false },
    { id: 2, title: "Review Q3 continuous cluster performance milestones", group: "Strategy", priority: "Medium", due: "Tomorrow", completed: false },
    { id: 3, title: "Isolate outdated library dependency trees", group: "Maintenance", priority: "Low", due: "4 days ago", completed: true },
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <>
      <Header title="Command Control Dock" />
      <main className="flex-1 p-10 max-w-7xl mx-auto w-full space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-pace-textMain">Command Center</h2>
            <p className="text-xs text-pace-textMuted">Orchestrating high-leverage atomic objectives.</p>
          </div>
          <div className="flex gap-6 items-center text-right font-mono">
            <div>
              <span className="block text-[10px] font-bold text-pace-textMuted uppercase tracking-wider">Velocity</span>
              <span className="block text-lg font-bold text-pace-success">94%</span>
            </div>
            <div className="h-8 w-[1px] bg-pace-border" />
            <div>
              <span className="block text-[10px] font-bold text-pace-textMuted uppercase tracking-wider">Load Factors</span>
              <span className="block text-lg font-bold text-pace-textMain">12 / 18</span>
            </div>
          </div>
        </header>

        {/* Sticky Input Field */}
        <section className="bg-pace-card border border-pace-border rounded-xl p-4 flex items-center gap-4 shadow-xl">
          <Plus className="text-pace-urgent w-5 h-5" />
          <input type="text" className="bg-transparent border-none text-sm text-pace-textMain placeholder:text-pace-textMuted focus:outline-none w-full" placeholder="Append structural task to global queue... (Hit Enter)" />
          <div className="flex items-center gap-2 shrink-0">
            <kbd className="px-2 py-1 rounded bg-pace-bg border border-pace-border text-[10px] text-pace-textMuted font-mono">⌘K</kbd>
            <button className="bg-pace-textMain text-pace-bg py-1.5 px-4 text-xs font-bold rounded hover:opacity-90">Append</button>
          </div>
        </section>

        {/* Tabular Layout List */}
        <div className="bg-pace-card border border-pace-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-[48px_1fr_120px_140px_60px] border-b border-pace-border bg-pace-bg/40 px-4 py-3 text-[10px] font-bold text-pace-textMuted tracking-wider uppercase">
            <div></div>
            <div>Objective Task Block</div>
            <div>Priority</div>
            <div>Timeline Space</div>
            <div className="text-right">Action</div>
          </div>

          <div className="divide-y divide-pace-border/60">
            {tasks.map((task) => (
              <div key={task.id} className="grid grid-cols-[48px_1fr_120px_140px_60px] items-center px-4 py-4 hover:bg-pace-bg/30 transition-colors group">
                <div className="flex justify-center">
                  <button className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                    task.completed ? "bg-pace-success border-pace-success" : "border-pace-border hover:border-pace-textMuted"
                  }`} onClick={() => toggleTask(task.id)}>
                    {task.completed && <Check className="w-2.5 h-2.5 text-pace-bg font-extrabold" />}
                  </button>
                </div>
                <div className="flex flex-col pr-4">
                  <span className={`text-sm font-medium ${task.completed ? "line-through opacity-40 text-pace-textMuted italic" : "text-pace-textMain"}`}>{task.title}</span>
                  <span className="text-[11px] text-pace-textMuted flex items-center gap-1 mt-0.5"><Calendar className="w-3 h-3" /> {task.group}</span>
                </div>
                <div>
                  <span className={`text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded border ${
                    task.priority === "High" ? "bg-pace-urgent/10 text-pace-urgent border-pace-urgent/20" :
                    task.priority === "Medium" ? "bg-pace-focus/10 text-pace-focus border-pace-focus/20" :
                    "bg-pace-bg text-pace-textMuted border-pace-border"
                  }`}>{task.priority}</span>
                </div>
                <div className="text-xs text-pace-textMuted font-mono">{task.due}</div>
                <div className="text-right opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 text-pace-textMuted hover:text-pace-textMain"><MoreVertical className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}