'use client'

import { useState, useEffect, useRef } from 'react'
import { generateMap } from '@/lib/mapGenerator'
import styles from './explore-test.module.css'

export const dynamic = 'force-dynamic'

interface Tile {
  x: number
  y: number
  type: string
  isRevealed: boolean
  hasLog: boolean
}

const TILE_COLORS: Record<string, string> = {
  water: '#1e6b9e',
  mountain: '#5a4d3a',
  jungle: '#2d5a2d',
  beach: '#c9a961',
  shore: '#7a8fa3',
  mountain_base: '#5a4d3a',
  mountain_mid: '#888888',
  mountain_peak: '#f0f0f0',
}

const TILE_SIZE = 20
const VIEWPORT_WIDTH = 20
const VIEWPORT_HEIGHT = 15
const MAP_SEED = 12345

export default function ExploreTest() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [playerX, setPlayerX] = useState(32)
  const [playerY, setPlayerY] = useState(32)
  const [revealedTiles, setRevealedTiles] = useState<Set<string>>(new Set())
  const [mapData, setMapData] = useState<Map<string, Tile> | null>(null)
  const [tilesList, setTilesList] = useState<Tile[]>([])

  // Initialize map
  useEffect(() => {
    const map = generateMap(MAP_SEED)
    setMapData(map.tiles)
    const tiles = Array.from(map.tiles.values())
    setTilesList(tiles)

    // Reveal starting area
    const revealed = new Set<string>()
    tiles.forEach(tile => {
      if (Math.abs(tile.x - playerX) <= 1 && Math.abs(tile.y - playerY) <= 1) {
        revealed.add(`${tile.x},${tile.y}`)
      }
    })
    setRevealedTiles(revealed)
  }, [])

  // Handle arrow key movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let newX = playerX
      let newY = playerY

      switch (e.key) {
        case 'ArrowUp':
          newY = Math.max(0, playerY - 1)
          e.preventDefault()
          break
        case 'ArrowDown':
          newY = Math.min(63, playerY + 1)
          e.preventDefault()
          break
        case 'ArrowLeft':
          newX = Math.max(0, playerX - 1)
          e.preventDefault()
          break
        case 'ArrowRight':
          newX = Math.min(63, playerX + 1)
          e.preventDefault()
          break
        default:
          return
      }

      if (newX !== playerX || newY !== playerY) {
        setPlayerX(newX)
        setPlayerY(newY)

        // Reveal tiles in 1-tile radius
        const newRevealed = new Set(revealedTiles)
        tilesList.forEach(tile => {
          if (Math.abs(tile.x - newX) <= 1 && Math.abs(tile.y - newY) <= 1) {
            newRevealed.add(`${tile.x},${tile.y}`)
          }
        })
        setRevealedTiles(newRevealed)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [playerX, playerY, tilesList, revealedTiles])

  // Render map
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || tilesList.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = playerX
    const centerY = playerY
    const startX = Math.max(0, centerX - Math.floor(VIEWPORT_WIDTH / 2))
    const startY = Math.max(0, centerY - Math.floor(VIEWPORT_HEIGHT / 2))

    ctx.fillStyle = '#0D1117'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw tiles
    for (let y = 0; y < VIEWPORT_HEIGHT; y++) {
      for (let x = 0; x < VIEWPORT_WIDTH; x++) {
        const mapX = startX + x
        const mapY = startY + y

        const tile = tilesList.find((t) => t.x === mapX && t.y === mapY)
        const canvasX = x * TILE_SIZE
        const canvasY = y * TILE_SIZE
        const isRevealed = revealedTiles.has(`${mapX},${mapY}`)

        if (tile) {
          // Draw tile
          ctx.fillStyle = isRevealed ? (TILE_COLORS[tile.type] || '#444444') : '#1a1a2e'
          ctx.fillRect(canvasX, canvasY, TILE_SIZE, TILE_SIZE)

          // Draw grid
          ctx.strokeStyle = '#333333'
          ctx.lineWidth = 0.5
          ctx.strokeRect(canvasX, canvasY, TILE_SIZE, TILE_SIZE)

          // Draw coordinates if revealed
          if (isRevealed) {
            ctx.fillStyle = '#ffffff'
            ctx.font = '8px monospace'
            ctx.fillText(`${mapX},${mapY}`, canvasX + 2, canvasY + 9)
          }
        }
      }
    }

    // Draw player
    const playerCanvasX = (playerX - startX) * TILE_SIZE + TILE_SIZE / 2
    const playerCanvasY = (playerY - startY) * TILE_SIZE + TILE_SIZE / 2

    ctx.fillStyle = '#00FF00'
    ctx.beginPath()
    ctx.arc(playerCanvasX, playerCanvasY, 6, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = '#FFD700'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(playerCanvasX, playerCanvasY, 8, 0, Math.PI * 2)
    ctx.stroke()
  }, [playerX, playerY, tilesList, revealedTiles])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Map Exploration Test</h1>
        <p>Use arrow keys to move around freely</p>
        <p className={styles.position}>
          Position: ({playerX}, {playerY}) | Revealed tiles: {revealedTiles.size}
        </p>
      </div>

      <div className={styles.gameArea}>
        <canvas
          ref={canvasRef}
          width={VIEWPORT_WIDTH * TILE_SIZE}
          height={VIEWPORT_HEIGHT * TILE_SIZE}
          className={styles.canvas}
        />
      </div>

      <div className={styles.controls}>
        <p>Arrow Keys: Move</p>
        <p>Green dot = Your position</p>
        <p>Dark tiles = Unexplored</p>
        <p>Colored tiles = Explored</p>
      </div>
    </div>
  )
}
