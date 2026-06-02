"use server";

import { signIn, signOut } from "@/auth";

export async function loginWithGoogle() {
  await signIn("google", { redirectTo: "/" });
}

export async function logoutUser() {
  await signOut({ redirectTo: "/login" });
}