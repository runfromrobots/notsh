import { Player, GameState, MoveType, Encounter, RPSChoice, Faction, GameStatus } from './types'
import { getTile, generateMap } from './mapGenerator'
import * as C from './constants'

export function initializeGame(gameId: string, code: string, mapSeed: number): GameState {
  return {
    id: gameId,
    code,
    status: GameStatus.Waiting,
    currentPlayerFaction: Faction.Pirates,
    dayNumber: 1,
    currentTurnInDay: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    mapSeed,
    sosPositions: [],
    rescuedPlayers: [],
    isLocked: false,
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
    logsPlaced: 0,
    status: 'alive',
    lastMoveTime: Date.now(),
    turnsUsedToday: 0,
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

export function isAdjacent(x1: number, y1: number, x2: number, y2: number): boolean {
  return Math.abs(x1 - x2) <= 1 && Math.abs(y1 - y2) <= 1 && !(x1 === x2 && y1 === y2)
}

export function processMove(
  player: Player,
  targetX: number,
  targetY: number,
  grid: any
): { success: boolean; message: string } {
  // Check turn budget
  if (player.turnsUsedToday >= C.TURNS_PER_DAY) {
    return { success: false, message: 'No moves left today' }
  }

  // Validate adjacent move
  if (!isAdjacent(player.x, player.y, targetX, targetY)) {
    return { success: false, message: 'Target must be adjacent' }
  }

  // Get target tile
  const targetTile = getTile(grid, targetX, targetY)
  if (!targetTile) {
    return { success: false, message: 'Invalid tile' }
  }

  // Can't move to water or mountain
  if (targetTile.type === 'water' || targetTile.type === 'mountain') {
    return { success: false, message: 'Cannot move there' }
  }

  // Move to tile and reveal it
  player.x = targetX
  player.y = targetY
  targetTile.isRevealed = true
  targetTile.lastRevealedBy = player.id

  // Pick up log if present and not carrying
  if (targetTile.hasLog && !player.carrying) {
    player.carrying = true
    targetTile.hasLog = false
  }

  player.turnsUsedToday++
  return { success: true, message: 'Moved successfully' }
}

export function placeLog(
  player: Player,
  tile: any,
  currentSOS: Array<{ x: number; y: number }>
): { success: boolean; message: string } {
  // Check turn budget
  if (player.turnsUsedToday >= C.TURNS_PER_DAY) {
    return { success: false, message: 'No moves left today' }
  }

  // Must be on beach
  if (tile.type !== 'beach') {
    return { success: false, message: 'Can only place logs on beach' }
  }

  // Must be carrying a log
  if (!player.carrying) {
    return { success: false, message: 'Not carrying a log' }
  }

  // Can't place where log already exists
  if (currentSOS.some((pos) => pos.x === player.x && pos.y === player.y)) {
    return { success: false, message: 'Log already placed here' }
  }

  // Check SOS isn't complete
  if (currentSOS.length >= C.LOGS_REQUIRED_FOR_SOS) {
    return { success: false, message: 'SOS already complete' }
  }

  // Place the log
  player.carrying = false
  player.logsPlaced++
  player.turnsUsedToday++

  return { success: true, message: 'Log placed' }
}

export function resolveRPS(choice1: RPSChoice, choice2: RPSChoice): string {
  if (choice1 === choice2) return 'tie'
  if (choice1 === RPSChoice.Rock && choice2 === RPSChoice.Scissors) return 'player1'
  if (choice1 === RPSChoice.Scissors && choice2 === RPSChoice.Paper) return 'player1'
  if (choice1 === RPSChoice.Paper && choice2 === RPSChoice.Rock) return 'player1'
  return 'player2'
}

export function checkEncounter(players: Player[]): Encounter | null {
  if (players.length < 2) return null

  const p1 = players[0]
  const p2 = players[1]

  // Check if on same tile and different factions
  if (p1.faction !== p2.faction && p1.x === p2.x && p1.y === p2.y && p1.status === 'alive' && p2.status === 'alive') {
    return {
      id: `${p1.id}-${p2.id}-${Date.now()}`,
      gameId: '',
      playerId1: p1.id,
      playerId2: p2.id,
      choice1: RPSChoice.Rock, // placeholder, will be filled by client choices
      choice2: RPSChoice.Rock,
      winnerId: '',
      loserId: '',
      loserChoice: 'death',
      timestamp: Date.now(),
    }
  }

  return null
}

export function checkRescue(players: Player[], sosPositions: Array<{ x: number; y: number }>): boolean {
  if (sosPositions.length < C.LOGS_REQUIRED_FOR_SOS) return false

  // Both players must be on beach at a position with a log
  for (const player of players) {
    if (player.status !== 'alive') continue
    if (player.faction === Faction.Pirates) continue // Only check one faction or wait for second player

    const beachTile = players.find((p) => p.status === 'alive' && p.x === player.x && p.y === player.y)
    if (beachTile) {
      // Check if they're at a tile with a log
      const hasLog = sosPositions.some((pos) => pos.x === player.x && pos.y === player.y)
      if (hasLog) return true
    }
  }

  return false
}

export function advanceDay(players: Player[]): void {
  for (const player of players) {
    player.turnsUsedToday = 0
  }
}
