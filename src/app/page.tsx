"use client";

import Link from "next/link";
import {
  ArrowRight,
  QrCode,
  Palette,
  BarChart3,
  ShieldCheck,
  Coffee,
  Smartphone,
} from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

const features = [
  {
    icon: <QrCode size={28} />,
    title: "Instant QR Code",
    desc: "Generate a branded QR code for your table tents in seconds.",
    num: "01",
  },
  {
    icon: <Palette size={28} />,
    title: "Custom Design",
    desc: "Match your restaurant's brand with theme colors and fonts.",
    num: "02",
  },
  {
    icon: <BarChart3 size={28} />,
    title: "Analytics",
    desc: "Track scans and views to understand guest behavior.",
    num: "03",
  },
  {
    icon: <ShieldCheck size={28} />,
    title: "Admin Verified",
    desc: "Every restaurant is manually verified for quality assurance.",
    num: "04",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } },
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center justify-center text-center px-4 md:px-5 pb-12 md:pb-20 pt-20 md:pt-32 min-h-[calc(100vh-76px)] relative overflow-hidden"
      >
        {/* Background ambient glows */}
        <div className="absolute w-[700px] h-[700px] rounded-full bg-primary/8 blur-[120px] -top-60 -right-60 pointer-events-none" />
        <div className="absolute w-[500px] h-[500px] rounded-full bg-orange-500/5 blur-[100px] -bottom-40 -left-40 pointer-events-none" />
        <div className="absolute w-[300px] h-[300px] rounded-full bg-purple-500/5 blur-[80px] top-1/3 left-1/4 pointer-events-none" />

        <motion.div variants={itemVariants} className="relative z-10">
          <span className="inline-flex items-center text-sm font-bold px-4 py-1.5 rounded-full mb-6 bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(255,107,53,0.1)]">
            <span className="w-2 h-2 rounded-full bg-primary pulse-ring mr-2" />
            Verified Partners Program
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-[32px] sm:text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight mb-6 text-foreground relative z-10"
        >
          Digitize Your Menu <br />
          <span className="gradient-text inline-block mt-2">Increase Your Revenue</span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-lg max-w-[600px] mx-auto mb-10 text-muted relative z-10"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Join our exclusive network of premium restaurants. Get a high-fidelity
          digital menu with dynamic animations and zero commissions.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex gap-4 mb-16 flex-wrap justify-center relative z-10"
        >
          <Link
            href="/register"
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-[15px] bg-gradient-to-r from-primary to-orange-400 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.03] transition-all duration-200 active:scale-[0.97]"
          >
            Request Early Access <ArrowRight size={18} />
          </Link>
          <a
            href="#features"
            className="group flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-[15px] border border-[rgba(255,255,255,0.08)] text-foreground hover:bg-[rgba(255,255,255,0.04)] hover:border-primary/20 transition-all duration-200 active:scale-[0.97]"
          >
            Explore Features
            <ArrowRight
              size={16}
              className="text-muted group-hover:translate-x-1 group-hover:text-primary transition-all duration-200"
            />
          </a>
        </motion.div>

        {/* Phone mockup */}
        <motion.div
          variants={itemVariants}
          className="relative w-[280px] h-[520px] mx-auto animate-float z-10"
        >
          <div className="w-full h-full rounded-[36px] overflow-hidden border-2 border-[rgba(255,255,255,0.08)] bg-surface shadow-[0_30px_80px_rgba(255,107,53,0.12)] relative">
            {/* Screen reflection */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-[32px] pointer-events-none z-10" />
            <div className="w-[80px] h-[5px] rounded-full mx-auto mt-3 bg-[rgba(255,255,255,0.1)]" />
            <div className="flex flex-col items-center mt-16 px-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center glow-sm">
                <Coffee size={28} className="text-white" />
              </div>
              <p className="text-lg font-bold mt-4 text-foreground">
                Your Menu
              </p>
              <p className="text-sm mt-1 text-muted">
                Scan QR to view
              </p>
              <div className="space-y-3 mt-8 w-full">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-14 rounded-xl animate-pulse ${
                      i === 1
                        ? "bg-primary/10 border border-primary/20"
                        : "bg-surface-alt"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Floating icons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-20 right-[15%] z-0"
        >
          <div className="w-12 h-12 rounded-xl bg-surface-alt/80 backdrop-blur-sm flex items-center justify-center border border-[rgba(255,255,255,0.06)] animate-float" style={{ animationDelay: "1s" }}>
            <Smartphone size={20} className="text-primary" />
          </div>
        </motion.div>
      </motion.section>

      {/* Features */}
      <section id="features" className="py-20 px-5 bg-surface">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4 text-foreground">
            Why MenuQR?
          </h2>
          <p className="max-w-[500px] mx-auto text-muted" style={{ fontFamily: "var(--font-body)" }}>
            Everything you need to run a professional digital menu.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1100px] mx-auto"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="group relative p-6 rounded-2xl bg-surface-alt border border-[rgba(255,255,255,0.04)] hover:border-primary/15 hover:shadow-[0_8px_40px_rgba(255,107,53,0.08)] transition-all duration-300"
            >
              {/* Number badge */}
              <span className="absolute top-4 right-4 text-[40px] font-black text-[rgba(255,255,255,0.03)] leading-none select-none">
                {f.num}
              </span>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-primary/10 text-primary group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted" style={{ fontFamily: "var(--font-body)" }}>{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-orange-500/5" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-[600px] mx-auto text-center"
        >
          <h2 className="text-3xl font-extrabold mb-4 text-foreground">
            Ready to go <span className="gradient-text">digital</span>?
          </h2>
          <p className="text-muted mb-8" style={{ fontFamily: "var(--font-body)" }}>
            Start creating your interactive menu today. It takes less than 2 minutes.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-[15px] bg-gradient-to-r from-primary to-orange-400 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.03] transition-all duration-200 active:scale-[0.97]"
          >
            Get Started Free <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 text-center text-sm text-muted">
        {/* Gradient separator */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center">
            <Coffee size={12} className="text-white" />
          </div>
          <span className="font-bold text-foreground text-xs">MenuQR</span>
        </div>
        © {new Date().getFullYear()} MenuQR. All rights reserved.
      </footer>
    </div>
  );
}
