-- Add step-based turn tracking to players table
ALTER TABLE players
ADD COLUMN IF NOT EXISTS carrying BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS steps_used_this_turn INTEGER NOT NULL DEFAULT 0;
