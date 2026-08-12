// Map configuration
export const MAP_WIDTH = 64
export const MAP_HEIGHT = 48
export const TILE_SIZE = 16 // pixels
export const VIEWPORT_WIDTH = 20 // tiles visible
export const VIEWPORT_HEIGHT = 15 // tiles visible

// Turn/day mechanics
export const TURNS_PER_DAY = 12
export const MAX_GAME_DAYS = 999 // no hard limit, game ends when rescued

// Movement
export const MOVE_COST = 1 // 1 turn per adjacent tile move

// SOS mechanics
export const LOGS_REQUIRED_FOR_SOS = 14 // total logs needed to spell SOS
export const LOGS_PER_TURN_PLACEMENT = 1 // can place 1 log per turn

// Log spawn mechanics (finite resource)
export const LOG_SPAWN_CHANCE_JUNGLE = 0.4 // on unrevealed jungle tiles
export const LOG_SPAWN_CHANCE_BEACH = 0.15 // on unrevealed beach tiles
export const LOG_SPAWN_CHANCE_SHORE = 0.2 // on unrevealed shore tiles

// Rescue mechanics
export const RESCUE_TILE_TYPE = 'beach' // must be on beach to rescue
export const RESCUE_TURNS_REQUIRED = 1 // how many turns to actually leave after both on beach

// Faction spawn distribution
export const PIRATE_SPAWN_QUADRANT = 'ne' // northeast
export const NAVY_SPAWN_QUADRANT = 'sw' // southwest

// Turn timing (in milliseconds)
export const TURN_TIME_LIMIT = 300000 // 5 minutes per turn
export const MOVE_ANIMATION_DURATION = 200

// Tile generation
export const WATER_COVERAGE = 0.30 // 30% water
export const MOUNTAIN_COVERAGE = 0.12 // 12% mountains
export const JUNGLE_COVERAGE = 0.48 // 48% jungle
export const BEACH_COVERAGE = 0.10 // 10% beach
