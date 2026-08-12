'use client'

import { useEffect, useRef } from 'react'
import { GridState, Player } from '@/lib/types'
import * as C from '@/lib/constants'

interface GameCanvasProps {
  grid: GridState
  player: Player
  onTileClick: (x: number, y: number) => void
}

const TILE_COLORS = {
  water: '#0a2540',
  shore: '#1a4d5c',
  beach: '#d4a76a',
  jungle: '#2d5a3d',
  mountain: '#4a4a4a',
}

const FOG_COLOR = 'rgba(10, 14, 39, 0.7)'

export default function GameCanvas({
  grid,
  player,
  onTileClick,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = C.VIEWPORT_WIDTH * C.TILE_SIZE
    canvas.height = C.VIEWPORT_HEIGHT * C.TILE_SIZE

    // Calculate viewport center on player
    const viewportStartX = Math.max(0, Math.min(player.x - Math.floor(C.VIEWPORT_WIDTH / 2), grid.width - C.VIEWPORT_WIDTH))
    const viewportStartY = Math.max(0, Math.min(player.y - Math.floor(C.VIEWPORT_HEIGHT / 2), grid.height - C.VIEWPORT_HEIGHT))

    // Draw tiles
    for (let y = 0; y < C.VIEWPORT_HEIGHT; y++) {
      for (let x = 0; x < C.VIEWPORT_WIDTH; x++) {
        const gridX = viewportStartX + x
        const gridY = viewportStartY + y

        const tile = grid.tiles.get(`${gridX},${gridY}`)
        if (!tile) continue

        const canvasX = x * C.TILE_SIZE
        const canvasY = y * C.TILE_SIZE

        // Draw tile base color
        ctx.fillStyle = TILE_COLORS[tile.type as keyof typeof TILE_COLORS] || '#1a1f3a'
        ctx.fillRect(canvasX, canvasY, C.TILE_SIZE, C.TILE_SIZE)

        // Draw log indicator
        if (tile.hasLog && tile.isRevealed) {
          ctx.fillStyle = '#ffaa00'
          ctx.fillRect(canvasX + 5, canvasY + 5, 6, 6)
        }

        // Draw tile border
        ctx.strokeStyle = 'rgba(34, 229, 255, 0.1)'
        ctx.lineWidth = 0.5
        ctx.strokeRect(canvasX, canvasY, C.TILE_SIZE, C.TILE_SIZE)

        // Apply fog of war if unrevealed
        if (!tile.isRevealed) {
          ctx.fillStyle = FOG_COLOR
          ctx.fillRect(canvasX, canvasY, C.TILE_SIZE, C.TILE_SIZE)
          // Diagonal lines for unrevealed
          ctx.strokeStyle = 'rgba(34, 229, 255, 0.05)'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(canvasX, canvasY)
          ctx.lineTo(canvasX + C.TILE_SIZE, canvasY + C.TILE_SIZE)
          ctx.stroke()
        }
      }
    }

    // Draw player
    const playerCanvasX = (player.x - viewportStartX) * C.TILE_SIZE + C.TILE_SIZE / 2
    const playerCanvasY = (player.y - viewportStartY) * C.TILE_SIZE + C.TILE_SIZE / 2

    ctx.fillStyle = player.faction === 'pirates' ? '#ff6b35' : '#4a90e2'
    ctx.beginPath()
    ctx.arc(playerCanvasX, playerCanvasY, 4, 0, Math.PI * 2)
    ctx.fill()

    // Draw outline
    ctx.strokeStyle = '#22e5ff'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Draw carrying indicator
    if (player.carrying) {
      ctx.fillStyle = '#ffaa00'
      ctx.fillRect(playerCanvasX - 2, playerCanvasY - 6, 4, 3)
    }
  }, [grid, player])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / C.TILE_SIZE)
    const y = Math.floor((e.clientY - rect.top) / C.TILE_SIZE)

    // Convert from viewport coordinates to grid coordinates
    const viewportStartX = Math.max(0, Math.min(player.x - Math.floor(C.VIEWPORT_WIDTH / 2), grid.width - C.VIEWPORT_WIDTH))
    const viewportStartY = Math.max(0, Math.min(player.y - Math.floor(C.VIEWPORT_HEIGHT / 2), grid.height - C.VIEWPORT_HEIGHT))

    const gridX = viewportStartX + x
    const gridY = viewportStartY + y

    onTileClick(gridX, gridY)
  }

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      style={{
        border: '2px solid #22e5ff',
        cursor: 'crosshair',
        width: C.VIEWPORT_WIDTH * C.TILE_SIZE,
        height: C.VIEWPORT_HEIGHT * C.TILE_SIZE,
      }}
    />
  )
}
