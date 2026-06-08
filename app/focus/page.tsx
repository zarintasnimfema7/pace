import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import FocusSanctuaryClient from "@/components/focus-sanctuary-client"

export default async function FocusPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  // Load user's focus session history for the current day to display live metrics
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const history = await prisma.focusSession.findMany({
    where: {
      userId: session.user.id,
      createdAt: { gte: todayStart },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      duration: true,
      status: true,
      createdAt: true,
    }
  })

  return <FocusSanctuaryClient initialHistory={history} />
}