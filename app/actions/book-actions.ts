"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// Ensure the user is securely authenticated
async function getAuthenticatedUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized. Please log in to manage your TBR.");
  }
  return session.user.id;
}

/**
 * Fetch books belonging to the user for a specific month and year
 */
export async function getBooksByMonth(month: string, year: number) {
  try {
    const userId = await getAuthenticatedUserId();
    return await prisma.book.findMany({
      where: {
        userId,
        month,
        year,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    return [];
  }
}

/**
 * Add a new book to the Monthly TBR with page tracking metrics
 */
export async function addBookToTBR(data: {
  title: string;
  author?: string;
  totalPages?: number; // Added to capture length metrics on initialization
  month: string;
  year: number;
}) {
  try {
    const userId = await getAuthenticatedUserId();
    
    const newBook = await prisma.book.create({
      data: {
        title: data.title,
        author: data.author || "",
        totalPages: data.totalPages || 0, // Fallback gracefully if left empty
        month: data.month,
        year: data.year,
        status: "WANT_TO_READ",
        userId,
      },
    });

    revalidatePath("/tbr");
    revalidatePath("/library");
    return { success: true, book: newBook };
  } catch (error) {
    console.error("Failed to add book to TBR:", error);
    return { success: false, error: "Failed to save book to database." };
  }
}

/**
 * Complete a book (Triggering the Migration Logic Rule)
 * Updates status to COMPLETED and injects a completion timestamp.
 */
export async function completeBook(bookId: string) {
  try {
    const userId = await getAuthenticatedUserId();

    // Ensure the book belongs to the user before changing state
    await prisma.book.updateMany({
      where: {
        id: bookId,
        userId,
      },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    revalidatePath("/tbr");
    revalidatePath("/library");
    return { success: true };
  } catch (error) {
    console.error("Failed to complete book:", error);
    return { success: false, error: "Failed to update book progress." };
  }
}

/**
 * Remove a book completely from the catalog
 */
export async function deleteBook(bookId: string) {
  try {
    const userId = await getAuthenticatedUserId();

    await prisma.book.deleteMany({
      where: {
        id: bookId,
        userId,
      },
    });

    revalidatePath("/tbr");
    revalidatePath("/library");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete book:", error);
    return { success: false, error: "Failed to remove book." };
  }
}