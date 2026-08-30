import { NextRequest, NextResponse } from 'next/server'
import { getGame, getPlayers, updatePlayer, recordMove, updateGame } from '@/lib/db'
import { generateMap } from '@/lib/mapGenerator'
import { Faction, MoveType, GameStatus } from '@/lib/types'

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

    if (game.status !== GameStatus.Active && game.status !== GameStatus.Waiting) {
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

    // Validate adjacent movement (max 1 tile away)
    const distance = Math.max(Math.abs(targetX - player.x), Math.abs(targetY - player.y))
    if (distance !== 1) {
      return NextResponse.json(
        { success: false, error: 'Can only move to adjacent tiles' },
        { status: 400 }
      )
    }

    // Validate within bounds (64x64 map)
    if (targetX < 0 || targetX >= 64 || targetY < 0 || targetY >= 64) {
      return NextResponse.json(
        { success: false, error: 'Move out of bounds' },
        { status: 400 }
      )
    }

    // Check if player has steps remaining this turn
    if (player.stepsUsedThisTurn >= 12) {
      return NextResponse.json(
        { success: false, error: 'No steps remaining this turn' },
        { status: 400 }
      )
    }

    // Update player position and increment steps
    await updatePlayer(gameId, playerId, {
      x: targetX,
      y: targetY,
      stepsUsedThisTurn: player.stepsUsedThisTurn + 1,
      lastMoveTime: Date.now(),
    })

    // Generate map to know which tiles are revealed (for UI, not stored in DB)
    const mapData = generateMap(game.mapSeed)
    const mapTiles = Array.from(mapData.tiles.values())

    // Reveal target tile and surrounding 1-tile radius (frontend will handle)
    const tilesToReveal = mapTiles.filter(
      (tile) =>
        Math.abs(tile.x - targetX) <= 1 &&
        Math.abs(tile.y - targetY) <= 1
    )

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

    // Lock game on first move if not already locked
    if (!game.isLocked) {
      await updateGame(gameId, { isLocked: true })
    }

    return NextResponse.json({
      success: true,
      message: 'Move successful',
      stepsUsedThisTurn: player.stepsUsedThisTurn + 1,
      stepsRemaining: 12 - (player.stepsUsedThisTurn + 1),
      revealedTiles: tilesToReveal.length,
    })
  } catch (error) {
    console.error('Error processing move:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process move' },
      { status: 500 }
    )
  }
}
