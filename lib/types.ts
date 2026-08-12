// Game grid and map types
export enum TileType {
  Water = 'water',
  Shore = 'shore',
  Beach = 'beach',
  Jungle = 'jungle',
  Mountain = 'mountain',
}

export interface Tile {
  x: number
  y: number
  type: TileType
  hasLog: boolean
  isRevealed: boolean
  lastRevealedBy?: string // player ID
}

export interface GridState {
  width: number
  height: number
  tiles: Map<string, Tile>
  seed: number
}

// Faction types
export enum Faction {
  Pirates = 'pirates',
  Navy = 'navy',
}

// Player types
export interface Player {
  id: string
  name: string
  faction: Faction
  x: number
  y: number
  carrying: boolean // is carrying a log
  logsPlaced: number // logs contributed to shared SOS
  status: 'alive' | 'eliminated' | 'rescued'
  lastMoveTime: number // timestamp of last move
  turnsUsedToday: number // how many of 12 turns used this day
}

// Game state types
export enum GameStatus {
  Waiting = 'waiting', // waiting for second player to join
  Active = 'active', // both players present, game in progress
  Paused = 'paused', // waiting for player to make their move
  Rescued = 'rescued', // player(s) rescued, game over
  Abandoned = 'abandoned', // player left
}

export interface GameState {
  id: string
  code: string // shareable game code (6 chars)
  status: GameStatus
  currentPlayerFaction: Faction // whose turn it is
  dayNumber: number
  currentTurnInDay: number // 0-11 of 12
  createdAt: number
  updatedAt: number
  mapSeed: number
  sosPositions: Array<{ x: number; y: number }> // shared SOS log positions
  rescuedPlayers: string[] // player IDs who escaped
}

// Move types
export enum MoveType {
  Move = 'move', // move to adjacent tile
  PlaceLog = 'place_log', // place log at current tile (if on beach)
  Wait = 'wait', // skip turn
}

export interface Move {
  id: string
  playerId: string
  gameId: string
  dayNumber: number
  turnInDay: number // 0-11
  moveType: MoveType
  x: number
  y: number
  timestamp: number
}

// Encounter/RPS types
export enum RPSChoice {
  Rock = 'rock',
  Paper = 'paper',
  Scissors = 'scissors',
}

export interface Encounter {
  id: string
  gameId: string
  playerId1: string
  playerId2: string
  choice1: RPSChoice
  choice2: RPSChoice
  winnerId: string // who won RPS
  loserId: string
  loserChoice: 'death' | 'switch_faction' // what loser chose
  timestamp: number
}
