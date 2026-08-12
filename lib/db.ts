import { supabase } from './supabase'
import { GameState, Player, Tile, Move, Encounter } from './types'

// Games
export async function createGame(mapSeed: number): Promise<GameState | null> {
  try {
    const { data, error } = await supabase
      .from('games')
      .insert([
        {
          status: 'waiting',
          current_turn: 0,
          map_seed: mapSeed,
          pirate_sos: [],
          navy_sos: [],
          rescue_triggered: false,
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

export async function updateGame(gameId: string, updates: Partial<GameState>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('games')
      .update({
        ...updates,
        updated_at: Date.now(),
      })
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
          logs: player.logs,
          status: player.status,
          reveal_budget: player.revealBudget,
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

export async function updatePlayer(gameId: string, playerId: string, updates: Partial<Player>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('players')
      .update({
        ...updates,
        updated_at: Date.now(),
      })
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

export async function updateTile(gameId: string, x: number, y: number, updates: Partial<Tile>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('tiles')
      .update(updates)
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
          turn_number: move.turnNumber,
          move_type: move.moveType,
          x: move.x,
          y: move.y,
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

export async function getMoves(gameId: string, turnNumber?: number): Promise<Move[]> {
  try {
    let query = supabase.from('moves').select('*').eq('game_id', gameId)

    if (turnNumber !== undefined) {
      query = query.eq('turn_number', turnNumber)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

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
          outcome: encounter.outcome,
          winner: encounter.winner,
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

export function subscribeTomoves(gameId: string, callback: (payload: any) => void) {
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
