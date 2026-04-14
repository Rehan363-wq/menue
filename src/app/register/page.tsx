"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Coffee, User, Mail, Lock, AlertCircle, Zap, Palette, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        if (data.data?.requires_verification) {
            router.push(`/verify-email?email=${encodeURIComponent(data.data.email)}`);
        } else {
            router.push("/login");
        }
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "An error occurred");
      } else {
        setError("An unknown error occurred");
      }
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
          <div className="absolute w-[200px] h-[200px] rounded-full bg-purple-500/5 blur-[60px] bottom-20 left-20" />

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
              Create your account
            </h2>
            <p className="text-muted mb-8" style={{ fontFamily: "var(--font-body)" }}>Start building your digital menu today</p>

            {error && (
              <div className="flex items-center gap-3 p-3.5 rounded-xl mb-5 text-sm bg-error/10 text-error border border-error/20">
                <AlertCircle size={18} className="flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold mb-2 text-muted uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-light" />
                  <input
                    type="text"
                    required
                    placeholder="Your name"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl input-obsidian"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 text-muted uppercase tracking-wider">
                  Email
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
                <label className="block text-xs font-bold mb-2 text-muted uppercase tracking-wider">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-light">📞</span>
                  <input
                    type="tel"
                    required
                    placeholder="+91 9876543210"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl input-obsidian"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 text-muted uppercase tracking-wider">
                  Address
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-light">📍</span>
                  <input
                    type="text"
                    required
                    placeholder="Restaurant Address"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl input-obsidian"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 text-muted uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-light" />
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl input-obsidian"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-semibold bg-gradient-to-r from-primary to-orange-400 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 cursor-pointer active:scale-[0.97] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Register"
                )}
              </button>
            </form>
            <p className="text-center mt-6 text-sm text-muted">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Login
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
