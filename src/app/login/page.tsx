"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Coffee, Mail, Lock, AlertCircle, Zap, Palette, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useToast } from "@/components/Toast";

export default function Login() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!data.success) {
         if (data.data?.requires_verification) {
            router.push(`/verify-email?email=${encodeURIComponent(data.data.email)}`);
            return;
         }
         throw new Error(data.error);
      }

      if (data.data?.requires_verification) {
        router.push(`/verify-email?email=${encodeURIComponent(data.data.email)}`);
        return;
      }

      // Token is now set as httpOnly cookie by the server
      localStorage.setItem("menuqr_user", JSON.stringify(data.data.user));
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex">
        {/* Left decorative panel */}
        <div className="hidden lg:flex w-1/2 bg-surface items-center justify-center p-12 relative overflow-hidden">
          {/* Ambient glows */}
          <div className="absolute w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute w-[200px] h-[200px] rounded-full bg-purple-500/5 blur-[60px] top-20 right-20" />

          {/* Brand */}
          <div className="relative z-10 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center mx-auto mb-6 shadow-xl glow-primary">
              <Coffee size={36} className="text-white" />
            </div>
            <h2 className="text-3xl font-extrabold mb-3 text-foreground">MenuQR</h2>
            <p className="text-muted max-w-[260px] leading-relaxed mx-auto" style={{ fontFamily: "var(--font-body)" }}>
              The premium platform for restaurant digital menus
            </p>
            {/* Feature pills */}
            <div className="mt-10 space-y-3">
              {[
                { icon: <Zap size={14} />, text: "Instant QR Menus" },
                { icon: <Palette size={14} />, text: "Custom Branding" },
                { icon: <BarChart3 size={14} />, text: "Scan Analytics" },
              ].map((f) => (
                <div
                  key={f.text}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-foreground/70 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)]"
                >
                  <span className="text-primary">{f.icon}</span>
                  {f.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex-1 flex items-center justify-center px-5"
        >
          <div className="w-full max-w-[420px]">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center">
                <Coffee size={20} className="text-white" />
              </div>
              <span className="text-xl font-extrabold gradient-text">MenuQR</span>
            </div>

            <h2 className="text-[28px] font-extrabold mb-2 text-foreground">
              Welcome back
            </h2>
            <p className="text-muted mb-8" style={{ fontFamily: "var(--font-body)" }}>Sign in to manage your menus</p>

            {error && (
              <div className="flex items-center gap-3 p-3.5 rounded-xl mb-5 text-sm bg-error/10 text-error border border-error/20">
                <AlertCircle size={18} className="flex-shrink-0" />
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold mb-2 text-muted uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-light" />
                  <input
                    type="email"
                    required
                    placeholder="name@restaurant.com"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl input-obsidian"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider">
                    Password
                  </label>
                  <span onClick={() => showToast("Feature coming soon!", "info")} className="text-xs font-semibold text-primary cursor-pointer hover:underline">Forgot?</span>
                </div>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-light" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl input-obsidian"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Remember checkbox */}
              <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-primary" />
                Remember this device
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-semibold bg-gradient-to-r from-primary to-orange-400 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 cursor-pointer active:scale-[0.97] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>Login to Dashboard →</>
                )}
              </button>
            </form>
            <p className="text-center mt-6 text-sm text-muted">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-semibold text-primary hover:underline">
                Register your restaurant
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
