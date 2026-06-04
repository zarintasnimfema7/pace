"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutUser } from "@/app/actions/auth-actions"; // Import the Server Action
import { 
  LayoutDashboard, 
  RotateCw, 
  Terminal, 
  Timer, 
  BookOpen, 
  Library, 
  User, 
  Settings, 
  LogOut, 
  Activity 
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Today", href: "/dashboard", icon: LayoutDashboard }, // Updated path to point to /dashboard
    { name: "Habits", href: "/habits", icon: RotateCw },
    { name: "Command Center", href: "/command", icon: Terminal },
    { name: "Focus Sanctuary", href: "/focus", icon: Timer },
    { name: "Monthly TBR", href: "/tbr", icon: BookOpen },
    { name: "The Grand Library", href: "/library", icon: Library },
  ];

  const handleSignOut = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Failed to execute logout protocol:", error);
    }
  };

  return (
    <aside className="h-screen w-64 sticky left-0 top-0 border-r border-pace-border bg-pace-card flex flex-col py-10 px-4 shrink-0">
      <div className="mb-12 px-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-pace-textMain rounded-sm flex items-center justify-center">
          <Activity className="text-pace-bg w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-pace-textMain tracking-tighter leading-none">Pace</h1>
          <span className="text-xs text-pace-textMuted">Senior Architect</span>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                isActive
                  ? "text-pace-success font-bold border-r-2 border-pace-success bg-pace-bg/50"
                  : "text-pace-textMuted hover:bg-pace-bg/40 hover:text-pace-textMain"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-10 space-y-2 border-t border-pace-border/30">
        <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-pace-textMuted hover:text-pace-textMain transition-colors">
          <User className="w-4 h-4" /> Profile
        </Link>
        <Link href="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-pace-textMuted hover:text-pace-textMain transition-colors">
          <Settings className="w-4 h-4" /> Settings
        </Link>
        <button 
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-pace-urgent hover:opacity-80 transition-opacity text-left"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
}