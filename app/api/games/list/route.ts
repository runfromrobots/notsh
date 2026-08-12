import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get('status') || 'waiting'

    const { data, error } = await supabase
      .from('games')
      .select('id, code, status, day_number, current_player_faction, sos_positions')
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error

    // For each game, get player count
    const gamesWithPlayers = await Promise.all(
      (data || []).map(async (game: any) => {
        const { data: players, error: playersError } = await supabase
          .from('players')
          .select('id, name, faction', { count: 'exact' })
          .eq('game_id', game.id)

        return {
          ...game,
          playerCount: players?.length || 0,
          players: players || [],
        }
      })
    )

    return NextResponse.json({
      success: true,
      games: gamesWithPlayers,
    })
  } catch (error) {
    console.error('Error listing games:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to list games' },
      { status: 500 }
    )
  }
}
