// src/lib/db.ts — ⚠️ WARNING: File-based JSON DB
// ⚠️ This implementation uses `fs` module and local `data.json` file.
// ⚠️ It will NOT work on Vercel/Netlify/Cloudflare Pages (Serverless).
// ⚠️ For Production: Replace with Prisma (PostgreSQL), Supabase, or Drizzle ORM.

import fs from 'fs';
import path from 'path';
import type { Owner, Restaurant, MenuCategory, MenuItem, QrCode, AnalyticsEvent } from './types';

const DB_PATH = path.join(process.cwd(), 'data.json');

// --- Load Database ---
let data: any = { owners: [], restaurants: [], categories: [], items: [], qrCodes: [], analyticsEvents: [] };
try {
  if (fs.existsSync(DB_PATH)) {
    const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
    if (fileContent.trim() !== '') {
       data = JSON.parse(fileContent);
       // Ensure analyticsEvents array exists for older data files
       if (!data.analyticsEvents) data.analyticsEvents = [];
    }
  }
} catch (e) {
  console.error("Failed to load data.json:", e);
}

// ─── In-Memory Store ───────────────────────────────────────
const owners: Map<string, Owner> = new Map(data.owners);
const restaurants: Map<string, Restaurant> = new Map(data.restaurants);
const categories: Map<string, MenuCategory> = new Map(data.categories);
const items: Map<string, MenuItem> = new Map(data.items);
const qrCodes: Map<string, QrCode> = new Map(data.qrCodes);
const analyticsEvents: Map<string, AnalyticsEvent> = new Map(data.analyticsEvents);

// --- Save Database ---
function saveDB() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify({
      owners: Array.from(owners.entries()),
      restaurants: Array.from(restaurants.entries()),
      categories: Array.from(categories.entries()),
      items: Array.from(items.entries()),
      qrCodes: Array.from(qrCodes.entries()),
      analyticsEvents: Array.from(analyticsEvents.entries()),
    }, null, 2));
  } catch (err) {
    console.error("Failed to save data.json", err);
  }
}

// ─── Owners ────────────────────────────────────────────────
export function getOwnerByEmail(email: string): Owner | undefined {
  return Array.from(owners.values()).find(o => o.email === email);
}

export function getOwnerById(id: string): Owner | undefined {
  return owners.get(id);
}

export function createOwner(owner: Owner): Owner {
  owners.set(owner.id, owner);
  saveDB();
  return owner;
}

export function updateOwner(id: string, data: Partial<Owner>): Owner | null {
  const o = owners.get(id);
  if (!o) return null;
  const updated = { ...o, ...data, updated_at: Date.now() };
  owners.set(id, updated);
  saveDB();
  return updated;
}

// ─── Restaurants ───────────────────────────────────────────
export function getRestaurantsByOwner(ownerId: string): Restaurant[] {
  return Array.from(restaurants.values())
    .filter(r => r.owner_id === ownerId)
    .sort((a, b) => b.created_at - a.created_at);
}

export function getRestaurantById(id: string): Restaurant | undefined {
  return restaurants.get(id);
}

export function getRestaurantBySlug(slug: string): Restaurant | undefined {
  return Array.from(restaurants.values()).find(r => r.slug === slug);
}

export function createRestaurant(restaurant: Restaurant): Restaurant {
  restaurants.set(restaurant.id, restaurant);
  saveDB();
  return restaurant;
}

export function updateRestaurant(id: string, data: Partial<Restaurant>): Restaurant | null {
  const r = restaurants.get(id);
  if (!r) return null;
  const updated = { ...r, ...data, updated_at: Date.now() };
  restaurants.set(id, updated);
  saveDB();
  return updated;
}

