"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Menu, 
  ChevronRight, 
  Store, 
  Plus, 
  LayoutGrid,
  Image as ImageIcon,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";
import type { Restaurant } from "@/lib/types";

export default function MenusPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurants();
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

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      approved: "text-success bg-success/10 border-success/20",
      rejected: "text-error bg-error/10 border-error/20",
      pending: "text-warning bg-warning/10 border-warning/20",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${styles[status] || styles.pending}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="page-enter max-w-5xl mx-auto">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground mb-2 flex items-center gap-3">
            <Menu className="text-primary" />
            Menu Management
          </h1>
          <p className="text-muted text-sm" style={{ fontFamily: "var(--font-body)" }}>
            Select a restaurant to modify its menu, categories, and appearance.
          </p>
        </div>
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.04)] transition-all"
        >
          <Plus size={16} />
          Add Store
        </Link>
      </header>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="h-24 bg-surface rounded-2xl animate-pulse border border-[rgba(255,255,255,0.04)]" />
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <div className="bg-surface rounded-3xl p-16 text-center border border-dashed border-[rgba(255,255,255,0.06)]">
          <Menu size={48} className="mx-auto text-muted/30 mb-4" />
          <h2 className="text-xl font-bold mb-2">No Menus Found</h2>
          <p className="text-muted text-sm mb-6 max-w-sm mx-auto">
            You haven't created any restaurants yet. Head back to the Overview to get started.
          </p>
          <Link href="/dashboard" className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm">
            Go to Overview
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {restaurants.map((rest, index) => (
            <motion.div
              key={rest.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-surface border border-[rgba(255,255,255,0.04)] hover:border-primary/20 rounded-2xl p-6 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-surface-alt border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-primary">
                    <Store size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold">{rest.name}</h3>
                      {getStatusBadge(rest.approval_status)}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted">
                      <span className="flex items-center gap-1.5 font-mono">
                        <LayoutGrid size={12} />
                        /{rest.slug}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <ImageIcon size={12} />
                        {rest.plan_type === "image" ? "Classic Plan" : "Video Plan"}
                      </span>
                    </div>
                  </div>
                </div>
                
                <Link
                  href={rest.approval_status === "approved" ? `/dashboard/menu/${rest.id}` : "/dashboard"}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                    rest.approval_status === "approved"
                      ? "bg-primary/10 text-primary hover:bg-primary hover:text-white"
                      : "bg-surface-alt text-muted cursor-not-allowed opacity-50"
                  }`}
                >
                  {rest.approval_status === "approved" ? "Manage Menu" : "Awaiting Approval"}
                  <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Info Card */}
      <div className="mt-10 p-6 rounded-2xl bg-gradient-to-br from-surface to-surface-alt border border-[rgba(255,255,255,0.04)]">
        <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
          <Clock size={16} className="text-orange-400" />
          Approval Process
        </h4>
        <p className="text-xs text-muted leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
          Your restaurant must be approved by our team before you can start editing the menu. 
          Standard approval time is typically under 12 hours. Once approved, the "Manage Menu" button will become active.
        </p>
      </div>
    </div>
  );
}
