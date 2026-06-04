"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

// Helper to get authenticated user ID securely using Auth.js v5
async function getUserId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized access request.")
  return session.user.id
}

export async function createHabit(formData: {
  name: string
  description: string
  frequency: string
  customCount?: number
}) {
  try {
    const userId = await getUserId()
    
    const habit = await prisma.habit.create({
      data: {
        userId,
        name: formData.name,
        description: formData.description || null,
        frequency: formData.frequency,
        customCount: formData.customCount || null,
      },
    })

    revalidatePath("/habits")
    return { success: true, data: habit }
  } catch (error) {
    console.error("Failed to compile new habit profile:", error)
    return { success: false, error: "Initialization failed." }
  }
}

export async function toggleHabitStatus(habitId: string, dateString: string, shouldComplete: boolean) {
  try {
    const userId = await getUserId() // Validate authentication state
    const targetDate = new Date(dateString)
    targetDate.setHours(0, 0, 0, 0) // Strictly normalize date boundary

    if (shouldComplete) {
      await prisma.habitLog.upsert({
        where: {
          habitId_date: { habitId, date: targetDate }
        },
        update: {}, // Existence indicates completion; no fields require updating
        create: { habitId, userId, date: targetDate }
      })
    } else {
      // Remove logging entirely to denote incomplete/reset status
      await prisma.habitLog.deleteMany({
        where: { habitId, userId, date: targetDate }
      })
    }

    revalidatePath("/habits")
    return { success: true }
  } catch (error) {
    console.error("Mutation failure state toggle:", error)
    return { success: false }
  }
}

export async function deleteHabit(habitId: string) {
  try {
    const userId = await getUserId()
    
    await prisma.habit.deleteMany({
      where: { id: habitId, userId }
    })

    revalidatePath("/habits")
    return { success: true }
  } catch (error) {
    console.error("Decommission error:", error)
    return { success: false }
  }
}