'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

const CORRECT_PASSWORD = 'lovesexsecretgod'

export default function Home() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [gameCode, setGameCode] = useState('')
  const [showAbout, setShowAbout] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const savedAuth = localStorage.getItem('sosGameAuth')
    if (savedAuth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

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

  const handleCreateGame = async () => {
    if (!playerName.trim()) {
      alert('Enter your name first!')
      return
    }
    try {
      setIsLoading(true)
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: playerName.trim() })
      })
      const data = await res.json()
      if (data.success) {
        localStorage.setItem('playerName', playerName.trim())
        localStorage.setItem('gameId', data.gameId)
        router.push(`/board/${data.gameId}`)
      } else {
        alert(data.error || 'Failed to create game')
      }
    } catch (error) {
      console.error('Create game error:', error)
      alert('Failed to create game')
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinGame = async () => {
    if (!playerName.trim()) {
      alert('Enter your name first!')
      return
    }
    if (!gameCode.trim()) {
      alert('Enter a game code!')
      return
    }
    try {
      setIsLoading(true)
      // First, look up the game by code
      const lookupRes = await fetch(`/api/games/lookup?code=${gameCode}`)
      const lookupData = await lookupRes.json()
      if (!lookupData.success) {
        alert(lookupData.error || 'Game not found')
        return
      }

      // Then, join the game with the player name
      const joinRes = await fetch(`/api/games/${lookupData.gameId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: playerName.trim() })
      })
      const joinData = await joinRes.json()
      if (joinData.success) {
        localStorage.setItem('playerName', playerName.trim())
        localStorage.setItem('gameId', lookupData.gameId)
        router.push(`/board/${lookupData.gameId}`)
      } else {
        alert(joinData.error || 'Failed to join game')
      }
    } catch (error) {
      console.error('Join game error:', error)
      alert('Failed to join game')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.passwordContent}>
          <h2 className={styles.passwordTitle}>Nothing To See Here</h2>
          <input
            type="password"
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
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={20}
          />
        </div>

        <div className={styles.actions}>
          <button
            onClick={handleCreateGame}
            className={styles.primaryBtn}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Create Game'}
          </button>

          <div className={styles.joinSection}>
            <input
              type="text"
              placeholder="Game code"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleJoinGame()}
              maxLength={6}
              disabled={isLoading}
            />
            <button onClick={handleJoinGame} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Join'}
            </button>
          </div>
        </div>
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
