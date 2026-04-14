"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Coffee,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  Store,
  ShieldCheck,
  AlertTriangle,
  Bell,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Restaurant } from "@/lib/types";
import { useToast } from "@/components/Toast";

export default function Dashboard() {
  const { showToast } = useToast();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastCreatedName, setLastCreatedName] = useState("");
  const [createError, setCreateError] = useState("");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    plan_type: "image",
  });

  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetchRestaurants();
    try {
      const storedUser = localStorage.getItem("menuqr_user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUserName(parsed.name || "");
      }
    } catch (e) { console.error("Failed to parse user data", e); }
  }, []);

  const fetchRestaurants = async () => {
    try {
      const res = await fetch("/api/restaurant");
      const data = await res.json();
      if (data.success) setRestaurants(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    try {
      const res = await fetch("/api/restaurant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setLastCreatedName(form.name);
        setShowModal(false);
        setShowSuccess(true);
        setForm({ name: "", slug: "", description: "", plan_type: "image" });
        fetchRestaurants();
      } else {
        setCreateError(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      setCreateError("Network error. Please try again.");
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      approved: "text-success bg-success/10 border-success/20",
      rejected: "text-error bg-error/10 border-error/20",
      pending: "text-warning bg-warning/10 border-warning/20",
    };
    const icons: Record<string, React.ReactNode> = {
      approved: <CheckCircle size={14} />,
      rejected: <XCircle size={14} />,
      pending: <Clock size={14} />,
    };
    return (
      <div className={`flex items-center gap-1.5 text-[12px] font-bold px-2.5 py-1 rounded-full border ${styles[status] || styles.pending}`}>
        {icons[status] || icons.pending}
        <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      approved: "bg-success",
      rejected: "bg-error",
      pending: "bg-warning",
    };
    return colors[status] || colors.pending;
  };

  const approvedCount = restaurants.filter((r) => r.approval_status === "approved").length;
  const pendingCount = restaurants.filter((r) => r.approval_status === "pending").length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="page-enter">
      {/* Header */}
      <header className="mb-8 md:mb-10">
        {userName && (
          <p className="text-muted text-[15px] mb-1" style={{ fontFamily: "var(--font-body)" }}>
            {getGreeting()}, {userName} 👋
          </p>
        )}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-[26px] md:text-[32px] font-extrabold mb-2 text-foreground">
              Your Restaurants
            </h1>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button onClick={() => showToast("Notifications feature coming soon!", "info")} className="w-9 h-9 rounded-xl flex items-center justify-center bg-surface-alt border border-[rgba(255,255,255,0.06)] text-muted hover:text-foreground transition-all duration-200 cursor-pointer">
              <Bell size={18} />
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-primary to-orange-400 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.03] transition-all duration-200 cursor-pointer active:scale-[0.97]"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Create New Request</span>
              <span className="sm:hidden">New Request</span>
            </button>
          </div>
        </div>

        {/* Stats Row — scrollable on mobile */}
        {!loading && restaurants.length > 0 && (
          <div className="flex md:grid md:grid-cols-3 gap-3 mt-6 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {[
              { label: "Total Stores", value: restaurants.length, icon: <Store size={18} />, color: "text-primary" },
              { label: "Approved", value: approvedCount, icon: <CheckCircle size={18} />, color: "text-success" },
              { label: "Pending", value: pendingCount, icon: <Clock size={18} />, color: "text-warning" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3 md:py-4 rounded-2xl bg-surface border border-[rgba(255,255,255,0.04)] min-w-[160px] md:min-w-0 flex-shrink-0 md:flex-shrink"
              >
                <div className={stat.color}>{stat.icon}</div>
                <div>
                  <p className="text-[22px] md:text-[26px] font-extrabold text-foreground leading-none">{stat.value}</p>
                  <p className="text-[11px] text-muted font-semibold uppercase tracking-wider mt-0.5">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </header>

      {/* Active Deployments label */}
      {!loading && restaurants.length > 0 && (
        <h2 className="text-lg font-bold text-foreground mb-5">Active Deployments</h2>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl p-6 bg-surface border border-[rgba(255,255,255,0.04)]">
              <div className="h-6 w-24 bg-surface-alt rounded-lg animate-pulse mb-5" />
              <div className="h-5 w-40 bg-surface-alt rounded-lg animate-pulse mb-2" />
              <div className="h-4 w-32 bg-surface-alt rounded-lg animate-pulse mb-3" />
              <div className="h-10 w-full bg-surface-alt rounded-xl animate-pulse mt-8" />
            </div>
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <div className="rounded-2xl p-10 md:p-20 text-center flex flex-col items-center gap-4 bg-surface border border-[rgba(255,255,255,0.04)]">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4 bg-primary/10 animate-float">
            <Coffee size={40} className="text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground">No restaurants yet</h3>
          <p className="text-muted mb-3 max-w-[300px]" style={{ fontFamily: "var(--font-body)" }}>
            Create your first restaurant request to get started.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-primary to-orange-400 text-white shadow-md hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.03] transition-all duration-200 cursor-pointer active:scale-[0.97]"
          >
            Create Request
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {restaurants.map((rest, index) => (
            <motion.div
              key={rest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
              className={`rounded-2xl flex flex-col bg-surface border border-[rgba(255,255,255,0.04)] hover:border-primary/15 hover:shadow-[0_8px_40px_rgba(255,107,53,0.06)] transition-all duration-300 relative overflow-hidden ${
                rest.approval_status === "approved" ? "card-gradient-border" : ""
              }`}
            >
              {/* Left accent bar */}
              <div className={`w-1 h-full rounded-r-full absolute left-0 top-0 ${getStatusColor(rest.approval_status)}`} />

              {/* Card image placeholder */}
              <div className="h-[120px] md:h-[140px] bg-surface-alt relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface" />
                <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                  {getStatusBadge(rest.approval_status)}
                  <span className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
                    {rest.plan_type} Plan
                  </span>
                </div>
              </div>

              <div className="p-4 md:p-5">
                <h3 className="text-lg font-bold mb-1 text-foreground">{rest.name}</h3>
                <p className="text-[13px] font-semibold mb-3 text-primary">
                  /{rest.slug}
                </p>

                <Link
                  href={`/dashboard/menu/${rest.id}`}
                  className="group flex items-center justify-between w-full px-4 py-2.5 rounded-xl font-semibold text-sm border border-[rgba(255,255,255,0.06)] text-foreground hover:bg-gradient-to-r hover:from-primary hover:to-orange-400 hover:text-white hover:border-transparent hover:shadow-md transition-all duration-200 active:scale-[0.97]"
                >
                  {rest.is_approved ? "Edit Menu" : "View Request"}
                  <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Analytics promo banner */}
      {!loading && restaurants.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 rounded-2xl p-6 md:p-8 bg-gradient-to-r from-surface to-surface-alt border border-[rgba(255,255,255,0.04)] relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-[200px] h-full bg-gradient-to-l from-primary/5 to-transparent" />
          <span className="inline-block text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full mb-3">📊 New: Real-time Analytics</span>
          <h3 className="text-lg md:text-xl font-extrabold text-foreground mb-2">
            Measure what makes them <span className="text-primary">hungry.</span>
          </h3>
          <p className="text-sm text-muted max-w-[400px] mb-4" style={{ fontFamily: "var(--font-body)" }}>
            Track which dishes get the most views and optimize your menu pricing in real-time with our new behavioral heatmaps.
          </p>
          <Link href="/dashboard/analytics" className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-[rgba(255,255,255,0.08)] text-foreground hover:bg-[rgba(255,255,255,0.04)] transition-all duration-200 cursor-pointer inline-block">
            Explore Analytics Engine
          </Link>
        </motion.div>
      )}

      {/* Create Modal — full screen on mobile */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 flex items-end md:items-center justify-center z-50 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full md:max-w-[480px] max-h-[95vh] md:max-h-none overflow-y-auto p-8 md:p-10 rounded-t-3xl md:rounded-2xl bg-surface border border-[rgba(255,255,255,0.06)] shadow-[0_24px_64px_rgba(0,0,0,0.5)]"
            >
              <h2 className="text-2xl font-extrabold mb-2 text-foreground">
                Request New Menu Setup
              </h2>
              <p className="text-[15px] mb-8 text-muted" style={{ fontFamily: "var(--font-body)" }}>
                Our admin team will review your request within 24 hours.
              </p>

              {createError && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl mb-5 text-sm bg-error/10 text-error border border-error/20">
                  <AlertTriangle size={18} className="flex-shrink-0" />
                  {createError}
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold mb-2 text-muted uppercase tracking-wider">
                    Restaurant Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Blue Door Cafe"
                    className="w-full px-4 py-3 rounded-xl text-[15px] input-obsidian"
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                        slug: e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-|-$/g, ""),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 text-muted uppercase tracking-wider">
                    Slug (URL Shortcut)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. blue-door"
                    className="w-full px-4 py-3 rounded-xl text-[15px] input-obsidian"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 text-muted uppercase tracking-wider">
                    Requested Plan
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-xl text-[15px] input-obsidian"
                    value={form.plan_type}
                    onChange={(e) =>
                      setForm({ ...form, plan_type: e.target.value })
                    }
                  >
                    <option value="image">Image Plan (Classic)</option>
                    <option value="video">Video Plan (Premium)</option>
                  </select>
                  <p className="text-xs text-muted mt-1.5">
                    Video plan allows autoplay videos for each item.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 text-muted uppercase tracking-wider">
                    Description (Optional)
                  </label>
                  <textarea
                    placeholder="Tell us about your restaurant..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl text-[15px] input-obsidian resize-none"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setCreateError(""); }}
                    className="px-4 py-3 rounded-xl font-semibold border border-[rgba(255,255,255,0.08)] text-foreground bg-transparent hover:bg-[rgba(255,255,255,0.04)] transition-all duration-200 cursor-pointer active:scale-[0.97]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-3 rounded-xl font-semibold bg-gradient-to-r from-primary to-orange-400 text-white shadow-md hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 cursor-pointer active:scale-[0.97]"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Modal with Contact */}
      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 flex items-end md:items-center justify-center z-50 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full md:max-w-[460px] p-8 md:p-10 rounded-t-3xl md:rounded-2xl text-center bg-surface border border-[rgba(255,255,255,0.06)] shadow-[0_24px_64px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
              {/* Confetti dots */}
              <div className="absolute top-16 left-1/2 pointer-events-none">
                <div className="w-2 h-2 rounded-full bg-primary absolute" style={{ animation: "confetti-1 1s ease-out infinite" }} />
                <div className="w-2 h-2 rounded-full bg-orange-400 absolute" style={{ animation: "confetti-2 1.2s ease-out infinite" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute" style={{ animation: "confetti-3 1.1s ease-out infinite" }} />
                <div className="w-2 h-2 rounded-full bg-rose-400 absolute" style={{ animation: "confetti-4 1.3s ease-out infinite" }} />
              </div>

              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-success/10 text-success">
                <CheckCircle size={40} />
              </div>
              <h2 className="text-2xl font-extrabold mb-2 text-foreground">
                Request Submitted!
              </h2>
              <p className="text-[15px] mb-6 text-muted" style={{ fontFamily: "var(--font-body)" }}>
                Your request for <strong className="text-foreground">{lastCreatedName}</strong> has been submitted successfully.
                Our admin will review and approve your plan.
              </p>

              <div className="rounded-xl p-5 mb-6 bg-primary/5 border border-primary/20">
                <p className="text-sm mb-2 text-muted">For faster approval, contact admin:</p>
                <a
                  href="tel:+919057291246"
                  className="flex items-center justify-center gap-2 text-xl font-extrabold text-primary hover:underline"
                >
                  <Phone size={20} />
                  +91 90572 91246
                </a>
                <p className="text-xs mt-2 text-muted">WhatsApp / Call available</p>
              </div>

              <button
                onClick={() => setShowSuccess(false)}
                className="w-full px-4 py-3 rounded-xl font-semibold bg-gradient-to-r from-primary to-orange-400 text-white shadow-md hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 cursor-pointer active:scale-[0.97]"
              >
                Got it, thanks!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
