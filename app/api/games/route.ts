import { NextRequest, NextResponse } from 'next/server'
import { generateMap } from '@/lib/mapGenerator'
import { createGame, getGame, getTiles, upsertTiles, getPlayers, createPlayer, updateGame } from '@/lib/db'
import { initializePlayer } from '@/lib/gameLogic'
import { Faction, GameStatus } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const { playerName, soloMode } = await request.json()

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

    // If solo mode, create both players and start game immediately
    if (soloMode) {
      // Create first player (Pirates)
      const playerId1 = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const player1 = initializePlayer(playerId1, playerName.trim(), Faction.Pirates)
      const savedPlayer1 = await createPlayer(game.id, player1)

      if (!savedPlayer1) {
        return NextResponse.json(
          { success: false, error: 'Failed to create first player' },
          { status: 500 }
        )
      }

      // Create second player (Navy)
      const playerId2 = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const player2 = initializePlayer(playerId2, `${playerName.trim()} (Navy)`, Faction.Navy)
      const savedPlayer2 = await createPlayer(game.id, player2)

      if (!savedPlayer2) {
        return NextResponse.json(
          { success: false, error: 'Failed to create second player' },
          { status: 500 }
        )
      }

      // Spawn both players on map
      const allPlayers = [savedPlayer1, savedPlayer2]
      allPlayers.forEach((player) => {
        const spawnTiles = tilesArray.filter(
          (tile) =>
            (player.faction === Faction.Pirates
              ? tile.x > 32 && tile.y < 14
              : tile.x < 32 && tile.y > 34) &&
            (tile.type === 'beach' || tile.type === 'jungle' || tile.type === 'shore')
        )

        if (spawnTiles.length > 0) {
          const spawn = spawnTiles[Math.floor(Math.random() * spawnTiles.length)]
          player.x = spawn.x
          player.y = spawn.y
        }
      })

      // Update game status to active
      await updateGame(game.id, {
        status: GameStatus.Active,
        currentPlayerFaction: Faction.Pirates,
      })

      // Update player positions
      for (const player of allPlayers) {
        await createPlayer(game.id, player)
      }

      return NextResponse.json({
        success: true,
        gameId: game.id,
        code: game.code,
        game,
        soloMode: true,
        playerId: playerId1,
      })
    }

    return NextResponse.json({
      success: true,
      gameId: game.id,
      code: game.code,
      game,
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
