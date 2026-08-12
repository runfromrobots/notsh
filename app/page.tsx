'use client'

import { useState } from 'react'
import styles from './page.module.css'

export default function Home() {
  const [playerName, setPlayerName] = useState('')
  const [gameCode, setGameCode] = useState('')
  const [showAbout, setShowAbout] = useState(false)

  const handleCreateGame = () => {
    if (!playerName.trim()) {
      alert('Enter your name first!')
      return
    }
    // TODO: Create game via API and navigate
  }

  const handleJoinGame = () => {
    if (!playerName.trim()) {
      alert('Enter your name first!')
      return
    }
    if (!gameCode.trim()) {
      alert('Enter a game code!')
      return
    }
    // TODO: Join game via API and navigate
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
              You and your crew have crashed on an uncharted island. You're not alone—
              survivors from a rival faction are stranded with you, each desperate to escape.
            </p>
            <p>
              The island is shrouded in fog. Each day, you can explore only a limited area.
              You'll find resources, encounter enemies, and race to build a rescue signal before
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
          >
            Create Game
          </button>

          <div className={styles.joinSection}>
            <input
              type="text"
              placeholder="Game code"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleJoinGame()}
              maxLength={6}
            />
            <button onClick={handleJoinGame}>Join</button>
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

      <div className={styles.footer}>
        <p>
          <a href="https://github.com/runfromrobots/notsh" target="_blank">GitHub</a>
        </p>
      </div>
    </div>
  )
}
