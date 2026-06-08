"use client";

import { useState, useTransition, useOptimistic } from "react";
import Header from "@/components/header";
import { toggleHabitStatus } from "@/app/actions/habit-actions";
import { createTask, toggleTaskStatus, deleteTask } from "@/app/actions/task-actions"; // 👈 Added deleteTask import
import { Check, CheckCircle2, Plus, Zap, AlertTriangle, X, Trash2 } from "lucide-react"; // 👈 Added Trash2 icon
import { Priority } from "@prisma/client";

interface ClientHabit {
  id: string;
  name: string;
  frequency: string;
  completed: boolean;
}

interface ClientTask {
  id: string;
  title: string;
  priority: Priority;
  completed: boolean;
}

interface DailyDashboardClientProps {
  initialHabits: ClientHabit[];
  initialTasks: ClientTask[];
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export default function DailyDashboardClient({ initialHabits, initialTasks, user }: DailyDashboardClientProps) {
  const [isPending, startTransition] = useTransition();
  const [isAddingTask, setIsAddingTask] = useState(false);
  
  const [taskTitle, setTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState<Priority>("MEDIUM");

  const [optimisticHabits, setOptimisticHabits] = useOptimistic(
    initialHabits,
    (state, update: { habitId: string; nextState: boolean }) =>
      state.map((h) => (h.id === update.habitId ? { ...h, completed: update.nextState } : h))
  );

  // 1. Updated Optimistic Array Layer to handle deletions cleanly
  const [optimisticTasks, setOptimisticTasks] = useOptimistic(
    initialTasks,
    (state, update: { type: "toggle" | "add" | "delete"; taskId?: string; nextState?: boolean; newTask?: ClientTask }) => {
      if (update.type === "toggle") {
        return state.map((t) => (t.id === update.taskId ? { ...t, completed: update.nextState! } : t));
      }
      if (update.type === "add" && update.newTask) {
        return [update.newTask, ...state];
      }
      if (update.type === "delete") {
        return state.filter((t) => t.id !== update.taskId); // 👈 Vanishes from screen immediately on trigger
      }
      return state;
    }
  );

  const handleToggleHabit = (habitId: string, currentlyCompleted: boolean) => {
    const nextState = !currentlyCompleted;
    const todayISO = new Date().toISOString();

    startTransition(async () => {
      setOptimisticHabits({ habitId, nextState });
      await toggleHabitStatus(habitId, todayISO, nextState);
    });
  };

  const handleToggleTask = (taskId: string, currentlyCompleted: boolean) => {
    const nextState = !currentlyCompleted;

    startTransition(async () => {
      setOptimisticTasks({ type: "toggle", taskId, nextState });
      await toggleTaskStatus(taskId, nextState);
    });
  };

  const handleCreateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const pseudoId = Math.random().toString();
    const tempTask: ClientTask = {
      id: pseudoId,
      title: taskTitle,
      priority: taskPriority,
      completed: false,
    };

    startTransition(async () => {
      setOptimisticTasks({ type: "add", newTask: tempTask });
      setTaskTitle("");
      setIsAddingTask(false);

      await createTask(tempTask.title, tempTask.priority);
    });
  };

  // 2. Added Delete Coordinator function
  const handleDeleteTask = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation(); // 👈 CRITICAL: Prevents the click from bubbling up and triggering a toggle status change!
    if (!confirm("Decommission this task from today's stack permanently?")) return;

    startTransition(async () => {
      setOptimisticTasks({ type: "delete", taskId });
      await deleteTask(taskId);
    });
  };

