// app/page.tsx
import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export default async function Home() {
  const session = await auth()

  // Protect the dashboard: Redirect unauthenticated requests to login page
  if (!session || !session.user) {
    redirect("/login")
  }

  // Fetch habits belonging only to this specific user from your Postgres database
  const userHabits = await prisma.habit.findMany({
    where: { userId: session.user.id },
  })

  return (
    <main className="min-h-screen bg-zinc-950 p-8 text-white">
      <header className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {session.user.name}!</h1>
          <p className="text-sm text-zinc-400">{session.user.email}</p>
        </div>
        
        {/* Sign Out Action Button */}
        <form
          action={async () => {
            "use server"
            await signOut({ redirectTo: "/login" })
          }}
        >
          <button className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium hover:bg-rose-700 transition">
            Sign Out
          </button>
        </form>
      </header>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Your Habits</h2>
        {userHabits.length === 0 ? (
          <p className="text-zinc-500">No habits added yet. Start executing Pillar 1!</p>
        ) : (
          <ul className="space-y-2">
            {userHabits.map((habit) => (
              <li key={habit.id} className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                {habit.name} — <span className="text-xs text-zinc-400">{habit.frequency}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}