'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import styles from './lobby.module.css'

interface Player {
  id: string
  name: string
  faction: string
}

interface Game {
  id: string
  code: string
  status: string
}

export default function Lobby() {
  const router = useRouter()
  const params = useParams()
  const gameId = params.gameId as string

  const [game, setGame] = useState<Game | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [playerName, setPlayerName] = useState('')
  const [playerId, setPlayerId] = useState('')

  useEffect(() => {
    const name = localStorage.getItem('playerName')
    setPlayerName(name || '')
    fetchGameState()

    // Poll for game state changes every 2 seconds
    const interval = setInterval(fetchGameState, 2000)
    return () => clearInterval(interval)
  }, [gameId])

  const fetchGameState = async () => {
    try {
      const res = await fetch(`/api/games?id=${gameId}`)
      if (res.ok) {
        const data = await res.json()
        setGame(data.game)
        setPlayers(data.players || [])
        setLoading(false)

        // Auto-navigate to game board once both players are ready
        if (data.players?.length >= 2 && data.game?.status === 'active') {
          router.push(`/board/${gameId}`)
        }
      }
    } catch (error) {
      console.error('Failed to fetch game state:', error)
      setLoading(false)
    }
  }

  const handleStartGame = async () => {
    if (players.length < 2) {
      alert('Waiting for second player...')
      return
    }

    // Navigate to game board
    router.push(`/board/${gameId}`)
  }

  const handleCopyCode = () => {
    if (game?.code) {
      navigator.clipboard.writeText(game.code)
      alert('Game code copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <p>Loading game...</p>
        </div>
      </div>
    )
  }

  const yourFaction = players.find((p) => p.name === playerName)?.faction || 'Unknown'
  const opponentName = players.find((p) => p.name !== playerName)?.name
  const opponentFaction = players.find((p) => p.name !== playerName)?.faction
  const isReady = players.length >= 2

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>Game Lobby</h1>

        <div className={styles.codeSection}>
          <p className={styles.label}>Game Code</p>
          <div className={styles.codeSectionContent}>
            <span className={styles.code}>{game?.code}</span>
            <button onClick={handleCopyCode} className={styles.copyBtn}>
              Copy
            </button>
          </div>
          <p className={styles.hint}>Share this code with your opponent</p>
        </div>

        <div className={styles.playersSection}>
          <h2>Players</h2>

          <div className={styles.playersList}>
            <div className={styles.playerCard}>
              <p className={styles.playerName}>{playerName}</p>
              <p className={styles.faction}>{yourFaction}</p>
              <p className={styles.status}>You</p>
            </div>

            {opponentName ? (
              <div className={styles.playerCard}>
                <p className={styles.playerName}>{opponentName}</p>
                <p className={styles.faction}>{opponentFaction}</p>
                <p className={styles.status}>Ready</p>
              </div>
            ) : (
              <div className={styles.playerCard + ' ' + styles.waiting}>
                <p className={styles.playerName}>Waiting...</p>
                <p className={styles.hint}>for opponent to join</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.status}>
          {isReady ? (
            <>
              <p className={styles.statusText + ' ' + styles.ready}>
                ✓ Ready to Start!
              </p>
              <button onClick={handleStartGame} className={styles.startBtn}>
                Start Game
              </button>
            </>
          ) : (
            <p className={styles.statusText + ' ' + styles.waiting}>
              Waiting for opponent...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
