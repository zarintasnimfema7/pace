"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { Priority } from "@prisma/client"

async function getUserId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized access request.")
  return session.user.id
}

export async function createTask(title: string, priority: Priority) {
  try {
    const userId = await getUserId()
    const task = await prisma.task.create({
      data: {
        userId,
        title,
        priority,
      },
    })
    revalidatePath("/dashboard")
    return { success: true, data: task }
  } catch (error) {
    console.error("Task compilation failed:", error)
    return { success: false, error: "Initialization failed." }
  }
}

export async function toggleTaskStatus(taskId: string, isCompleted: boolean) {
  try {
    const userId = await getUserId()
    await prisma.task.updateMany({
      where: { id: taskId, userId },
      data: { isCompleted },
    })
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Task status modification failed:", error)
    return { success: false }
  }
}