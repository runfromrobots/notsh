import { NextRequest, NextResponse } from 'next/server'
import { generateMap } from '@/lib/mapGenerator'
import { createGame, getGame, getTiles, upsertTiles, createPlayer, updateGame, updatePlayer, getPlayers } from '@/lib/db'
import { initializePlayer } from '@/lib/gameLogic'
import { Faction, GameStatus } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const { playerName } = await request.json()

    if (!playerName || !playerName.trim()) {
      return NextResponse.json(
        { success: false, error: 'Player name required' },
        { status: 400 }
      )
    }

    // Generate map seed
    const mapSeed = Math.floor(Math.random() * 1000000)

    // Create game in database
    const game = await createGame(mapSeed)
    if (!game) {
      return NextResponse.json(
        { success: false, error: 'Failed to create game' },
        { status: 500 }
      )
    }

    // Generate map tiles with logs
    const mapData = generateMap(game.mapSeed)

    // Save tiles to database
    const tilesArray = Array.from(mapData.tiles.values())
    const tilesSaved = await upsertTiles(game.id, tilesArray)

    if (!tilesSaved) {
      return NextResponse.json(
        { success: false, error: 'Failed to save map' },
        { status: 500 }
      )
    }

    // Create first player (Pirates)
    const playerId1 = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const player1 = initializePlayer(playerId1, playerName.trim(), Faction.Pirates)
    const savedPlayer1 = await createPlayer(game.id, player1)

    if (!savedPlayer1) {
      return NextResponse.json(
        { success: false, error: 'Failed to create player' },
        { status: 500 }
      )
    }

    // Spawn player on map (Pirates spawn at North pole)
    // Only spawn on navigable land tiles (Beach, Jungle, Shore - not Water or Mountain)
    const navigableTiles = tilesArray.filter((tile) => ['beach', 'jungle', 'shore'].includes(tile.type))

    if (navigableTiles.length > 0) {
      // Find north pole (minimum y values)
      const minY = Math.min(...navigableTiles.map(t => t.y))
      const northSpawns = navigableTiles.filter(t => t.y <= minY + 3)

      if (northSpawns.length > 0) {
        const spawn = northSpawns[Math.floor(Math.random() * northSpawns.length)]
        await updatePlayer(game.id, playerId1, {
          x: spawn.x,
          y: spawn.y,
        })
      }
    }

    // Update game status to active with first player's faction
    await updateGame(game.id, {
      status: GameStatus.Active,
      currentPlayerFaction: Faction.Pirates,
    })

    return NextResponse.json({
      success: true,
      gameId: game.id,
      code: game.code,
      playerId: playerId1,
    })
  } catch (error) {
    console.error('Error creating game:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create game' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const gameId = request.nextUrl.searchParams.get('id')
    const code = request.nextUrl.searchParams.get('code')

    if (!gameId && !code) {
      return NextResponse.json(
        { success: false, error: 'Provide either gameId or code' },
        { status: 400 }
      )
    }

    let game
    if (code) {
      // Get game by code (not implemented yet, use gameId for now)
      game = await getGame(gameId || '')
    } else {
      game = await getGame(gameId || '')
    }

    if (!game) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      )
    }

    const tiles = await getTiles(game.id)
    const players = await getPlayers(game.id)

    return NextResponse.json({
      success: true,
      game,
      tiles,
      players,
    })
  } catch (error) {
    console.error('Error fetching game:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch game' },
      { status: 500 }
    )
  }
}
