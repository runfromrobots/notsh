import { NextRequest, NextResponse } from 'next/server'
import { getTiles, upsertTiles } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const { playerX, playerY } = await request.json()
    const gameId = params.gameId

    if (playerX === undefined || playerY === undefined) {
      return NextResponse.json(
        { success: false, error: 'Player position required' },
        { status: 400 }
      )
    }

    // Get all current tiles for the game
    const existingTiles = await getTiles(gameId)

    // Mark tiles as revealed: center tile + 8 surrounding tiles
    const tilesToReveal: any[] = []
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const x = playerX + dx
        const y = playerY + dy

        // Find existing tile or create new record
        const existing = existingTiles.find(t => t.x === x && t.y === y)
        if (existing) {
          tilesToReveal.push({
            ...existing,
            isRevealed: true,
          })
        }
      }
    }

    // Update tiles in database
    if (tilesToReveal.length > 0) {
      await upsertTiles(gameId, tilesToReveal)
    }

    return NextResponse.json({
      success: true,
      revealedCount: tilesToReveal.length,
    })
  } catch (error) {
    console.error('Error revealing tiles:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to reveal tiles' },
      { status: 500 }
    )
  }
}
