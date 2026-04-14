"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Star, StarHalf, Menu, X, CheckCircle2 } from "lucide-react";
import type { Restaurant, CategoryWithItems } from "@/lib/types";

function StarRating({
  rating = 0,
  ratingCount = 0,
  itemId,
  slug,
  isPreview,
}: {
  rating?: number;
  ratingCount?: number;
  itemId: string;
  slug: string;
  isPreview: boolean;
}) {
  const [currentRating, setCurrentRating] = useState(rating);
  const [currentCount, setCurrentCount] = useState(ratingCount);
  const [hasRated, setHasRated] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [showThanks, setShowThanks] = useState(false);

  // Check localStorage for previous ratings on this slug
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`menuqr_rated_${slug}`);
      if (stored) {
        const ratedIds: string[] = JSON.parse(stored);
        if (ratedIds.includes(itemId)) {
          setHasRated(true);
        }
      }
    } catch {
      // ignore parse errors
    }
  }, [slug, itemId]);

  const handleRate = async (val: number) => {
    if (hasRated || isPreview) return;
    setHasRated(true);

    // Optimistic update: calculate new average
    const newCount = currentCount + 1;
    const newAvg = currentCount === 0 ? val : (currentRating * currentCount + val) / newCount;
    setCurrentRating(newAvg);
    setCurrentCount(newCount);
    setShowThanks(true);
    setTimeout(() => setShowThanks(false), 3000);

    // Save to localStorage to prevent re-rating
    try {
      const stored = localStorage.getItem(`menuqr_rated_${slug}`);
      const ratedIds: string[] = stored ? JSON.parse(stored) : [];
      ratedIds.push(itemId);
      localStorage.setItem(`menuqr_rated_${slug}`, JSON.stringify(ratedIds));
    } catch {
      // ignore
    }

    try {
      await fetch(`/api/menu/item/${itemId}/rate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: val }),
      });
    } catch {
      // revert if failed
      setHasRated(false);
      setShowThanks(false);
      setCurrentRating(rating);
      setCurrentCount(ratingCount);
      // Remove from localStorage
      try {
        const stored = localStorage.getItem(`menuqr_rated_${slug}`);
        if (stored) {
          const ratedIds: string[] = JSON.parse(stored);
          localStorage.setItem(
            `menuqr_rated_${slug}`,
            JSON.stringify(ratedIds.filter(id => id !== itemId))
          );
        }
      } catch {}
    }
  };

  // Show nothing if unrated and can't rate
  const displayRating = hoverRating > 0 ? hoverRating : currentRating;
  const fullStars = Math.floor(displayRating);
  const hasHalfStar = displayRating > 0 && displayRating % 1 >= 0.25;
  const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0));

  if (showThanks) {
    return (
      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1 text-[11px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded w-fit">
        <CheckCircle2 size={12} /> Thanks for rating!
      </motion.div>
    );
  }

  // If no ratings yet and display is 0, show "No ratings yet" with clickable empty stars
  if (currentRating === 0 && currentCount === 0 && !hasRated) {
    return (
      <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
        <div className="flex items-center gap-0.5 text-orange-400">
          {[1, 2, 3, 4, 5].map(val => (
            <Star
              key={val}
              size={16}
              className={`${hoverRating >= val ? "text-orange-400 fill-current" : "text-slate-200"} ${!isPreview ? "cursor-pointer hover:scale-125 transition-transform" : ""}`}
              fill={hoverRating >= val ? "currentColor" : "none"}
              onMouseEnter={() => !hasRated && !isPreview && setHoverRating(val)}
              onClick={(e) => { e.stopPropagation(); handleRate(val); }}
            />
          ))}
        </div>
        <span className="text-[10px] text-slate-400 ml-1">Be first to rate</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-0.5 text-orange-400" onMouseLeave={() => setHoverRating(0)}>
        {[...Array(fullStars)].map((_, i) => (
          <Star
            key={`f-${i}`} size={16} fill="currentColor"
            className={!hasRated && !isPreview ? "cursor-pointer hover:scale-125 transition-transform drop-shadow-sm" : "drop-shadow-sm"}
            onMouseEnter={() => !hasRated && setHoverRating(i + 1)}
            onClick={(e) => { e.stopPropagation(); handleRate(i + 1); }}
          />
        ))}
        {hasHalfStar && (
          <StarHalf
            size={16} fill="currentColor"
            className={!hasRated && !isPreview ? "cursor-pointer hover:scale-125 transition-transform drop-shadow-sm" : "drop-shadow-sm"}
            onMouseEnter={() => !hasRated && setHoverRating(fullStars + 1)}
            onClick={(e) => { e.stopPropagation(); handleRate(fullStars + 1); }}
          />
        )}
        {[...Array(emptyStars)].map((_, i) => {
          const starVal = fullStars + (hasHalfStar ? 1 : 0) + i + 1;
          return (
            <Star
              key={`e-${i}`} size={16} className={`text-slate-200 ${!hasRated && !isPreview ? "cursor-pointer hover:scale-125 transition-transform" : ""}`}
              onMouseEnter={() => !hasRated && setHoverRating(starVal)}
              onClick={(e) => { e.stopPropagation(); handleRate(starVal); }}
            />
          );
        })}
        <span className="text-[11px] font-bold text-slate-500 ml-1">{currentRating.toFixed(1)}</span>
      </div>
      {currentCount > 0 && (
        <span className="text-[10px] text-slate-400">{currentCount} rating{currentCount !== 1 ? "s" : ""}</span>
      )}
    </div>
  );
}

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
  const [expandedItem, setExpandedItem] = useState<CategoryWithItems["items"][0] | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
        <div className="h-[280px] bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse" />
        <div className="px-4 pt-6 space-y-4 max-w-[600px] mx-auto w-full">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    );

  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="text-5xl mb-4">🍽️</div>
          <p className="text-muted font-medium">Menu not found</p>
        </div>
      </div>
    );

  const { restaurant, categories } = data;
  const hasBgImage = !!restaurant.bg_image_url;

  return (
    <div 
      className="min-h-screen bg-slate-100 flex justify-center w-full bg-cover bg-center bg-fixed relative"
      style={{
        backgroundImage: hasBgImage ? `url(${restaurant.bg_image_url})` : undefined,
      }}
    >
      {/* Background blurred overlay */}
      {hasBgImage && <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />}

      <div
      className="bg-[#fdfdfd]/95 min-h-screen w-full max-w-[480px] text-slate-800 pb-4 shadow-2xl relative overflow-hidden"
      style={{
        // @ts-expect-error css custom property
        "--theme-primary": restaurant.theme_color || "#FF6B35",
        fontFamily: `'${restaurant.font_family || "Inter"}', system-ui, sans-serif`,
      }}
    >
      {/* Hero Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-[280px] bg-cover bg-center flex items-end relative overflow-hidden"
        style={{
          backgroundImage: hasBgImage
            ? `url(${restaurant.bg_image_url})`
            : "linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div className="text-white w-full p-6 relative z-10">
          {restaurant.logo_url && (
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={restaurant.logo_url}
              alt="logo"
              className="w-16 h-[60px] rounded-xl mb-4 object-cover border-2 border-white/30 shadow-lg"
            />
          )}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[32px] font-extrabold leading-[1.1] mb-1"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.3)" }}
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

      {/* Category Nav Hamburger & Scroll */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-xl z-40 border-b border-black/5 relative flex items-center pr-2 shadow-sm">
        <button 
          onClick={() => setIsSidebarOpen(true)} 
          className="p-3.5 text-slate-700 hover:text-black cursor-pointer active:scale-95 transition-transform border-r border-black/5"
        >
          <Menu size={22} />
        </button>
        {/* Fade edges */}
        <div className="absolute left-14 top-0 bottom-0 w-6 bg-gradient-to-r from-white/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white/80 to-transparent z-10 pointer-events-none" />
        
        <div className="flex-1 flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide scroll-smooth snap-x snap-mandatory">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              className={`px-[18px] py-1.5 rounded-full text-[13px] font-bold border-none whitespace-nowrap transition-all duration-200 cursor-pointer snap-start ${
                activeCategory === cat.id
                  ? "text-white shadow-[0_4px_12px_rgba(255,107,53,0.4)] scale-105"
                  : "bg-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100"
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

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-[100] flex">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
            />
            <motion.div 
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-[280px] bg-white h-full relative z-10 p-6 flex flex-col shadow-2xl"
              style={{ fontFamily: `'${restaurant.font_family || "Inter"}', system-ui, sans-serif` }}
            >
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-extrabold text-slate-800">Menu Options</h2>
                 <button onClick={() => setIsSidebarOpen(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 cursor-pointer">
                   <X size={18} />
                 </button>
               </div>
               <div className="flex flex-col gap-2 overflow-y-auto pb-6">
                 {categories.map(cat => (
                   <button 
                     key={cat.id} 
                     onClick={() => { scrollToCategory(cat.id); setIsSidebarOpen(false); }}
                     className={`text-left px-4 py-3 rounded-xl font-bold transition-all text-sm cursor-pointer active:scale-95 ${activeCategory === cat.id ? "bg-orange-50/50 text-orange-600 shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}
                     style={activeCategory === cat.id ? { color: "var(--theme-primary)", backgroundColor: "var(--theme-primary)", opacity: 0.9 } : {}}
                   >
                     <span style={activeCategory === cat.id ? { filter: "brightness(0) invert(1)" } : {}}>{cat.name}</span>
                   </button>
                 ))}
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
            <div className="space-y-3">
              {cat.items.map((item, i) => (
                <motion.div
                  key={item.id}
                  layoutId={`item-card-${item.id}`}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  whileHover={{ y: -2 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                  onClick={() => setExpandedItem(item)}
                  className="bg-white rounded-2xl overflow-hidden flex shadow-[0_2px_16px_rgba(0,0,0,0.05)] border border-black/[0.03] transition-all duration-200 cursor-pointer min-h-[100px]"
                >
                  {item.media_url && (
                    <div className="w-[120px] min-h-[100px] flex-shrink-0 bg-slate-100">
                      {item.media_type === "video" ? (
                        <video
                          src={item.media_url}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover rounded-l-xl"
                        />
                      ) : (
                        <img
                          src={item.media_url}
                          alt={item.name}
                          loading="lazy"
                          className="w-full h-full object-cover rounded-l-xl"
                        />
                      )}
                    </div>
                  )}
                  <div className="flex-1 p-3.5 relative min-w-0">
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span
                          className={`w-4 h-4 flex-shrink-0 border-[1.5px] rounded-sm inline-flex items-center justify-center ${
                            item.is_veg
                              ? "border-green-600"
                              : "border-red-600"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              item.is_veg ? "bg-green-600" : "bg-red-600"
                            }`}
                          />
                        </span>
                        <h3 className="text-[15px] font-bold truncate">{item.name}</h3>
                      </div>
                      <div
                        className="text-lg font-extrabold flex-shrink-0"
                        style={{ color: "var(--theme-primary)" }}
                      >
                        ₹{item.price}
                      </div>
                    </div>
                    {/* Make sure StarRating clicks don't bubble to the card */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <StarRating
                        rating={item.rating_score}
                        ratingCount={item.rating_count}
                        itemId={item.id}
                        slug={slug}
                        isPreview={isPreview}
                      />
                    </div>
                    {item.description && (
                      <p className="text-[13px] text-slate-500 leading-snug mt-1">
                        {item.description}
                      </p>
                    )}
                    {item.is_featured === 1 && (
                      <span className="absolute right-0 bottom-0 bg-gradient-to-r from-amber-50 to-orange-50 text-orange-500 text-[10px] font-bold px-2.5 py-0.5 rounded-tl-lg uppercase border-t border-l border-orange-200/50">
                        ✨ Specialty
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
              {/* Category divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-2" />
            </div>
          </section>
        ))}
      </main>

      {/* Social Links & Footer */}
      <footer className="text-center py-8 mt-6 border-t border-slate-100 bg-slate-50/50">
        {(restaurant.instagram_url || restaurant.zomato_url || restaurant.swiggy_url) && (
           <div className="mb-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Find us on</p>
              <div className="flex justify-center gap-5">
{restaurant.instagram_url && (
                     <a href={restaurant.instagram_url} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 shadow-md flex items-center justify-center text-white hover:scale-110 transition-transform">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                     </a>
                  )}
                  {restaurant.zomato_url && (
                     <a href={restaurant.zomato_url} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-[#E23744] shadow-md flex items-center justify-center text-white font-extrabold hover:scale-110 transition-transform text-xl italic pt-0.5">
                        Z
                     </a>
                  )}
                  {restaurant.swiggy_url && (
                     <a href={restaurant.swiggy_url} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-[#FC8019] shadow-md flex items-center justify-center text-white hover:scale-110 transition-transform">
                       <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 2.5C13 2.5 12.4 2.5 11.9 2.5C6.1 2.5 1.5 7.1 1.5 12.9C1.5 18.7 6.1 23.3 11.9 23.3C13.2 23.3 14.4 23 15.6 22.5L9.1 16.1C9.4 16.3 9.7 16.3 10 16.3C11.9 16.3 13.5 14.7 13.5 12.8C13.5 12.5 13.5 12.2 13.4 11.9L20.2 5.1C21.4 7.2 22.1 9.7 22.1 12.3C22.1 12.4 22.1 12.4 22.1 12.5C22.5 12.1 22.8 11.6 23.1 11.1C23 10.8 23 10.6 22.9 10.3C21.9 5.8 18.1 2.5 13.5 2.5Z"/></svg>
                    </a>
                 )}
              </div>
           </div>
        )}
        <div className="inline-flex items-center justify-center space-x-1.5 opacity-60">
           <p className="text-[11px] text-slate-500 font-medium">
             Powered by <span className="text-orange-500 font-extrabold">MenuQR</span>
           </p>
        </div>
      </footer>

      {/* Expanded Item Modal via Framer Motion */}
      <AnimatePresence>
        {expandedItem && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-end sm:justify-center pointer-events-none p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExpandedItem(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer pointer-events-auto"
            />
            <motion.div
              layoutId={`item-card-${expandedItem.id}`}
              className="bg-white w-full max-w-[480px] sm:rounded-3xl rounded-t-[28px] overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh] pointer-events-auto"
              style={{ fontFamily: `'${restaurant.font_family || "Inter"}', system-ui, sans-serif` }}
            >
              <button
                onClick={() => setExpandedItem(null)}
                className="absolute top-4 right-4 w-9 h-9 bg-black/40 backdrop-blur text-white rounded-full flex items-center justify-center z-20 cursor-pointer hover:bg-black/60 shadow-lg active:scale-95 transition-transform"
              >
                <X size={20} />
              </button>
              {expandedItem.media_url ? (
                <div className="w-full h-[280px] sm:h-[320px] bg-slate-100 flex-shrink-0 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10 pointer-events-none" />
                  {expandedItem.media_type === "video" ? (
                    <video
                      src={expandedItem.media_url}
                      autoPlay loop muted playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={expandedItem.media_url}
                      alt={expandedItem.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              ) : (
                <div className="h-6 w-full" />
              )}
              <div className="p-6 md:p-8 overflow-y-auto pb-10">
                <div className="flex justify-between items-start mb-3 gap-4">
                  <div className="flex items-start gap-2 flex-1">
                    <span className={`w-[18px] h-[18px] mt-1 border-[1.5px] rounded-sm flex-shrink-0 inline-flex items-center justify-center ${expandedItem.is_veg ? "border-green-600" : "border-red-600"}`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${expandedItem.is_veg ? "bg-green-600" : "bg-red-600"}`} />
                    </span>
                    <h3 className="text-2xl font-extrabold text-slate-800 leading-tight">{expandedItem.name}</h3>
                  </div>
                  <div className="text-2xl font-black flex-shrink-0" style={{ color: "var(--theme-primary)" }}>
                    ₹{expandedItem.price}
                  </div>
                </div>
                <div className="mb-5 bg-slate-50 p-3 rounded-xl border border-slate-100 w-fit">
                  <StarRating
                    rating={expandedItem.rating_score}
                    ratingCount={expandedItem.rating_count}
                    itemId={expandedItem.id}
                    slug={slug}
                    isPreview={isPreview}
                  />
                </div>
                {expandedItem.description ? (
                   <div className="text-[15px] text-slate-600 leading-relaxed font-medium bg-slate-50/50 p-4 rounded-2xl">
                     {expandedItem.description}
                   </div>
                ) : (
                   <p className="text-sm text-slate-400 italic">No description provided.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </div>
  );
}

export default function PublicMenu() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
          <div className="h-[280px] bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse" />
          <div className="px-4 pt-6 space-y-4 max-w-[600px] mx-auto w-full">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        </div>
      }
    >
      <PublicMenuContent />
    </Suspense>
  );
}
