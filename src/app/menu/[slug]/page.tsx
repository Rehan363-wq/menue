"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import type { Restaurant, CategoryWithItems } from "@/lib/types";

function PublicMenuContent() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    restaurant: Restaurant;
    categories: CategoryWithItems[];
  } | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/public/menu/${slug}`);
        const result = await res.json();
        if (result.success) {
          setData(result.data);
          if (result.data.categories.length > 0)
            setActiveCategory(result.data.categories[0].id);
          if (!isPreview)
            fetch(`/api/public/qr-scan/${result.data.restaurant.id}`, {
              method: "POST",
            }).catch(() => {});
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, isPreview]);

  const scrollToCategory = (id: string) => {
    setActiveCategory(id);
    document.getElementById(`cat-${id}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-16 h-16 bg-orange-50 rounded-full mb-4 animate-pulse" />
        <p className="text-slate-400 font-medium">Loading Delicious Menu...</p>
      </div>
    );

  if (!data)
    return (
      <div className="p-10 text-center text-muted">Menu not found</div>
    );

  const { restaurant, categories } = data;

  return (
    <div
      className="bg-[#fdfdfd] min-h-screen text-slate-800 pb-10"
      style={{
        // @ts-expect-error css custom property
        "--theme-primary": restaurant.theme_color || "#FF6B35",
        fontFamily: restaurant.font_family || "Inter",
      }}
    >
      {/* Hero Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-[280px] bg-cover bg-center flex items-end p-6"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.8)), url('${
            restaurant.bg_image_url || ""
          }')`,
        }}
      >
        <div className="text-white w-full">
          {restaurant.logo_url && (
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={restaurant.logo_url}
              alt="logo"
              className="w-16 h-[60px] rounded-xl mb-4 object-cover border-2 border-white shadow-lg"
            />
          )}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[32px] font-extrabold leading-[1.1] mb-1"
          >
            {restaurant.name}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm opacity-90 font-medium mb-3"
          >
            {restaurant.description}
          </motion.p>
          <div className="flex gap-3 text-[11px] font-semibold uppercase tracking-wide opacity-70">
            {restaurant.address && (
              <span className="flex items-center gap-1">
                <MapPin size={12} /> {restaurant.address}
              </span>
            )}
          </div>
        </div>
      </motion.header>

      {/* Category Nav */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-xl z-50 border-b border-black/5">
        <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              className={`px-[18px] py-2 rounded-full text-[13px] font-bold border-none whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? "text-white shadow-md"
                  : "bg-transparent text-slate-500"
              }`}
              style={
                activeCategory === cat.id
                  ? { background: "var(--theme-primary)" }
                  : {}
              }
            >
              {cat.name}
            </button>
          ))}
        </div>
      </nav>

      {/* Menu Body */}
      <main className="px-4 pt-6 max-w-[600px] mx-auto">
        {categories.map((cat) => (
          <section
            key={cat.id}
            id={`cat-${cat.id}`}
            className="mb-10 scroll-mt-20"
          >
            <h2
              className="text-[22px] font-extrabold mb-5 border-l-4 pl-3"
              style={{ borderColor: "var(--theme-primary)" }}
            >
              {cat.name}
            </h2>
            <div className="space-y-4">
              {cat.items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl overflow-hidden flex shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-black/[0.02]"
                >
                  {item.media_url && (
                    <div className="w-[100px] min-h-[100px] flex-shrink-0 bg-slate-100">
                      {item.media_type === "video" ? (
                        <video
                          src={item.media_url}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={item.media_url}
                          alt={item.name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  )}
                  <div className="flex-1 p-3.5 relative">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-3.5 h-3.5 border-[1.5px] rounded-sm inline-flex items-center justify-center ${
                            item.is_veg
                              ? "border-green-600"
                              : "border-red-600"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.is_veg ? "bg-green-600" : "bg-red-600"
                            }`}
                          />
                        </span>
                        <h3 className="text-base font-bold">{item.name}</h3>
                      </div>
                      <div
                        className="text-base font-extrabold"
                        style={{ color: "var(--theme-primary)" }}
                      >
                        ₹{item.price}
                      </div>
                    </div>
                    {item.description && (
                      <p className="text-[13px] text-slate-500 leading-snug mt-1">
                        {item.description}
                      </p>
                    )}
                    {item.is_featured === 1 && (
                      <span className="absolute right-0 bottom-0 bg-orange-50 text-orange-500 text-[10px] font-bold px-2.5 py-0.5 rounded-tl-lg uppercase">
                        Specialty
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}

export default function PublicMenu() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-slate-400 font-medium">Loading...</p>
        </div>
      }
    >
      <PublicMenuContent />
    </Suspense>
  );
}
