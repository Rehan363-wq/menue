"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Building2, CheckCircle2, XCircle, Search, 
  MapPin, Clock, ChefHat, Eye, LogOut, ChevronLeft,
  Menu, X, Mail, Phone, Calendar, Package, Filter,
  ShieldCheck, AlertTriangle, Trash2
} from "lucide-react";
import type { CategoryWithItems } from "@/lib/types";
import { useToast } from "@/components/Toast";

interface AdminRestaurant {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  phone: string | null;
  theme_color: string;
  plan_type: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  is_approved: number;
  created_at: number;
  updated_at: number;
  owner_email?: string;
  owner_name?: string;
  owner_phone?: string | null;
  total_items?: number;
}

export default function AdminDashboard() {
  const { showToast } = useToast();
  const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewData, setPreviewData] = useState<{ restaurant: AdminRestaurant, categories: CategoryWithItems[] } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const getSecret = () => localStorage.getItem("menuqr_admin_secret");

  const fetchRestaurants = async () => {
    const secret = getSecret();
    if (!secret) return router.push("/admin/login");

    try {
      const res = await fetch("/api/admin/approve", {
        headers: { "x-admin-secret": secret }
      });
      
      if (res.status === 401) {
        localStorage.removeItem("menuqr_admin_secret");
        router.push("/admin/login");
        return;
      }
      
      const data = await res.json();
      if (data.success) {
        setRestaurants(data.data.sort((a: any, b: any) => b.created_at - a.created_at));
      }
    } catch (err) {
      setError("Failed to connect to admin servers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    const secret = getSecret();
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret || "",
        },
        body: JSON.stringify({ restaurant_id: id, action })
      });
      const data = await res.json();
      if (data.success) {
        setRestaurants(prev => prev.map(r => r.id === id ? { ...r, ...data.data } : r));
        if (previewData && previewData.restaurant.id === id) {
          setPreviewData(prev => prev ? { ...prev, restaurant: { ...prev.restaurant, ...data.data } } : null);
        }
        showToast(`Restaurant ${action}d successfully!`, "success");
      }
    } catch (err) {
      showToast("Action failed.", "error");
    }
  };

  const openPreview = async (id: string) => {
    const secret = getSecret();
    setPreviewLoading(true);
    try {
      const res = await fetch(`/api/admin/restaurant/${id}`, {
        headers: { "x-admin-secret": secret || "" }
      });
      const data = await res.json();
      if (data.success) {
        setPreviewData(data.data);
      }
    } catch {
      showToast("Failed to load details", "error");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("menuqr_admin_secret");
    router.push("/admin/login");
  };

  const handleDelete = async (id: string) => {
    const secret = getSecret();
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/approve", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret || "",
        },
        body: JSON.stringify({ restaurant_id: id }),
      });
      const data = await res.json();
      if (data.success) {
        setRestaurants(prev => prev.filter(r => r.id !== id));
        if (previewData && previewData.restaurant.id === id) {
          setPreviewData(null);
        }
        setConfirmDeleteId(null);
        showToast("Restaurant permanently deleted!", "success");
      } else {
        showToast(data.error || "Delete failed", "error");
      }
    } catch {
      showToast("Delete failed.", "error");
    } finally {
      setDeleting(false);
    }
  };

  // Computed stats
  const totalCount = restaurants.length;
  const pendingCount = restaurants.filter(r => r.approval_status === "pending").length;
  const approvedCount = restaurants.filter(r => r.approval_status === "approved").length;
  const rejectedCount = restaurants.filter(r => r.approval_status === "rejected").length;

  // Filtered restaurants
  const filtered = restaurants.filter(r => {
    const matchesSearch = searchQuery === "" ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.owner_email && r.owner_email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || r.approval_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted">Loading Admin Portal...</div>;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Navigation — Desktop */}
      <aside className="w-64 border-r border-[rgba(255,255,255,0.05)] bg-surface flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-[rgba(255,255,255,0.05)] text-brand gap-2 font-bold tracking-tight text-lg">
          <ChefHat className="text-red-500" />
          HQ Portal
        </div>
        <div className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/10 text-red-500 rounded-xl font-medium text-sm transition-colors border border-red-500/20">
            <Building2 size={18} />
            All Deployments
          </button>
        </div>
        <div className="p-4 border-t border-[rgba(255,255,255,0.05)]">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[rgba(255,255,255,0.03)] rounded-xl text-muted hover:text-foreground text-sm font-medium transition-colors">
            <LogOut size={18} />
            Secure Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-surface/95 backdrop-blur-xl border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between px-4 z-40">
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-muted hover:text-foreground">
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <span className="font-bold text-sm flex items-center gap-2"><ChefHat size={16} className="text-red-500" /> HQ Portal</span>
        <button onClick={handleLogout} className="p-2 text-muted hover:text-error">
          <LogOut size={18} />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-64 bg-surface h-full p-4 pt-16 border-r border-[rgba(255,255,255,0.05)]" onClick={e => e.stopPropagation()}>
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/10 text-red-500 rounded-xl font-medium text-sm border border-red-500/20">
              <Building2 size={18} />
              All Deployments
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden pt-14 md:pt-0">
        <header className="h-14 md:h-16 flex items-center justify-between px-4 md:px-8 border-b border-[rgba(255,255,255,0.05)] bg-background/50 backdrop-blur-md flex-shrink-0">
          <h1 className="text-lg md:text-xl font-semibold">Active Deployments</h1>
          <div className="flex items-center gap-4 text-sm text-muted">
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              System Online
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-5 md:space-y-6">
            
            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total", value: totalCount, icon: <Building2 size={16} />, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
                { label: "Pending", value: pendingCount, icon: <Clock size={16} />, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
                { label: "Approved", value: approvedCount, icon: <CheckCircle2 size={16} />, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
                { label: "Rejected", value: rejectedCount, icon: <XCircle size={16} />, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
              ].map(s => (
                <div key={s.label} className={`flex items-center gap-3 p-3 md:p-4 rounded-xl border ${s.bg}`}>
                  <div className={s.color}>{s.icon}</div>
                  <div>
                    <p className="text-xl md:text-2xl font-extrabold text-foreground leading-none">{s.value}</p>
                    <p className="text-[10px] text-muted font-bold uppercase tracking-wider">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Search and Filter Tabs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by name, slug, or email..." 
                  className="w-full bg-surface border border-[rgba(255,255,255,0.08)] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-red-500/50 transition-colors"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                {(["all", "pending", "approved", "rejected"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer capitalize ${
                      statusFilter === tab
                        ? "bg-red-500 text-white"
                        : "bg-surface border border-[rgba(255,255,255,0.05)] text-muted hover:text-foreground"
                    }`}
                  >
                    {tab === "all" ? `All (${totalCount})` : `${tab} (${tab === "pending" ? pendingCount : tab === "approved" ? approvedCount : rejectedCount})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop: Data Grid Table */}
            <div className="hidden md:block bg-surface border border-[rgba(255,255,255,0.05)] rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[rgba(255,255,255,0.02)] border-b border-[rgba(255,255,255,0.05)] text-muted font-medium">
                  <tr>
                    <th className="px-6 py-4">Restaurant</th>
                    <th className="px-6 py-4">Owner</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Items</th>
                    <th className="px-6 py-4 text-center">Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.02)]">
                  {filtered.map((restaurant) => (
                    <tr key={restaurant.id} className="hover:bg-[rgba(255,255,255,0.01)] transition-colors">
                      <td className="px-6 py-4 font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-xs">
                            {restaurant.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold">{restaurant.name}</p>
                            <p className="text-xs text-muted font-mono">/{restaurant.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted text-xs">
                        <p>{restaurant.owner_email || "N/A"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                          ${restaurant.approval_status === "approved" ? "bg-green-500/10 text-green-500 border-green-500/20" : ""}
                          ${restaurant.approval_status === "pending" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" : ""}
                          ${restaurant.approval_status === "rejected" ? "bg-red-500/10 text-red-500 border-red-500/20" : ""}
                        `}>
                          {restaurant.approval_status === "approved" && <CheckCircle2 size={12} />}
                          {restaurant.approval_status === "pending" && <Clock size={12} />}
                          {restaurant.approval_status === "rejected" && <XCircle size={12} />}
                          <span className="capitalize">{restaurant.approval_status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted text-center text-xs">{restaurant.total_items ?? 0}</td>
                      <td className="px-6 py-4 text-muted text-center text-xs">
                        {new Date(restaurant.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openPreview(restaurant.id)}
                            className="p-2 bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.08)] rounded-lg text-muted hover:text-white transition-colors"
                            title="Inspect Menu"
                          >
                            <Eye size={16} />
                          </button>
                          {restaurant.approval_status === "pending" && (
                            <>
                              <button 
                                onClick={() => handleAction(restaurant.id, "approve")}
                                className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-lg text-xs font-semibold transition-colors border border-green-500/20"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleAction(restaurant.id, "reject")}
                                className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-xs font-semibold transition-colors border border-red-500/20"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {confirmDeleteId === restaurant.id ? (
                            <div className="flex items-center gap-1.5 ml-1">
                              <button
                                onClick={() => handleDelete(restaurant.id)}
                                disabled={deleting}
                                className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                              >
                                {deleting ? "..." : "Confirm"}
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2.5 py-1.5 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] rounded-lg text-xs font-semibold text-muted transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(restaurant.id)}
                              className="p-2 bg-[rgba(255,255,255,0.03)] hover:bg-red-500/10 rounded-lg text-muted hover:text-red-500 transition-colors"
                              title="Delete Restaurant"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted">
                        {searchQuery || statusFilter !== "all" ? "No restaurants match your filters." : "No restaurants found in the database."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile: Card List */}
            <div className="md:hidden space-y-3">
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-muted bg-surface rounded-2xl border border-[rgba(255,255,255,0.05)]">
                  {searchQuery || statusFilter !== "all" ? "No matching restaurants." : "No restaurants found."}
                </div>
              ) : (
                filtered.map((restaurant) => (
                  <div key={restaurant.id} className="bg-surface border border-[rgba(255,255,255,0.05)] rounded-2xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-sm">
                          {restaurant.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm">{restaurant.name}</h3>
                          <p className="text-xs text-muted font-mono">/{restaurant.slug}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border
                        ${restaurant.approval_status === "approved" ? "bg-green-500/10 text-green-500 border-green-500/20" : ""}
                        ${restaurant.approval_status === "pending" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" : ""}
                        ${restaurant.approval_status === "rejected" ? "bg-red-500/10 text-red-500 border-red-500/20" : ""}
                      `}>
                        {restaurant.approval_status === "approved" && <CheckCircle2 size={10} />}
                        {restaurant.approval_status === "pending" && <Clock size={10} />}
                        {restaurant.approval_status === "rejected" && <XCircle size={10} />}
                        <span className="capitalize">{restaurant.approval_status}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[10px] text-muted">
                      <div className="flex items-center gap-1">
                        <Mail size={10} />
                        <span className="truncate">{restaurant.owner_email || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package size={10} />
                        <span>{restaurant.total_items ?? 0} items</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={10} />
                        <span>{new Date(restaurant.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openPreview(restaurant.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.08)] rounded-xl text-xs font-semibold text-muted hover:text-white transition-colors border border-[rgba(255,255,255,0.05)]"
                      >
                        <Eye size={14} /> Preview
                      </button>
                      {restaurant.approval_status === "pending" && (
                        <>
                          <button 
                            onClick={() => handleAction(restaurant.id, "approve")}
                            className="flex-1 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-xl text-xs font-bold transition-colors border border-green-500/20"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleAction(restaurant.id, "reject")}
                            className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-xs font-bold transition-colors border border-red-500/20"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {confirmDeleteId === restaurant.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDelete(restaurant.id)}
                            disabled={deleting}
                            className="px-3 py-2 bg-red-600 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                          >
                            {deleting ? "..." : "Yes, Delete"}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-3 py-2 bg-[rgba(255,255,255,0.05)] rounded-xl text-xs font-semibold text-muted"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(restaurant.id)}
                          className="py-2 px-3 bg-[rgba(255,255,255,0.03)] hover:bg-red-500/10 rounded-xl text-muted hover:text-red-500 transition-colors border border-[rgba(255,255,255,0.05)]"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      </main>

      {/* Loading Overlay */}
      {previewLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-brand">
            <div className="w-12 h-12 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
            <span className="font-bold tracking-widest text-sm uppercase">Securely Fetching Data...</span>
          </div>
        </div>
      )}

      {/* Enhanced Preview Modal — full screen on mobile */}
      {previewData && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="w-full md:max-w-3xl bg-surface border-l border-[rgba(255,255,255,0.05)] h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right-8 duration-300">
            <header className="sticky top-0 bg-surface/80 backdrop-blur-xl border-b border-[rgba(255,255,255,0.05)] p-4 md:p-6 flex items-start justify-between z-10">
              <div className="flex items-center gap-3 md:gap-4 min-w-0">
                <button 
                  onClick={() => setPreviewData(null)}
                  className="p-2 hover:bg-[rgba(255,255,255,0.05)] rounded-full transition-colors text-muted hover:text-white flex-shrink-0"
                >
                  <ChevronLeft size={24} />
                </button>
                <div className="min-w-0">
                  <h2 className="text-xl md:text-2xl font-bold truncate">{previewData.restaurant.name}</h2>
                  <div className="flex items-center gap-3 text-sm text-muted mt-1 flex-wrap">
                    <span className="font-mono">/{previewData.restaurant.slug}</span>
                    <span className="w-1 h-1 rounded-full bg-[rgba(255,255,255,0.2)] hidden sm:block" />
                    <span className="capitalize hidden sm:inline">{previewData.restaurant.approval_status}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 flex-shrink-0">
                {previewData.restaurant.approval_status === "pending" && (
                  <>
                    <button 
                      onClick={() => handleAction(previewData.restaurant.id, "reject")}
                      className="px-3 md:px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-xs md:text-sm font-semibold transition-colors border border-red-500/20"
                    >
                      <span className="hidden sm:inline">Reject Application</span>
                      <span className="sm:hidden">Reject</span>
                    </button>
                    <button 
                      onClick={() => handleAction(previewData.restaurant.id, "approve")}
                      className="px-3 md:px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs md:text-sm font-semibold transition-colors shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                    >
                      <span className="hidden sm:inline">Approve Application</span>
                      <span className="sm:hidden">Approve</span>
                    </button>
                  </>
                )}
                {confirmDeleteId === previewData.restaurant.id ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDelete(previewData.restaurant.id)}
                      disabled={deleting}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      {deleting ? "Deleting..." : "Confirm Delete"}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-3 py-2 bg-[rgba(255,255,255,0.05)] rounded-xl text-xs font-semibold text-muted hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(previewData.restaurant.id)}
                    className="px-3 md:px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-xs md:text-sm font-semibold transition-colors border border-red-500/20 flex items-center gap-1.5"
                  >
                    <Trash2 size={14} />
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                )}
              </div>
            </header>

            <div className="p-4 md:p-8 space-y-8 md:space-y-10">
              {/* Restaurant Details Section */}
              <section className="bg-background rounded-2xl p-4 md:p-6 border border-[rgba(255,255,255,0.02)]">
                <h3 className="text-sm font-bold tracking-widest uppercase text-muted mb-5 md:mb-6 flex items-center gap-2">
                  <MapPin size={16} /> Contact & Configuration
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6 md:gap-x-8">
                  <div>
                    <span className="text-xs text-muted block mb-1">Owner Name</span>
                    <p className="text-sm font-semibold">{previewData.restaurant.owner_name || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted block mb-1">Owner Email</span>
                    <p className="text-sm font-semibold flex items-center gap-1.5">
                      <Mail size={12} className="text-muted" />
                      {previewData.restaurant.owner_email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted block mb-1">Owner Phone</span>
                    <p className="text-sm">{previewData.restaurant.owner_phone || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted block mb-1">Restaurant Phone</span>
                    <p className="text-sm">{previewData.restaurant.phone || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted block mb-1">Description</span>
                    <p className="text-sm">{previewData.restaurant.description || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted block mb-1">Plan Type</span>
                    <p className="text-sm font-semibold uppercase">{previewData.restaurant.plan_type}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted block mb-1">Theme Color</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-5 h-5 rounded-full border border-[rgba(255,255,255,0.2)]" style={{ backgroundColor: previewData.restaurant.theme_color }} />
                      <span className="text-sm font-mono">{previewData.restaurant.theme_color}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted block mb-1">Total Menu Items</span>
                    <p className="text-sm font-bold">{previewData.restaurant.total_items ?? 0}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted block mb-1">Created</span>
                    <p className="text-sm text-muted">{new Date(previewData.restaurant.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </section>

              {/* Menu Items Section */}
              <section>
                <h3 className="text-sm font-bold tracking-widest uppercase text-muted mb-5 md:mb-6 flex items-center gap-2">
                  <ChefHat size={16} /> Extracted Menu Content
                </h3>
                
                {previewData.categories.length === 0 ? (
                  <div className="text-center p-10 bg-background border border-dashed border-[rgba(255,255,255,0.1)] rounded-2xl text-muted">
                    No menu items have been added by the owner yet.
                  </div>
                ) : (
                  <div className="space-y-6 md:space-y-8">
                    {previewData.categories.map(category => (
                      <div key={category.id} className="space-y-3 md:space-y-4">
                        <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.05)] pb-2">
                          <h4 className="text-lg font-semibold">{category.name}</h4>
                          <span className="text-xs text-muted px-2 py-1 bg-[rgba(255,255,255,0.03)] rounded-lg">
                            {category.items.length} items
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                          {category.items.map(item => (
                            <div key={item.id} className="bg-background rounded-xl p-3 md:p-4 border border-[rgba(255,255,255,0.02)] flex gap-3 md:gap-4">
                              {item.media_url ? (
                                <img src={item.media_url} alt={item.name} className="w-14 h-14 md:w-16 md:h-16 rounded-lg object-cover flex-shrink-0" />
                              ) : (
                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-lg bg-surface flex items-center justify-center border border-[rgba(255,255,255,0.05)] flex-shrink-0">
                                  <ChefHat size={20} className="text-muted/50" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                  <h5 className="font-semibold text-sm truncate">{item.name}</h5>
                                  <span className="font-bold text-sm text-brand flex-shrink-0">₹{item.price}</span>
                                </div>
                                <p className="text-xs text-muted line-clamp-2 mt-1">{item.description}</p>
                                <div className="mt-2 flex items-center gap-2">
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[rgba(255,255,255,0.05)] text-muted">
                                    {item.is_veg ? "🟢 Veg" : "🔴 Non-Veg"}
                                  </span>
                                  {item.rating_count > 0 && (
                                    <span className="text-[10px] text-muted">★ {item.rating_score.toFixed(1)} ({item.rating_count})</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {category.items.length === 0 && (
                          <p className="text-sm text-muted italic p-4 bg-[rgba(255,255,255,0.02)] rounded-xl border border-dashed border-[rgba(255,255,255,0.05)]">Empty category</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
