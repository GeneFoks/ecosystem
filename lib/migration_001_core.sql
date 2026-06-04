-- ─── CORE SCHEMA: multi-tenant personal ecosystem platform ───
-- Idempotent — safe to re-run in Supabase SQL editor.
-- Tables use CREATE TABLE IF NOT EXISTS.
-- Policies use DROP POLICY IF EXISTS before CREATE POLICY.
-- Run order matters: tenants → tenant_members → persons → pillars → offers → facts → channels.

-- ──────────────────────────────────────────────
-- TABLES
-- ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tenants (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle     TEXT NOT NULL UNIQUE,
  tier       TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tenant_members (
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role      TEXT NOT NULL DEFAULT 'owner',
  PRIMARY KEY (tenant_id, user_id)
);

-- One person profile per tenant (enforced by the unique constraint).
CREATE TABLE IF NOT EXISTS persons (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
  name       TEXT NOT NULL DEFAULT '',
  mission    TEXT NOT NULL DEFAULT '',
  bio        TEXT NOT NULL DEFAULT '',
  photo_url  TEXT NOT NULL DEFAULT '',
  location   TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pillars (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title       TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  icon        TEXT NOT NULL DEFAULT '',
  status      TEXT NOT NULL DEFAULT 'active',
  sort_order  INT  NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS offers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  -- pillar_id is nullable; SET NULL if the pillar is deleted.
  pillar_id    UUID REFERENCES pillars(id) ON DELETE SET NULL,
  title        TEXT NOT NULL DEFAULT '',
  description  TEXT NOT NULL DEFAULT '',
  kind         TEXT NOT NULL DEFAULT 'service',
  price_cents  INT  NOT NULL DEFAULT 0,
  currency     TEXT NOT NULL DEFAULT 'usd',
  external_url TEXT NOT NULL DEFAULT '',
  sort_order   INT  NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS facts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  label      TEXT NOT NULL DEFAULT '',
  value      TEXT NOT NULL DEFAULT '',
  sort_order INT  NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS channels (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  platform    TEXT NOT NULL DEFAULT '',
  url         TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  sort_order  INT  NOT NULL DEFAULT 0
);

-- ──────────────────────────────────────────────
-- HELPER FUNCTION
-- ──────────────────────────────────────────────

-- Returns true when the calling user is a member of the given tenant.
-- SECURITY DEFINER so it can query tenant_members without triggering
-- its own RLS policies (avoids infinite recursion).
CREATE OR REPLACE FUNCTION is_tenant_member(tid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM tenant_members
    WHERE tenant_id = tid
      AND user_id   = auth.uid()
  );
$$;

-- ──────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ──────────────────────────────────────────────

ALTER TABLE tenants        ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE persons        ENABLE ROW LEVEL SECURITY;
ALTER TABLE pillars        ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE facts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels       ENABLE ROW LEVEL SECURITY;

-- ── tenants ──────────────────────────────────

DROP POLICY IF EXISTS "tenants_select_public"  ON tenants;
DROP POLICY IF EXISTS "tenants_insert_member"  ON tenants;
DROP POLICY IF EXISTS "tenants_update_member"  ON tenants;
DROP POLICY IF EXISTS "tenants_delete_member"  ON tenants;

-- Public pages are readable by anyone (anon or authenticated).
CREATE POLICY "tenants_select_public"
  ON tenants FOR SELECT
  USING (true);

-- Only a tenant member can mutate the tenant row.
-- Note: on first insert (bootstrapping), the user inserts the tenant row
-- and then immediately inserts themselves into tenant_members. Use a
-- service-role call or a SECURITY DEFINER function for that flow; the
-- write policies here guard subsequent mutations.
CREATE POLICY "tenants_insert_member"
  ON tenants FOR INSERT
  WITH CHECK (is_tenant_member(id));

CREATE POLICY "tenants_update_member"
  ON tenants FOR UPDATE
  USING (is_tenant_member(id));

CREATE POLICY "tenants_delete_member"
  ON tenants FOR DELETE
  USING (is_tenant_member(id));

-- ── tenant_members ────────────────────────────

DROP POLICY IF EXISTS "tenant_members_select_self"  ON tenant_members;
DROP POLICY IF EXISTS "tenant_members_insert_self"  ON tenant_members;

-- A user can only see their own membership rows.
CREATE POLICY "tenant_members_select_self"
  ON tenant_members FOR SELECT
  USING (user_id = auth.uid());

-- An authenticated user can add themselves as a member (e.g. join flow).
-- Restricting to user_id = auth.uid() prevents adding others.
CREATE POLICY "tenant_members_insert_self"
  ON tenant_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ── persons ───────────────────────────────────

DROP POLICY IF EXISTS "persons_select_public"  ON persons;
DROP POLICY IF EXISTS "persons_insert_member"  ON persons;
DROP POLICY IF EXISTS "persons_update_member"  ON persons;
DROP POLICY IF EXISTS "persons_delete_member"  ON persons;

CREATE POLICY "persons_select_public"
  ON persons FOR SELECT
  USING (true);

CREATE POLICY "persons_insert_member"
  ON persons FOR INSERT
  WITH CHECK (is_tenant_member(tenant_id));

CREATE POLICY "persons_update_member"
  ON persons FOR UPDATE
  USING (is_tenant_member(tenant_id));

CREATE POLICY "persons_delete_member"
  ON persons FOR DELETE
  USING (is_tenant_member(tenant_id));

-- ── pillars ───────────────────────────────────

DROP POLICY IF EXISTS "pillars_select_public"  ON pillars;
DROP POLICY IF EXISTS "pillars_insert_member"  ON pillars;
DROP POLICY IF EXISTS "pillars_update_member"  ON pillars;
DROP POLICY IF EXISTS "pillars_delete_member"  ON pillars;

CREATE POLICY "pillars_select_public"
  ON pillars FOR SELECT
  USING (true);

CREATE POLICY "pillars_insert_member"
  ON pillars FOR INSERT
  WITH CHECK (is_tenant_member(tenant_id));

CREATE POLICY "pillars_update_member"
  ON pillars FOR UPDATE
  USING (is_tenant_member(tenant_id));

CREATE POLICY "pillars_delete_member"
  ON pillars FOR DELETE
  USING (is_tenant_member(tenant_id));

-- ── offers ────────────────────────────────────

DROP POLICY IF EXISTS "offers_select_public"  ON offers;
DROP POLICY IF EXISTS "offers_insert_member"  ON offers;
DROP POLICY IF EXISTS "offers_update_member"  ON offers;
DROP POLICY IF EXISTS "offers_delete_member"  ON offers;

CREATE POLICY "offers_select_public"
  ON offers FOR SELECT
  USING (true);

CREATE POLICY "offers_insert_member"
  ON offers FOR INSERT
  WITH CHECK (is_tenant_member(tenant_id));

CREATE POLICY "offers_update_member"
  ON offers FOR UPDATE
  USING (is_tenant_member(tenant_id));

CREATE POLICY "offers_delete_member"
  ON offers FOR DELETE
  USING (is_tenant_member(tenant_id));

-- ── facts ─────────────────────────────────────

DROP POLICY IF EXISTS "facts_select_public"  ON facts;
DROP POLICY IF EXISTS "facts_insert_member"  ON facts;
DROP POLICY IF EXISTS "facts_update_member"  ON facts;
DROP POLICY IF EXISTS "facts_delete_member"  ON facts;

CREATE POLICY "facts_select_public"
  ON facts FOR SELECT
  USING (true);

CREATE POLICY "facts_insert_member"
  ON facts FOR INSERT
  WITH CHECK (is_tenant_member(tenant_id));

CREATE POLICY "facts_update_member"
  ON facts FOR UPDATE
  USING (is_tenant_member(tenant_id));

CREATE POLICY "facts_delete_member"
  ON facts FOR DELETE
  USING (is_tenant_member(tenant_id));

-- ── channels ──────────────────────────────────

DROP POLICY IF EXISTS "channels_select_public"  ON channels;
DROP POLICY IF EXISTS "channels_insert_member"  ON channels;
DROP POLICY IF EXISTS "channels_update_member"  ON channels;
DROP POLICY IF EXISTS "channels_delete_member"  ON channels;

CREATE POLICY "channels_select_public"
  ON channels FOR SELECT
  USING (true);

CREATE POLICY "channels_insert_member"
  ON channels FOR INSERT
  WITH CHECK (is_tenant_member(tenant_id));

CREATE POLICY "channels_update_member"
  ON channels FOR UPDATE
  USING (is_tenant_member(tenant_id));

CREATE POLICY "channels_delete_member"
  ON channels FOR DELETE
  USING (is_tenant_member(tenant_id));
