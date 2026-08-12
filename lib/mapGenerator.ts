import { Tile, TileType, GridState } from './types'
import * as C from './constants'

// Seeded random number generator (linear congruential)
class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280
    return this.seed / 233280
  }
}

function perlinNoise(x: number, y: number, seed: number): number {
  const rng = new SeededRandom(seed + x * 73856093 ^ y * 19349663)
  return rng.next()
}

function getTileType(noise: number): TileType {
  if (noise < C.WATER_COVERAGE) return TileType.Water
  if (noise < C.WATER_COVERAGE + C.MOUNTAIN_COVERAGE) return TileType.Mountain
  if (noise < C.WATER_COVERAGE + C.MOUNTAIN_COVERAGE + C.BEACH_COVERAGE) {
    return TileType.Beach
  }
  if (noise < C.WATER_COVERAGE + C.MOUNTAIN_COVERAGE + C.BEACH_COVERAGE + C.JUNGLE_COVERAGE) {
    return TileType.Jungle
  }
  return TileType.Shore
}

function isNavigable(type: TileType): boolean {
  return type !== TileType.Water && type !== TileType.Mountain
}

function shouldSpawnLog(type: TileType, rng: SeededRandom): boolean {
  if (type === TileType.Jungle) return rng.next() < C.LOG_SPAWN_CHANCE_JUNGLE
  if (type === TileType.Beach) return rng.next() < C.LOG_SPAWN_CHANCE_BEACH
  return false
}

export function generateMap(seed: number): GridState {
  const tiles = new Map<string, Tile>()
  const rng = new SeededRandom(seed)

  // Generate island base layer
  for (let y = 0; y < C.MAP_HEIGHT; y++) {
    for (let x = 0; x < C.MAP_WIDTH; x++) {
      const noise = perlinNoise(x, y, seed)
      const type = getTileType(noise)

      // Add some shore tiles between water and land
      const isEdge = x < 3 || x > C.MAP_WIDTH - 4 || y < 3 || y > C.MAP_HEIGHT - 4
      let finalType = type
      if (isEdge && type !== TileType.Water && type !== TileType.Mountain) {
        if (rng.next() > 0.6) finalType = TileType.Shore
      }

      const hasLog = isNavigable(finalType) && shouldSpawnLog(finalType, rng)

      const key = `${x},${y}`
      tiles.set(key, {
        x,
        y,
        type: finalType,
        hasLog,
        isRevealed: false,
      })
    }
  }

  return {
    width: C.MAP_WIDTH,
    height: C.MAP_HEIGHT,
    tiles,
    seed,
  }
}

export function getTile(grid: GridState, x: number, y: number): Tile | undefined {
  if (x < 0 || x >= grid.width || y < 0 || y >= grid.height) return undefined
  return grid.tiles.get(`${x},${y}`)
}

export function getAdjacentTiles(grid: GridState, x: number, y: number): Tile[] {
  const adjacent: Tile[] = []
  const directions = [
    [0, -1], // up
    [1, -1], // up-right
    [1, 0],  // right
    [1, 1],  // down-right
    [0, 1],  // down
    [-1, 1], // down-left
    [-1, 0], // left
    [-1, -1], // up-left
  ]

  for (const [dx, dy] of directions) {
    const tile = getTile(grid, x + dx, y + dy)
    if (tile) adjacent.push(tile)
  }

  return adjacent
}
