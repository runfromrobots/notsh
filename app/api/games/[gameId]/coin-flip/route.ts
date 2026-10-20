import { NextRequest, NextResponse } from 'next/server'
import { getGame, updateGame } from '@/lib/db'
import { Faction } from '@/lib/types'

export async function POST(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const { playerId, startingFaction } = await request.json()
    const gameId = params.gameId

    if (!startingFaction || !['pirates', 'navy'].includes(startingFaction)) {
      return NextResponse.json(
        { success: false, error: 'Invalid starting faction' },
        { status: 400 }
      )
    }

    // Get game to verify it exists
    const game = await getGame(gameId)
    if (!game) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      )
    }

    // Only allow if currentPlayerFaction is not already set
    if (game.currentPlayerFaction) {
      return NextResponse.json(
        { success: false, error: 'Coin flip already completed' },
        { status: 400 }
      )
    }

    // Update game with the starting faction
    const success = await updateGame(gameId, {
      currentPlayerFaction: startingFaction as Faction,
    })

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to update game' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      startingFaction,
      message: `Game starting with ${startingFaction} player first`,
    })
  } catch (error) {
    console.error('Error processing coin flip:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process coin flip' },
      { status: 500 }
    )
  }
}
