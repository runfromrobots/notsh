import { NextRequest, NextResponse } from 'next/server'
import { initializeGame } from '@/lib/gameLogic'
import { generateMap } from '@/lib/mapGenerator'

export async function POST(request: NextRequest) {
  try {
    const { mapSeed } = await request.json()

    // Generate game ID (simple UUID for now, would use crypto.randomUUID() in production)
    const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Initialize game state
    const game = initializeGame(gameId)
    game.mapSeed = mapSeed || Date.now()

    // Generate map
    const mapData = generateMap(game.mapSeed)

    // TODO: Save to Supabase

    return NextResponse.json({
      success: true,
      gameId,
      game,
      map: {
        width: mapData.width,
        height: mapData.height,
        seed: mapData.seed,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create game' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'Provide a gameId in the URL query parameter',
  })
}
