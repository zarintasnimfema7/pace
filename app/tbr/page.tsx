import React from "react";
import { getBooksByMonth } from "@/app/actions/book-actions";
import TBRClient from "@/components/tbr-client";

export const metadata = {
  title: "Monthly TBR | Pace",
  description: "Plan your monthly reading goals and archive books instantly.",
};

export default async function TBRPage() {
  // Compute default chronological targets base values on current date (June 2026)
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonthName = today.toLocaleString("en-US", { month: "long" });

  // Initial SSR Data load
  const books = await getBooksByMonth(currentMonthName, currentYear);

  return (
    <main className="py-6 min-h-screen text-zinc-100">
      <TBRClient 
        initialBooks={books} 
        currentMonth={currentMonthName} 
        currentYear={currentYear} 
      />
    </main>
  );
}