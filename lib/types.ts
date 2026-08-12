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
  logs: number // total logs contributed to SOS
  status: 'alive' | 'eliminated' | 'rescued' | 'left_behind'
  lastMove: number // timestamp
  revealBudget: number // remaining moves this turn
}

// Game state types
export enum GameStatus {
  Waiting = 'waiting',
  Active = 'active',
  Completed = 'completed',
}

export interface GameState {
  id: string
  status: GameStatus
  currentTurn: number
  createdAt: number
  updatedAt: number
  mapSeed: number
  pirateSOS: { x: number; y: number }[] // log positions for pirate win
  navySOS: { x: number; y: number }[] // log positions for navy win
  rescueTriggered: boolean
  rescueTriggerTime?: number
  winnerFaction?: Faction
}

// Move types
export enum MoveType {
  Reveal = 'reveal',
  Backtrack = 'backtrack',
}

export interface Move {
  id: string
  playerId: string
  gameId: string
  turnNumber: number
  moveType: MoveType
  x: number
  y: number
  timestamp: number
}

// Encounter types
export enum EncounterOutcome {
  Elimination = 'elimination',
  FactionSwitch = 'faction_switch',
  Standoff = 'standoff',
}

export interface Encounter {
  id: string
  gameId: string
  playerId1: string
  playerId2: string
  outcome: EncounterOutcome
  winner?: string
  timestamp: number
}
