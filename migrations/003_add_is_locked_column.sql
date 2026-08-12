-- Add is_locked column to games table
ALTER TABLE games
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;
