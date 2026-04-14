"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coffee } from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();

  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/menu/") ||
    pathname === "/login" ||
    pathname === "/register"
  )
    return null;

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex items-center justify-between px-6 py-4 glass-surface sticky top-0 z-50"
    >
      <Link href="/" className="flex items-center gap-2.5 text-xl font-extrabold text-foreground">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shadow-md glow-sm">
          <Coffee size={18} className="text-white" />
        </div>
        <span className="gradient-text">MenuQR</span>
      </Link>
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="px-4 py-2 rounded-lg text-sm font-semibold text-muted hover:text-foreground border border-transparent hover:border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-200 active:scale-[0.97]"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary to-orange-400 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.03] transition-all duration-200 active:scale-[0.97]"
        >
          Get Started
        </Link>
      </div>
    </motion.nav>
  );
}
