"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
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
      if (!data.success) throw new Error(data.error);

      // Auto-login after register
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
      const loginData = await loginRes.json();
      if (loginData.success) {
        localStorage.setItem("menuqr_token", loginData.data.token);
        localStorage.setItem(
          "menuqr_user",
          JSON.stringify(loginData.data.user)
        );
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-5">
        <div className="w-full max-w-[450px] p-8 rounded-2xl bg-surface border border-border shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
          <h2 className="text-center text-2xl font-extrabold mb-8 text-foreground">
            Create Account
          </h2>
          {error && (
            <div className="p-3 rounded-lg mb-5 text-sm text-center bg-error-light text-error">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="Your name"
                className="w-full px-4 py-3.5 rounded-lg border border-border bg-background text-foreground outline-none transition focus:ring-2 focus:ring-primary/30 focus:border-primary"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Email
              </label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3.5 rounded-lg border border-border bg-background text-foreground outline-none transition focus:ring-2 focus:ring-primary/30 focus:border-primary"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="Minimum 6 characters"
                className="w-full px-4 py-3.5 rounded-lg border border-border bg-background text-foreground outline-none transition focus:ring-2 focus:ring-primary/30 focus:border-primary"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold bg-primary text-white hover:bg-primary-hover transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Creating Account..." : "Register"}
            </button>
          </form>
          <p className="text-center mt-6 text-sm text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
