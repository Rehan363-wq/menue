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
} from "lucide-react";
import type { Restaurant } from "@/lib/types";

export default function Dashboard() {
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

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const res = await fetch("/api/restaurant", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("menuqr_token")}`,
        },
      });
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
          Authorization: `Bearer ${localStorage.getItem("menuqr_token")}`,
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
      approved: "text-success bg-success-light border-success/20",
      rejected: "text-error bg-error-light border-error/20",
      pending: "text-warning bg-warning-light border-warning/20",
    };
    const icons: Record<string, React.ReactNode> = {
      approved: <CheckCircle size={16} />,
      rejected: <XCircle size={16} />,
      pending: <Clock size={16} />,
    };
    return (
      <div className={`flex items-center gap-1.5 text-[13px] font-bold px-2.5 py-1 rounded-md border ${styles[status] || styles.pending}`}>
        {icons[status] || icons.pending}
        <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-[32px] font-extrabold mb-2 text-foreground">
            Your Restaurants
          </h1>
          <p className="text-muted">
            Request and manage your digital menu listings.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold bg-primary text-white hover:bg-primary-hover transition-all cursor-pointer"
        >
          <Plus size={20} />
          Create New Request
        </button>
      </header>

      {/* Content */}
      {loading ? (
        <div className="text-center py-20 text-muted">
          Loading your restaurants...
        </div>
      ) : restaurants.length === 0 ? (
        <div className="rounded-xl p-20 text-center flex flex-col items-center gap-4 bg-surface border border-border shadow-sm">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-surface-alt text-muted">
            <Coffee size={32} />
          </div>
          <h3 className="text-xl font-bold text-foreground">No restaurants yet</h3>
          <p className="text-muted mb-3">
            Create your first restaurant request to get started.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-xl font-semibold border border-primary text-primary bg-transparent hover:bg-primary hover:text-white transition-all cursor-pointer"
          >
            Create Request
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-6">
          {restaurants.map((rest) => (
            <div
              key={rest.id}
              className="rounded-xl flex flex-col p-6 bg-surface border border-border shadow-sm hover:-translate-y-1 transition-transform"
            >
              <div className="flex justify-between items-center mb-5">
                {getStatusBadge(rest.approval_status)}
                <span className="text-[11px] font-extrabold text-muted-light">
                  {rest.plan_type.toUpperCase()} PLAN
                </span>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1 text-foreground">{rest.name}</h3>
                <p className="text-[13px] font-semibold mb-3 text-primary">
                  /{rest.slug}
                </p>
                <p className="text-sm text-muted line-clamp-2 h-[42px]">
                  {rest.description || "No description provided."}
                </p>
              </div>

              <div className="mt-auto">
                <Link
                  href={`/dashboard/menu/${rest.id}`}
                  className="flex items-center justify-between w-full px-4 py-3 rounded-xl font-semibold text-sm border border-border text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all"
                >
                  {rest.is_approved ? "Edit Menu" : "View Request"}
                  <ChevronRight size={18} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-[480px] p-10 rounded-2xl bg-surface border border-border shadow-2xl">
            <h2 className="text-2xl font-extrabold mb-2 text-foreground">
              Request New Menu Setup
            </h2>
            <p className="text-[15px] mb-8 text-muted">
              Our admin team will review your request within 24 hours.
            </p>

            {createError && (
              <div className="p-3 rounded-lg mb-5 text-sm text-center bg-error-light text-error">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Blue Door Cafe"
                  className="w-full px-3 py-3 rounded-lg text-[15px] border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
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
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  Slug (URL Shortcut)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. blue-door"
                  className="w-full px-3 py-3 rounded-lg text-[15px] border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  Requested Plan
                </label>
                <select
                  className="w-full px-3 py-3 rounded-lg text-[15px] border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
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
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  Description (Optional)
                </label>
                <textarea
                  placeholder="Tell us about your restaurant..."
                  rows={3}
                  className="w-full px-3 py-3 rounded-lg text-[15px] border border-border bg-background text-foreground resize-none outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
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
                  className="px-4 py-3 rounded-xl font-semibold border border-primary text-primary bg-transparent hover:bg-primary hover:text-white transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-3 rounded-xl font-semibold bg-primary text-white hover:bg-primary-hover transition-all cursor-pointer"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal with Contact */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-[460px] p-10 rounded-2xl text-center bg-surface border border-border shadow-2xl">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-success-light text-success">
              <CheckCircle size={40} />
            </div>
            <h2 className="text-2xl font-extrabold mb-2 text-foreground">
              Request Submitted!
            </h2>
            <p className="text-[15px] mb-6 text-muted">
              Your request for <strong>{lastCreatedName}</strong> has been submitted successfully.
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
              className="w-full px-4 py-3 rounded-xl font-semibold bg-primary text-white hover:bg-primary-hover transition-all cursor-pointer"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
