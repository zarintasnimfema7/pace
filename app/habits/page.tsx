"use client";

import { useState } from "react";
import Header from "@/components/header";
import { PlusCircle, Sliders, Flame } from "lucide-react";

export default function HabitsInventoryPage() {
  const [activeTab, setActiveTab] = useState("Daily");
  const habitsData = [
    { name: "Morning Cardio", freq: "Daily", streak: 14, desc: "Maintain Zone 2 heart rate for 45 minutes before first macro ingestion block.", cells: [1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1] },
    { name: "Cold Exposure", freq: "Custom", streak: 42, desc: "3-minute deliberate cold immersion at 10°C to release shock proteins.", cells: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
    { name: "Deep Learning", freq: "Daily", streak: 0, desc: "Devote a solid hour to modern systems engineering or technical architecture maps.", cells: [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  ];

  return (
    <>
      <Header title="Habit Inventory Blueprint" />
      <main className="flex-1 p-10 max-w-7xl mx-auto w-full space-y-12">
        {/* Engineering Card Box */}
        <div className="bg-pace-card border border-pace-border rounded-xl p-8 max-w-4xl">
          <div className="flex items-center gap-2 mb-6 text-pace-success">
            <PlusCircle className="w-5 h-5" />
            <h3 className="text-lg font-medium tracking-tight text-pace-textMain">Initialize Protocol</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold tracking-wider text-pace-textMuted uppercase mb-2">Protocol Name</label>
                <input type="text" className="w-full bg-pace-bg border border-pace-border rounded px-4 py-2.5 text-sm text-pace-textMain focus:border-pace-success outline-none transition-colors" placeholder="e.g. System Architecture Mapping" />
              </div>
              <div>
                <label className="block text-[11px] font-bold tracking-wider text-pace-textMuted uppercase mb-2">Operational Target Scope</label>
                <textarea rows={2} className="w-full bg-pace-bg border border-pace-border rounded px-4 py-2.5 text-sm text-pace-textMain focus:border-pace-success outline-none transition-colors resize-none" placeholder="Isolate micro targets..." />
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-[11px] font-bold tracking-wider text-pace-textMuted uppercase mb-2">Interval Frequency</label>
                <div className="flex gap-1 p-1 bg-pace-bg border border-pace-border rounded w-fit">
                  {["Daily", "Weekly", "Custom"].map(tab => (
                    <button key={tab} className={`px-4 py-1.5 rounded text-xs font-semibold transition-all ${activeTab === tab ? "bg-pace-textMain text-pace-bg" : "text-pace-textMuted hover:text-pace-textMain"}`} onClick={() => setActiveTab(tab)}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              <button className="w-full py-3 bg-pace-textMain text-pace-bg text-sm font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all">
                Deploy Protocol Engine
              </button>
            </div>
          </div>
        </div>

        {/* Display Grid */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-semibold text-pace-textMain">Active Continuous Protocols</h3>
            <div className="flex items-center gap-2 text-xs text-pace-textMuted cursor-pointer hover:text-pace-textMain">
              <Sliders className="w-3.5 h-3.5" /> <span>Sort: Recent</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {habitsData.map((habit, index) => (
              <div key={index} className="bg-pace-card border border-pace-border rounded-xl p-6 hover:border-pace-success/40 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-base font-semibold text-pace-textMain mb-1">{habit.name}</h4>
                      <span className="text-[10px] font-bold font-mono uppercase tracking-wider px-2 py-0.5 bg-pace-bg border border-pace-border rounded text-pace-textMuted">{habit.freq}</span>
                    </div>
                    <div className="flex items-center gap-1 text-orange-400 font-mono text-sm font-bold">
                      <Flame className="w-4 h-4 fill-current" />
                      <span>{habit.streak}d</span>
                    </div>
                  </div>
                  <p className="text-xs text-pace-textMuted leading-relaxed mb-6">{habit.desc}</p>
                </div>
                <div className="space-y-2">
                  <span className="block text-[10px] font-bold tracking-wider text-pace-textMuted uppercase">Consistency Matrix</span>
                  <div className="flex gap-1 flex-wrap">
                    {habit.cells.map((cell, idx) => (
                      <div key={idx} className={`w-3 h-3 rounded-sm border ${cell === 1 ? "bg-pace-success border-pace-success/40" : "bg-pace-bg border-pace-border/60"}`} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}