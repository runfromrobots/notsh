import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (typeof window === 'undefined') {
  console.log('[Supabase] URL:', supabaseUrl)
  console.log('[Supabase] Key configured:', !!supabaseAnonKey)
  if (!supabaseUrl) console.error('[Supabase] NEXT_PUBLIC_SUPABASE_URL is missing')
  if (!supabaseAnonKey) console.error('[Supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY is missing')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database schema functions (to be used in migrations)
export const dbSchema = {
  games: `
    CREATE TABLE games (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      status TEXT NOT NULL DEFAULT 'waiting',
      current_turn INT NOT NULL DEFAULT 0,
      map_seed INT NOT NULL,
      pirate_sos JSONB DEFAULT '[]',
      navy_sos JSONB DEFAULT '[]',
      rescue_triggered BOOLEAN DEFAULT false,
      rescue_trigger_time BIGINT,
      winner_faction TEXT,
      created_at BIGINT NOT NULL DEFAULT extract(epoch from now()) * 1000,
      updated_at BIGINT NOT NULL DEFAULT extract(epoch from now()) * 1000
    )
  `,

  players: `
    CREATE TABLE players (
      id TEXT PRIMARY KEY,
      game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      faction TEXT NOT NULL,
      x INT NOT NULL,
      y INT NOT NULL,
      carrying BOOLEAN DEFAULT false,
      logs INT DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'alive',
      created_at BIGINT NOT NULL DEFAULT extract(epoch from now()) * 1000,
      updated_at BIGINT NOT NULL DEFAULT extract(epoch from now()) * 1000
    )
  `,

  tiles: `
    CREATE TABLE tiles (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
      x INT NOT NULL,
      y INT NOT NULL,
      type TEXT NOT NULL,
      has_log BOOLEAN DEFAULT false,
      is_revealed BOOLEAN DEFAULT false,
      last_revealed_by TEXT,
      created_at BIGINT NOT NULL,
      UNIQUE(game_id, x, y)
    )
  `,

  moves: `
    CREATE TABLE moves (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
      player_id TEXT NOT NULL REFERENCES players(id),
      turn_number INT NOT NULL,
      move_type TEXT NOT NULL,
      x INT NOT NULL,
      y INT NOT NULL,
      created_at BIGINT NOT NULL DEFAULT extract(epoch from now()) * 1000
    )
  `,

  encounters: `
    CREATE TABLE encounters (
      id TEXT PRIMARY KEY,
      game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
      player_id_1 TEXT NOT NULL REFERENCES players(id),
      player_id_2 TEXT NOT NULL REFERENCES players(id),
      outcome TEXT NOT NULL,
      winner TEXT,
      created_at BIGINT NOT NULL DEFAULT extract(epoch from now()) * 1000
    )
  `,
}
