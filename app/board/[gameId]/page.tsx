'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import styles from './board.module.css'

interface Tile {
  x: number
  y: number
  type: string
  isRevealed: boolean
  hasLog: boolean
}

interface Player {
  id: string
  name: string
  faction: string
  x: number
  y: number
  carrying: boolean
  logsPlaced: number
  status: string
  turnsUsedToday: number
}

interface Game {
  id: string
  code: string
  status: string
  currentPlayerFaction: string
  dayNumber: number
  currentTurnInDay: number
  sosPositions: Array<{ x: number; y: number }>
  rescuedPlayers: string[]
}

const TILE_COLORS: Record<string, string> = {
  water: '#1e6b9e',
  mountain: '#5a4d3a',
  jungle: '#2d5a2d',
  beach: '#c9a961',
  shore: '#7a8fa3',
}

const TILE_SIZE = 20
const VIEWPORT_WIDTH = 20
const VIEWPORT_HEIGHT = 15

export default function Board() {
  const router = useRouter()
  const params = useParams()
  const gameId = params.gameId as string

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [game, setGame] = useState<Game | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [tiles, setTiles] = useState<Tile[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [playerName, setPlayerName] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedAction, setSelectedAction] = useState<'move' | 'place-log' | null>(null)
  const [showRPSModal, setShowRPSModal] = useState(false)
  const [showRescueModal, setShowRescueModal] = useState(false)
  const [showCoinFlip, setShowCoinFlip] = useState(false)
  const [coinFlipping, setCoinFlipping] = useState(false)
  const [coinResult, setCoinResult] = useState<'heads' | 'tails' | null>(null)
  const [playerChoice, setPlayerChoice] = useState<'heads' | 'tails' | null>(null)

  useEffect(() => {
    const name = localStorage.getItem('playerName')
    if (name) {
      setPlayerName(name)
      // Only fetch after playerName is known
      fetchGameState()
      const interval = setInterval(fetchGameState, 2000)
      return () => clearInterval(interval)
    }
  }, [gameId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (playerName && players.length > 0) {
      const current = players.find((p: Player) => p.name === playerName) || null
      setCurrentPlayer(current)
    }
  }, [playerName, players])

  useEffect(() => {
    // Show coin flip if both players joined but currentPlayerFaction is not set yet
    if (players.length === 2 && !game?.currentPlayerFaction && !coinFlipping && !coinResult) {
      console.log('[CoinFlip] Condition met: showing coin flip modal')
      setShowCoinFlip(true)
    } else if (players.length === 2 && game?.currentPlayerFaction) {
      console.log('[CoinFlip] currentPlayerFaction is set, closing modal')
      setShowCoinFlip(false)
    }
  }, [players.length, game?.currentPlayerFaction, coinFlipping, coinResult])

  useEffect(() => {
    if (canvasRef.current && (tiles?.length || 0) > 0 && currentPlayer) {
      renderMap()
    }
  }, [tiles, currentPlayer, game]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentPlayer || !game) return

      // Check if it's this player's turn
      if (game.currentPlayerFaction !== currentPlayer.faction) return

      let targetX = currentPlayer.x
      let targetY = currentPlayer.y

      switch (e.key) {
        case 'ArrowUp':
          targetY = Math.max(0, currentPlayer.y - 1)
          e.preventDefault()
          break
        case 'ArrowDown':
          targetY = Math.min(63, currentPlayer.y + 1)
          e.preventDefault()
          break
        case 'ArrowLeft':
          targetX = Math.max(0, currentPlayer.x - 1)
          e.preventDefault()
          break
        case 'ArrowRight':
          targetX = Math.min(63, currentPlayer.x + 1)
          e.preventDefault()
          break
        default:
          return
      }

      // Only move if position actually changed
      if (targetX !== currentPlayer.x || targetY !== currentPlayer.y) {
        handleMove(targetX, targetY)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentPlayer, game]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchGameState = async () => {
    try {
      const res = await fetch(`/api/games?id=${gameId}`)
      if (res.ok) {
        const data = await res.json()
        console.log('[GameState] Fetched:', {
          players: data.players?.length || 0,
          currentPlayerFaction: data.game?.currentPlayerFaction,
          dayNumber: data.game?.dayNumber,
          currentTurnInDay: data.game?.currentTurnInDay,
        })
        setGame(data.game)
        setPlayers(data.players || [])
        setTiles(data.tiles || [])
        setLoading(false)

        // Check if game is over
        if (data.game?.status === 'rescued') {
          router.push(`/results/${gameId}`)
        }
      }
    } catch (error) {
      console.error('Failed to fetch game state:', error)
    }
  }

  const fetchGameStateWithName = async (name: string) => {
    await fetchGameState()
  }

  const renderMap = () => {
    const canvas = canvasRef.current
    if (!canvas || !currentPlayer) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = currentPlayer.x
    const centerY = currentPlayer.y
    const startX = Math.max(0, centerX - Math.floor(VIEWPORT_WIDTH / 2))
    const startY = Math.max(0, centerY - Math.floor(VIEWPORT_HEIGHT / 2))

    ctx.fillStyle = '#0D1117'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw tiles
    for (let y = 0; y < VIEWPORT_HEIGHT; y++) {
      for (let x = 0; x < VIEWPORT_WIDTH; x++) {
        const mapX = startX + x
        const mapY = startY + y

        const tile = tiles.find((t) => t.x === mapX && t.y === mapY)
        const canvasX = x * TILE_SIZE
        const canvasY = y * TILE_SIZE

        if (tile) {
          // Draw tile
          ctx.fillStyle = tile.isRevealed ? TILE_COLORS[tile.type] : '#1a1a2e'
          ctx.fillRect(canvasX, canvasY, TILE_SIZE, TILE_SIZE)

          // Draw grid
          ctx.strokeStyle = '#333333'
          ctx.lineWidth = 0.5
          ctx.strokeRect(canvasX, canvasY, TILE_SIZE, TILE_SIZE)

          // Draw log indicator
          if (tile.hasLog && tile.isRevealed) {
            ctx.fillStyle = '#FFD700'
            ctx.fillRect(canvasX + 4, canvasY + 4, TILE_SIZE - 8, TILE_SIZE - 8)
          }
        }
      }
    }

    // Draw SOS positions
    if (game?.sosPositions) {
      for (const pos of game.sosPositions) {
        const x = pos.x - startX
        const y = pos.y - startY

        if (x >= 0 && x < VIEWPORT_WIDTH && y >= 0 && y < VIEWPORT_HEIGHT) {
          const canvasX = x * TILE_SIZE
          const canvasY = y * TILE_SIZE

          ctx.fillStyle = '#FF1744'
          ctx.fillRect(canvasX + 2, canvasY + 2, TILE_SIZE - 4, TILE_SIZE - 4)
        }
      }
    }

    // Draw players
    for (const player of players) {
      if (player.status !== 'alive') continue

      const x = player.x - startX
      const y = player.y - startY

      if (x >= 0 && x < VIEWPORT_WIDTH && y >= 0 && y < VIEWPORT_HEIGHT) {
        const canvasX = x * TILE_SIZE + TILE_SIZE / 2
        const canvasY = y * TILE_SIZE + TILE_SIZE / 2

        ctx.fillStyle =
          player.faction === 'pirates' ? '#FF1744' : '#00BCD4'
        ctx.beginPath()
        ctx.arc(canvasX, canvasY, 5, 0, Math.PI * 2)
        ctx.fill()

        // Highlight current player
        if (player.id === currentPlayer.id) {
          ctx.strokeStyle = '#FFD700'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(canvasX, canvasY, 7, 0, Math.PI * 2)
          ctx.stroke()
        }
      }
    }
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentPlayer || !game) return
    if (game.currentPlayerFaction !== currentPlayer.faction) return
    if (!selectedAction) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const tileX = Math.floor(x / TILE_SIZE)
    const tileY = Math.floor(y / TILE_SIZE)

    const centerX = currentPlayer.x
    const centerY = currentPlayer.y
    const startX = Math.max(0, centerX - Math.floor(VIEWPORT_WIDTH / 2))
    const startY = Math.max(0, centerY - Math.floor(VIEWPORT_HEIGHT / 2))

    const mapX = startX + tileX
    const mapY = startY + tileY

    if (selectedAction === 'move') {
      handleMove(mapX, mapY)
    }
  }

  const handleMove = async (targetX: number, targetY: number) => {
    if (!currentPlayer) return

    try {
      const res = await fetch(`/api/games/${gameId}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: currentPlayer.id,
          targetX,
          targetY,
        }),
      })

      if (res.ok) {
        setSelectedAction(null)
        fetchGameState()
      } else {
        const error = await res.json()
        alert(`Move failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Move error:', error)
      alert('Failed to process move')
    }
  }

  const handlePlaceLog = async () => {
    if (!currentPlayer) return

    try {
      const res = await fetch(`/api/games/${gameId}/place-log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: currentPlayer.id }),
      })

      if (res.ok) {
        setSelectedAction(null)
        fetchGameState()
      } else {
        const error = await res.json()
        alert(`Failed to place log: ${error.error}`)
      }
    } catch (error) {
      console.error('Place log error:', error)
    }
  }

  const handleCoinFlip = async (choice: 'heads' | 'tails') => {
    console.log('[CoinFlip] User chose:', choice)
    setPlayerChoice(choice)
    setCoinFlipping(true)

    // Simulate coin flip animation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Random result
    const result = Math.random() > 0.5 ? 'heads' : 'tails'
    console.log('[CoinFlip] Result:', result)
    setCoinResult(result)

    // Determine winner faction
    const winnerFaction = result === 'heads' ? 'pirates' : 'navy'
    console.log('[CoinFlip] Starting faction:', winnerFaction)

    // Set the starting faction
    try {
      const flipRes = await fetch(`/api/games/${gameId}/coin-flip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startingFaction: winnerFaction }),
      })
      const flipData = await flipRes.json()
      console.log('[CoinFlip] Endpoint response:', flipData)

      // Wait a bit for dramatic effect, then close modal and fetch updated state
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setShowCoinFlip(false)
      fetchGameState()
    } catch (error) {
      console.error('[CoinFlip] Error:', error)
      alert('Failed to set starting player')
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Loading game board...</p>
      </div>
    )
  }

  const isYourTurn = currentPlayer && game?.currentPlayerFaction === currentPlayer.faction
  const opponent = players.find((p) => p.id !== currentPlayer?.id)
  const turnDisplay = isYourTurn ? 'Your Turn' : (opponent?.name ? `${opponent.name}'s Turn` : 'Waiting for opponent...')

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.gameInfo}>
          <h1>SOS - Day {game?.dayNumber || 1}</h1>
          <p className={styles.turnInfo}>
            Turn {game?.currentTurnInDay || 0}/12 - {turnDisplay}
          </p>
          {game?.code && (
            <p className={styles.gameCode}>Code: {game.code}</p>
          )}
        </div>
      </div>

      <div className={styles.gameArea}>
        <div className={styles.mapSection}>
          <canvas
            ref={canvasRef}
            width={VIEWPORT_WIDTH * TILE_SIZE}
            height={VIEWPORT_HEIGHT * TILE_SIZE}
            onClick={handleCanvasClick}
            className={styles.canvas}
          />
          {selectedAction && (
            <p className={styles.hint}>
              {selectedAction === 'move' ? 'Click tile to move' : 'Click beach tile to place log'}
            </p>
          )}
        </div>

        <div className={styles.sidebar}>
          <div className={styles.playerInfo}>
            <h2>{currentPlayer?.name}</h2>
            <p className={styles.faction}>{currentPlayer?.faction.toUpperCase()}</p>
            <p className={styles.position}>
              Position: ({currentPlayer?.x}, {currentPlayer?.y})
            </p>
            <p className={styles.stats}>
              Logs Placed: {currentPlayer?.logsPlaced}/{game?.sosPositions?.length || 0}
            </p>
            {currentPlayer?.carrying && (
              <p className={styles.carrying}>📦 Carrying Log</p>
            )}
          </div>

          <div className={styles.movementControls}>
            <button
              onClick={() => handleMove(currentPlayer!.x, Math.max(0, currentPlayer!.y - 1))}
              disabled={!isYourTurn}
              className={styles.arrowBtn}
              title="Move Up"
            >
              ▲
            </button>
            <div className={styles.arrowRow}>
              <button
                onClick={() => handleMove(Math.max(0, currentPlayer!.x - 1), currentPlayer!.y)}
                disabled={!isYourTurn}
                className={styles.arrowBtn}
                title="Move Left"
              >
                ◀
              </button>
              <button
                onClick={() => handleMove(Math.min(63, currentPlayer!.x + 1), currentPlayer!.y)}
                disabled={!isYourTurn}
                className={styles.arrowBtn}
                title="Move Right"
              >
                ▶
              </button>
            </div>
            <button
              onClick={() => handleMove(currentPlayer!.x, Math.min(63, currentPlayer!.y + 1))}
              disabled={!isYourTurn}
              className={styles.arrowBtn}
              title="Move Down"
            >
              ▼
            </button>
          </div>

          {isYourTurn && (
            <div className={styles.actions}>
              <button
                onClick={() => setSelectedAction('move')}
                className={`${styles.actionBtn} ${selectedAction === 'move' ? styles.active : ''}`}
              >
                Move
              </button>
              {currentPlayer?.carrying && (
                <button
                  onClick={handlePlaceLog}
                  className={styles.actionBtn}
                >
                  Place Log
                </button>
              )}
            </div>
          )}

          {game?.sosPositions && (game.sosPositions?.length || 0) >= 14 && currentPlayer?.x === opponent?.x && currentPlayer?.y === opponent?.y && (
            <button onClick={() => setShowRescueModal(true)} className={styles.rescueBtn}>
              🚁 Rescue!
            </button>
          )}
        </div>
      </div>

      {/* RPS Modal */}
      {showRPSModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Rock Paper Scissors!</h2>
            <p>You encountered an opponent!</p>
            {/* RPS will be implemented next */}
          </div>
        </div>
      )}

      {/* Rescue Modal */}
      {showRescueModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Rescued! 🎉</h2>
            <button onClick={() => router.push(`/results/${gameId}`)}>
              View Results
            </button>
          </div>
        </div>
      )}

      {/* Coin Flip Modal */}
      {showCoinFlip && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Who Goes First?</h2>
            {!coinFlipping ? (
              <>
                <p>Call the coin flip!</p>
                <div className={styles.coinFlipButtons}>
                  <button
                    onClick={() => handleCoinFlip('heads')}
                    className={styles.coinBtn}
                  >
                    🪙 Heads
                  </button>
                  <button
                    onClick={() => handleCoinFlip('tails')}
                    className={styles.coinBtn}
                  >
                    🪙 Tails
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className={styles.coinAnimation}>🪙</div>
                {coinResult && (
                  <>
                    <p className={styles.coinResultText}>
                      The coin landed on <strong>{coinResult.toUpperCase()}</strong>!
                    </p>
                    <p className={styles.coinWinner}>
                      {(currentPlayer?.faction === 'pirates' && coinResult === 'heads') ||
                       (currentPlayer?.faction === 'navy' && coinResult === 'tails')
                        ? '✨ You go first! ✨'
                        : '⏳ Opponent goes first'}
                    </p>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
