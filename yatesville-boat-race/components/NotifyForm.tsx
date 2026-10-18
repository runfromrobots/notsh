'use client'

import { FormEvent, useState } from 'react'
import styles from './NotifyForm.module.css'

type Status = 'idle' | 'sending' | 'done' | 'error'

export default function NotifyForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('sending')
    setMessage('')

    const website = new FormData(event.currentTarget).get('website')

    try {
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setStatus('error')
        setMessage(data.error || 'Something went sideways. Please try again.')
        return
      }

      setStatus('done')
    } catch {
      setStatus('error')
      setMessage('Couldn’t reach the creek. Check your connection and try again.')
    }
  }

  if (status === 'done') {
    return (
      <div className={styles.done} role="status">
        <strong>You’re on the list.</strong>
        <span>We’ll send word to {email} the moment registration opens. Start practicing your folds.</span>
      </div>
    )
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <label htmlFor="email" className={styles.label}>
        Get a note when registration opens
      </label>
      <div className={styles.row}>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={styles.input}
          aria-describedby="notify-help"
          aria-invalid={status === 'error'}
        />
        <button type="submit" className={styles.button} disabled={status === 'sending'}>
          {status === 'sending' ? 'Folding…' : 'Notify me'}
        </button>
      </div>
      {/* Honeypot for bots; hidden from people and screen readers */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className={styles.honeypot} aria-hidden="true" />
      <p id="notify-help" className={status === 'error' ? styles.error : styles.help} aria-live="polite">
        {status === 'error' ? message : 'One email when registration opens. No spam, just boats.'}
      </p>
    </form>
  )
}
