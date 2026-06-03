"use client";

import { Search, Bell } from "lucide-react";

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="flex justify-between items-center w-full h-16 px-10 border-b border-pace-border bg-pace-card/40 glass-panel sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {title ? (
          <h2 className="text-base font-semibold text-pace-textMain">{title}</h2>
        ) : (
          <div className="flex items-center gap-3 text-pace-textMuted">
            <Search className="w-4 h-4" />
            <input
              type="text"
              placeholder="Search rituals..."
              className="bg-transparent border-none text-sm font-sans text-pace-textMain placeholder:text-pace-textMuted focus:outline-none w-64"
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-6">
        <button className="text-pace-textMuted hover:text-pace-textMain transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-pace-urgent rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full overflow-hidden border border-pace-border bg-pace-border" />
      </div>
    </header>
  );
}