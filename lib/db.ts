import { supabase } from './supabase'
import { GameState, Player, Tile, Move, Encounter, Faction } from './types'

// Helper: Generate game code (6 char alphanumeric)
function generateGameCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Games
export async function createGame(mapSeed: number, code?: string): Promise<GameState | null> {
  try {
    const gameCode = code || generateGameCode()
    const { data, error } = await supabase
      .from('games')
      .insert([
        {
          code: gameCode,
          status: 'waiting',
          current_player_faction: null,
          day_number: 1,
          current_turn_in_day: 0,
          map_seed: mapSeed,
          sos_positions: [],
          rescued_players: [],
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data as GameState
  } catch (error) {
    console.error('Failed to create game:', error)
    return null
  }
}

export async function getGame(gameId: string): Promise<GameState | null> {
  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single()

    if (error) throw error
    return data as GameState
  } catch (error) {
    console.error('Failed to get game:', error)
    return null
  }
}

export async function getGameByCode(code: string): Promise<GameState | null> {
  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('code', code)
      .single()

    if (error) throw error
    return data as GameState
  } catch (error) {
    console.error('Failed to get game by code:', error)
    return null
  }
}

export async function updateGame(gameId: string, updates: Partial<GameState>): Promise<boolean> {
  try {
    const dbUpdates: any = {}

    // Map TypeScript field names to snake_case for Supabase
    Object.entries(updates).forEach(([key, value]) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
      dbUpdates[snakeKey] = value
    })

    dbUpdates.updated_at = Date.now()

    const { error } = await supabase
      .from('games')
      .update(dbUpdates)
      .eq('id', gameId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Failed to update game:', error)
    return false
  }
}

// Players
export async function createPlayer(gameId: string, player: Player): Promise<Player | null> {
  try {
    const { data, error } = await supabase
      .from('players')
      .insert([
        {
          id: player.id,
          game_id: gameId,
          name: player.name,
          faction: player.faction,
          x: player.x,
          y: player.y,
          carrying: player.carrying,
          logs_placed: player.logsPlaced,
          status: player.status,
          last_move_time: player.lastMoveTime,
          turns_used_today: player.turnsUsedToday,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data as Player
  } catch (error) {
    console.error('Failed to create player:', error)
    return null
  }
}

export async function getPlayers(gameId: string): Promise<Player[]> {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('game_id', gameId)

    if (error) throw error
    return (data || []) as Player[]
  } catch (error) {
    console.error('Failed to get players:', error)
    return []
  }
}

export async function getPlayer(gameId: string, playerId: string): Promise<Player | null> {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('game_id', gameId)
      .eq('id', playerId)
      .single()

    if (error) throw error
    return data as Player
  } catch (error) {
    console.error('Failed to get player:', error)
    return null
  }
}

export async function updatePlayer(gameId: string, playerId: string, updates: Partial<Player>): Promise<boolean> {
  try {
    const dbUpdates: any = {}

    // Map TypeScript field names to snake_case
    Object.entries(updates).forEach(([key, value]) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
      dbUpdates[snakeKey] = value
    })

    dbUpdates.updated_at = Date.now()

    const { error } = await supabase
      .from('players')
      .update(dbUpdates)
      .eq('game_id', gameId)
      .eq('id', playerId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Failed to update player:', error)
    return false
  }
}

// Tiles
export async function upsertTiles(gameId: string, tiles: Tile[]): Promise<boolean> {
  try {
    const tileData = tiles.map((tile) => ({
      game_id: gameId,
      x: tile.x,
      y: tile.y,
      type: tile.type,
      has_log: tile.hasLog,
      is_revealed: tile.isRevealed,
      last_revealed_by: tile.lastRevealedBy,
      created_at: Date.now(),
    }))

    const { error } = await supabase
      .from('tiles')
      .upsert(tileData, { onConflict: 'game_id,x,y' })

    if (error) throw error
    return true
  } catch (error) {
    console.error('Failed to upsert tiles:', error)
    return false
  }
}

export async function getTiles(gameId: string): Promise<Tile[]> {
  try {
    const { data, error } = await supabase
      .from('tiles')
      .select('*')
      .eq('game_id', gameId)

    if (error) throw error
    return (data || []) as Tile[]
  } catch (error) {
    console.error('Failed to get tiles:', error)
    return []
  }
}

export async function getTile(gameId: string, x: number, y: number): Promise<Tile | null> {
  try {
    const { data, error } = await supabase
      .from('tiles')
      .select('*')
      .eq('game_id', gameId)
      .eq('x', x)
      .eq('y', y)
      .single()

    if (error) throw error
    return data as Tile
  } catch (error) {
    console.error('Failed to get tile:', error)
    return null
  }
}

export async function updateTile(gameId: string, x: number, y: number, updates: Partial<Tile>): Promise<boolean> {
  try {
    const dbUpdates: any = {}

    Object.entries(updates).forEach(([key, value]) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
      dbUpdates[snakeKey] = value
    })

    const { error } = await supabase
      .from('tiles')
      .update(dbUpdates)
      .eq('game_id', gameId)
      .eq('x', x)
      .eq('y', y)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Failed to update tile:', error)
    return false
  }
}

// Moves
export async function recordMove(gameId: string, move: Move): Promise<Move | null> {
  try {
    const { data, error } = await supabase
      .from('moves')
      .insert([
        {
          id: move.id,
          game_id: gameId,
          player_id: move.playerId,
          day_number: move.dayNumber,
          turn_in_day: move.turnInDay,
          move_type: move.moveType,
          x: move.x,
          y: move.y,
          timestamp: move.timestamp,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data as Move
  } catch (error) {
    console.error('Failed to record move:', error)
    return null
  }
}

export async function getMoves(gameId: string, dayNumber?: number): Promise<Move[]> {
  try {
    let query = supabase.from('moves').select('*').eq('game_id', gameId)

    if (dayNumber !== undefined) {
      query = query.eq('day_number', dayNumber)
    }

    const { data, error } = await query.order('timestamp', { ascending: true })

    if (error) throw error
    return (data || []) as Move[]
  } catch (error) {
    console.error('Failed to get moves:', error)
    return []
  }
}

// Encounters
export async function recordEncounter(gameId: string, encounter: Encounter): Promise<Encounter | null> {
  try {
    const { data, error } = await supabase
      .from('encounters')
      .insert([
        {
          id: encounter.id,
          game_id: gameId,
          player_id_1: encounter.playerId1,
          player_id_2: encounter.playerId2,
          choice_1: encounter.choice1,
          choice_2: encounter.choice2,
          winner_id: encounter.winnerId,
          loser_id: encounter.loserId,
          loser_choice: encounter.loserChoice,
          timestamp: encounter.timestamp,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data as Encounter
  } catch (error) {
    console.error('Failed to record encounter:', error)
    return null
  }
}

export async function getEncounters(gameId: string): Promise<Encounter[]> {
  try {
    const { data, error } = await supabase
      .from('encounters')
      .select('*')
      .eq('game_id', gameId)

    if (error) throw error
    return (data || []) as Encounter[]
  } catch (error) {
    console.error('Failed to get encounters:', error)
    return []
  }
}

// Realtime subscriptions
export function subscribeToGame(gameId: string, callback: (payload: any) => void) {
  const subscription = supabase
    .channel(`game:${gameId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'games',
        filter: `id=eq.${gameId}`,
      },
      callback
    )
    .subscribe()

  return subscription
}

export function subscribeToPlayers(gameId: string, callback: (payload: any) => void) {
  const subscription = supabase
    .channel(`players:${gameId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'players',
        filter: `game_id=eq.${gameId}`,
      },
      callback
    )
    .subscribe()

  return subscription
}

export function subscribeToMoves(gameId: string, callback: (payload: any) => void) {
  const subscription = supabase
    .channel(`moves:${gameId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'moves',
        filter: `game_id=eq.${gameId}`,
      },
      callback
    )
    .subscribe()

  return subscription
}
