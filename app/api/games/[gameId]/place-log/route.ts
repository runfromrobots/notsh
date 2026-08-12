import { NextRequest, NextResponse } from 'next/server'
import { getGame, getPlayers, getTile, updatePlayer, updateGame } from '@/lib/db'
import { placeLog } from '@/lib/gameLogic'
import { GameStatus } from '@/lib/types'
import * as C from '@/lib/constants'

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

    const game = await getGame(gameId)
    if (!game || game.status !== GameStatus.Active) {
      return NextResponse.json(
        { success: false, error: 'Game not active' },
        { status: 400 }
      )
    }

    const players = await getPlayers(gameId)
    const player = players.find((p) => p.id === playerId)

    if (!player) {
      return NextResponse.json(
        { success: false, error: 'Player not found' },
        { status: 404 }
      )
    }

    // Verify it's this player's turn
    if (player.faction !== game.currentPlayerFaction) {
      return NextResponse.json(
        { success: false, error: 'Not your turn' },
        { status: 400 }
      )
    }

    // Get current tile
    const tile = await getTile(gameId, player.x, player.y)
    if (!tile) {
      return NextResponse.json(
        { success: false, error: 'Invalid tile' },
        { status: 400 }
      )
    }

    // Try to place log
    const result = placeLog(player, tile, game.sosPositions)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      )
    }

    // Update player
    await updatePlayer(gameId, playerId, {
      carrying: player.carrying,
      logsPlaced: player.logsPlaced,
      turnsUsedToday: player.turnsUsedToday,
    })

    // Add to SOS positions
    const updatedSOS = [...game.sosPositions, { x: player.x, y: player.y }]
    const isComplete = updatedSOS.length >= C.LOGS_REQUIRED_FOR_SOS

    // Update game
    await updateGame(gameId, {
      sosPositions: updatedSOS,
    })

    // Advance to next player if not at turn limit
    const nextTurnInDay = game.currentTurnInDay + 1
    const allOtherPlayers = players.filter((p) => p.id !== playerId)
    const nextFaction = allOtherPlayers[0]?.faction

    if (nextFaction && nextTurnInDay < C.TURNS_PER_DAY) {
      await updateGame(gameId, {
        currentTurnInDay: nextTurnInDay,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Log placed',
      logsPlaced: updatedSOS.length,
      isComplete,
    })
  } catch (error) {
    console.error('Error placing log:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to place log' },
      { status: 500 }
    )
  }
}
