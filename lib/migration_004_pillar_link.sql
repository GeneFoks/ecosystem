-- Add an optional outbound link (button) to each pillar.
-- Idempotent.
ALTER TABLE pillars ADD COLUMN IF NOT EXISTS link_url text NOT NULL DEFAULT '';
