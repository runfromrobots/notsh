import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get('status') || 'waiting'

    const { data, error } = await supabase
      .from('games')
      .select('id, code, status')
      .eq('status', status)
      .limit(10)

    if (error) throw error

    // Ensure data is an array
    const gamesList = Array.isArray(data) ? data : []

    // Get player counts for each game
    const gamesWithPlayers = await Promise.all(
      gamesList.map(async (game) => {
        const { data: players, error: playersError } = await supabase
          .from('players')
          .select('id, name, faction')
          .eq('game_id', game.id)

        if (playersError) {
          console.error('Error fetching players:', playersError)
          return {
            ...game,
            playerCount: 0,
            players: [],
          }
        }

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
