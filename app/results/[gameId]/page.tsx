'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import styles from './results.module.css'

interface Player {
  id: string
  name: string
  faction: string
  status: string
  logsPlaced: number
}

interface Game {
  id: string
  dayNumber: number
  sosPositions: Array<{ x: number; y: number }>
  rescuedPlayers: string[]
}

export default function Results() {
  const router = useRouter()
  const params = useParams()
  const gameId = params.gameId as string

  const [game, setGame] = useState<Game | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGameState()
  }, [gameId])

  const fetchGameState = async () => {
    try {
      const res = await fetch(`/api/games?id=${gameId}`)
      if (res.ok) {
        const data = await res.json()
        setGame(data.game)
        setPlayers(data.players || [])
      }
    } catch (error) {
      console.error('Failed to fetch game state:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Loading results...</p>
      </div>
    )
  }

  const rescuedPlayers = players.filter((p) =>
    game?.rescuedPlayers.includes(p.id)
  )
  const eliminatedPlayers = players.filter((p) => p.status === 'eliminated')

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>Game Over!</h1>

        <div className={styles.summarySection}>
          <p className={styles.dayCount}>Lasted {game?.dayNumber} days</p>
          <p className={styles.sosCount}>
            SOS Built with {game?.sosPositions.length} logs
          </p>
        </div>

        {rescuedPlayers.length > 0 && (
          <div className={styles.rescued}>
            <h2>🎉 Rescued!</h2>
            <div className={styles.playersList}>
              {rescuedPlayers.map((player) => (
                <div key={player.id} className={styles.playerCard}>
                  <p className={styles.playerName}>{player.name}</p>
                  <p className={styles.faction}>{player.faction}</p>
                  <p className={styles.logsPlaced}>
                    Logs Placed: {player.logsPlaced}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {eliminatedPlayers.length > 0 && (
          <div className={styles.eliminated}>
            <h2>Eliminated</h2>
            <div className={styles.playersList}>
              {eliminatedPlayers.map((player) => (
                <div key={player.id} className={styles.playerCard + ' ' + styles.dead}>
                  <p className={styles.playerName}>{player.name}</p>
                  <p className={styles.faction}>{player.faction}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <button onClick={() => router.push('/')} className={styles.homeBtn}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
