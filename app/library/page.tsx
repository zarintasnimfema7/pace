"use client";

import Header from "@/components/header";
import { CheckCircle2, Book, Award, Milestone, Layers } from "lucide-react";

export default function GrandLibraryPage() {
  const historyData = [
    { year: "2026", months: [
      { month: "JUNE", books: [
        { title: "The Sovereign Individual", author: "James Dale Davidson, Lord William Rees-Mogg", pages: 416, date: "June 14" },
        { title: "Deep Work", author: "Cal Newport", pages: 304, date: "June 02" }
      ]},
      { month: "MAY", books: [
        { title: "Atomic Habits", author: "James Clear", pages: 320, date: "May 19" }
      ]}
    ]}
  ];

  return (
    <>
      <Header title="Historical Intelligence Repository" />
      <main className="flex-1 p-10 max-w-5xl mx-auto w-full space-y-12">
        {/* Aggregated Analytical Rows */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Accumulated Stacks", val: "428", icon: Layers, color: "text-pace-textMain" },
            { label: "Total Page Depth", val: "142k", icon: Book, color: "text-pace-focus" },
            { label: "Monthly Output Index", val: "3.2/mo", icon: Milestone, color: "text-pace-success" },
            { label: "Active Momentum Index", val: "18d", icon: Award, color: "text-pace-urgent" }
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-pace-card border border-pace-border rounded-xl p-5 hover:bg-pace-card/80 transition-colors">
                <span className="block text-[9px] font-bold font-mono text-pace-textMuted uppercase tracking-wider mb-1">{stat.label}</span>
                <div className="flex justify-between items-baseline">
                  <span className="text-xl font-bold font-mono text-pace-textMain">{stat.val}</span>
                  <Icon className={`w-4 h-4 ${stat.color} opacity-60`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual Chronicler Timeline Section */}
        <div className="relative border-l border-pace-border/60 pl-8 space-y-12 ml-4">
          {historyData.map((epoch) => (
            <div key={epoch.year} className="relative space-y-8">
              {/* Timeline Year Hub Node */}
              <div className="absolute -left-[37px] top-1.5 w-4 h-4 rounded-full bg-pace-textMain border-4 border-pace-bg z-10" />
              <h3 className="text-3xl font-black tracking-tight font-mono text-pace-textMain">{epoch.year}</h3>

              {epoch.months.map((group, mIdx) => (
                <div key={mIdx} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold font-mono tracking-widest px-3 py-1 bg-pace-card border border-pace-border rounded-full text-pace-textMuted">{group.month}</span>
                    <div className="h-[1px] flex-1 bg-pace-border/30" />
                  </div>

                  <div className="space-y-3">
                    {group.books.map((book, bIdx) => (
                      <div key={bIdx} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-pace-card/60 border border-pace-border rounded-xl hover:bg-pace-card hover:border-pace-textMuted/40 transition-colors cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-9 h-12 bg-pace-bg border border-pace-border rounded flex items-center justify-center text-pace-textMuted/40"><Book className="w-4 h-4" /></div>
                          <div>
                            <h4 className="text-sm font-semibold text-pace-textMain mb-0.5">{book.title}</h4>
                            <p className="text-xs text-pace-textMuted">{book.author}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 mt-4 md:mt-0 font-mono text-xs">
                          <div className="text-right hidden md:block">
                            <span className="block text-[9px] font-bold tracking-wider text-pace-textMuted uppercase">Volume Scale</span>
                            <span className="text-pace-textMain">{book.pages} Pages</span>
                          </div>
                          <div className="bg-pace-success/10 border border-pace-success/20 px-3 py-1.5 rounded flex items-center gap-2 text-pace-success text-[11px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
                            <span>Logged {book.date}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </main>
    </>
  );
}