import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DailyDashboardClient from "@/components/daily-dashboard-client";

export default async function DashboardPage() {
  // 1. Authenticate server session securely
  const session = await auth();

  // 2. Protect Route: Route unauthenticated sessions out immediately
  if (!session || !session.user?.id) {
    redirect("/");
  }

  const userId = session.user.id;

  // Compute boundaries for Today at midnight (00:00:00)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // 3. Query Database: Fetch habits along with today's completion logs
  const userHabits = await prisma.habit.findMany({
    where: { 
      userId,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      frequency: true,
      logs: {
        where: {
          date: todayStart,
        },
        select: {
          id: true,
        },
      },
    },
  });

  // 4. Fetch actual tasks for one-off completions
  const userTasks = await prisma.task.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // Map habits to explicitly communicate today's completion state to client component
  const habitsData = userHabits.map((habit) => ({
    id: habit.id,
    name: habit.name,
    frequency: habit.frequency,
    completed: habit.logs.length > 0,
  }));

  // Map task data to standard client interfaces
  const tasksData = userTasks.map((task) => ({
    id: task.id,
    title: task.title,
    priority: task.priority, // LOW, MEDIUM, HIGH, URGENT
    completed: task.isCompleted,
  }));

  // 5. Render premium layout hydrations
  return (
    <DailyDashboardClient 
      initialHabits={habitsData} 
      initialTasks={tasksData}
      user={{
        name: session.user.name,
        email: session.user.email
      }} 
    />
  );
}