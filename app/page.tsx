'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

const CORRECT_PASSWORD = 'lovesexsecretgod'

interface Game {
  id: string
  code: string
  playerCount: number
  players: Array<{ id: string; name: string; faction: string }>
}

export default function Home() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [gameCode, setGameCode] = useState('')
  const [showAbout, setShowAbout] = useState(false)
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const savedAuth = localStorage.getItem('sosGameAuth')
    if (savedAuth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchGames()
      // Poll for new games every 5 seconds
      const interval = setInterval(fetchGames, 5000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const fetchGames = async () => {
    try {
      const res = await fetch('/api/games/list?status=waiting')
      if (res.ok) {
        const data = await res.json()
        if (data && Array.isArray(data.games)) {
          setGames(data.games)
        }
      }
    } catch (error) {
      console.error('Failed to fetch games:', error)
      setGames([])
    }
  }

  const handlePasswordSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (password === CORRECT_PASSWORD) {
        setIsAuthenticated(true)
        localStorage.setItem('sosGameAuth', 'true')
        setPassword('')
      } else {
        setPassword('')
        alert('Incorrect password')
      }
    }
  }

  const handleCreateGame = async (solo: boolean = false) => {
    if (!playerName.trim()) {
      alert('Enter your name first!')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: playerName.trim(), soloMode: solo }),
      })

      if (!res.ok) {
        try {
          const error = await res.json()
          alert(`Failed to create game: ${error?.error || 'Unknown error'}`)
        } catch {
          alert('Failed to create game')
        }
        setLoading(false)
        return
      }

      const data = await res.json()
      if (!data?.gameId) {
        alert('Invalid response from server')
        setLoading(false)
        return
      }

      // Store player name and navigate to lobby
      localStorage.setItem('playerName', playerName.trim())
      router.push(`/lobby/${data.gameId}`)
    } catch (error) {
      console.error('Error creating game:', error)
      alert('Failed to create game')
      setLoading(false)
    }
  }

  const handleJoinGame = async (gameIdToJoin?: string) => {
    if (!playerName.trim()) {
      alert('Enter your name first!')
      return
    }

    let targetGameId = gameIdToJoin

    // If no gameId provided, look up by code
    if (!targetGameId) {
      const codeToUse = gameCode.trim()
      if (!codeToUse) {
        alert('Enter a game code!')
        return
      }

      setLoading(true)
      try {
        const lookupRes = await fetch(`/api/games/lookup?code=${codeToUse}`)
        if (!lookupRes.ok) {
          try {
            const error = await lookupRes.json()
            alert(`Game not found: ${error?.error || 'Unknown error'}`)
          } catch {
            alert('Game not found')
          }
          setLoading(false)
          return
        }
        const lookupData = await lookupRes.json()
        if (!lookupData?.gameId) {
          alert('Invalid response from server')
          setLoading(false)
          return
        }
        targetGameId = lookupData.gameId
      } catch (error) {
        console.error('Error looking up game:', error)
        alert('Failed to lookup game')
        setLoading(false)
        return
      }
    }

    try {
      const res = await fetch(`/api/games/${targetGameId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: playerName.trim() }),
      })

      if (!res.ok) {
        try {
          const error = await res.json()
          alert(`Failed to join game: ${error?.error || 'Unknown error'}`)
        } catch {
          alert('Failed to join game')
        }
        setLoading(false)
        return
      }

      const data = await res.json()
      if (!data?.success) {
        alert(`Failed to join game: ${data?.error || 'Unknown error'}`)
        setLoading(false)
        return
      }

      // Store player name and navigate to lobby
      localStorage.setItem('playerName', playerName.trim())
      router.push(`/lobby/${targetGameId}`)
    } catch (error) {
      console.error('Error joining game:', error)
      alert('Failed to join game')
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.passwordContent}>
          <h2 className={styles.passwordTitle}>Nothing To See Here</h2>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handlePasswordSubmit}
            className={styles.passwordInput}
            autoFocus
          />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Tattoo Art Placeholder - Top Left */}
      <div className={styles.artworkPlaceholder + ' ' + styles.artTopLeft}>
        <div className={styles.placeholder}>[Anchor Tattoo]</div>
      </div>

      {/* Tattoo Art Placeholder - Top Right */}
      <div className={styles.artworkPlaceholder + ' ' + styles.artTopRight}>
        <div className={styles.placeholder}>[Ship Wheel]</div>
      </div>

      <div className={styles.content}>
        <div className={styles.titleSection}>
          <h1>SOS</h1>
          <p className={styles.tagline}>Island Survival</p>
        </div>

        <p className={styles.blurb}>
          Survive a plane crash on a remote island. Explore unknown terrain,
          gather resources, and race against rival factions to escape.
        </p>

        <div className={styles.aboutToggle}>
          <button
            onClick={() => setShowAbout(!showAbout)}
            className={styles.readMoreBtn}
          >
            {showAbout ? '▼ Less' : '▶ Read More'}
          </button>
        </div>

        {showAbout && (
          <div className={styles.aboutSection}>
            <h2>About the Game</h2>
            <p>
              You and your crew have crashed on an uncharted island. You&apos;re not alone—
              survivors from a rival faction are stranded with you, each desperate to escape.
            </p>
            <p>
              The island is shrouded in fog. Each day, you can explore only a limited area.
              You&apos;ll find resources, encounter enemies, and race to build a rescue signal before
              your rivals do.
            </p>
            <p>
              Form an alliance with your faction, or make risky moves alone. Every choice matters.
              Only the swift—and the lucky—will make it off the island alive.
            </p>
          </div>
        )}

        <div className={styles.nameInput}>
          <input
            type="text"
            id="playerName"
            name="playerName"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={20}
            disabled={loading}
          />
        </div>

        <div className={styles.actions}>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <button
              onClick={() => handleCreateGame(true)}
              className={styles.primaryBtn}
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? 'Starting...' : 'Solo Game'}
            </button>
            <button
              onClick={() => handleCreateGame(false)}
              className={styles.primaryBtn}
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? 'Starting...' : 'Multiplayer'}
            </button>
          </div>

          <div className={styles.joinSection}>
            <input
              type="text"
              id="gameCode"
              name="gameCode"
              placeholder="Game code"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleJoinGame()}
              maxLength={6}
              disabled={loading}
            />
            <button onClick={() => handleJoinGame()} disabled={loading}>
              Join
            </button>
          </div>
        </div>

        {/* Game List */}
        {games.length > 0 && (
          <div className={styles.gamesList}>
            <h3>Available Games</h3>
            <div className={styles.gamesGrid}>
              {games.map((game) => (
                <div key={game.id} className={styles.gameCard}>
                  <p className={styles.gameCode}>Code: {game.code}</p>
                  <p className={styles.playerCount}>{game.playerCount || 0}/2 players</p>
                  {Array.isArray(game.players) && game.players.length > 0 && (
                    <p className={styles.gamePlayer}>
                      Playing: {game.players[0].name}
                    </p>
                  )}
                  <button
                    onClick={() => handleJoinGame(game.id)}
                    className={styles.joinGameBtn}
                    disabled={loading}
                  >
                    Join
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tattoo Art Placeholder - Bottom Left */}
      <div className={styles.artworkPlaceholder + ' ' + styles.artBottomLeft}>
        <div className={styles.placeholder}>[Wave Pattern]</div>
      </div>

      {/* Tattoo Art Placeholder - Bottom Right */}
      <div className={styles.artworkPlaceholder + ' ' + styles.artBottomRight}>
        <div className={styles.placeholder}>[Compass Rose]</div>
      </div>
    </div>
  )
}
