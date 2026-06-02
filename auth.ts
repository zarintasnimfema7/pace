// auth.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma" // Ensure this path correctly targets your client

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  callbacks: {
    async session({ session, user }) {
      // Pass user ID from database into session object
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
})