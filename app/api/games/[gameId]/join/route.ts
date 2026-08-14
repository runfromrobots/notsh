import { NextRequest, NextResponse } from 'next/server'
import { getGame, getPlayers, createPlayer, updateGame, updatePlayer } from '@/lib/db'
import { initializePlayer } from '@/lib/gameLogic'
import { Faction, GameStatus } from '@/lib/types'
import { generateMap } from '@/lib/mapGenerator'

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

    // If this is the second player, spawn them on map and start the game
    if (players.length === 1) {
      const mapData = generateMap(game.mapSeed)
      const tilesArray = Array.from(mapData.tiles.values())

      // Spawn second player (Navy at South pole)
      // Only spawn on navigable land tiles (Beach, Jungle, Shore - not Water or Mountain)
      const navigableTiles = tilesArray.filter((tile) => ['beach', 'jungle', 'shore'].includes(tile.type))

      if (navigableTiles.length > 0) {
        // Find south pole (maximum y values)
        const maxY = Math.max(...navigableTiles.map(t => t.y))
        const southSpawns = navigableTiles.filter(t => t.y >= maxY - 3)

        if (southSpawns.length > 0) {
          const spawn = southSpawns[Math.floor(Math.random() * southSpawns.length)]
          await updatePlayer(gameId, savedPlayer.id, {
            x: spawn.x,
            y: spawn.y,
          })
        }
      }

      // Second player joined - start the game with random first player
      const randomFirstFaction = Math.random() < 0.5 ? Faction.Pirates : Faction.Navy
      await updateGame(gameId, {
        status: GameStatus.Active,
        currentPlayerFaction: randomFirstFaction,
      })
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
