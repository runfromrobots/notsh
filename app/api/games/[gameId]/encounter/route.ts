import { NextRequest, NextResponse } from 'next/server'
import { getGame, getPlayers, updatePlayer, recordEncounter } from '@/lib/db'
import { resolveRPS, checkEncounter } from '@/lib/gameLogic'
import { Encounter, RPSChoice, GameStatus, Faction } from '@/lib/types'

export async function POST(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const { playerId, choice, loserChoice } = await request.json()
    const gameId = params.gameId

    if (!playerId || !choice || !loserChoice) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
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

    const players = await getPlayers(gameId)
    if (players.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Both players must be present' },
        { status: 400 }
      )
    }

    const player = players.find((p) => p.id === playerId)
    const opponent = players.find((p) => p.id !== playerId)

    if (!player || !opponent) {
      return NextResponse.json(
        { success: false, error: 'Player not found' },
        { status: 404 }
      )
    }

    // Verify encounter exists (players on same tile, different factions)
    if (player.x !== opponent.x || player.y !== opponent.y) {
      return NextResponse.json(
        { success: false, error: 'Players not on same tile' },
        { status: 400 }
      )
    }

    if (player.faction === opponent.faction) {
      return NextResponse.json(
        { success: false, error: 'Same faction, no encounter' },
        { status: 400 }
      )
    }

    // For now, accept the choice. In real app, both players would submit choices
    // and we'd resolve when both are received.
    // For MVP, we'll just record what happened.

    // Simulate opponent choice (random for now)
    const opponentChoice = [RPSChoice.Rock, RPSChoice.Paper, RPSChoice.Scissors][
      Math.floor(Math.random() * 3)
    ] as RPSChoice

    // Resolve RPS
    const result = resolveRPS(choice, opponentChoice)
    const winnerId = result === 'player1' ? playerId : opponent.id
    const loserId = result === 'player1' ? opponent.id : playerId

    // Apply consequences based on loser's choice
    if (loserChoice === 'death') {
      await updatePlayer(gameId, loserId, {
        status: 'eliminated',
      })
    } else if (loserChoice === 'switch_faction') {
      const loser = result === 'player1' ? opponent : player
      const newFaction = loser.faction === Faction.Pirates ? Faction.Navy : Faction.Pirates
      await updatePlayer(gameId, loserId, {
        faction: newFaction,
      })
    }

    // Record encounter
    const encounter: Encounter = {
      id: `enc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      gameId,
      playerId1: playerId,
      playerId2: opponent.id,
      choice1: choice,
      choice2: opponentChoice,
      winnerId,
      loserId,
      loserChoice: loserChoice,
      timestamp: Date.now(),
    }

    await recordEncounter(gameId, encounter)

    return NextResponse.json({
      success: true,
      message: 'Encounter resolved',
      winnerId,
      loserId,
      outcome: loserChoice,
      opponentChoice, // reveal opponent's choice
    })
  } catch (error) {
    console.error('Error resolving encounter:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to resolve encounter' },
      { status: 500 }
    )
  }
}
