"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, LogOut, Coffee } from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("menuqr_token");
    const storedUser = localStorage.getItem("menuqr_user");
    if (!token || !storedUser) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("menuqr_token");
    localStorage.removeItem("menuqr_user");
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-semibold text-muted">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-[260px] p-6 flex flex-col bg-surface border-r border-border">
        <div className="flex items-center gap-3 text-xl font-extrabold mb-12 text-foreground">
          <Coffee size={24} className="text-primary" />
          <span>MenuQR</span>
        </div>

        <nav className="flex flex-col flex-1">
          <div className="flex flex-col gap-2">
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                pathname === "/dashboard"
                  ? "bg-primary-light text-primary"
                  : "text-muted hover:bg-surface-alt"
              }`}
            >
              <LayoutDashboard size={20} />
              <span>Overview</span>
            </Link>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium mt-auto cursor-pointer border-none bg-transparent w-full text-left text-error hover:bg-error-light transition-all"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">{children}</main>
    </div>
  );
}
