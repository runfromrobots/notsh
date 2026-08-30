import { NextRequest, NextResponse } from 'next/server'
import { getGame, updateGame, getPlayers } from '@/lib/db'
import { Faction } from '@/lib/types'

export async function POST(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const { playerId, startingFaction } = await request.json()
    const gameId = params.gameId

    if (!playerId) {
      return NextResponse.json(
        { success: false, error: 'Player ID required' },
        { status: 400 }
      )
    }

    if (!startingFaction) {
      return NextResponse.json(
        { success: false, error: 'Starting faction required' },
        { status: 400 }
      )
    }

    // Validate faction
    if (startingFaction !== Faction.Pirates && startingFaction !== Faction.Navy) {
      return NextResponse.json(
        { success: false, error: 'Invalid faction' },
        { status: 400 }
      )
    }

    // Get game
    const game = await getGame(gameId)
    if (!game) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      )
    }

    // Get players - verify caller is the second player (Navy)
    const players = await getPlayers(gameId)
    const callingPlayer = players.find((p) => p.id === playerId)

    if (!callingPlayer) {
      return NextResponse.json(
        { success: false, error: 'Player not found' },
        { status: 404 }
      )
    }

    // Only second player (Navy) can call coin flip
    if (callingPlayer.faction !== Faction.Navy) {
      return NextResponse.json(
        { success: false, error: 'Only the second player can call the coin flip' },
        { status: 400 }
      )
    }

    // Update game with starting faction
    await updateGame(gameId, {
      currentPlayerFaction: startingFaction,
      currentTurnInDay: 0,
      dayNumber: 1,
    })

    return NextResponse.json({
      success: true,
      message: 'Coin flip result set',
      startingFaction,
    })
  } catch (error) {
    console.error('Error processing coin flip:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process coin flip' },
      { status: 500 }
    )
  }
}
