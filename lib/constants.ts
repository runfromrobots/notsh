// Map configuration
export const MAP_WIDTH = 64
export const MAP_HEIGHT = 48
export const TILE_SIZE = 16 // pixels
export const VIEWPORT_WIDTH = 20 // tiles visible
export const VIEWPORT_HEIGHT = 15 // tiles visible

// Game mechanics
export const INITIAL_REVEAL_BUDGET = 6 // moves per turn
export const WEATHER_DELAY_CHANCE = 0.3 // 30% chance
export const WEATHER_DELAY_AMOUNT = 1 // reduce budget by 1
export const BACKTRACK_LOG_COST = 1
export const MAX_CARRY_LOGS = 1

// Faction spawn distribution
export const PIRATE_SPAWN_QUADRANT = 'ne' // northeast
export const NAVY_SPAWN_QUADRANT = 'sw' // southwest

// SOS mechanics
export const SOS_LETTERS_REQUIRED = 3 // S, O, S
export const LOGS_PER_LETTER = 1
export const LOG_SPACING_MIN = 2 // min tiles between logs

// Rescue mechanics
export const RESCUE_DEPARTURE_RADIUS = 5 // tiles around departure point
export const RESCUE_DEPARTURE_X = MAP_WIDTH / 2
export const RESCUE_DEPARTURE_Y = MAP_HEIGHT / 2

// Turn timing (in milliseconds)
export const TURN_TIME_LIMIT = 300000 // 5 minutes per turn
export const MOVE_ANIMATION_DURATION = 200

// Tile generation
export const WATER_COVERAGE = 0.4 // 40% water
export const MOUNTAIN_COVERAGE = 0.15 // 15% mountains
export const JUNGLE_COVERAGE = 0.35 // 35% jungle (has logs)
export const BEACH_COVERAGE = 0.1 // 10% beach (sometimes has logs)

// Log spawn rates
export const LOG_SPAWN_CHANCE_JUNGLE = 0.4
export const LOG_SPAWN_CHANCE_BEACH = 0.1
