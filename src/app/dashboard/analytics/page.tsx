"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Users, Target, Calendar, ArrowUpRight, Star, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface AnalyticsData {
  stats: {
    qrScans: number;
    itemViews: number;
    uniqueVisitors: number;
    periodQrScans: number;
    periodItemViews: number;
    periodUniqueVisitors: number;
  };
  chartData: { date: string; count: number }[];
  topItems: { id: string; name: string; rating_score: number; rating_count: number; price: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDays, setActiveDays] = useState(12);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  // Get user's first restaurant
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/restaurant");
        const result = await res.json();
        if (result.success && result.data.length > 0) {
          setRestaurantId(result.data[0].id);
        } else {
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    })();
  }, []);

  // Fetch analytics when restaurantId or days change
  useEffect(() => {
    if (!restaurantId) return;
    fetchAnalytics(restaurantId, activeDays);
  }, [restaurantId, activeDays]);

  const fetchAnalytics = async (rid: string, days: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?restaurantId=${rid}&days=${days}`);
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const stats = data
    ? [
        { label: "Total QR Scans", value: data.stats.qrScans.toLocaleString(), growth: `${data.stats.periodQrScans}`, icon: <Target className="text-blue-400" />, sub: `${activeDays}d` },
        { label: "Menu Item Views", value: data.stats.itemViews.toLocaleString(), growth: `${data.stats.periodItemViews}`, icon: <TrendingUp className="text-green-400" />, sub: `${activeDays}d` },
        { label: "Unique Visitors", value: data.stats.uniqueVisitors.toLocaleString(), growth: `${data.stats.periodUniqueVisitors}`, icon: <Users className="text-purple-400" />, sub: `${activeDays}d` },
      ]
    : [];

  const maxChartVal = data ? Math.max(...data.chartData.map(d => d.count), 1) : 1;

  if (loading && !data) {
    return (
      <div className="page-enter max-w-6xl mx-auto pb-10">
        <header className="mb-10">
          <div className="h-9 w-64 bg-surface-alt rounded-xl animate-pulse mb-3" />
          <div className="h-4 w-96 bg-surface-alt rounded-lg animate-pulse" />
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-surface border border-[rgba(255,255,255,0.04)] rounded-2xl p-6">
              <div className="h-10 w-10 bg-surface-alt rounded-xl animate-pulse mb-4" />
              <div className="h-8 w-24 bg-surface-alt rounded-lg animate-pulse mb-2" />
              <div className="h-3 w-32 bg-surface-alt rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
        <div className="bg-surface border border-[rgba(255,255,255,0.04)] rounded-3xl p-6 md:p-8 mb-8">
          <div className="h-6 w-48 bg-surface-alt rounded-lg animate-pulse mb-8" />
          <div className="h-[200px] flex items-end gap-2">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="flex-1 bg-surface-alt rounded-t-lg animate-pulse" style={{ height: `${30 + Math.random() * 60}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter max-w-6xl mx-auto pb-10">
      <header className="mb-8 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-2 flex items-center gap-3">
          <BarChart3 className="text-primary" />
          Insight Analytics
        </h1>
        <p className="text-muted text-sm" style={{ fontFamily: "var(--font-body)" }}>
          Track your menu performance, customer engagement, and business growth.
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-surface border border-[rgba(255,255,255,0.04)] rounded-2xl p-5 md:p-6 relative overflow-hidden group hover:border-primary/20 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-surface-alt border border-[rgba(255,255,255,0.05)]">
                {stat.icon}
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-success bg-success/10 px-2 py-1 rounded-lg">
                <ArrowUpRight size={14} />
                {stat.growth} in {stat.sub}
              </span>
            </div>
            <h3 className="text-[28px] md:text-[32px] font-black text-foreground mb-1 leading-none">{stat.value}</h3>
            <p className="text-xs text-muted font-bold uppercase tracking-widest">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Chart Section */}
      <div className="bg-surface border border-[rgba(255,255,255,0.04)] rounded-2xl md:rounded-3xl p-5 md:p-8 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-8 md:mb-10">
          <div>
            <h3 className="text-lg font-bold mb-1">Engagement Heatmap</h3>
            <p className="text-xs text-muted">Total menu views across the last {activeDays} days</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveDays(7)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeDays === 7
                  ? "bg-primary text-white"
                  : "bg-surface-alt border border-[rgba(255,255,255,0.05)] text-muted hover:text-foreground"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setActiveDays(12)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeDays === 12
                  ? "bg-primary text-white"
                  : "bg-surface-alt border border-[rgba(255,255,255,0.05)] text-muted hover:text-foreground"
              }`}
            >
              12 Days
            </button>
          </div>
        </div>

        {loading ? (
          <div className="h-[200px] md:h-[240px] flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : (
          <div className="overflow-x-auto -mx-2 px-2">
            <div className="h-[200px] md:h-[240px] flex items-end justify-between gap-1.5 md:gap-2 min-w-[400px]">
              {data?.chartData.map((bar, i) => {
                const pct = maxChartVal > 0 ? (bar.count / maxChartVal) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center group relative cursor-help">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(pct, 2)}%` }}
                      transition={{ delay: 0.3 + i * 0.05, duration: 0.8, ease: "easeOut" }}
                      className="w-full bg-gradient-to-t from-primary/10 to-primary rounded-t-lg group-hover:from-primary/30 group-hover:to-primary/80 transition-all duration-300"
                    />
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface text-white text-[10px] font-bold px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.1)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {bar.count} Views
                    </div>
                    <span className="text-[9px] md:text-[10px] font-bold text-muted mt-3 md:mt-4 whitespace-nowrap">{bar.date}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {data && data.chartData.every(d => d.count === 0) && (
          <p className="text-center text-muted text-sm mt-4">No activity recorded yet. Data will appear as customers scan your QR codes.</p>
        )}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface border border-[rgba(255,255,255,0.04)] rounded-2xl p-5 md:p-6">
          <h3 className="font-bold text-sm mb-6 flex items-center gap-2">
            <Calendar size={16} className="text-primary" />
            Top Performing Items
          </h3>
          <div className="space-y-3">
            {data && data.topItems.length > 0 ? (
              data.topItems.map((item, i) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-surface-alt flex items-center justify-center text-[10px] font-black text-muted">0{i + 1}</span>
                    <div>
                      <span className="text-sm font-semibold block">{item.name}</span>
                      <span className="text-[10px] text-muted flex items-center gap-1">
                        <Star size={10} className="text-orange-400" fill="currentColor" />
                        {item.rating_score.toFixed(1)} ({item.rating_count})
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">₹{item.price}</p>
                    <p className="text-[10px] text-muted font-bold uppercase tracking-wider">{item.rating_count} Ratings</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted text-sm">
                <Star size={24} className="mx-auto mb-2 opacity-30" />
                <p>No rated items yet</p>
                <p className="text-xs mt-1">Items will appear here once customers rate them.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-surface border border-[rgba(255,255,255,0.04)] rounded-2xl p-5 md:p-6 flex flex-col justify-center text-center items-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <BarChart3 className="text-primary" size={32} />
          </div>
          <h3 className="text-lg font-bold mb-2">Detailed Reports</h3>
          <p className="text-xs text-muted max-w-[240px] mb-6 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
            Unlock customer demographic data and revenue forecasting by upgrading to our Enterprise plan.
          </p>
          <button className="px-5 py-2.5 rounded-xl bg-surface-alt border border-[rgba(255,255,255,0.06)] text-sm font-black text-muted cursor-not-allowed">
            Upgrade Coming Soon
          </button>
        </div>
      </div>
    </div>
  );
}
