"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coffee } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/menu/"))
    return null;

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2 text-xl font-extrabold text-foreground">
        <Coffee size={22} className="text-primary" /> MenuQR
      </Link>
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="px-4 py-2 rounded-lg text-sm font-semibold text-foreground border border-border hover:bg-surface-alt transition"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary-hover transition"
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}
