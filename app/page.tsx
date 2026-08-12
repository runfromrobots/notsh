'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [auth, setAuth] = useState(false)
  const [pwd, setPwd] = useState('')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('auth')) setAuth(true)
    }
  }, [])

  return (
    <div style={{ padding: '20px' }}>
      {!auth ? (
        <>
          <h1>Password</h1>
          <input type="password" onChange={(e) => setPwd(e.target.value)} onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (pwd === 'lovesexsecretgod') {
                localStorage.setItem('auth', '1')
                setAuth(true)
              } else alert('Wrong')
            }
          }} />
        </>
      ) : (
        <>
          <h1>SOS</h1>
          <input placeholder="Name" onChange={(e) => setName(e.target.value)} />
          <button onClick={async () => {
            const res = await fetch('/api/games', { method: 'POST', body: JSON.stringify({ playerName: name }) })
            const data = await res.json()
            router.push(`/board/${data.gameId}`)
          }}>Create</button>
          <input placeholder="Code" onChange={(e) => setCode(e.target.value)} />
          <button onClick={async () => {
            const res = await fetch(`/api/games/lookup?code=${code}`)
            const data = await res.json()
            router.push(`/board/${data.gameId}`)
          }}>Join</button>
        </>
      )}
    </div>
  )
}
