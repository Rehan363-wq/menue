// src/lib/db.ts — In-memory database for local development
// Replace this with Cloudflare D1 bindings when deploying to production.

import type { Owner, Restaurant, MenuCategory, MenuItem, QrCode } from './types';

// ─── In-Memory Store ───────────────────────────────────────
const owners: Map<string, Owner> = new Map();
const restaurants: Map<string, Restaurant> = new Map();
const categories: Map<string, MenuCategory> = new Map();
const items: Map<string, MenuItem> = new Map();
const qrCodes: Map<string, QrCode> = new Map();

// ─── Owners ────────────────────────────────────────────────
export function getOwnerByEmail(email: string): Owner | undefined {
  return Array.from(owners.values()).find(o => o.email === email);
}

export function getOwnerById(id: string): Owner | undefined {
  return owners.get(id);
}

export function createOwner(owner: Owner): Owner {
  owners.set(owner.id, owner);
  return owner;
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
  return restaurant;
}

export function updateRestaurant(id: string, data: Partial<Restaurant>): Restaurant | null {
  const r = restaurants.get(id);
  if (!r) return null;
  const updated = { ...r, ...data, updated_at: Date.now() };
  restaurants.set(id, updated);
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
  return category;
}

export function updateCategory(id: string, data: Partial<MenuCategory>): MenuCategory | null {
  const c = categories.get(id);
  if (!c) return null;
  const updated = { ...c, ...data };
  categories.set(id, updated);
  return updated;
}

export function deleteCategory(id: string): boolean {
  // Also delete items in this category
  Array.from(items.values())
    .filter(i => i.category_id === id)
    .forEach(i => items.delete(i.id));
  return categories.delete(id);
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
  return item;
}

export function updateItem(id: string, data: Partial<MenuItem>): MenuItem | null {
  const i = items.get(id);
  if (!i) return null;
  const updated = { ...i, ...data, updated_at: Math.floor(Date.now() / 1000) };
  items.set(id, updated);
  return updated;
}

export function deleteItem(id: string): boolean {
  return items.delete(id);
}

// ─── QR Codes ──────────────────────────────────────────────
export function createQrCode(qr: QrCode): QrCode {
  qrCodes.set(qr.id, qr);
  return qr;
}

export function incrementScanCount(restaurantId: string): void {
  const qr = Array.from(qrCodes.values()).find(q => q.restaurant_id === restaurantId);
  if (qr) {
    qr.scan_count += 1;
    qrCodes.set(qr.id, qr);
  }
}

// ─── Admin Helpers ─────────────────────────────────────────
export function getAllRestaurants(): Restaurant[] {
  return Array.from(restaurants.values()).sort((a, b) => b.created_at - a.created_at);
}
