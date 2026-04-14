"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, LogOut, Coffee, Menu, BarChart3, Users, Settings, X } from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check auth via httpOnly cookie (server-side verification)
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.data.user);
        } else {
          router.push("/login");
        }
      })
      .catch(() => router.push("/login"));
  }, [router]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch { /* ignore */ }
    localStorage.removeItem("menuqr_user");
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm font-semibold text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/dashboard", icon: <LayoutDashboard size={18} />, label: "Overview", active: pathname === "/dashboard" },
    { href: "/dashboard/menus", icon: <Menu size={18} />, label: "Menus", active: pathname.startsWith("/dashboard/menus") },
    { href: "/dashboard/analytics", icon: <BarChart3 size={18} />, label: "Analytics", active: pathname.startsWith("/dashboard/analytics") },
    { href: "/dashboard/customers", icon: <Users size={18} />, label: "Customers", active: pathname.startsWith("/dashboard/customers") },
    { href: "/dashboard/settings", icon: <Settings size={18} />, label: "Settings", active: pathname.startsWith("/dashboard/settings") },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar — hidden on mobile */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-50 w-[260px] p-5 flex-col bg-surface border-r border-[rgba(255,255,255,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center glow-sm">
              <Coffee size={18} className="text-white" />
            </div>
            <div>
              <span className="text-lg font-extrabold text-foreground block leading-tight">MenuQR</span>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Restaurant Engine</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-[rgba(255,255,255,0.04)] my-2" />

        <nav className="flex flex-col flex-1 overflow-y-auto">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  item.active
                    ? "bg-primary/10 text-primary border-l-2 border-primary"
                    : "text-muted hover:text-foreground hover:bg-[rgba(255,255,255,0.04)]"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mt-auto cursor-pointer border-none bg-transparent w-full text-left text-error/70 hover:bg-error/10 hover:text-error transition-all duration-200"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </nav>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-xl border-t border-[rgba(255,255,255,0.06)] safe-area-pb">
        <div className="flex items-center justify-around px-2 py-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl text-[10px] font-bold transition-all duration-200 min-w-[56px] ${
                item.active
                  ? "text-primary"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-all ${item.active ? "bg-primary/15 scale-110" : ""}`}>
                {item.icon}
              </div>
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl text-[10px] font-bold text-muted hover:text-error transition-all duration-200 min-w-[56px] cursor-pointer bg-transparent border-none"
          >
            <div className="p-1.5 rounded-lg">
              <LogOut size={18} />
            </div>
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content — offset for sidebar on desktop, bottom padding on mobile */}
      <main className="flex-1 md:ml-[260px] p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto">{children}</main>
    </div>
  );
}
