-- ─── BOOTSTRAP: create a tenant for a newly registered user ───
-- Idempotent — safe to re-run (CREATE OR REPLACE).
-- Depends on migration_001_core.sql.

-- Creates a tenant owned by the calling user, adds them as 'owner' in
-- tenant_members, and seeds an empty persons row. All in one transaction.
-- SECURITY DEFINER so it can write despite RLS; relies on auth.uid() for
-- the caller's identity, so it cannot be used to act as someone else.
CREATE OR REPLACE FUNCTION bootstrap_tenant(desired_handle TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid          UUID := auth.uid();
  base_handle  TEXT;
  final_handle TEXT;
  suffix       INT := 0;
  new_tenant   UUID;
  existing     UUID;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  -- If the user already owns a tenant, return it (idempotent for the caller).
  SELECT tenant_id INTO existing
  FROM tenant_members
  WHERE user_id = uid
  LIMIT 1;
  IF existing IS NOT NULL THEN
    RETURN existing;
  END IF;

  -- Normalize the requested handle: lowercase, only [a-z0-9-], trimmed.
  base_handle := lower(regexp_replace(coalesce(desired_handle, ''), '[^a-zA-Z0-9-]', '', 'g'));
  base_handle := trim(both '-' from base_handle);
  IF base_handle = '' THEN
    base_handle := 'user';
  END IF;

  -- Find a free handle, appending -1, -2, ... if taken.
  final_handle := base_handle;
  WHILE EXISTS (SELECT 1 FROM tenants WHERE handle = final_handle) LOOP
    suffix := suffix + 1;
    final_handle := base_handle || '-' || suffix::TEXT;
  END LOOP;

  INSERT INTO tenants (handle) VALUES (final_handle)
  RETURNING id INTO new_tenant;

  INSERT INTO tenant_members (tenant_id, user_id, role)
  VALUES (new_tenant, uid, 'owner');

  INSERT INTO persons (tenant_id) VALUES (new_tenant);

  RETURN new_tenant;
END;
$$;
