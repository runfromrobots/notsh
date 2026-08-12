import { NextRequest, NextResponse } from 'next/server'
import { getGameByCode } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code')

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Code required' },
        { status: 400 }
      )
    }

    const game = await getGameByCode(code)
    if (!game) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      gameId: game.id,
    })
  } catch (error) {
    console.error('Error looking up game:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to lookup game' },
      { status: 500 }
    )
  }
}
