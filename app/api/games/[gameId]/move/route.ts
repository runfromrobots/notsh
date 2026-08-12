import { NextRequest, NextResponse } from 'next/server'
import { getGame, getPlayers, getTile, updatePlayer, updateTile, recordMove, updateGame } from '@/lib/db'
import { generateMap } from '@/lib/mapGenerator'
import { processMove } from '@/lib/gameLogic'
import { Faction, MoveType, GameStatus } from '@/lib/types'
import { v4 as uuidv4 } from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const { playerId, targetX, targetY } = await request.json()
    const gameId = params.gameId

    if (!playerId || targetX === undefined || targetY === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
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

    if (game.status !== GameStatus.Active) {
      return NextResponse.json(
        { success: false, error: 'Game not active' },
        { status: 400 }
      )
    }

    // Get player
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

    // Get target tile
    const targetTile = await getTile(gameId, targetX, targetY)
    if (!targetTile) {
      return NextResponse.json(
        { success: false, error: 'Invalid tile' },
        { status: 400 }
      )
    }

    // Generate map for validation (we could cache this)
    const mapData = generateMap(game.mapSeed)

    // Process the move
    const result = processMove(player, targetX, targetY, mapData)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      )
    }

    // Update player position and turns
    await updatePlayer(gameId, playerId, {
      x: player.x,
      y: player.y,
      carrying: player.carrying,
      turnsUsedToday: player.turnsUsedToday,
    })

    // Update tile if revealed
    await updateTile(gameId, targetX, targetY, {
      isRevealed: targetTile.isRevealed,
      lastRevealedBy: targetTile.lastRevealedBy,
      hasLog: targetTile.hasLog,
    })

    // Record move in history
    const moveId = `move_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    await recordMove(gameId, {
      id: moveId,
      playerId,
      gameId,
      dayNumber: game.dayNumber,
      turnInDay: game.currentTurnInDay,
      moveType: MoveType.Move,
      x: targetX,
      y: targetY,
      timestamp: Date.now(),
    })

    // Advance to next player's turn
    const nextFaction = player.faction === Faction.Pirates ? Faction.Navy : Faction.Pirates
    const nextTurnInDay = game.currentTurnInDay + 1

    // Check if day is over
    const newDayNumber = nextTurnInDay >= 12 ? game.dayNumber + 1 : game.dayNumber
    const newTurnInDay = nextTurnInDay >= 12 ? 0 : nextTurnInDay

    await updateGame(gameId, {
      currentPlayerFaction: nextFaction,
      dayNumber: newDayNumber,
      currentTurnInDay: newTurnInDay,
    })

    return NextResponse.json({
      success: true,
      message: 'Move successful',
      nextPlayer: nextFaction,
      dayNumber: newDayNumber,
      turnInDay: newTurnInDay,
    })
  } catch (error) {
    console.error('Error processing move:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process move' },
      { status: 500 }
    )
  }
}
