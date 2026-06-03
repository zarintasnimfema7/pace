// app/layout.tsx
"use client"; // Temporary or permanent depending on path checks

import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/sidebar";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  
  // Isolate login and public landing states from the application nav grid[cite: 1]
  const isAuthPage = pathname === "/login" || pathname === "/welcome"; 

  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <div className="flex min-h-screen bg-pace-bg text-pace-textMain">
          {/* Only inject sidebar if user is inside the actual dashboard system */}
          {!isAuthPage && <Sidebar />}
          
          <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}