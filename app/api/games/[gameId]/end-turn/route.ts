import { NextRequest, NextResponse } from 'next/server'
import { getGame, getPlayers, updatePlayer, updateGame } from '@/lib/db'
import { Faction, GameStatus } from '@/lib/types'

export async function POST(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const { playerId } = await request.json()
    const gameId = params.gameId

    if (!playerId) {
      return NextResponse.json(
        { success: false, error: 'Player ID required' },
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

    // Get players
    const players = await getPlayers(gameId)
    const currentPlayer = players.find((p) => p.id === playerId)
    const otherPlayer = players.find((p) => p.id !== playerId)

    if (!currentPlayer) {
      return NextResponse.json(
        { success: false, error: 'Player not found' },
        { status: 404 }
      )
    }

    // Verify it's this player's turn
    if (currentPlayer.faction !== game.currentPlayerFaction) {
      return NextResponse.json(
        { success: false, error: 'Not your turn' },
        { status: 400 }
      )
    }

    // Advance turn
    const nextFaction = currentPlayer.faction === Faction.Pirates ? Faction.Navy : Faction.Pirates
    const nextTurnInDay = game.currentTurnInDay + 1

    // Check if day is over
    const newDayNumber = nextTurnInDay >= 12 ? game.dayNumber + 1 : game.dayNumber
    const newTurnInDay = nextTurnInDay >= 12 ? 0 : nextTurnInDay

    // Increment turns for current player (steps tracking will be added after migration)
    await updatePlayer(gameId, currentPlayer.id, {
      turnsUsedToday: currentPlayer.turnsUsedToday + 1,
    })

    // Update game state
    await updateGame(gameId, {
      currentPlayerFaction: nextFaction,
      dayNumber: newDayNumber,
      currentTurnInDay: newTurnInDay,
    })

    return NextResponse.json({
      success: true,
      message: 'Turn ended',
      nextPlayer: nextFaction,
      dayNumber: newDayNumber,
      turnInDay: newTurnInDay,
    })
  } catch (error) {
    console.error('Error ending turn:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to end turn' },
      { status: 500 }
    )
  }
}
