"use client";

import { useEffect, useState } from "react";
import { Users, Star, MessageSquare, ThumbsUp, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface FeedbackData {
  avgRating: number;
  totalRatings: number;
  positivePercent: number;
  fanFavorite: { name: string; restaurantName: string; rating: number } | null;
  recentFeedback: {
    id: string;
    itemName: string;
    restaurantName: string;
    ratingScore: number;
    ratingCount: number;
    updatedAt: number;
  }[];
}

export default function CustomersPage() {
  const [data, setData] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const res = await fetch("/api/customers/feedback");
      const result = await res.json();
      if (result.success) setData(result.data);
    } catch (err) {
      console.error("Failed to fetch feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (ts: number) => {
    const now = Date.now();
    // Handle both seconds and milliseconds timestamps
    const timestamp = ts < 1e12 ? ts * 1000 : ts;
    const diff = now - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  };

  if (loading) {
    return (
      <div className="page-enter max-w-5xl mx-auto">
        <header className="mb-10">
          <div className="h-9 w-64 bg-surface-alt rounded-xl animate-pulse mb-3" />
          <div className="h-4 w-80 bg-surface-alt rounded-lg animate-pulse" />
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="md:col-span-2 h-48 bg-surface rounded-3xl animate-pulse" />
          <div className="h-48 bg-surface rounded-3xl animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-surface rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const hasData = data && data.totalRatings > 0;

  return (
    <div className="page-enter max-w-5xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold text-foreground mb-2 flex items-center gap-3">
          <Users className="text-primary" />
          Customer Lounge
        </h1>
        <p className="text-muted text-sm" style={{ fontFamily: "var(--font-body)" }}>
          Real feedback and ratings from your customers.
        </p>
      </header>

      {/* Hero Feedback Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="md:col-span-2 bg-gradient-to-br from-primary to-orange-500 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-primary/20">
          <div className="absolute right-0 top-0 p-4 opacity-20">
            <MessageSquare size={120} />
          </div>
          <div className="relative z-10">
            {hasData ? (
              <>
                <h2 className="text-[42px] font-black leading-tight mb-2">
                  {data.avgRating.toFixed(1)}
                </h2>
                <div className="flex gap-1 mb-4 text-amber-300">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star
                      key={i}
                      size={20}
                      fill={i <= Math.round(data.avgRating) ? "currentColor" : "none"}
                      className={i > Math.round(data.avgRating) ? "opacity-40" : ""}
                    />
                  ))}
                </div>
                <p className="text-sm font-bold opacity-90 mb-6">Average Rating across all your restaurants</p>
                <div className="flex gap-8">
                  <div>
                    <p className="text-xl font-black">{data.totalRatings}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Total Ratings</p>
                  </div>
                  <div>
                    <p className="text-xl font-black">{data.positivePercent}%</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Positive Feedback</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-[28px] font-black leading-tight mb-2">No Ratings Yet</h2>
                <p className="text-sm font-bold opacity-90 mb-4">
                  Ratings will appear here once customers start rating your menu items.
                </p>
                <div className="flex gap-1 text-white/40">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} size={24} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-surface border border-[rgba(255,255,255,0.04)] rounded-3xl p-6 flex flex-col justify-center items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center text-success mb-4">
            <ThumbsUp size={24} />
          </div>
          <h3 className="font-bold text-foreground mb-1">Fan Favorite</h3>
          {data?.fanFavorite ? (
            <>
              <p className="text-sm text-primary font-black mb-1">{data.fanFavorite.name}</p>
              <p className="text-[11px] text-muted font-semibold mb-3">{data.fanFavorite.restaurantName}</p>
              <div className="flex gap-0.5 text-amber-400">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} size={12} fill={i <= Math.round(data.fanFavorite!.rating) ? "currentColor" : "none"} />
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-muted leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              Your highest rated item will appear here once customers start rating.
            </p>
          )}
        </div>
      </div>

      {/* Recent Feedback */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-bold">Recent Feedback</h3>
        </div>

        <div className="grid gap-4">
          {hasData && data.recentFeedback.length > 0 ? (
            data.recentFeedback.map((fb, i) => (
              <motion.div
                key={fb.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-surface border border-[rgba(255,255,255,0.04)] rounded-2xl p-6 hover:border-primary/20 transition-all group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-alt flex items-center justify-center font-bold text-muted border border-[rgba(255,255,255,0.05)]">
                      {fb.itemName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-sm leading-none mb-1">{fb.itemName}</h4>
                      <span className="text-[10px] text-muted font-bold uppercase tracking-tighter">{fb.restaurantName}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex gap-0.5 text-amber-400 mb-1">
                      {[1, 2, 3, 4, 5].map(x => (
                        <Star key={x} size={12} fill={x <= Math.round(fb.ratingScore) ? "currentColor" : "none"} className={x > Math.round(fb.ratingScore) ? "text-muted/30" : ""} />
                      ))}
                    </div>
                    <span className="text-[10px] text-muted font-bold uppercase">{formatTimeAgo(fb.updatedAt)}</span>
                  </div>
                </div>
                <p className="text-sm text-muted/90" style={{ fontFamily: "var(--font-body)" }}>
                  Avg rating: {fb.ratingScore.toFixed(1)} from {fb.ratingCount} {fb.ratingCount === 1 ? "customer" : "customers"}
                </p>
              </motion.div>
            ))
          ) : (
            <div className="bg-surface border border-dashed border-[rgba(255,255,255,0.06)] rounded-2xl p-16 text-center">
              <MessageSquare size={40} className="mx-auto text-muted/30 mb-4" />
              <h3 className="text-lg font-bold mb-2">No Customer Feedback Yet</h3>
              <p className="text-sm text-muted max-w-sm mx-auto" style={{ fontFamily: "var(--font-body)" }}>
                Once customers scan your QR code and rate menu items, their feedback will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
