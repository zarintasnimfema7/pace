import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  // Define explicitly public paths that unauthenticated users can access
  const isPublicPage = pathname === "/" || pathname === "/login"

  // 1. If user is NOT logged in and tries to access protected application dashboard items:
  if (!isLoggedIn && !isPublicPage) {
    return NextResponse.redirect(new URL("/", req.nextUrl)) // Redirect back to landing page
  }

  // 2. If user IS logged in and tries to hit public landing/login layouts, forward them straight into the system workspace
  if (isLoggedIn && (pathname === "/" || pathname === "/login")) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  // Matches all routes except system resources, API endpoints, and static image arrays
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
}