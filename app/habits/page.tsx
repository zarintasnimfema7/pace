import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import HabitsDashboardClient from "@/components/habits-dashboard-client";

export default async function HabitsInventoryPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Load the complete habits ecosystem belonging to this profile
  const rawHabits = await prisma.habit.findMany({
    where: {
      userId: session.user.id,
      isActive: true,
    },
    include: {
      logs: {
        where: {
          date: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        select: {
          date: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Map database entries to cleanly match the client component type interface expectations
  const habits = rawHabits.map(habit => ({
    id: habit.id,
    name: habit.name,
    description: habit.description,
    frequency: habit.frequency,
    customCount: habit.customCount,
    logs: habit.logs.map(log => ({
      date: new Date(log.date)
    }))
  }));

  return <HabitsDashboardClient initialHabits={habits} />;
}