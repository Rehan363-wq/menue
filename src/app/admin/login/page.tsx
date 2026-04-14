"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, KeyRound, Loader2, Lock } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("menuqr_admin_secret", data.data.secret);
        router.push("/admin/dashboard");
      } else {
        setError(data.error || "Invalid admin credentials");
        setLoading(false);
      }
    } catch {
      setError("Connection failed. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      
      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-surface border border-red-500/20 shadow-2xl mb-6 relative">
            <ShieldAlert size={36} className="text-red-500" />
            <div className="absolute inset-0 border border-red-500/10 rounded-3xl animate-ping opacity-20" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Admin System</h1>
          <p className="text-muted mt-2 text-sm">Secure Portal Access</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="bg-surface p-6 rounded-2xl border border-[rgba(255,255,255,0.05)] shadow-2xl">
            {error && (
              <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center justify-center gap-2 font-medium">
                <Lock size={16} />
                {error}
              </div>
            )}
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-background border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3.5 text-sm text-foreground focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all font-mono"
                    placeholder="admin@menuqr.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <KeyRound size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-background border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3.5 text-sm text-foreground focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all font-mono tracking-widest placeholder:tracking-normal"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.2)] hover:shadow-[0_0_25px_rgba(220,38,38,0.4)] transition-all flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>Authorize Access <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
