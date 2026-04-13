-- =============================================
-- TABLE 1: owners (Restaurant Owners)
-- =============================================
CREATE TABLE IF NOT EXISTS owners (
  id          TEXT PRIMARY KEY,           -- UUID v4
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  phone       TEXT,
  password    TEXT NOT NULL,              -- PBKDF2 hashed
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);

-- =============================================
-- TABLE 2: restaurants
-- =============================================
CREATE TABLE IF NOT EXISTS restaurants (
  id              TEXT PRIMARY KEY,
  owner_id        TEXT NOT NULL,
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  description     TEXT,
  address         TEXT,
  phone           TEXT,
  bg_image_url    TEXT,
  theme_color     TEXT DEFAULT '#FF6B35',
  font_family     TEXT DEFAULT 'Poppins',
  logo_url        TEXT,
  is_active       INTEGER DEFAULT 1,
  approval_status TEXT DEFAULT 'pending', -- pending, approved, rejected
  is_approved     INTEGER DEFAULT 0,
  plan_type       TEXT DEFAULT 'image', -- image, video
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL,
  FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE CASCADE
);

-- =============================================
-- TABLE 3: subscriptions
-- =============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id              TEXT PRIMARY KEY,
  owner_id        TEXT NOT NULL,
  restaurant_id   TEXT NOT NULL,
  plan            TEXT NOT NULL,
  status          TEXT DEFAULT 'pending',
  price_paid      INTEGER NOT NULL,
  razorpay_order_id    TEXT,
  razorpay_payment_id  TEXT,
  starts_at       INTEGER,
  expires_at      INTEGER,
  created_at      INTEGER NOT NULL,
  FOREIGN KEY (owner_id) REFERENCES owners(id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

-- =============================================
-- TABLE 4: menu_categories
-- =============================================
CREATE TABLE IF NOT EXISTS menu_categories (
  id              TEXT PRIMARY KEY,
  restaurant_id   TEXT NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  sort_order      INTEGER DEFAULT 0,
  is_visible      INTEGER DEFAULT 1,
  created_at      INTEGER NOT NULL,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- =============================================
-- TABLE 5: menu_items
-- =============================================
CREATE TABLE IF NOT EXISTS menu_items (
  id              TEXT PRIMARY KEY,
  category_id     TEXT NOT NULL,
  restaurant_id   TEXT NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  price           REAL NOT NULL,
  is_veg          INTEGER DEFAULT 1,
  is_available    INTEGER DEFAULT 1,
  is_featured     INTEGER DEFAULT 0,
  media_type      TEXT,
  media_url       TEXT,
  media_thumbnail TEXT,
  sort_order      INTEGER DEFAULT 0,
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL,
  FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- =============================================
-- TABLE 6: qr_codes
-- =============================================
CREATE TABLE IF NOT EXISTS qr_codes (
  id              TEXT PRIMARY KEY,
  restaurant_id   TEXT NOT NULL,
  menu_url        TEXT NOT NULL,
  qr_image_url    TEXT,
  scan_count      INTEGER DEFAULT 0,
  created_at      INTEGER NOT NULL,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_restaurants_owner ON restaurants(owner_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurant_id);