  const completedHabitsCount = optimisticHabits.filter((h) => h.completed).length;
  const totalTasksCount = optimisticTasks.length;
  const completedTasksCount = optimisticTasks.filter((t) => t.completed).length;
  const taskCompletionPercentage = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return (
    <>
      <Header />
      <main className="flex-1 p-10 max-w-7xl mx-auto w-full text-slate-100">
        
        <div className="mb-12">
          <p className="text-xs font-semibold tracking-widest text-emerald-400 uppercase mb-2">Dashboard</p>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-1">
            Welcome back, {user.name || "Executor"}
          </h1>
          <p className="text-sm text-slate-400 font-mono">
            Cycle Matrix Date: {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          
          {/* Habits Bento Block */}
          <div className="col-span-12 bg-slate-900 border border-slate-800 p-8 rounded-xl">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-lg font-medium tracking-tight text-white">Habit Momentum</h3>
                <p className="text-xs text-slate-400 mt-0.5">Toggles update the consistency matrices across the habit engine map</p>
              </div>
              <span className="text-xs text-slate-400 font-mono font-bold tracking-wider uppercase bg-slate-950 px-3 py-1 border border-slate-800 rounded">
                {completedHabitsCount}/{optimisticHabits.length} Completed
              </span>
            </div>

            {optimisticHabits.length === 0 ? (
              <p className="text-sm text-slate-400 italic py-4">No active protocols loaded in database. Initialize habits in the inventory map.</p>
            ) : (
              <div className="flex flex-wrap gap-8 items-center">
                {optimisticHabits.map((habit) => (
                  <div 
                    key={habit.id} 
                    className="flex flex-col items-center gap-3 cursor-pointer group" 
                    onClick={() => handleToggleHabit(habit.id, habit.completed)}
                  >
                    <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all active:scale-95 duration-300 ${
                      habit.completed 
                        ? "bg-emerald-950/40 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)] text-emerald-400" 
                        : "border-slate-800 text-slate-500 group-hover:border-slate-600"
                    }`}>
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className={`text-xs font-medium transition-colors ${habit.completed ? "text-white" : "text-slate-400 group-hover:text-slate-300"}`}>{habit.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Core Focus Stack Panel */}
          <div className="col-span-12 lg:col-span-8 bg-slate-900 border border-slate-800 p-8 rounded-xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-medium tracking-tight text-white">Today's Focus Stack</h3>
              {!isAddingTask && (
                <button 
                  onClick={() => setIsAddingTask(true)}
                  className="bg-slate-100 text-slate-950 px-4 py-2 text-xs font-bold rounded hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Task
                </button>
              )}
            </div>

            {isAddingTask && (
              <form onSubmit={handleCreateTaskSubmit} className="mb-6 p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Compile Protocol Task</span>
                  <button type="button" onClick={() => setIsAddingTask(false)} className="text-slate-500 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="What operations need execution?"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:border-emerald-500 outline-none font-light"
                  autoFocus
                />
                <div className="flex justify-between items-center pt-2">
                  <div className="flex gap-1.5 p-0.5 bg-slate-900 border border-slate-800 rounded">
                    {(["LOW", "MEDIUM", "HIGH", "URGENT"] as Priority[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setTaskPriority(p)}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wide transition-all ${
                          taskPriority === p ? "bg-slate-100 text-slate-950" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <button 
                    type="submit"
                    disabled={!taskTitle.trim() || isPending}
                    className="bg-emerald-600 text-white px-4 py-1.5 text-xs font-bold rounded hover:bg-emerald-500 transition-colors disabled:opacity-40"
                  >
                    Deploy
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {optimisticTasks.length === 0 ? (
                <p className="text-sm text-slate-500 italic py-6 text-center">Your stack is clear. No one-off missions declared.</p>
              ) : (
                optimisticTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-950/40 border border-slate-800/40 hover:bg-slate-950/80 hover:border-slate-800 transition-all group/task cursor-pointer" 
                    onClick={() => handleToggleTask(task.id, task.completed)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-5 h-5 border rounded flex items-center justify-center transition-all ${
                        task.completed ? "bg-emerald-600 border-emerald-600" : "border-slate-700 bg-slate-900"
                      }`}>
                        {task.completed && <Check className="w-3 h-3 text-slate-950 font-extrabold" />}
                      </div>
                      <div>
                        <span className={`text-sm transition-all ${task.completed ? "line-through opacity-40 text-slate-500" : "text-slate-200"}`}>{task.title}</span>
                        <div className="flex gap-2 mt-1.5 items-center">
                          {task.priority === "HIGH" && (
                            <span className="bg-amber-950/50 text-amber-400 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border border-amber-900/30">High Priority</span>
                          )}
                          {task.priority === "URGENT" && (
                            <span className="bg-rose-950/60 text-rose-400 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border border-rose-900/40 flex items-center gap-1">
                              <AlertTriangle className="w-2.5 h-2.5" /> Urgent Stack
                            </span>
                          )}
                          {task.priority === "MEDIUM" && (
                            <span className="bg-slate-900 text-slate-400 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider border border-slate-800">Medium</span>
                          )}
                          {task.priority === "LOW" && (
                            <span className="text-slate-600 text-[10px] font-mono">Low Tier</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 3. Render Premium Deletion Action Control on Hover */}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteTask(e, task.id)}
                      className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-500 hover:text-rose-400 hover:border-rose-950/40 md:opacity-0 group-hover/task:opacity-100 transition-all duration-200"
                      title="Delete Mission Block"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Performance Summary Grid */}
          <div className="col-span-12 lg:col-span-4 bg-slate-900 border border-slate-800 p-8 rounded-xl flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="text-lg font-medium tracking-tight text-white">Productivity Matrix</h3>
              
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Task Completion</span>
                  <span className="text-base font-bold font-mono text-emerald-400">{taskCompletionPercentage}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-500" 
                    style={{ width: `${taskCompletionPercentage}%` }}
                  ></div>
                </div>
              </div>

             

              <div className="pt-6 border-t border-slate-800">
                <div className="flex items-center gap-2 mb-3 text-amber-500">
                  <Zap className="w-4 h-4 fill-current" />
                  <span className="text-sm font-semibold text-white">Active Operational Stride</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed italic">
                  "Focus operates like a muscle. Toggling your task stack or habit nodes updates statistics dynamically across data frameworks."
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}