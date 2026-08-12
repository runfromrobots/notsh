import { NextRequest, NextResponse } from 'next/server'
import { getGame, getPlayers, createPlayer, updateGame, updatePlayer } from '@/lib/db'
import { initializePlayer } from '@/lib/gameLogic'
import { Faction, GameStatus } from '@/lib/types'
import { generateMap as generateMapData } from '@/lib/mapGenerator'

export async function POST(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const { playerName } = await request.json()
    const gameId = params.gameId

    if (!playerName || !playerName.trim()) {
      return NextResponse.json(
        { success: false, error: 'Player name required' },
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

    // Check if game is locked
    if (game.isLocked) {
      return NextResponse.json(
        { success: false, error: 'Game is locked - already in progress' },
        { status: 400 }
      )
    }

    // Get existing players
    const players = await getPlayers(gameId)
    if (players.length >= 2) {
      return NextResponse.json(
        { success: false, error: 'Game is full' },
        { status: 400 }
      )
    }

    // Assign faction (opposite of first player)
    const faction = players.length === 0 ? Faction.Pirates : Faction.Navy

    // Create new player
    const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newPlayer = initializePlayer(playerId, playerName, faction)

    const savedPlayer = await createPlayer(gameId, newPlayer)
    if (!savedPlayer) {
      return NextResponse.json(
        { success: false, error: 'Failed to create player' },
        { status: 500 }
      )
    }

    // If this is the second player, spawn them on map
    if (players.length === 1) {
      const mapData = generateMapData(game.mapSeed)
      const tilesArray = Array.from(mapData.tiles.values())

      // Spawn second player (Navy side, Southwest quadrant)
      // Only spawn on navigable land tiles (Beach, Jungle, Shore - not Water or Mountain)
      const navigableTiles = new Set(['beach', 'jungle', 'shore'])
      const spawnTiles = tilesArray.filter(
        (tile) =>
          tile.x < 32 &&
          tile.y > 34 &&
          navigableTiles.has(tile.type)
      )

      if (spawnTiles.length > 0) {
        const spawn = spawnTiles[Math.floor(Math.random() * spawnTiles.length)]
        await updatePlayer(gameId, savedPlayer.id, {
          x: spawn.x,
          y: spawn.y,
        })
      }
    }

    return NextResponse.json({
      success: true,
      playerId: savedPlayer.id,
      faction: savedPlayer.faction,
      gameStatus: players.length === 0 ? 'waiting' : 'ready',
    })
  } catch (error) {
    console.error('Error joining game:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to join game' },
      { status: 500 }
    )
  }
}
