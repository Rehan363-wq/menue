"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, Palette, Image as ImageIcon, Plus,
  Trash2, Save, ExternalLink, Download, Clock, ShieldCheck, XCircle,
  GripVertical, Loader2, Settings, Smartphone, SlidersHorizontal, LayoutGrid,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import type { Restaurant, CategoryWithItems, MenuItem } from "@/lib/types";
import { useToast } from "@/components/Toast";

interface EditorData {
  restaurant: Restaurant;
  categories: CategoryWithItems[];
}

const PRESET_COLORS = ["#FF6B35", "#f43f5e", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"];

export default function MenuEditor() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<EditorData>({
    restaurant: {} as Restaurant,
    categories: [],
  });
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [confirmDeleteCat, setConfirmDeleteCat] = useState<string | null>(null);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState<string | null>(null);
  const [mobilePanel, setMobilePanel] = useState<'builder' | 'settings'>('builder');
  const [itemForm, setItemForm] = useState({
    name: "", price: "", description: "", is_veg: 1,
    media_url: "", media_type: "image",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);



  useEffect(() => { fetchMenuData(); }, [id]);

  const fetchMenuData = async () => {
    try {
      const res = await fetch(`/api/menu/editor/${id}`);
      const result = await res.json();
      if (result.success) {
        setData(result.data);
        if (result.data.categories.length > 0 && !activeTab)
          setActiveTab(result.data.categories[0].id);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/restaurant/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data.restaurant),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      const result = await res.json();
      if (result.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) { 
        console.error(err);
        showToast("Failed to save settings. Please try again.", "error");
    }
    finally { setSaving(false); }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be less than 5MB.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setItemForm({ ...itemForm, media_url: event.target?.result as string, media_type: "image" });
    };
    reader.readAsDataURL(file);
  };

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("Background image must be less than 5MB.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setData({ ...data, restaurant: { ...data.restaurant, bg_image_url: event.target?.result as string }});
    };
    reader.readAsDataURL(file);
  };

  const handleAddCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("catName") as string;
    try {
      const res = await fetch("/api/menu/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurant_id: id, name }),
      });
      const result = await res.json();
      if (result.success) {
        setData({
          ...data,
          categories: [...data.categories, { ...result.data, items: [] }],
        });
        setActiveTab(result.data.id);
        setShowCategoryModal(false);
      }
    } catch (err) { console.error(err); }
  };

  
  const handleDeleteCategory = async (catId: string) => {
    try {
      const res = await fetch(`/api/menu/category/${catId}`, {
        method: "DELETE",
      });
      if ((await res.json()).success) {
        const newCats = data.categories.filter((c) => c.id !== catId);
        setData({ ...data, categories: newCats });
        if (activeTab === catId) setActiveTab(newCats[0]?.id || null);
      }
    } catch (err) { console.error(err); }
    finally { setConfirmDeleteCat(null); }
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingItem ? "PUT" : "POST";
    const url = editingItem
      ? `/api/menu/item/${editingItem.id}`
      : "/api/menu/item";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...itemForm, restaurant_id: id, category_id: activeTab }),
      });
      const result = await res.json();
      if (result.success) {
        fetchMenuData();
        setShowItemModal(false);
        setEditingItem(null);
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteItem = async (itemId: string) => {
    await fetch(`/api/menu/item/${itemId}`, {
      method: "DELETE",
    });
    fetchMenuData();
    setConfirmDeleteItem(null);
  };

  const activeCategory = data.categories.find((c) => c.id === activeTab);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="text-primary animate-spin" />
          <p className="text-lg font-semibold text-muted">Loading Editor...</p>
        </div>
      </div>
    );

  // Gate: if not approved
  if (!data.restaurant.is_approved) {
    return (
      <div className="h-[calc(100vh-80px)] flex items-center justify-center p-5 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[500px] p-12 rounded-2xl text-center bg-surface border border-[rgba(255,255,255,0.06)] shadow-[0_24px_64px_rgba(0,0,0,0.3)]"
        >
          {/* Status Timeline */}
          <div className="flex items-center justify-center gap-0 mb-10">
            {[
              { label: "Submitted", done: true },
              { label: "Under Review", active: data.restaurant.approval_status === "pending" },
              { label: "Approved", done: data.restaurant.approval_status === "approved" },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center">
                {i > 0 && (
                  <div className={`w-8 h-0.5 ${step.done || step.active ? "bg-primary" : "bg-[rgba(255,255,255,0.08)]"}`} />
                )}
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    step.done ? "bg-primary text-white" :
                    step.active ? "bg-primary/20 text-primary border-2 border-primary" :
                    "bg-surface-alt text-muted border border-[rgba(255,255,255,0.08)]"
                  }`}>
                    {step.done ? "✓" : i + 1}
                  </div>
                  <span className={`text-[10px] font-semibold ${step.active ? "text-primary" : "text-muted"}`}>
                    {step.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-8">
            {data.restaurant.approval_status === "rejected" ? (
              <XCircle size={64} className="mx-auto text-error" />
            ) : (
              <Clock size={64} className="mx-auto text-warning animate-spin-slow" />
            )}
            <h1 className="text-[28px] font-extrabold mt-4 text-foreground">Verification in Progress</h1>
          </div>

          <div className="rounded-xl p-6 mb-8 text-left space-y-3 bg-surface-alt border border-[rgba(255,255,255,0.04)]">
            <div className="flex justify-between text-[15px]">
              <span className="text-muted">Restaurant</span>
              <strong className="text-foreground">{data.restaurant.name}</strong>
            </div>
            <div className="flex justify-between text-[15px]">
              <span className="text-muted">Requested Plan</span>
              <strong className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full text-[11px] font-black">
                {data.restaurant.plan_type?.toUpperCase()}
              </strong>
            </div>
            <div className="flex justify-between text-[15px]">
              <span className="text-muted">Status</span>
              <strong className="text-warning">
                {data.restaurant.approval_status?.charAt(0).toUpperCase() +
                  data.restaurant.approval_status?.slice(1)}
              </strong>
            </div>
          </div>

          <div className="flex gap-3 p-4 rounded-xl mb-6 text-left text-sm leading-relaxed bg-warning/10 border border-warning/20 text-warning">
            <ShieldCheck size={20} className="flex-shrink-0 mt-0.5" />
            <p>
              Our admin team will review your restaurant and activate your{" "}
              <strong>{data.restaurant.plan_type?.toUpperCase()} Plan</strong>.
              Once approved, you&apos;ll be able to upload your menu items,
              generate your QR code, and go live.
            </p>
          </div>

          <div className="rounded-xl p-5 mb-8 text-center bg-primary/5 border border-primary/20">
            <p className="text-sm mb-2 text-muted">For faster approval, contact us directly:</p>
            <a
              href="tel:+919057291246"
              className="text-xl font-extrabold text-primary hover:underline"
            >
              📞 +91 90572 91246
            </a>
            <p className="text-xs mt-2 text-muted">WhatsApp / Call available</p>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold border border-[rgba(255,255,255,0.08)] text-foreground bg-transparent hover:bg-[rgba(255,255,255,0.04)] transition-all duration-200 cursor-pointer active:scale-[0.97]"
          >
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Dynamic SVG text for QR code overlay */}
      <svg width="0" height="0" className="hidden">
         <defs>
            <g id="qrCenterText">
              <rect x="-40" y="-12" width="80" height="24" rx="4" fill={data.restaurant.theme_color || "#FF6B35"} />
              <text x="0" y="4" fontSize="10" fontWeight="900" fontFamily="sans-serif" fill="#FFF" textAnchor="middle">
                 {data.restaurant.name ? data.restaurant.name.substring(0, 10).toUpperCase() : "MENU"}
              </text>
            </g>
         </defs>
      </svg>
      {/* Header */}
      <header className="min-h-[56px] lg:h-[64px] bg-surface border-b border-[rgba(255,255,255,0.04)] flex flex-wrap items-center px-3 lg:px-6 gap-2 lg:gap-6 z-10 py-2 lg:py-0">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-1.5 font-semibold text-xs lg:text-sm text-muted hover:text-foreground border-none bg-transparent cursor-pointer transition-all duration-200"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Dashboard</span>
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
            <h1 className="text-sm lg:text-lg font-extrabold text-foreground truncate max-w-[140px] lg:max-w-none">{data.restaurant.name}</h1>
            <span className="bg-success/10 text-success border border-success/20 px-2 py-0.5 rounded-full text-[9px] lg:text-[10px] font-black uppercase">
              ✓ Approved
            </span>
            {data.restaurant.approved_until && (
              <span className="hidden lg:inline text-[11px] text-muted font-medium bg-[rgba(255,255,255,0.03)] px-2 py-1 rounded-md">
                Valid until: {new Date(data.restaurant.approved_until).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2 lg:gap-3 items-center">
          <AnimatePresence>
            {saveSuccess && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="hidden sm:block px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium bg-success/10 text-success border border-success/20"
              >
                ✓ Saved!
              </motion.div>
            )}
          </AnimatePresence>
          <a
            href={`/menu/${data.restaurant.slug}`}
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 border border-[rgba(255,255,255,0.08)] rounded-lg text-sm font-semibold text-muted hover:text-foreground hover:bg-[rgba(255,255,255,0.04)] transition-all duration-200 active:scale-[0.97]"
          >
            <ExternalLink size={16} /> <span className="hidden md:inline">View Live</span>
          </a>
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 lg:px-4 py-2 bg-gradient-to-r from-primary to-orange-400 text-white rounded-lg text-xs lg:text-sm font-semibold shadow-md hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 cursor-pointer disabled:opacity-50 active:scale-[0.97]"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" /> <span className="hidden sm:inline">Saving...</span>
              </>
            ) : (
              <>
                <Save size={16} /> <span className="hidden sm:inline">Save All</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Mobile panel switcher */}
      <div className="lg:hidden flex border-b border-[rgba(255,255,255,0.04)] bg-surface">
        <button
          onClick={() => setMobilePanel('builder')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer bg-transparent ${
            mobilePanel === 'builder'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          <LayoutGrid size={14} /> Menu Items
        </button>
        <button
          onClick={() => setMobilePanel('settings')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer bg-transparent ${
            mobilePanel === 'settings'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          <SlidersHorizontal size={14} /> Settings
        </button>
      </div>

      {/* Three-panel layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Settings */}
        <aside className={`w-full lg:w-[300px] border-r border-[rgba(255,255,255,0.04)] bg-surface p-4 lg:p-6 overflow-y-auto ${mobilePanel === 'settings' ? 'block' : 'hidden'} lg:block`}>
          <section className="mb-8">
            <h3 className="text-[11px] font-bold text-muted uppercase tracking-widest mb-5 flex items-center gap-2 border-l-2 border-primary pl-3">
              <Palette size={14} /> Aesthetics
            </h3>
            <div className="mb-5">
              <label className="block text-[13px] font-semibold mb-2 text-foreground">Theme Color</label>
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="color"
                  className="w-11 h-11 rounded-lg cursor-pointer border-none p-0"
                  value={data.restaurant.theme_color || "#FF6B35"}
                  onChange={(e) =>
                    setData({
                      ...data,
                      restaurant: { ...data.restaurant, theme_color: e.target.value },
                    })
                  }
                />
                <span className="font-mono text-sm text-muted">
                  {data.restaurant.theme_color}
                </span>
              </div>
              {/* Preset colors */}
              <div className="flex gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() =>
                      setData({
                        ...data,
                        restaurant: { ...data.restaurant, theme_color: color },
                      })
                    }
                    className={`w-7 h-7 rounded-lg cursor-pointer border-2 transition-all duration-200 hover:scale-110 ${
                      data.restaurant.theme_color === color ? "border-foreground scale-110" : "border-transparent"
                    }`}
                    style={{ background: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
            
            <div className="mb-5">
              <label className="block text-[13px] font-semibold mb-2 text-foreground">Background Image</label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl border border-dashed border-[rgba(255,255,255,0.2)] bg-surface-alt flex flex-col items-center justify-center relative overflow-hidden group">
                  {data.restaurant.bg_image_url ? (
                    <>
                      <img src={data.restaurant.bg_image_url} className="w-full h-full object-cover" alt="Background" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ImageIcon size={16} className="text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <ImageIcon size={16} className="text-muted mb-1 mx-auto" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBgImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                {data.restaurant.bg_image_url && (
                  <button
                    onClick={() => setData({ ...data, restaurant: { ...data.restaurant, bg_image_url: null } })}
                    className="text-[11px] font-semibold text-error/80 hover:text-error bg-error/10 hover:bg-error/20 px-2 py-1 rounded transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-semibold mb-2 text-foreground">
                Typography
              </label>
              <select
                className="w-full px-3 py-2.5 rounded-xl text-sm input-obsidian"
                value={data.restaurant.font_family || "Inter"}
                onChange={(e) =>
                  setData({
                    ...data,
                    restaurant: { ...data.restaurant, font_family: e.target.value },
                  })
                }
              >
                <option value="Inter" style={{ fontFamily: "Inter" }}>Inter (Modern)</option>
                <option value="Poppins" style={{ fontFamily: "Poppins" }}>Poppins (Friendly)</option>
                <option value="Montserrat" style={{ fontFamily: "Montserrat" }}>Montserrat (Bold)</option>
                <option value="Playfair Display" style={{ fontFamily: "Playfair Display" }}>Playfair (Elegant)</option>
                <option value="Outfit" style={{ fontFamily: "Outfit" }}>Outfit (Clean)</option>
                <option value="Nunito" style={{ fontFamily: "Nunito" }}>Nunito (Rounded)</option>
                <option value="Raleway" style={{ fontFamily: "Raleway" }}>Raleway (Thin)</option>
                <option value="Lora" style={{ fontFamily: "Lora" }}>Lora (Serif)</option>
                <option value="DM Sans" style={{ fontFamily: "DM Sans" }}>DM Sans (Geometric)</option>
                <option value="Quicksand" style={{ fontFamily: "Quicksand" }}>Quicksand (Soft)</option>
                <option value="Rubik" style={{ fontFamily: "Rubik" }}>Rubik (Rounded)</option>
                <option value="Josefin Sans" style={{ fontFamily: "Josefin Sans" }}>Josefin (Retro)</option>
              </select>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-[11px] font-bold text-muted uppercase tracking-widest mb-5 flex items-center gap-2 border-l-2 border-primary pl-3">
              <ExternalLink size={14} /> Social Links
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold mb-1 text-muted">Zomato URL</label>
                <input
                  type="text"
                  placeholder="https://zomato.com/..."
                  className="w-full px-3 py-2 rounded-lg text-xs input-obsidian"
                  value={data.restaurant.zomato_url || ""}
                  onChange={(e) => setData({ ...data, restaurant: { ...data.restaurant, zomato_url: e.target.value } })}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold mb-1 text-muted">Swiggy URL</label>
                <input
                  type="text"
                  placeholder="https://swiggy.com/..."
                  className="w-full px-3 py-2 rounded-lg text-xs input-obsidian"
                  value={data.restaurant.swiggy_url || ""}
                  onChange={(e) => setData({ ...data, restaurant: { ...data.restaurant, swiggy_url: e.target.value } })}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold mb-1 text-muted">Instagram URL</label>
                <input
                  type="text"
                  placeholder="https://instagram.com/..."
                  className="w-full px-3 py-2 rounded-lg text-xs input-obsidian"
                  value={data.restaurant.instagram_url || ""}
                  onChange={(e) => setData({ ...data, restaurant: { ...data.restaurant, instagram_url: e.target.value } })}
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-[11px] font-bold text-muted uppercase tracking-widest mb-5 flex items-center gap-2 border-l-2 border-primary pl-3">
              <Download size={14} /> QR Code
            </h3>
            <div className="bg-surface-alt p-5 rounded-xl border border-[rgba(255,255,255,0.04)] inline-flex flex-col items-center gap-3 mb-2">
              <QRCodeSVG
                value={typeof window !== "undefined" ? `${window.location.origin}/menu/${data.restaurant.slug}` : ""}
                size={140}
                fgColor={data.restaurant.theme_color || "#FF6B35"}
                bgColor="transparent"
                level="H"
                imageSettings={{
                    src: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="24"><rect width="80" height="24" rx="4" fill="${encodeURIComponent(data.restaurant.theme_color || '#FF6B35')}"/><text x="40" y="15" font-size="10" font-weight="bold" font-family="sans-serif" fill="%23FFFFFF" text-anchor="middle">${encodeURIComponent((data.restaurant.name || 'MENU').substring(0, 10).toUpperCase())}</text></svg>`,
                    height: 24,
                    width: 70,
                    excavate: true
                }}
              />
              <p className="text-[11px] text-muted text-center mt-2">
                Scan to preview on mobile
              </p>
              <button
                onClick={() => {
                  const svg = document.querySelector(".qr-download-target");
                  if (!svg) return;
                  const svgData = new XMLSerializer().serializeToString(svg);
                  const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${data.restaurant.slug}-qr.svg`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-muted border border-[rgba(255,255,255,0.08)] rounded-lg hover:bg-[rgba(255,255,255,0.04)] hover:text-foreground transition-all duration-200 cursor-pointer bg-transparent active:scale-[0.97]"
              >
                <Download size={12} /> Download QR
              </button>
            </div>
            {/* Hidden SVG for download */}
            <div className="hidden">
              <QRCodeSVG
                className="qr-download-target"
                value={typeof window !== "undefined" ? `${window.location.origin}/menu/${data.restaurant.slug}` : ""}
                size={512}
                fgColor={data.restaurant.theme_color || "#FF6B35"}
                bgColor="transparent"
                level="H"
                imageSettings={{
                    src: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="48"><rect width="160" height="48" rx="8" fill="${encodeURIComponent(data.restaurant.theme_color || '#FF6B35')}"/><text x="80" y="30" font-size="20" font-weight="bold" font-family="sans-serif" fill="%23FFFFFF" text-anchor="middle">${encodeURIComponent((data.restaurant.name || 'MENU').substring(0, 10).toUpperCase())}</text></svg>`,
                    height: 48,
                    width: 140,
                    excavate: true
                }}
              />
            </div>
          </section>
        </aside>

        {/* CENTER: Builder */}
        <main className={`flex-1 min-w-0 lg:min-w-[500px] p-4 lg:p-8 bg-background overflow-y-auto ${mobilePanel === 'builder' ? 'block' : 'hidden'} lg:block`}>
          {/* Categories bar */}
          <div className="flex gap-2.5 pb-5 overflow-x-auto border-b border-[rgba(255,255,255,0.04)] items-center mb-8 scrollbar-hide">
            {data.categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-5 py-2 rounded-full text-sm font-semibold border whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  activeTab === cat.id
                    ? "bg-gradient-to-r from-primary to-orange-400 text-white border-transparent shadow-md shadow-primary/20"
                    : "border-[rgba(255,255,255,0.06)] bg-surface hover:border-[rgba(255,255,255,0.12)]"
                }`}
              >
                {cat.name}
              </button>
            ))}
            <button
              onClick={() => setShowCategoryModal(true)}
              className="w-9 h-9 rounded-full border border-dashed border-primary text-primary flex items-center justify-center flex-shrink-0 cursor-pointer bg-transparent hover:bg-primary/10 transition-all duration-200 pulse-ring"
            >
              <Plus size={16} />
            </button>
            {activeCategory && (
              confirmDeleteCat === activeTab ? (
                <div className="flex items-center gap-2 ml-2 text-sm">
                  <span className="text-error font-medium">Delete?</span>
                  <button
                    onClick={() => handleDeleteCategory(activeTab!)}
                    className="px-2 py-1 rounded-lg bg-error text-white text-xs font-bold cursor-pointer border-none transition-all duration-200 active:scale-[0.97]"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setConfirmDeleteCat(null)}
                    className="px-2 py-1 rounded-lg border border-[rgba(255,255,255,0.08)] text-xs font-bold cursor-pointer bg-transparent transition-all duration-200 active:scale-[0.97]"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDeleteCat(activeTab)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:bg-error/10 hover:text-error cursor-pointer bg-transparent border-none transition-all duration-200"
                  title="Delete Category"
                >
                  <Trash2 size={16} />
                </button>
              )
            )}
          </div>

          {/* Active Category Label */}
          <div className="flex justify-between items-center mb-5">
            <div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Active Category</p>
              <h2 className="text-xl font-extrabold text-foreground">
                {activeCategory ? activeCategory.name : "No Category"}
              </h2>
            </div>
            {activeCategory && (
              <button
                onClick={() => {
                  setEditingItem(null);
                  setItemForm({ name: "", price: "", description: "", is_veg: 1, media_url: "", media_type: "image" });
                  setShowItemModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary to-orange-400 text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 cursor-pointer active:scale-[0.97]"
              >
                <Plus size={16} /> Add Item
              </button>
            )}
          </div>

          <div className="space-y-3">
            {!activeCategory ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-float">
                  <Plus size={24} className="text-primary" />
                </div>
                <p className="text-muted font-medium">Click + to create your first category</p>
              </div>
            ) : activeCategory.items.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">🍽️</div>
                <p className="text-muted font-medium">No items in this category yet.</p>
                <p className="text-sm text-muted-light mt-1">Click &quot;Add Item&quot; to get started</p>
              </div>
            ) : (
              activeCategory.items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-surface border border-[rgba(255,255,255,0.04)] rounded-xl p-3 flex items-center gap-4 hover:border-[rgba(255,255,255,0.08)] transition-all duration-200"
                >
                  {/* Drag handle */}
                  <div className="flex-shrink-0 text-muted-light cursor-grab">
                    <GripVertical size={16} />
                  </div>
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-alt flex-shrink-0 flex items-center justify-center">
                    {item.media_url ? (
                      item.media_type === "video" ? (
                        <video src={item.media_url} muted className="w-full h-full object-cover" />
                      ) : (
                        <img src={item.media_url} alt={item.name} className="w-full h-full object-cover" />
                      )
                    ) : (
                      <span className="text-2xl">{item.is_veg ? "🥗" : "🍖"}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[15px] font-semibold text-foreground">{item.name}</h4>
                    <p className="text-[13px] font-bold text-primary">₹{item.price}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setItemForm({
                          name: item.name,
                          price: String(item.price),
                          description: item.description || "",
                          is_veg: item.is_veg,
                          media_url: item.media_url || "",
                          media_type: item.media_type || "image",
                        });
                        setShowItemModal(true);
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:bg-[rgba(255,255,255,0.04)] cursor-pointer bg-transparent border-none transition-all duration-200"
                    >
                      <Palette size={16} />
                    </button>
                    {confirmDeleteItem === item.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="px-2 py-1 rounded-lg bg-error text-white text-xs font-bold cursor-pointer border-none transition-all duration-200 active:scale-[0.97]"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmDeleteItem(null)}
                          className="px-2 py-1 rounded-lg border border-[rgba(255,255,255,0.08)] text-xs font-bold cursor-pointer bg-transparent transition-all duration-200 active:scale-[0.97]"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteItem(item.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:bg-error/10 hover:text-error cursor-pointer bg-transparent border-none transition-all duration-200"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </main>

        {/* RIGHT: Preview — hidden on mobile */}
        <aside className="hidden xl:flex w-[400px] border-l border-[rgba(255,255,255,0.04)] flex-col items-center justify-center bg-surface-alt relative">
          <div className="w-[300px] h-[600px] bg-gradient-to-b from-[#1a1a1e] to-[#0e0e10] rounded-[40px] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.06)] relative">
            {/* Status bar */}
            <div className="flex items-center justify-between px-6 pt-2 pb-1 text-white/40 text-[10px] font-semibold z-10 relative">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 20h2V8h-2v12zm5 0h2V4h-2v16zm5 0h2v-8h-2v8zm5 0h2V2h-2v18z"/></svg>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 8l11-6 11 6M5 12l7-4 7 4M9 16l3-2 3 2"/></svg>
                <svg width="16" height="12" viewBox="0 0 24 12" fill="currentColor"><rect x="0" y="1" width="20" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5"/><rect x="2" y="3" width="14" height="6" rx="1" fill="currentColor"/><rect x="21" y="4" width="2" height="4" rx="0.5" fill="currentColor"/></svg>
              </div>
            </div>
            <div className="w-full h-[calc(100%-24px)] bg-white rounded-[30px] overflow-hidden relative">
              <div style={{ width: '480px', height: '100%', transform: 'scale(0.57)', transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
                <iframe
                  src={`/menu/${data.restaurant.slug}?preview=true`}
                  style={{ width: '480px', height: `${100 / 0.57}%`, border: 'none' }}
                  key={`preview-${data.restaurant.slug}-${saveSuccess ? 'saved' : 'pending'}`}
                />
              </div>
            </div>
          </div>
          <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-4">Live Preview</p>
          <p className="text-[9px] text-muted/60 mt-1">Save to see changes</p>
        </aside>
      </div>

      {/* Category Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface border border-[rgba(255,255,255,0.06)] rounded-2xl p-8 w-[400px] max-h-[90vh] overflow-y-auto shadow-[0_24px_64px_rgba(0,0,0,0.5)]"
            >
              <h3 className="text-lg font-bold mb-5 text-foreground">New Category</h3>
              <form onSubmit={handleAddCategory}>
                <div className="mb-5">
                  <label className="block text-[13px] font-semibold mb-2 text-foreground">Name</label>
                  <input
                    name="catName"
                    type="text"
                    required
                    placeholder="Starters, Main, etc."
                    className="w-full px-4 py-2.5 rounded-xl text-sm input-obsidian"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(false)}
                    className="px-4 py-2.5 border border-[rgba(255,255,255,0.08)] text-foreground rounded-xl font-semibold text-sm hover:bg-[rgba(255,255,255,0.04)] transition-all duration-200 cursor-pointer bg-transparent active:scale-[0.97]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-gradient-to-r from-primary to-orange-400 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 cursor-pointer active:scale-[0.97]"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Item Modal */}
      <AnimatePresence>
        {showItemModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface border border-[rgba(255,255,255,0.06)] rounded-2xl p-8 w-[450px] max-h-[90vh] overflow-y-auto shadow-[0_24px_64px_rgba(0,0,0,0.5)]"
            >
              <h3 className="text-lg font-bold mb-5 text-foreground">
                {editingItem ? "Edit Item" : "New Item"}
              </h3>
              <form onSubmit={handleItemSubmit} className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-[13px] font-semibold mb-2 text-foreground">Name</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2.5 rounded-xl text-sm input-obsidian"
                      value={itemForm.name}
                      onChange={(e) =>
                        setItemForm({ ...itemForm, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="w-[100px]">
                    <label className="block text-[13px] font-semibold mb-2 text-foreground">Price</label>
                    <input
                      type="number"
                      required
                      className="w-full px-4 py-2.5 rounded-xl text-sm input-obsidian"
                      value={itemForm.price}
                      onChange={(e) =>
                        setItemForm({ ...itemForm, price: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold mb-2 text-foreground">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl text-sm input-obsidian resize-none"
                    value={itemForm.description}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, description: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold mb-2 text-foreground">Type</label>
                  <div className="flex gap-2">
                    {[
                      { label: "Veg", value: 1 },
                      { label: "Non-Veg", value: 0 },
                    ].map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setItemForm({ ...itemForm, is_veg: opt.value })}
                        className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold border transition-all duration-200 cursor-pointer ${
                          itemForm.is_veg === opt.value
                            ? "bg-gradient-to-r from-primary to-orange-400 text-white border-transparent shadow-md"
                            : "border-[rgba(255,255,255,0.06)] bg-surface hover:bg-surface-alt"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold mb-2 text-foreground">
                    Item Photo (up to 2MB)
                  </label>
                  <div className="flex items-center gap-3">
                    {itemForm.media_url ? (
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-[rgba(255,255,255,0.1)] group">
                        <img src={itemForm.media_url} alt="Item menu" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setItemForm({ ...itemForm, media_url: "", media_type: "image" })}
                          className="absolute inset-0 bg-black/60 items-center justify-center hidden group-hover:flex cursor-pointer transition-all"
                        >
                           <Trash2 size={16} className="text-white" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-16 h-16 rounded-xl border border-[rgba(255,255,255,0.1)] border-dashed flex items-center justify-center text-muted hover:text-primary hover:border-primary/50 transition-all cursor-pointer bg-surface"
                      >
                         <ImageIcon size={20} />
                      </button>
                    )}
                    <div className="flex-1">
                      <input 
                         type="file" 
                         accept="image/*" 
                         ref={fileInputRef}
                         onChange={handleImageUpload}
                         className="hidden" 
                      />
                      <p className="text-xs text-muted leading-relaxed">
                         A great photo increases sales. We compress and optimize automatically. 
                         <br/>
                         <button type="button" onClick={() => fileInputRef.current?.click()} className="text-primary font-bold hover:underline cursor-pointer">Browse File</button>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowItemModal(false);
                      setEditingItem(null);
                    }}
                    className="px-4 py-2.5 border border-[rgba(255,255,255,0.08)] text-foreground rounded-xl font-semibold text-sm hover:bg-[rgba(255,255,255,0.04)] transition-all duration-200 cursor-pointer bg-transparent active:scale-[0.97]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-gradient-to-r from-primary to-orange-400 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 cursor-pointer active:scale-[0.97]"
                  >
                    {editingItem ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
