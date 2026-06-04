import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DailyDashboardClient from "@/components/daily-dashboard-client";

export default async function DashboardPage() {
  // 1. Authenticate server session securely
  const session = await auth();

  // 2. Protect Route: Route unauthenticated sessions out immediately to landing page
  if (!session || !session.user) {
    redirect("/");
  }

  // 3. Query Database: Isolate habits belonging strictly to this user
  const userHabits = await prisma.habit.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      frequency: true,
    }
  });

  // 4. Render Layout UI hydrated with database data fields
  return (
    <DailyDashboardClient 
      initialHabits={userHabits} 
      user={{
        name: session.user.name,
        email: session.user.email
      }} 
    />
  );
}