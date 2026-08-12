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

function getTile(x: number, y: number, tiles: Tile[]): Tile | null {
  if (x < 0 || x >= C.MAP_WIDTH || y < 0 || y >= C.MAP_HEIGHT) return null
  return tiles[y * C.MAP_WIDTH + x] || null
}

function findLargestLandmass(tiles: Tile[]): Set<string> {
  const tilesMap = new Map<string, Tile>()

  // Index all tiles by position
  for (const tile of tiles) {
    tilesMap.set(`${tile.x},${tile.y}`, tile)
  }

  // Find all connected components using navigable + mountain tiles
  const visited = new Set<string>()
  const components: Set<string>[] = []

  for (const tile of tiles) {
    const key = `${tile.x},${tile.y}`

    // Start component from any land tile (navigable or mountain)
    if (!visited.has(key) && (isNavigable(tile.type) || tile.type === TileType.Mountain)) {
      const component = new Set<string>()
      const queue: Array<[number, number]> = [[tile.x, tile.y]]
      component.add(key)
      visited.add(key)

      while (queue.length > 0) {
        const [x, y] = queue.shift()!

        // Check all 4 cardinal directions
        for (const [dx, dy] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
          const nx = x + dx
          const ny = y + dy
          const neighborKey = `${nx},${ny}`

          if (!visited.has(neighborKey)) {
            const neighbor = tilesMap.get(neighborKey)
            // Include navigable tiles and mountains in connectivity
            if (neighbor && (isNavigable(neighbor.type) || neighbor.type === TileType.Mountain)) {
              visited.add(neighborKey)
              component.add(neighborKey)
              queue.push([nx, ny])
            }
          }
        }
      }

      components.push(component)
    }
  }

  // Return the largest landmass
  let largest = new Set<string>()
  for (const component of components) {
    if (component.size > largest.size) {
      largest = component
    }
  }

  return largest
}

function ensureSingleIsland(tiles: Tile[]): Tile[] {
  // Find the largest connected landmass (navigable + mountains)
  const island = findLargestLandmass(tiles)

  // Convert all other tiles to water (both navigable land and mountains)
  return tiles.map(tile => {
    const key = `${tile.x},${tile.y}`
    if ((isNavigable(tile.type) || tile.type === TileType.Mountain) && !island.has(key)) {
      return { ...tile, type: TileType.Water, hasLog: false }
    }
    return tile
  })
}

export function generateMap(seed: number): GridState {
  const tiles: Tile[] = []
  const rng = new SeededRandom(seed)

  // Generate base terrain using noise
  for (let y = 0; y < C.MAP_HEIGHT; y++) {
    for (let x = 0; x < C.MAP_WIDTH; x++) {
      const noise = perlinNoise(x, y, seed)
      let type = getTileType(noise)

      // Add some shore tiles between water and land (more natural coastlines)
      const isEdge = x < 3 || x > C.MAP_WIDTH - 4 || y < 3 || y > C.MAP_HEIGHT - 4
      if (isEdge && type !== TileType.Water && type !== TileType.Mountain) {
        if (rng.next() > 0.6) type = TileType.Shore
      }

      const hasLog = isNavigable(type) && shouldSpawnLog(type, rng)

      tiles.push({
        x,
        y,
        type,
        hasLog,
        isRevealed: false,
      })
    }
  }

  // Ensure only ONE connected island exists
  // This keeps the largest landmass and converts all fragmented pieces to water
  const processedTiles = ensureSingleIsland(tiles)

  const tilesMap = new Map<string, Tile>()
  for (const tile of processedTiles) {
    tilesMap.set(`${tile.x},${tile.y}`, tile)
  }

  return {
    width: C.MAP_WIDTH,
    height: C.MAP_HEIGHT,
    tiles: tilesMap,
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