// ─── Categories ────────────────────────────────────────────
export function getCategoriesByRestaurant(restaurantId: string): MenuCategory[] {
  return Array.from(categories.values())
    .filter(c => c.restaurant_id === restaurantId)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function getCategoryById(id: string): MenuCategory | undefined {
  return categories.get(id);
}

export function createCategory(category: MenuCategory): MenuCategory {
  categories.set(category.id, category);
  saveDB();
  return category;
}

export function updateCategory(id: string, data: Partial<MenuCategory>): MenuCategory | null {
  const c = categories.get(id);
  if (!c) return null;
  const updated = { ...c, ...data };
  categories.set(id, updated);
  saveDB();
  return updated;
}

export function deleteCategory(id: string): boolean {
  // Also delete items in this category
  Array.from(items.values())
    .filter(i => i.category_id === id)
    .forEach(i => items.delete(i.id));
  const success = categories.delete(id);
  saveDB();
  return success;
}

// ─── Menu Items ────────────────────────────────────────────
export function getItemsByRestaurant(restaurantId: string): MenuItem[] {
  return Array.from(items.values())
    .filter(i => i.restaurant_id === restaurantId)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function getItemById(id: string): MenuItem | undefined {
  return items.get(id);
}

export function createItem(item: MenuItem): MenuItem {
  items.set(item.id, item);
  saveDB();
  return item;
}

export function updateItem(id: string, data: Partial<MenuItem>): MenuItem | null {
  const i = items.get(id);
  if (!i) return null;
  const updated = { ...i, ...data, updated_at: Math.floor(Date.now() / 1000) };
  items.set(id, updated);
  saveDB();
  return updated;
}

export function deleteItem(id: string): boolean {
  const success = items.delete(id);
  saveDB();
  return success;
}

// ─── QR Codes ──────────────────────────────────────────────
export function createQrCode(qr: QrCode): QrCode {
  qrCodes.set(qr.id, qr);
  saveDB();
  return qr;
}

export function incrementScanCount(restaurantId: string): void {
  const qr = Array.from(qrCodes.values()).find(q => q.restaurant_id === restaurantId);
  if (qr) {
    qr.scan_count += 1;
    qrCodes.set(qr.id, qr);
    saveDB();
  }
}

// ─── Analytics Events ──────────────────────────────────────
export function logAnalyticsEvent(event: AnalyticsEvent): AnalyticsEvent {
  analyticsEvents.set(event.id, event);
  saveDB();
  return event;
}

export function getAnalyticsEvents(restaurantId: string, fromTimestamp?: number): AnalyticsEvent[] {
  return Array.from(analyticsEvents.values())
    .filter(e => e.restaurant_id === restaurantId && (!fromTimestamp || e.created_at >= fromTimestamp))
    .sort((a, b) => b.created_at - a.created_at);
}

export function getAnalyticsEventsByType(restaurantId: string, eventType: string, fromTimestamp?: number): AnalyticsEvent[] {
  return Array.from(analyticsEvents.values())
    .filter(e => e.restaurant_id === restaurantId && e.event_type === eventType && (!fromTimestamp || e.created_at >= fromTimestamp));
}

export function getUniqueVisitorCount(restaurantId: string, fromTimestamp?: number): number {
  const events = getAnalyticsEvents(restaurantId, fromTimestamp);
  const uniqueHashes = new Set(events.map(e => e.visitor_hash));
  return uniqueHashes.size;
}

export function getTopItemsByRating(restaurantId: string, limit = 5): MenuItem[] {
  return Array.from(items.values())
    .filter(i => i.restaurant_id === restaurantId && i.rating_count > 0)
    .sort((a, b) => b.rating_score - a.rating_score)
    .slice(0, limit);
}

export function getPerDayCounts(restaurantId: string, days: number, eventType?: string): { date: string; count: number }[] {
  const now = Date.now();
  const result: { date: string; count: number }[] = [];

  for (let d = days - 1; d >= 0; d--) {
    const dayStart = new Date(now - d * 86400000);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + 86400000);

    const count = Array.from(analyticsEvents.values()).filter(e =>
      e.restaurant_id === restaurantId &&
      e.created_at >= dayStart.getTime() &&
      e.created_at < dayEnd.getTime() &&
      (!eventType || e.event_type === eventType)
    ).length;

    const label = dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    result.push({ date: label, count });
  }

  return result;
}

// ─── Admin Helpers ─────────────────────────────────────────
export function getAllRestaurants(): Restaurant[] {
  return Array.from(restaurants.values()).sort((a, b) => b.created_at - a.created_at);
}

export function deleteRestaurant(id: string): boolean {
  // Cascade delete: items → categories → qrCodes → analytics → restaurant
  Array.from(items.values())
    .filter(i => i.restaurant_id === id)
    .forEach(i => items.delete(i.id));

  Array.from(categories.values())
    .filter(c => c.restaurant_id === id)
    .forEach(c => categories.delete(c.id));

  Array.from(qrCodes.values())
    .filter(q => q.restaurant_id === id)
    .forEach(q => qrCodes.delete(q.id));

  Array.from(analyticsEvents.values())
    .filter(e => e.restaurant_id === id)
    .forEach(e => analyticsEvents.delete(e.id));

  const deleted = restaurants.delete(id);
  saveDB();
  return deleted;
}
