"use server";

import { signIn, signOut } from "@/auth";

export async function loginWithGoogle() {
  // When logging in, directly route to your active dashboard panel
  await signIn("google", { redirectTo: "/dashboard" });
}

export async function logoutUser() {
  // When logging out, cleanly wipe cookies and land on the main root public description page
  await signOut({ redirectTo: "/" });
}