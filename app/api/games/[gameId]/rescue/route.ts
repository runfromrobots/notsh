import { NextRequest, NextResponse } from 'next/server'
import { getGame, getPlayers, updateGame, updatePlayer } from '@/lib/db'
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

    // Check SOS is complete
    if (game.sosPositions.length < C.LOGS_REQUIRED_FOR_SOS) {
      return NextResponse.json(
        { success: false, error: 'SOS not complete' },
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

    // Player must be on beach
    if (!game.sosPositions.some((pos) => pos.x === player.x && pos.y === player.y)) {
      return NextResponse.json(
        { success: false, error: 'Not on rescue tile' },
        { status: 400 }
      )
    }

    // Check if both alive players are on beach (same tile as SOS)
    const aliveOnBeach = players.filter(
      (p) =>
        p.status === 'alive' &&
        game.sosPositions.some((pos) => pos.x === p.x && pos.y === p.y)
    )

    if (aliveOnBeach.length === 1) {
      // Only one player on beach, they get rescued
      await updatePlayer(gameId, playerId, {
        status: 'rescued',
      })

      const rescuedPlayers = [...game.rescuedPlayers, playerId]

      // Check if other player is alive - if so, game continues, otherwise game over
      const otherAlive = players.find(
        (p) => p.id !== playerId && p.status === 'alive'
      )

      if (!otherAlive) {
        // Game over
        await updateGame(gameId, {
          status: GameStatus.Rescued,
          rescuedPlayers,
        })
      } else {
        // Other player still alive, they can try to reach beach
        await updateGame(gameId, {
          rescuedPlayers,
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Rescued!',
        rescuedPlayerIds: rescuedPlayers,
      })
    } else if (aliveOnBeach.length >= 2) {
      // Both players on beach together - both rescued
      const rescuedPlayerIds = aliveOnBeach.map((p) => p.id)

      for (const p of aliveOnBeach) {
        await updatePlayer(gameId, p.id, {
          status: 'rescued',
        })
      }

      await updateGame(gameId, {
        status: GameStatus.Rescued,
        rescuedPlayers: rescuedPlayerIds,
      })

      return NextResponse.json({
        success: true,
        message: 'Both rescued!',
        rescuedPlayerIds,
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Cannot rescue right now' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error processing rescue:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process rescue' },
      { status: 500 }
    )
  }
}
