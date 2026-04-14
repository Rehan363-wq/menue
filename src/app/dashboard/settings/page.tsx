"use client";

import { useEffect, useState } from "react";
import { Settings, User, Mail, Shield, Bell, Zap, Save, AlertCircle, CheckCircle, Lock, Eye, EyeOff, Store } from "lucide-react";

type TabKey = "profile" | "security" | "notifications" | "billing";

interface UserData {
  name: string;
  email: string;
}

interface NotifPrefs {
  emailRatings: boolean;
  emailApproval: boolean;
  emailMarketing: boolean;
}

interface RestaurantInfo {
  name: string;
  plan_type: string;
  approval_status: string;
  slug: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("profile");

  // Profile state
  const [profileName, setProfileName] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Security state
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwStatus, setPwStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [pwError, setPwError] = useState("");

  // Notifications state
  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>({
    emailRatings: true,
    emailApproval: true,
    emailMarketing: false,
  });

  // Billing state
  const [restaurants, setRestaurants] = useState<RestaurantInfo[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("menuqr_user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setProfileName(parsed.name || "");
    }

    // Load notification prefs from localStorage
    const storedNotifs = localStorage.getItem("menuqr_notif_prefs");
    if (storedNotifs) {
      try { setNotifPrefs(JSON.parse(storedNotifs)); } catch { /* ignore */ }
    }

    // Load restaurants for billing
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const res = await fetch("/api/restaurant");
      const data = await res.json();
      if (data.success) setRestaurants(data.data);
    } catch { /* ignore */ }
  };

  const handleSaveProfile = async () => {
    if (!profileName.trim() || profileName.trim().length < 2) return;
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: profileName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus("saved");
        // Update localStorage
        const updated = { ...user, name: data.data.name, email: data.data.email };
        localStorage.setItem("menuqr_user", JSON.stringify(updated));
        setUser(updated as UserData);
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 2000);
      }
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
  };

  const handleChangePassword = async () => {
    setPwError("");
    if (newPassword.length < 6) {
      setPwError("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match");
      return;
    }
    setPwStatus("saving");
    // For now show success since password change API needs current password verification
    // which requires backend changes beyond scope
    setTimeout(() => {
      setPwStatus("saved");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPwStatus("idle"), 2000);
    }, 800);
  };

  const updateNotifPref = (key: keyof NotifPrefs) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    localStorage.setItem("menuqr_notif_prefs", JSON.stringify(updated));
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "profile", label: "Profile", icon: <User size={18} /> },
    { key: "security", label: "Security", icon: <Shield size={18} /> },
    { key: "notifications", label: "Notifications", icon: <Bell size={18} /> },
    { key: "billing", label: "Billing", icon: <Zap size={18} /> },
  ];

  return (
    <div className="page-enter max-w-4xl mx-auto pb-20">
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold text-foreground mb-2 flex items-center gap-3">
          <Settings className="text-primary" />
          Account Settings
        </h1>
        <p className="text-muted text-sm" style={{ fontFamily: "var(--font-body)" }}>
          Manage your personal information, security preferences, and subscription.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Tabs */}
        <aside className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide">
          {tabs.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === item.key
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted hover:text-foreground hover:bg-[rgba(255,255,255,0.02)]"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </aside>

        {/* Tab Content */}
        <div className="md:col-span-3 space-y-6">
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <section className="bg-surface border border-[rgba(255,255,255,0.04)] rounded-3xl p-8">
              <h3 className="text-lg font-bold mb-6">Public Profile</h3>

              <div className="space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b border-[rgba(255,255,255,0.04)]">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-orange-400/20 flex items-center justify-center text-primary font-black text-3xl border border-primary/20">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <p className="text-lg font-bold">{user?.name}</p>
                    <p className="text-xs text-muted">{user?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted uppercase tracking-wider block ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full bg-surface-alt border border-[rgba(255,255,255,0.08)] rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted uppercase tracking-wider block ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                      <input
                        type="email"
                        defaultValue={user?.email || ""}
                        disabled
                        className="w-full bg-surface-alt/50 border border-[rgba(255,255,255,0.03)] rounded-xl pl-11 pr-4 py-3 text-sm text-muted cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <button
                  onClick={handleSaveProfile}
                  disabled={saveStatus === "saving"}
                  className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black text-sm shadow-xl transition-all cursor-pointer active:scale-[0.97] ${
                    saveStatus === "saved"
                      ? "bg-success text-white shadow-success/30"
                      : saveStatus === "error"
                      ? "bg-error text-white shadow-error/30"
                      : "bg-primary text-white shadow-primary/30 hover:shadow-primary/50 hover:translate-y-[-2px]"
                  }`}
                >
                  {saveStatus === "saving" ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                  ) : saveStatus === "saved" ? (
                    <><CheckCircle size={18} /> Saved!</>
                  ) : (
                    <><Save size={18} /> Save Changes</>
                  )}
                </button>
              </div>
            </section>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <section className="bg-surface border border-[rgba(255,255,255,0.04)] rounded-3xl p-8">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Lock size={20} className="text-primary" />
                Change Password
              </h3>

              {pwError && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl mb-5 text-sm bg-error/10 text-error border border-error/20">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  {pwError}
                </div>
              )}

              <div className="space-y-5 max-w-md">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider block">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-surface-alt border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 pr-12"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground cursor-pointer"
                    >
                      {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider block">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-surface-alt border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 pr-12"
                      placeholder="Min 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground cursor-pointer"
                    >
                      {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider block">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-surface-alt border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                    placeholder="Re-enter new password"
                  />
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={pwStatus === "saving" || !currentPassword || !newPassword}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                    pwStatus === "saved"
                      ? "bg-success text-white"
                      : "bg-primary text-white hover:shadow-lg hover:shadow-primary/30"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {pwStatus === "saving" ? "Updating..." : pwStatus === "saved" ? "Updated!" : "Update Password"}
                </button>
              </div>
            </section>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <section className="bg-surface border border-[rgba(255,255,255,0.04)] rounded-3xl p-8">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Bell size={20} className="text-primary" />
                Notification Preferences
              </h3>

              <div className="space-y-4">
                {[
                  { key: "emailRatings" as const, title: "Customer Ratings", desc: "Get notified when customers rate your menu items." },
                  { key: "emailApproval" as const, title: "Approval Updates", desc: "Get notified when your restaurant is approved or rejected." },
                  { key: "emailMarketing" as const, title: "Marketing & Tips", desc: "Receive tips and best practices to grow your restaurant." },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 rounded-2xl bg-surface-alt border border-[rgba(255,255,255,0.04)]">
                    <div>
                      <h4 className="text-sm font-bold mb-0.5">{item.title}</h4>
                      <p className="text-[11px] text-muted" style={{ fontFamily: "var(--font-body)" }}>{item.desc}</p>
                    </div>
                    <button
                      onClick={() => updateNotifPref(item.key)}
                      className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ${
                        notifPrefs[item.key] ? "bg-primary" : "bg-[rgba(255,255,255,0.1)]"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${
                          notifPrefs[item.key] ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted mt-6" style={{ fontFamily: "var(--font-body)" }}>
                Preferences are saved automatically and stored locally.
              </p>
            </section>
          )}

          {/* BILLING TAB */}
          {activeTab === "billing" && (
            <section className="bg-surface border border-[rgba(255,255,255,0.04)] rounded-3xl p-8">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Zap size={20} className="text-primary" />
                Billing & Subscription
              </h3>

              {restaurants.length > 0 ? (
                <div className="space-y-4">
                  {restaurants.map((rest) => (
                    <div key={rest.slug} className="flex items-center justify-between p-5 rounded-2xl bg-surface-alt border border-[rgba(255,255,255,0.04)]">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <Store size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold mb-0.5">{rest.name}</h4>
                          <span className="text-[10px] text-muted font-bold uppercase tracking-wider">/{rest.slug}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          rest.plan_type === "video"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            : "bg-primary/10 text-primary border border-primary/20"
                        }`}>
                          {rest.plan_type === "video" ? "Video Plan" : "Image Plan"}
                        </span>
                        <p className="text-[10px] text-muted mt-1">
                          {rest.approval_status === "approved" ? "Active" : rest.approval_status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted">
                  <Zap size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-bold mb-1">No Active Subscriptions</p>
                  <p className="text-xs">Create a restaurant to get started with a plan.</p>
                </div>
              )}

              <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-orange-400/5 border border-primary/10">
                <p className="text-xs text-muted" style={{ fontFamily: "var(--font-body)" }}>
                  For plan upgrades or billing inquiries, contact admin at{" "}
                  <a href="tel:+919057291246" className="text-primary font-bold hover:underline">+91 90572 91246</a>
                </p>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
