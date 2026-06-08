"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { FocusStatus } from "@prisma/client"

/**
 * Secures and validates the current active session user.
 */
async function getUserId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized access request.")
  return session.user.id
}

/**
 * Dispatches a completed or aborted focus block telemetry entry to PostgreSQL.
 */
export async function logFocusSession(duration: number, status: FocusStatus) {
  try {
    const userId = await getUserId()

    const session = await prisma.focusSession.create({
      data: {
        userId,
        duration,
        status,
      },
    })

    // Automatically revalidate dashboard components to refresh metric charts instantly
    revalidatePath("/dashboard")
    revalidatePath("/focus")

    return { success: true, data: session }
  } catch (error) {
    console.error("Failed to commit focus sanctuary log block:", error)
    return { success: false, error: "Database transaction rejected." }
  }
}