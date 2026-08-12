'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './page.module.css'

export default function Home() {
  const [gameCode, setGameCode] = useState('')

  const handleCreateGame = () => {
    // TODO: Create game via API
  }

  const handleJoinGame = () => {
    if (gameCode.trim()) {
      // TODO: Navigate to game with gameCode
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>SOS — Island Survival</h1>
        <p className={styles.subtitle}>
          Turn-based island exploration • Two factions • Race for rescue
        </p>
      </div>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2>Game Menu</h2>

          <div className={styles.actions}>
            <div className={styles.actionGroup}>
              <button
                onClick={handleCreateGame}
                className={styles.primaryBtn}
              >
                Create New Game
              </button>
              <p className={styles.description}>
                Start a new match and invite others to join
              </p>
            </div>

            <div className={styles.actionGroup}>
              <div className={styles.joinForm}>
                <input
                  type="text"
                  placeholder="Enter game code"
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinGame()}
                />
                <button onClick={handleJoinGame}>Join Game</button>
              </div>
              <p className={styles.description}>
                Join an existing game using a code
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>How to Play</h2>
          <ul className={styles.rules}>
            <li>
              <strong>Explore:</strong> Reveal tiles adjacent to your position
              using your daily reveal budget
            </li>
            <li>
              <strong>Gather:</strong> Collect logs found in jungle tiles
            </li>
            <li>
              <strong>Spell SOS:</strong> Place 3 logs to form "SOS" and trigger
              a rescue
            </li>
            <li>
              <strong>Escape:</strong> Reach the departure point after rescue
              is triggered
            </li>
            <li>
              <strong>Encounter:</strong> Meeting a rival faction player leads
              to an encounter with uncertain outcome
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>About</h2>
          <p>
            You're a survivor of a plane crash on a remote island. Your faction
            has rival survivors who want to escape just as badly. Will you
            cooperate with your faction to build a rescue signal, or take risks
            to be rescued first?
          </p>
        </section>
      </div>

      <div className={styles.footer}>
        <p>
          Made with{' '}
          <span style={{ color: '#22e5ff' }}>Claude Code</span> •{' '}
          <a href="https://github.com/runfromrobots/notsh">GitHub</a>
        </p>
      </div>
    </div>
  )
}
