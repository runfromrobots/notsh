'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const CORRECT_PASSWORD = 'lovesexsecretgod'

export default function Home() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [gameCode, setGameCode] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedAuth = localStorage.getItem('sosGameAuth')
    if (savedAuth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  if (!mounted) return null

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

    setLoading(true)
    try {
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: playerName.trim() }),
      })

      const data = await res.json()
      localStorage.setItem('playerName', playerName.trim())
      router.push(`/board/${data.gameId}`)
    } catch (error) {
      alert('Error creating game')
      setLoading(false)
    }
  }

  const handleJoinGame = async () => {
    if (!playerName.trim()) {
      alert('Enter your name first!')
      return
    }

    const code = gameCode.trim()
    if (!code) {
      alert('Enter a game code!')
      return
    }

    setLoading(true)
    try {
      const lookupRes = await fetch(`/api/games/lookup?code=${code}`)
      const lookup = await lookupRes.json()

      const res = await fetch(`/api/games/${lookup.gameId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: playerName.trim() }),
      })

      localStorage.setItem('playerName', playerName.trim())
      router.push(`/board/${lookup.gameId}`)
    } catch (error) {
      alert('Error joining game')
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>
          <h1>Nothing To See Here</h1>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handlePasswordSubmit}
            autoFocus
          />
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>SOS Island Survival</h1>
      
      <input
        type="text"
        placeholder="Enter your name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        maxLength={20}
        disabled={loading}
      />

      <div style={{ marginTop: '1rem' }}>
        <button onClick={handleCreateGame} disabled={loading}>
          Create Game
        </button>
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="Game code"
          value={gameCode}
          onChange={(e) => setGameCode(e.target.value.toUpperCase())}
          maxLength={6}
          disabled={loading}
        />
        <button onClick={handleJoinGame} disabled={loading}>
          Join
        </button>
      </div>
    </div>
  )
}
