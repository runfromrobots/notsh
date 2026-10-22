'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useCallback } from 'react'

export default function JoinPage() {
  const router = useRouter()
  const params = useParams()
  const gameId = params.gameId as string
  
  const [playerName, setPlayerName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [gameExists, setGameExists] = useState(false)

  useEffect(() => {
    // Verify game exists
    const verifyGame = async () => {
      try {
        const res = await fetch(`/api/games?id=${gameId}`)
        if (res.ok) {
          setGameExists(true)
        } else {
          setError('Game not found')
        }
      } catch (err) {
        setError('Failed to verify game')
      } finally {
        setLoading(false)
      }
    }
    
    verifyGame()
  }, [gameId])

  const handleJoin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!playerName.trim()) {
      setError('Please enter your name')
      return
    }

    try {
      setLoading(true)
      const res = await fetch(`/api/games/${gameId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: playerName.trim() }),
      })

      if (res.ok) {
        const data = await res.json()
        // Save player info and redirect to board
        localStorage.setItem('playerName', playerName.trim())
        router.push(`/board/${gameId}`)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to join game')
      }
    } catch (err) {
      setError('Failed to join game')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [gameId, playerName, router])

  if (loading) {
    return (
      <div style={styles.container}>
        <p>Verifying game...</p>
      </div>
    )
  }

  if (!gameExists) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.heading}>Game Not Found</h1>
          <p style={styles.error}>{error}</p>
          <button onClick={() => router.push('/')} style={styles.button}>
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.heading}>Join Game</h1>
        <p style={styles.subtitle}>Enter your name to join</p>
        
        <form onSubmit={handleJoin} style={styles.form}>
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => {
              setPlayerName(e.target.value)
              setError('')
            }}
            style={styles.input}
            autoFocus
            disabled={loading}
          />
          
          {error && <p style={styles.errorText}>{error}</p>}
          
          <button
            type="submit"
            style={{...styles.button, opacity: loading ? 0.6 : 1}}
            disabled={loading}
          >
            {loading ? 'Joining...' : 'Join Game'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#0D1117',
    color: '#FFFFFF',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  } as React.CSSProperties,
  
  card: {
    background: '#1a1a2e',
    border: '2px solid #00BCD4',
    borderRadius: '8px',
    padding: '3rem 2rem',
    textAlign: 'center',
    maxWidth: '400px',
    width: '90%',
  } as React.CSSProperties,
  
  heading: {
    margin: '0 0 0.5rem 0',
    fontSize: '2rem',
    color: '#FFD700',
    textShadow: '2px 2px 0px #FF1744',
  } as React.CSSProperties,
  
  subtitle: {
    margin: '0 0 2rem 0',
    color: '#00BCD4',
    fontSize: '1rem',
  } as React.CSSProperties,
  
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  } as React.CSSProperties,
  
  input: {
    padding: '0.75rem',
    fontSize: '1rem',
    border: '2px solid #00BCD4',
    borderRadius: '4px',
    background: '#0D1117',
    color: '#FFFFFF',
    outline: 'none',
  } as React.CSSProperties,
  
  button: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    background: '#FF1744',
    color: '#FFFFFF',
    border: '2px solid #FFD700',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.2s',
  } as React.CSSProperties,
  
  error: {
    margin: '0',
    color: '#FF1744',
    fontSize: '0.9rem',
  } as React.CSSProperties,
  
  errorText: {
    color: '#FF1744',
    fontSize: '0.9rem',
    margin: '0',
  } as React.CSSProperties,
}
