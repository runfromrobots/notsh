-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Games table: tracks overall game state
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed')),
  current_turn INTEGER NOT NULL DEFAULT 0,
  map_seed INTEGER NOT NULL,
  pirate_sos JSONB DEFAULT '[]'::jsonb,
  navy_sos JSONB DEFAULT '[]'::jsonb,
  rescue_triggered BOOLEAN DEFAULT false,
  rescue_trigger_time BIGINT,
  winner_faction TEXT CHECK (winner_faction IN ('pirates', 'navy')),
  created_at BIGINT NOT NULL DEFAULT (EXTRACT(epoch FROM now()) * 1000)::BIGINT,
  updated_at BIGINT NOT NULL DEFAULT (EXTRACT(epoch FROM now()) * 1000)::BIGINT
);

-- Players table: individual player state
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  faction TEXT NOT NULL CHECK (faction IN ('pirates', 'navy')),
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  carrying BOOLEAN DEFAULT false,
  logs INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'alive' CHECK (status IN ('alive', 'eliminated', 'rescued', 'left_behind')),
  reveal_budget INTEGER DEFAULT 6,
  created_at BIGINT NOT NULL DEFAULT (EXTRACT(epoch FROM now()) * 1000)::BIGINT,
  updated_at BIGINT NOT NULL DEFAULT (EXTRACT(epoch FROM now()) * 1000)::BIGINT,
  UNIQUE(game_id, id)
);

-- Tiles table: map grid state (cached for performance)
CREATE TABLE IF NOT EXISTS tiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('water', 'shore', 'beach', 'jungle', 'mountain')),
  has_log BOOLEAN DEFAULT false,
  is_revealed BOOLEAN DEFAULT false,
  last_revealed_by TEXT,
  created_at BIGINT NOT NULL DEFAULT (EXTRACT(epoch FROM now()) * 1000)::BIGINT,
  UNIQUE(game_id, x, y)
);

-- Moves table: turn history and audit log
CREATE TABLE IF NOT EXISTS moves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  turn_number INTEGER NOT NULL,
  move_type TEXT NOT NULL CHECK (move_type IN ('reveal', 'backtrack')),
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  created_at BIGINT NOT NULL DEFAULT (EXTRACT(epoch FROM now()) * 1000)::BIGINT,
  FOREIGN KEY (game_id, player_id) REFERENCES players(game_id, id) ON DELETE CASCADE
);

-- Encounters table: faction interactions
CREATE TABLE IF NOT EXISTS encounters (
  id TEXT PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id_1 TEXT NOT NULL,
  player_id_2 TEXT NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('elimination', 'faction_switch', 'standoff')),
  winner TEXT,
  created_at BIGINT NOT NULL DEFAULT (EXTRACT(epoch FROM now()) * 1000)::BIGINT,
  FOREIGN KEY (game_id, player_id_1) REFERENCES players(game_id, id) ON DELETE CASCADE,
  FOREIGN KEY (game_id, player_id_2) REFERENCES players(game_id, id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_players_game_id ON players(game_id);
CREATE INDEX idx_players_faction ON players(faction);
CREATE INDEX idx_tiles_game_id ON tiles(game_id);
CREATE INDEX idx_tiles_revealed ON tiles(is_revealed);
CREATE INDEX idx_moves_game_id ON moves(game_id);
CREATE INDEX idx_moves_player_id ON moves(player_id);
CREATE INDEX idx_encounters_game_id ON encounters(game_id);

-- Enable realtime subscriptions
ALTER TABLE games REPLICA IDENTITY FULL;
ALTER TABLE players REPLICA IDENTITY FULL;
ALTER TABLE tiles REPLICA IDENTITY FULL;
ALTER TABLE moves REPLICA IDENTITY FULL;
ALTER TABLE encounters REPLICA IDENTITY FULL;
