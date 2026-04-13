"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, Palette, Image as ImageIcon, Plus,
  Trash2, Save, ExternalLink, Download, Clock, ShieldCheck, XCircle,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { Restaurant, CategoryWithItems, MenuItem } from "@/lib/types";

interface EditorData {
  restaurant: Restaurant;
  categories: CategoryWithItems[];
}

export default function MenuEditor() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
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
  const [itemForm, setItemForm] = useState({
    name: "", price: "", description: "", is_veg: 1,
    media_url: "", media_type: "image",
  });

  // Fix 8: token as a simple value, not a function
  const token = typeof window !== "undefined"
    ? localStorage.getItem("menuqr_token") || ""
    : "";

  useEffect(() => { fetchMenuData(); }, [id]);

  const fetchMenuData = async () => {
    try {
      const res = await fetch(`/api/menu/editor/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        setData(result.data);
        if (result.data.categories.length > 0 && !activeTab)
          setActiveTab(result.data.categories[0].id);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // Fix 4: replaced alert() with state-driven toast
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/restaurant/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data.restaurant),
      });
      const result = await res.json();
      if (result.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleAddCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("catName") as string;
    try {
      const res = await fetch("/api/menu/category", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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

  // Fix 4: replaced confirm() with inline confirmation state
  const handleDeleteCategory = async (catId: string) => {
    try {
      const res = await fetch(`/api/menu/category/${catId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchMenuData();
    setConfirmDeleteItem(null);
  };

  const activeCategory = data.categories.find((c) => c.id === activeTab);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-lg font-semibold text-muted">
        Loading Editor...
      </div>
    );

  // Gate: if not approved
  if (!data.restaurant.is_approved) {
    return (
      <div className="h-[calc(100vh-80px)] flex items-center justify-center p-5 bg-background">
        <div className="w-full max-w-[500px] p-12 rounded-xl text-center bg-surface border border-border shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
          <div className="mb-8">
            {data.restaurant.approval_status === "rejected" ? (
              <XCircle size={64} className="mx-auto text-error" />
            ) : (
              <Clock size={64} className="mx-auto text-warning animate-pulse" />
            )}
            <h1 className="text-[28px] font-extrabold mt-4 text-foreground">Verification in Progress</h1>
          </div>

          <div className="rounded-xl p-6 mb-8 text-left space-y-3 bg-background">
            <div className="flex justify-between text-[15px]">
              <span className="text-muted">Restaurant</span>
              <strong>{data.restaurant.name}</strong>
            </div>
            <div className="flex justify-between text-[15px]">
              <span className="text-muted">Requested Plan</span>
              <strong className="px-2 py-0.5 rounded text-[11px] bg-primary text-white">
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

          <div className="flex gap-3 p-4 rounded-xl mb-6 text-left text-sm leading-relaxed bg-warning-light border border-warning/20 text-warning">
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
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold border border-primary text-primary bg-transparent hover:bg-primary hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="h-[72px] bg-surface border-b border-border flex items-center px-6 gap-6 z-10">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 font-semibold text-sm text-muted hover:text-foreground border-none bg-transparent cursor-pointer transition"
        >
          <ArrowLeft size={18} /> Dashboard
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">{data.restaurant.name}</h1>
          <span className="text-[11px] text-success bg-success-light px-2 py-0.5 rounded font-semibold inline-block">
            Approved • {data.restaurant.plan_type?.toUpperCase()}
          </span>
        </div>
        <div className="flex gap-3 items-center">
          {/* Fix 4: toast banner */}
          {saveSuccess && (
            <div className="px-4 py-2 rounded-lg text-sm font-medium bg-success-light text-success border border-success/20">
              ✓ Settings saved!
            </div>
          )}
          <a
            href={`/menu/${data.restaurant.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-sm font-semibold hover:bg-surface-alt transition"
          >
            <ExternalLink size={16} /> View Live
          </a>
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-hover transition cursor-pointer disabled:opacity-50"
          >
            <Save size={16} /> {saving ? "Saving..." : "Save All"}
          </button>
        </div>
      </header>

      {/* Three-panel layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Settings */}
        <aside className="w-[320px] border-r border-border bg-surface p-6 overflow-y-auto">
          <section className="mb-8">
            <h3 className="text-xs font-bold text-muted uppercase tracking-wide mb-5 flex items-center gap-2">
              <Palette size={16} /> Aesthetics
            </h3>
            <div className="mb-5">
              <label className="block text-[13px] font-semibold mb-2 text-foreground">Theme Color</label>
              <div className="flex items-center gap-3">
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
            </div>
            <div>
              <label className="block text-[13px] font-semibold mb-2 text-foreground">
                Typography
              </label>
              <select
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-surface text-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                value={data.restaurant.font_family || "Inter"}
                onChange={(e) =>
                  setData({
                    ...data,
                    restaurant: { ...data.restaurant, font_family: e.target.value },
                  })
                }
              >
                <option value="Inter">Inter (Modern)</option>
                <option value="Poppins">Poppins (Friendly)</option>
                <option value="Montserrat">Montserrat (Bold)</option>
                <option value="Playfair Display">Playfair (Elegant)</option>
              </select>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold text-muted uppercase tracking-wide mb-5 flex items-center gap-2">
              <Download size={16} /> QR Code
            </h3>
            <div className="bg-surface p-4 rounded-xl border border-border inline-block mb-2">
              <QRCodeSVG
                value={typeof window !== "undefined" ? `${window.location.origin}/menu/${data.restaurant.slug}` : ""}
                size={120}
                fgColor={data.restaurant.theme_color || "#FF6B35"}
              />
            </div>
            <p className="text-[11px] text-muted text-center w-[120px]">
              Scan to preview on mobile
            </p>
          </section>
        </aside>

        {/* CENTER: Builder */}
        <main className="flex-1 min-w-[500px] p-8 bg-background overflow-y-auto">
          {/* Categories bar */}
          <div className="flex gap-2.5 pb-5 overflow-x-auto border-b border-border items-center mb-8">
            {data.categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-5 py-2 rounded-full text-sm font-semibold border whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === cat.id
                    ? "bg-primary text-white border-primary"
                    : "border-border bg-surface hover:border-muted-light"
                }`}
              >
                {cat.name}
              </button>
            ))}
            <button
              onClick={() => setShowCategoryModal(true)}
              className="w-9 h-9 rounded-full border border-dashed border-primary text-primary flex items-center justify-center flex-shrink-0 cursor-pointer bg-transparent hover:bg-primary-light transition"
            >
              <Plus size={16} />
            </button>
            {activeCategory && (
              confirmDeleteCat === activeTab ? (
                <div className="flex items-center gap-2 ml-2 text-sm">
                  <span className="text-error font-medium">Delete?</span>
                  <button
                    onClick={() => handleDeleteCategory(activeTab!)}
                    className="px-2 py-1 rounded bg-error text-white text-xs font-bold cursor-pointer border-none"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setConfirmDeleteCat(null)}
                    className="px-2 py-1 rounded border border-border text-xs font-bold cursor-pointer bg-transparent"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDeleteCat(activeTab)}
                  className="w-8 h-8 rounded-md flex items-center justify-center text-muted hover:bg-error-light hover:text-error cursor-pointer bg-transparent border-none transition"
                  title="Delete Category"
                >
                  <Trash2 size={16} />
                </button>
              )
            )}
          </div>

          {/* Items */}
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-bold text-foreground">
              {activeCategory ? activeCategory.name : "No Category"}
            </h2>
            {activeCategory && (
              <button
                onClick={() => {
                  setEditingItem(null);
                  setItemForm({ name: "", price: "", description: "", is_veg: 1, media_url: "", media_type: "image" });
                  setShowItemModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-hover transition cursor-pointer"
              >
                <Plus size={16} /> Add Item
              </button>
            )}
          </div>

          <div className="space-y-3">
            {!activeCategory ? (
              <p className="text-center text-muted py-8">Click + to create your first category</p>
            ) : activeCategory.items.length === 0 ? (
              <p className="text-center text-muted py-8">No items in this category yet.</p>
            ) : (
              activeCategory.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-surface border border-border rounded-xl p-3 flex items-center gap-4 shadow-[0_2px_4px_rgba(0,0,0,0.02)]"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-alt flex-shrink-0 flex items-center justify-center">
                    {item.media_url ? (
                      item.media_type === "video" ? (
                        <video src={item.media_url} muted className="w-full h-full object-cover" />
                      ) : (
                        <img src={item.media_url} alt={item.name} className="w-full h-full object-cover" />
                      )
                    ) : (
                      <ImageIcon size={20} className="text-muted" />
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
                      className="w-8 h-8 rounded-md flex items-center justify-center text-muted hover:bg-surface-alt cursor-pointer bg-transparent border-none transition"
                    >
                      <Palette size={16} />
                    </button>
                    {confirmDeleteItem === item.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="px-2 py-1 rounded bg-error text-white text-xs font-bold cursor-pointer border-none"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmDeleteItem(null)}
                          className="px-2 py-1 rounded border border-border text-xs font-bold cursor-pointer bg-transparent"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteItem(item.id)}
                        className="w-8 h-8 rounded-md flex items-center justify-center text-muted hover:bg-error-light hover:text-error cursor-pointer bg-transparent border-none transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>

        {/* RIGHT: Preview */}
        <aside className="w-[420px] border-l border-border flex items-center justify-center bg-surface-alt">
          <div className="w-[320px] h-[640px] bg-slate-800 rounded-[40px] p-3 shadow-2xl border-2 border-slate-700">
            <div className="w-full h-full bg-surface rounded-[30px] overflow-hidden relative">
              <iframe
                src={`/menu/${data.restaurant.slug}?preview=true`}
                className="w-full h-full border-none"
                key={JSON.stringify(data.restaurant)}
              />
            </div>
          </div>
        </aside>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-surface rounded-2xl p-8 w-[400px] max-h-[90vh] overflow-y-auto border border-border shadow-2xl">
            <h3 className="text-lg font-bold mb-5 text-foreground">New Category</h3>
            <form onSubmit={handleAddCategory}>
              <div className="mb-5">
                <label className="block text-[13px] font-semibold mb-2 text-foreground">Name</label>
                <input
                  name="catName"
                  type="text"
                  required
                  placeholder="Starters, Main, etc."
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-background text-foreground"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2.5 border border-primary text-primary rounded-xl font-semibold text-sm hover:bg-primary hover:text-white transition cursor-pointer bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-hover transition cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-surface rounded-2xl p-8 w-[450px] max-h-[90vh] overflow-y-auto border border-border shadow-2xl">
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
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-background text-foreground"
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
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-background text-foreground"
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
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm resize-none outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-background text-foreground"
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
                      className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold border transition cursor-pointer ${
                        itemForm.is_veg === opt.value
                          ? "bg-primary text-white border-primary"
                          : "border-border bg-surface hover:bg-surface-alt"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-semibold mb-2 text-foreground">
                  Media URL (optional)
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-background text-foreground"
                  value={itemForm.media_url}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, media_url: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowItemModal(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2.5 border border-primary text-primary rounded-xl font-semibold text-sm hover:bg-primary hover:text-white transition cursor-pointer bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-hover transition cursor-pointer"
                >
                  {editingItem ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
