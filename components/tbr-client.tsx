"use client";

import React, { useState, useTransition, useOptimistic } from "react";
import { addBookToTBR, completeBook, deleteBook } from "@/app/actions/book-actions";
import { Plus, BookOpen, CheckCircle, Trash2, Calendar, Loader2, Layers } from "lucide-react";

interface Book {
  id: string;
  title: string;
  author: string | null;
  totalPages: number; // Added to maintain explicit entity typing across components
  status: string;
  month: string;
  year: number;
}

interface TBRClientProps {
  initialBooks: Book[];
  currentMonth: string;
  currentYear: number;
}

// Month array helpers for selector UI
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function TBRClient({ initialBooks, currentMonth, currentYear }: TBRClientProps) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [totalPages, setTotalPages] = useState(""); // Captures raw user character inputs
  
  // Active selectors for planning ahead or looking back
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Optimistic state definition
  const [optimisticBooks, setOptimisticBooks] = useOptimistic(
    initialBooks,
    (state, action: { type: string; payload: any }) => {
      switch (action.type) {
        case "ADD":
          return [...state, action.payload];
        case "COMPLETE":
          return state.filter((book) => book.id !== action.payload);
        case "DELETE":
          return state.filter((book) => book.id !== action.payload);
        default:
          return state;
      }
    }
  );

  // Filter current lists for active/completed visualization within this specific month view
  const activeTBR = optimisticBooks.filter((b) => b.status === "WANT_TO_READ" && b.month === selectedMonth && b.year === selectedYear);
  const finishedThisMonth = optimisticBooks.filter((b) => b.status === "COMPLETED" && b.month === selectedMonth && b.year === selectedYear);

  // Handle Form submission for adding books
  async function handleAddBook(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    // Convert raw string to safe base-10 numerical type representation
    const parsedPages = parseInt(totalPages, 10) || 0;

    const temporaryId = crypto.randomUUID();
    const mockBook: Book = {
      id: temporaryId,
      title: title.trim(),
      author: author.trim() || null,
      totalPages: parsedPages,
      status: "WANT_TO_READ",
      month: selectedMonth,
      year: selectedYear,
    };

    // Clean inputs immediately to show high-fidelity responsive layout feedback loop
    setTitle("");
    setAuthor("");
    setTotalPages("");

    // Execute instant UI addition
    startTransition(async () => {
      setOptimisticBooks({ type: "ADD", payload: mockBook });
      const result = await addBookToTBR({
        title: mockBook.title,
        author: mockBook.author || undefined,
        totalPages: mockBook.totalPages,
        month: mockBook.month,
        year: mockBook.year,
      });
      
      if (!result.success) {
        alert("Failed to sync book with system catalog.");
      }
    });
  }

  // Handle book checking/completion logic
  function handleCheckOff(id: string) {
    startTransition(async () => {
      setOptimisticBooks({ type: "COMPLETE", payload: id });
      const result = await completeBook(id);
      if (!result.success) {
        alert("Could not process completion state.");
      }
    });
  }

  // Handle quick deleting items
  function handleDelete(id: string) {
    startTransition(async () => {
      setOptimisticBooks({ type: "DELETE", payload: id });
      const result = await deleteBook(id);
      if (!result.success) {
        alert("Could not remove the requested item.");
      }
    });
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-4">
      {/* Dynamic Month Header and Selector Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-emerald-500" />
            Monthly TBR Tracker
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Curate and manage your goals for <span className="text-emerald-400 font-medium">{selectedMonth} {selectedYear}</span>. Checked items migrate to your permanent Grand Library archive automatically.
          </p>
        </div>

        {/* Month/Year Navigation Bar */}
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-1.5 rounded-xl">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent text-sm text-zinc-200 outline-none px-2 py-1 cursor-pointer font-medium hover:text-white"
          >
            {MONTHS.map((m) => (
              <option key={m} value={m} className="bg-zinc-950 text-white">{m}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-transparent text-sm text-zinc-200 outline-none px-2 py-1 cursor-pointer font-medium hover:text-white border-l border-zinc-800"
          >
            {[2026, 2027, 2028].map((y) => (
              <option key={y} value={y} className="bg-zinc-950 text-white">{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Input Section: Quick Book Intake */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 h-fit backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-zinc-400" />
            Queue a Book
          </h2>
          <form onSubmit={handleAddBook} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">Book Title</label>
              <input
                type="text"
                placeholder="The Pragmatic Programmer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">Author (Optional)</label>
              <input
                type="text"
                placeholder="Andy Hunt, Dave Thomas"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            {/* Page Count Field Input Added Below */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">Total Pages (Optional)</label>
              <input
                type="number"
                min="0"
                placeholder="352"
                value={totalPages}
                onChange={(e) => setTotalPages(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:margin-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:margin-0 [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <button
              type="submit"
              disabled={isPending || !title.trim()}
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-medium text-sm py-2 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/20"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 stroke-[2.5]" />}
              Add to Reading List
            </button>
          </form>
        </div>

        {/* Right Dashboard Lists Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Reading Requirements */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 mb-3">
              Target Reading Inventory ({activeTBR.length})
            </h3>
            {activeTBR.length === 0 ? (
              <div className="border border-dashed border-zinc-800 rounded-2xl p-8 text-center bg-zinc-900/10">
                <p className="text-zinc-500 text-sm">No books lined up for this month yet. Plan your next reading session above!</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeTBR.map((book) => (
                  <div
                    key={book.id}
                    className="group flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl p-4 transition-all duration-200 hover:border-zinc-700/80 hover:bg-zinc-900/80"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <button
                        onClick={() => handleCheckOff(book.id)}
                        className="flex-shrink-0 text-zinc-600 hover:text-emerald-500 transition-colors focus:outline-none"
                        title="Mark as Completed"
                      >
                        <CheckCircle className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" />
                      </button>
                      <div className="min-w-0">
                        <p className="text-zinc-100 font-medium text-sm truncate">{book.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {book.author && <p className="text-zinc-500 text-xs truncate">by {book.author}</p>}
                          {book.author && book.totalPages > 0 && <span className="text-zinc-700 text-xs">•</span>}
                          {book.totalPages > 0 && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400 bg-zinc-950 border border-zinc-800/60 px-1.5 py-0.5 rounded">
                              <Layers className="h-2.5 w-2.5 text-emerald-500/80" />
                              {book.totalPages} pages
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(book.id)}
                      className="text-zinc-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 p-1.5 transition-all rounded-lg hover:bg-zinc-950 focus:outline-none"
                      title="Remove From List"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Migration Visualizer Area: Finished entries this month */}
          {finishedThisMonth.length > 0 && (
            <div className="border-t border-zinc-800/60 pt-6">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-emerald-600 mb-3">
                Completed & Archived This Month ({finishedThisMonth.length})
              </h3>
              <div className="space-y-2.5 opacity-60">
                {finishedThisMonth.map((book) => (
                  <div
                    key={book.id}
                    className="flex items-center justify-between bg-zinc-950/40 border border-zinc-900 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-zinc-400 font-medium text-sm line-through truncate">{book.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {book.author && <p className="text-zinc-600 text-xs line-through truncate">by {book.author}</p>}
                          {book.author && book.totalPages > 0 && <span className="text-zinc-800 text-xs">•</span>}
                          {book.totalPages > 0 && <p className="text-zinc-600 text-xs">{book.totalPages} pages</p>}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-emerald-600/80 bg-emerald-950/30 border border-emerald-900/30 px-2.5 py-1 rounded-full">
                      Archived
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}