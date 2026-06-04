-- ─── BASE: users table ───
-- NOTE: Bestie had no users migration (the table was created ad-hoc). This is a
-- fresh minimal base table. Extend with your product's profile fields.
-- `id` mirrors auth.users.id so RLS via auth.uid() works directly.

CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  username    TEXT UNIQUE,
  full_name   TEXT,
  bio         TEXT,
  avatar_url  TEXT,
  is_plus     BOOLEAN NOT NULL DEFAULT FALSE,
  stripe_customer_id TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Anyone can read public profile rows (tighten if you need privacy).
CREATE POLICY "users_select_all" ON users FOR SELECT USING (true);

-- A user can insert/update only their own row.
CREATE POLICY "users_insert_self" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_self" ON users FOR UPDATE USING (auth.uid() = id);

-- Auto-create a users row when someone signs up via Supabase Auth.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
