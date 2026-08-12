-- Update games table to match new game logic
-- Add missing columns
ALTER TABLE games
ADD COLUMN IF NOT EXISTS code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS current_player_faction TEXT,
ADD COLUMN IF NOT EXISTS day_number INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS current_turn_in_day INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS sos_positions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS rescued_players JSONB DEFAULT '[]'::jsonb;

-- Drop old columns that are no longer used
ALTER TABLE games
DROP COLUMN IF EXISTS pirate_sos,
DROP COLUMN IF EXISTS navy_sos,
DROP COLUMN IF EXISTS rescue_triggered,
DROP COLUMN IF EXISTS rescue_trigger_time,
DROP COLUMN IF EXISTS winner_faction;

-- Update players table to match new game logic
ALTER TABLE players
RENAME COLUMN logs TO logs_placed;

ALTER TABLE players
ADD COLUMN IF NOT EXISTS last_move_time BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS turns_used_today INTEGER NOT NULL DEFAULT 0;

-- Drop old columns that are no longer used
ALTER TABLE players
DROP COLUMN IF EXISTS reveal_budget;

-- Update moves table to match new game logic
ALTER TABLE moves
ADD COLUMN IF NOT EXISTS day_number INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS turn_in_day INTEGER NOT NULL DEFAULT 0;

ALTER TABLE moves
RENAME COLUMN turn_number TO move_order;

-- Update encounters table to match new game logic
ALTER TABLE encounters
ADD COLUMN IF NOT EXISTS choice1 TEXT,
ADD COLUMN IF NOT EXISTS choice2 TEXT,
ADD COLUMN IF NOT EXISTS winner_id TEXT,
ADD COLUMN IF NOT EXISTS loser_id TEXT,
ADD COLUMN IF NOT EXISTS loser_choice TEXT;

-- Drop old column that's no longer used
ALTER TABLE encounters
DROP COLUMN IF EXISTS outcome;
