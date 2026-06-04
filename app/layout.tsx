"use client";

import "./globals.css";
import Sidebar from "@/components/sidebar";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  
  // Hide the sidebar navigation grid on the main public landing (`/`) and explicit `/login` paths
  const isAuthPage = pathname === "/" || pathname === "/login" || pathname === "/welcome"; 

  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <div className="flex min-h-screen bg-pace-bg text-pace-textMain">
          {/* Only inject sidebar if user is inside the actual dashboard app interface */}
          {!isAuthPage && <Sidebar />}
          
          <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}