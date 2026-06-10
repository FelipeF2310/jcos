import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)" }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative w-full max-w-sm mx-4">
        {/* Card */}
        <div
          className="bg-white rounded-2xl px-8 py-10"
          style={{ boxShadow: "0 32px 64px rgba(0,0,0,0.4)" }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ backgroundColor: "#1d4ed8" }}
            >
              JC
            </div>
            <div>
              <p className="font-bold text-slate-900 text-base leading-tight">Jersey City OS</p>
              <p className="text-xs text-slate-400">CitiStat Performance Platform</p>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h1>
          <p className="text-sm text-slate-500 mb-8">
            Sign in to access the city performance dashboard.
          </p>

          {/* Google sign-in */}
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/executive" });
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 transition-all hover:bg-slate-50"
              style={{ border: "1.5px solid #e2e8f0" }}
            >
              {/* Google logo */}
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </form>

          <p className="text-xs text-slate-400 text-center mt-6 leading-relaxed">
            Access is restricted to authorized<br />Jersey City government personnel.
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-6" style={{ color: "rgba(255,255,255,0.3)" }}>
          © 2026 City of Jersey City · FY2026 Q2
        </p>
      </div>
    </div>
  );
}
