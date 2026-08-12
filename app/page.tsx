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
        alert('Wrong password')
      }
    }
  }

  const handleCreateGame = async () => {
    if (!playerName.trim()) {
      alert('Please enter your name')
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
      alert('Error')
      setLoading(false)
    }
  }

  const handleJoinGame = async () => {
    if (!playerName.trim()) {
      alert('Please enter your name')
      return
    }

    const code = gameCode.trim()
    if (!code) {
      alert('Please enter code')
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
      alert('Error')
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <h1>NOTHING TO SEE</h1>
        <input type="password" placeholder="pwd" value={password} onChange={(e) => setPassword(e.target.value)} onKeyPress={handlePasswordSubmit} autoFocus />
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>SOS GAME v2</h1>
      <input type="text" placeholder="name" value={playerName} onChange={(e) => setPlayerName(e.target.value)} maxLength={20} />
      <button onClick={handleCreateGame}>Create</button>
      <div style={{ marginTop: '1rem' }}>
        <input type="text" placeholder="code" value={gameCode} onChange={(e) => setGameCode(e.target.value.toUpperCase())} maxLength={6} />
        <button onClick={handleJoinGame}>Join</button>
      </div>
    </div>
  )
}
