"use client";

import Link from "next/link";
import {
  ArrowRight,
  QrCode,
  Palette,
  BarChart3,
  ShieldCheck,
  Coffee,
} from "lucide-react";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-5 pb-16 pt-12">
        <span className="inline-block text-sm font-bold px-4 py-1.5 rounded-full mb-6 bg-primary-light text-primary">
          Verified Partners Program
        </span>

        <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.1] mb-6 text-foreground">
          Digitize Your Menu <br />
          <span className="text-primary">Increase Your Revenue</span>
        </h1>
        <p className="text-lg max-w-[600px] mx-auto mb-10 text-muted">
          Join our exclusive network of premium restaurants. Get a high-fidelity
          digital menu with dynamic animations and zero commissions.
        </p>

        <div className="flex gap-4 mb-16 flex-wrap justify-center">
          <Link
            href="/register"
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-[15px] bg-primary text-white hover:bg-primary-hover transition-all"
          >
            Request Early Access <ArrowRight size={18} />
          </Link>
          <a
            href="#features"
            className="px-7 py-3.5 rounded-xl font-semibold text-[15px] border border-border text-foreground hover:bg-surface-alt transition-all"
          >
            Explore Features
          </a>
        </div>

        {/* Phone mockup */}
        <div className="relative w-[280px] h-[520px] mx-auto">
          <div className="w-full h-full rounded-[36px] overflow-hidden border-4 border-slate-700 bg-gradient-to-b from-primary/10 to-primary/[0.03]">
            <div className="w-[80px] h-[5px] rounded-full mx-auto mt-3 bg-muted-light" />
            <div className="flex flex-col items-center mt-16 px-6">
              <Coffee size={40} className="text-primary" />
              <p className="text-lg font-bold mt-4 text-foreground">
                Your Menu
              </p>
              <p className="text-sm mt-1 text-muted-light">
                Scan QR to view
              </p>
              <div className="space-y-3 mt-8 w-full">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-14 rounded-xl ${
                      i === 1
                        ? "bg-primary/10 border border-primary/30"
                        : "bg-surface-alt"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-5 bg-surface">
        <h2 className="text-3xl font-extrabold text-center mb-4 text-foreground">
          Why MenuQR?
        </h2>
        <p className="text-center max-w-[500px] mx-auto mb-14 text-muted">
          Everything you need to run a professional digital menu.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1100px] mx-auto">
          {[
            {
              icon: <QrCode size={28} />,
              title: "Instant QR Code",
              desc: "Generate a branded QR code for your table tents in seconds.",
            },
            {
              icon: <Palette size={28} />,
              title: "Custom Design",
              desc: "Match your restaurant's brand with theme colors and fonts.",
            },
            {
              icon: <BarChart3 size={28} />,
              title: "Analytics",
              desc: "Track scans and views to understand guest behavior.",
            },
            {
              icon: <ShieldCheck size={28} />,
              title: "Admin Verified",
              desc: "Every restaurant is manually verified for quality assurance.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-background border border-border hover:-translate-y-1 transition-all"
            >
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-primary-light text-primary">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-light border-t border-border">
        © {new Date().getFullYear()} MenuQR. All rights reserved.
      </footer>
    </div>
  );
}
