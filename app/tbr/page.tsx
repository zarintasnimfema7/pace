"use client";

import Header from "@/components/header";
import { Plus, TrendingUp, CheckCircle, Grid, List } from "lucide-react";

export default function MonthlyTBRPage() {
  const currentStack = [
    { title: "Beyond Good and Evil", author: "Friedrich Nietzsche", category: "Philosophical", progress: 34.2, read: 120, total: 350 },
    { title: "Thinking in Systems", author: "Donella Meadows", category: "Systems", progress: 83.7, read: 201, total: 240 },
    { title: "The Lessons of History", author: "Will & Ariel Durant", category: "History", progress: 9.3, read: 12, total: 128 },
  ];

  return (
    <>
      <Header title="Monthly Intentions Engine" />
      <main className="flex-1 p-10 max-w-7xl mx-auto w-full space-y-12">
        <section className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-7 bg-pace-card border border-pace-border p-8 rounded-xl">
            <h3 className="text-lg font-medium mb-1 tracking-tight">Queue Next Intention</h3>
            <p className="text-xs text-pace-textMuted mb-6">Commit to your next stack layer. Restrict your current slot load allocation to 5 targets to maintain processing depth.</p>
            <form className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[11px] font-bold tracking-wider text-pace-textMuted uppercase mb-1.5">Book Title</label>
                <input type="text" className="w-full bg-pace-bg border border-pace-border px-4 py-2.5 text-sm rounded outline-none text-pace-textMain focus:border-pace-textMain" placeholder="e.g. Meditations" />
              </div>
              <div>
                <label className="block text-[11px] font-bold tracking-wider text-pace-textMuted uppercase mb-1.5">Author</label>
                <input type="text" className="w-full bg-pace-bg border border-pace-border px-4 py-2.5 text-sm rounded outline-none text-pace-textMain focus:border-pace-textMain" placeholder="Marcus Aurelius" />
              </div>
              <div>
                <label className="block text-[11px] font-bold tracking-wider text-pace-textMuted uppercase mb-1.5">Total Pages</label>
                <input type="number" className="w-full bg-pace-bg border border-pace-border px-4 py-2.5 text-sm rounded outline-none text-pace-textMain focus:border-pace-textMain" placeholder="256" />
              </div>
              <button type="button" className="col-span-2 mt-2 w-full bg-pace-textMain text-pace-bg py-3 text-xs font-bold uppercase tracking-wider rounded hover:opacity-90 flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Initialize Tracker Slot
              </button>
            </form>
          </div>

          <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
            <div className="flex-1 bg-pace-card border border-pace-border p-6 rounded-xl flex flex-col justify-center items-center text-center">
              <span className="text-6xl font-black font-mono text-pace-success leading-none">04</span>
              <span className="text-[10px] font-bold tracking-[0.2em] text-pace-textMuted uppercase mt-4">Volumes Extracted This Month</span>
              <div className="w-full h-[1px] bg-pace-border/60 my-4" />
              <p className="text-xs text-pace-textMuted font-serif italic">"Surgical filtration of incoming informational pathways optimizes system retention rates."</p>
            </div>
            <div className="bg-pace-card border border-pace-border p-5 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold tracking-wider text-pace-textMuted uppercase">Velocity Velocity</p>
                <p className="text-lg font-bold text-pace-textMain font-mono">14 pgs / day</p>
              </div>
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-pace-bg border border-pace-border text-pace-success">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
          </div>
        </section>

        {/* Core Book Catalog Stack */}
        <section className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-xl font-bold text-pace-textMain tracking-tight">Active Operational Stack</h3>
              <p className="text-xs text-pace-textMuted">Highly focused allocation of ongoing developmental readings.</p>
            </div>
            <div className="flex gap-1 border border-pace-border p-1 bg-pace-card rounded">
              <button className="p-1.5 bg-pace-bg rounded text-pace-textMain"><Grid className="w-3.5 h-3.5" /></button>
              <button className="p-1.5 text-pace-textMuted hover:text-pace-textMain"><List className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentStack.map((book, idx) => (
              <div key={idx} className="bg-pace-card border border-pace-border rounded-xl overflow-hidden group hover:border-pace-textMain/30 transition-all flex flex-col justify-between">
                <div className="p-6 space-y-4">
                  <div>
                    <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 bg-pace-bg border border-pace-border rounded text-pace-success">{book.category}</span>
                    <h4 className="text-base font-semibold mt-2 text-pace-textMain group-hover:text-pace-success transition-colors truncate">{book.title}</h4>
                    <p className="text-xs text-pace-textMuted mt-0.5">{book.author}</p>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] font-mono">
                      <span className="text-pace-textMuted">Progress Metrics</span>
                      <span>{book.read} <span className="opacity-40">/ {book.total} pgs</span></span>
                    </div>
                    <div className="w-full h-1 bg-pace-bg border border-pace-border/50 rounded-full overflow-hidden">
                      <div className="h-full bg-pace-success transition-all duration-500" style={{ width: `${book.progress}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-pace-bg/30 border-t border-pace-border/60">
                  <button className="w-full border border-pace-border py-2 text-[10px] font-bold uppercase tracking-wider rounded hover:bg-pace-textMain hover:text-pace-bg transition-colors flex items-center justify-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5" /> Commit To Archive View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}