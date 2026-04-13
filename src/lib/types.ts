// src/lib/types.ts — Shared types for the entire application

export interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  password: string;
  created_at: number;
  updated_at: number;
}

export interface Restaurant {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  bg_image_url: string | null;
  theme_color: string;
  font_family: string;
  logo_url: string | null;
  is_active: number;
  approval_status: 'pending' | 'approved' | 'rejected';
  is_approved: number;
  plan_type: 'image' | 'video';
  created_at: number;
  updated_at: number;
}

export interface MenuCategory {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_visible: number;
  created_at: number;
}

export interface MenuItem {
  id: string;
  category_id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  price: number;
  is_veg: number;
  is_available: number;
  is_featured: number;
  media_type: string | null;
  media_url: string | null;
  media_thumbnail: string | null;
  sort_order: number;
  created_at: number;
  updated_at: number;
}

export interface QrCode {
  id: string;
  restaurant_id: string;
  menu_url: string;
  qr_image_url: string | null;
  scan_count: number;
  created_at: number;
}

export interface CategoryWithItems extends MenuCategory {
  items: MenuItem[];
}

export interface JWTPayload {
  sub: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}
