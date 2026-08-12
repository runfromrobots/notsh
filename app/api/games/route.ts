import { NextRequest, NextResponse } from 'next/server'
import { generateMap } from '@/lib/mapGenerator'
import { createGame, getGame, getTiles, upsertTiles } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { mapSeed } = await request.json()

    // Create game in database
    const seedValue = mapSeed || Math.floor(Math.random() * 1000000)
    const game = await createGame(seedValue)

    if (!game) {
      return NextResponse.json(
        { success: false, error: 'Failed to create game in database' },
        { status: 500 }
      )
    }

    // Generate map tiles
    const mapData = generateMap(game.mapSeed)

    // Save tiles to database
    const tilesArray = Array.from(mapData.tiles.values())
    const tilesSaved = await upsertTiles(game.id, tilesArray)

    if (!tilesSaved) {
      return NextResponse.json(
        { success: false, error: 'Failed to save map tiles' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      gameId: game.id,
      game,
      map: {
        width: mapData.width,
        height: mapData.height,
        seed: mapData.seed,
        tileCount: tilesArray.length,
      },
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

    if (!gameId) {
      return NextResponse.json(
        { success: false, error: 'Provide a gameId query parameter' },
        { status: 400 }
      )
    }

    const game = await getGame(gameId)
    if (!game) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      )
    }

    const tiles = await getTiles(gameId)

    return NextResponse.json({
      success: true,
      game,
      tiles,
    })
  } catch (error) {
    console.error('Error fetching game:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch game' },
      { status: 500 }
    )
  }
}
