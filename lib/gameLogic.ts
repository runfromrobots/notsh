import { Player, GameState, Tile, MoveType, Encounter, EncounterOutcome, Faction } from './types'
import { getTile, getAdjacentTiles, generateMap } from './mapGenerator'
import * as C from './constants'

export function initializeGame(gameId: string): GameState {
  return {
    id: gameId,
    status: 'waiting',
    currentTurn: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    mapSeed: C.MAP_WIDTH,
    pirateSOS: [],
    navySOS: [],
    rescueTriggered: false,
  }
}

export function initializePlayer(playerId: string, name: string, faction: Faction): Player {
  return {
    id: playerId,
    name,
    faction,
    x: 0,
    y: 0,
    carrying: false,
    logs: 0,
    status: 'alive',
    lastMove: Date.now(),
    revealBudget: C.INITIAL_REVEAL_BUDGET,
  }
}

export function spawnPlayers(players: Player[], seed: number): void {
  const grid = generateMap(seed)

  // Find spawn quadrants
  const pirateSpawns: [number, number][] = []
  const navySpawns: [number, number][] = []

  // NE quadrant (pirates)
  for (let x = C.MAP_WIDTH * 0.5; x < C.MAP_WIDTH * 0.85; x++) {
    for (let y = C.MAP_HEIGHT * 0; y < C.MAP_HEIGHT * 0.3; y++) {
      const tile = getTile(grid, Math.floor(x), Math.floor(y))
      if (tile && (tile.type === 'beach' || tile.type === 'jungle' || tile.type === 'shore')) {
        pirateSpawns.push([tile.x, tile.y])
      }
    }
  }

  // SW quadrant (navy)
  for (let x = C.MAP_WIDTH * 0; x < C.MAP_WIDTH * 0.5; x++) {
    for (let y = C.MAP_HEIGHT * 0.7; y < C.MAP_HEIGHT; y++) {
      const tile = getTile(grid, Math.floor(x), Math.floor(y))
      if (tile && (tile.type === 'beach' || tile.type === 'jungle' || tile.type === 'shore')) {
        navySpawns.push([tile.x, tile.y])
      }
    }
  }

  // Assign spawn positions
  players.forEach((player) => {
    const spawns = player.faction === Faction.Pirates ? pirateSpawns : navySpawns
    if (spawns.length > 0) {
      const spawn = spawns[Math.floor(Math.random() * spawns.length)]
      player.x = spawn[0]
      player.y = spawn[1]
    }
  })
}

export function processMove(
  player: Player,
  moveType: MoveType,
  targetX: number,
  targetY: number,
  grid: any // GridState
): { success: boolean; message: string } {
  if (player.revealBudget <= 0) {
    return { success: false, message: 'No reveal budget remaining' }
  }

  if (moveType === MoveType.Backtrack) {
    if (!player.carrying) {
      return { success: false, message: 'Must be carrying a log to backtrack' }
    }
    player.carrying = false
    player.x = targetX
    player.y = targetY
    player.revealBudget--
    return { success: true, message: 'Backtracked successfully' }
  }

  // Reveal move
  const targetTile = getTile(grid, targetX, targetY)
  if (!targetTile) {
    return { success: false, message: 'Invalid target tile' }
  }

  if (!isAdjacent(player.x, player.y, targetX, targetY)) {
    return { success: false, message: 'Target must be adjacent' }
  }

  if (targetTile.type === 'water' || targetTile.type === 'mountain') {
    return { success: false, message: 'Cannot move to water or mountain' }
  }

  targetTile.isRevealed = true
  targetTile.lastRevealedBy = player.id
  player.x = targetX
  player.y = targetY
  player.revealBudget--

  // Pick up log if present and not carrying
  if (targetTile.hasLog && !player.carrying) {
    player.carrying = true
    targetTile.hasLog = false
  }

  return { success: true, message: 'Move successful' }
}

export function isAdjacent(x1: number, y1: number, x2: number, y2: number): boolean {
  return Math.abs(x1 - x2) <= 1 && Math.abs(y1 - y2) <= 1 && !(x1 === x2 && y1 === y2)
}

export function checkEncounter(players: Player[]): Encounter | null {
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const p1 = players[i]
      const p2 = players[j]

      if (
        p1.faction !== p2.faction &&
        p1.x === p2.x &&
        p1.y === p2.y &&
        p1.status === 'alive' &&
        p2.status === 'alive'
      ) {
        const outcome = resolveEncounter()
        return {
          id: `${p1.id}-${p2.id}-${Date.now()}`,
          gameId: '',
          playerId1: p1.id,
          playerId2: p2.id,
          outcome,
          winner: outcome === EncounterOutcome.Standoff ? undefined : p1.id,
          timestamp: Date.now(),
        }
      }
    }
  }
  return null
}

function resolveEncounter(): EncounterOutcome {
  const roll = Math.random()
  if (roll < 0.4) return EncounterOutcome.Elimination
  if (roll < 0.7) return EncounterOutcome.FactionSwitch
  return EncounterOutcome.Standoff
}

export function applyEncounter(encounter: Encounter, players: Player[]): void {
  const p1 = players.find((p) => p.id === encounter.playerId1)
  const p2 = players.find((p) => p.id === encounter.playerId2)

  if (!p1 || !p2) return

  switch (encounter.outcome) {
    case EncounterOutcome.Elimination:
      const eliminated = Math.random() < 0.5 ? p1 : p2
      eliminated.status = 'eliminated'
      break
    case EncounterOutcome.FactionSwitch:
      const switched = Math.random() < 0.5 ? p1 : p2
      switched.faction = switched.faction === Faction.Pirates ? Faction.Navy : Faction.Pirates
      break
    case EncounterOutcome.Standoff:
      // Both survive, no change
      break
  }
}

export function checkSOSWin(sosLogs: [number, number][]): boolean {
  if (sosLogs.length < 3) return false
  // Simple check: 3 logs placed forms valid SOS pattern (would be more complex with specific letter shapes)
  return true
}

export function applyWeatherDelay(): number {
  if (Math.random() < C.WEATHER_DELAY_CHANCE) {
    return Math.max(0, C.INITIAL_REVEAL_BUDGET - C.WEATHER_DELAY_AMOUNT)
  }
  return C.INITIAL_REVEAL_BUDGET
}
