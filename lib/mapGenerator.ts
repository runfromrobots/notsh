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
  // Better hash function to avoid left/right bias
  let h = seed
  h = ((h ^ (x * 73856093)) >>> 0)
  h = ((h ^ (y * 19349663)) >>> 0)
  h = h ^ (h >> 16)
  h = Math.imul(h, 2246822519)
  h = h ^ (h >> 13)
  return ((h >>> 0) % 1000000) / 1000000
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

function findEdgeWater(tiles: Tile[]): Set<string> {
  const tilesMap = new Map<string, Tile>()

  // Index all tiles by position
  for (const tile of tiles) {
    tilesMap.set(`${tile.x},${tile.y}`, tile)
  }

  // Start flood fill from all water on the edges
  const visited = new Set<string>()
  const queue: Array<[number, number]> = []

  // Add all edge water tiles to queue
  for (const tile of tiles) {
    if (tile.type === TileType.Water) {
      if (tile.x === 0 || tile.x === C.MAP_WIDTH - 1 || tile.y === 0 || tile.y === C.MAP_HEIGHT - 1) {
        const key = `${tile.x},${tile.y}`
        queue.push([tile.x, tile.y])
        visited.add(key)
      }
    }
  }

  // Flood fill to find all water connected to edges
  while (queue.length > 0) {
    const [x, y] = queue.shift()!

    for (const [dx, dy] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
      const nx = x + dx
      const ny = y + dy
      const neighborKey = `${nx},${ny}`

      if (!visited.has(neighborKey) && nx >= 0 && nx < C.MAP_WIDTH && ny >= 0 && ny < C.MAP_HEIGHT) {
        const neighbor = tilesMap.get(neighborKey)
        if (neighbor && neighbor.type === TileType.Water) {
          visited.add(neighborKey)
          queue.push([nx, ny])
        }
      }
    }
  }

  return visited
}

function ensureSingleIsland(tiles: Tile[]): Tile[] {
  // Find all water connected to map edges
  const edgeWater = findEdgeWater(tiles)

  // Convert inner water to jungle, keep edge water as water
  return tiles.map(tile => {
    const key = `${tile.x},${tile.y}`

    if (tile.type === TileType.Water && !edgeWater.has(key)) {
      // Inner water becomes jungle with potential logs
      return { ...tile, type: TileType.Jungle, hasLog: Math.random() < C.LOG_SPAWN_CHANCE_JUNGLE }
    }

    // Everything else stays the same
    return tile
  })
}

export function generateIslandName(seed: number): string {
  const adjectives = ['Dinghy', 'Skull', 'Treasure', 'Lost', 'Hidden', 'Whisper', 'Storm', 'Golden', 'Crimson', 'Silent', 'Mystic', 'Dragon']
  const nouns = ['Island', 'Key', 'Cove', 'Point', 'Reef', 'Haven', 'Shoal', 'Atoll', 'Cape', 'Islet']

  const rng = new SeededRandom(seed)
  const adjIdx = Math.floor(rng.next() * adjectives.length)
  const nounIdx = Math.floor(rng.next() * nouns.length)

  return `${adjectives[adjIdx]} ${nouns[nounIdx]}`
}

export function generateMap(seed: number): GridState {
  const tiles: Tile[] = []
  const rng = new SeededRandom(seed)
  const centerX = C.MAP_WIDTH / 2
  const centerY = C.MAP_HEIGHT / 2
  const islandRadius = 20 // Fixed radius for the island

  // Generate island based on distance from center
  for (let y = 0; y < C.MAP_HEIGHT; y++) {
    for (let x = 0; x < C.MAP_WIDTH; x++) {
      // Simple distance check
      const dx = x - centerX
      const dy = y - centerY
      const dist = Math.sqrt(dx * dx + dy * dy)

      // Use noise to add organic variation to island edge
      const noise = perlinNoise(x, y, seed)
      const adjustedRadius = islandRadius + (noise - 0.5) * 4 // ±2 tile variation

      let type: TileType
      if (dist > adjustedRadius) {
        type = TileType.Water
      } else {
        // Land - assign terrain type based on noise
        if (noise < 0.10) type = TileType.Mountain
        else if (noise < 0.25) type = TileType.Beach
        else if (noise < 0.75) type = TileType.Jungle
        else type = TileType.Beach
      }

      const hasLog = type !== TileType.Water && type !== TileType.Mountain && shouldSpawnLog(type, rng)

      tiles.push({
        x,
        y,
        type,
        hasLog,
        isRevealed: false,
      })
    }
  }

  const tilesMap = new Map<string, Tile>()
  for (const tile of tiles) {
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
