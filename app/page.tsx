import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await auth();
  
  // If user session is already active, middleware handles this but we add a safety fallback
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white selection:bg-pace-success/30">
      {/* Grid container to perfectly position elements */}
      <div className="mx-auto grid max-w-7xl w-full grid-cols-1 px-6 lg:grid-cols-12 lg:px-8 items-center gap-12">
        
        {/* Left Side: Name, Quote, and Description */}
        <div className="lg:col-span-7 space-y-8 py-12 lg:py-0">
          <div>
            <span className="text-xs font-semibold tracking-widest text-pace-success uppercase font-mono">
              The 6 Pillars of Personal Architecture
            </span>
            <h1 className="mt-3 text-5xl font-black tracking-tight sm:text-7xl bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
              Pace.
            </h1>
          </div>

          <blockquote className="border-l-2 border-pace-success pl-4 italic text-zinc-400 font-medium text-lg leading-relaxed max-w-xl">
            "Focus operates like a muscle. Build exceptional operational consistency inside your morning system blocks."
          </blockquote>

          <div className="space-y-4 max-w-lg text-sm text-zinc-400 leading-relaxed font-sans">
            <p>
              Pace is a calibrated productivity platform designed to structure intentional daily rituals. 
              Manage a hyper-focused <span className="text-white font-medium">Daily Dashboard</span> that resets every 24 hours, catalog multi-frequency habits in your inventory map, and command single-task sprints from a single terminal interface.
            </p>
            <p>
              Engineered with background audio environments for deep focus sanctuary blocks, alongside automated literary migration grids to archive your structural study lists seamlessly.
            </p>
          </div>
        </div>

        {/* Right Side: Centered/Middle Google Login Button Block */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="w-full max-w-md space-y-6 rounded-2xl border border-zinc-850 bg-zinc-900/50 backdrop-blur-sm p-8 shadow-2xl">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight">Access Command Center</h2>
              <p className="text-xs text-zinc-500">Authenticate session securely via Google provider protocols.</p>
            </div>

            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/dashboard" }, { prompt: "select_account" });
              }}
            >
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-3 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-black transition-all hover:bg-zinc-200 active:scale-[0.98]"
              >
                {/* Minimal Google SVG Icon */}
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}