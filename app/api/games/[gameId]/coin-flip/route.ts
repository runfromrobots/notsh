import { NextRequest, NextResponse } from 'next/server'
import { getGame, updateGame } from '@/lib/db'
import { Faction } from '@/lib/types'

export async function POST(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const { startingFaction } = await request.json()
    const gameId = params.gameId

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

    // Update game with starting faction and reset turn counter
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
