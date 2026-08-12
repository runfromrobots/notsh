import { Player } from '@/lib/types'
import styles from './PlayerInfo.module.css'

interface PlayerInfoProps {
  player: Player
}

export default function PlayerInfo({ player }: PlayerInfoProps) {
  const factionEmoji = player.faction === 'pirates' ? '🏴‍☠️' : '⚓'
  const statusEmoji =
    player.status === 'alive'
      ? '✓'
      : player.status === 'eliminated'
        ? '✗'
        : '✈️'

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>{player.name}</h3>
        <span className={styles.status}>{statusEmoji} {player.status}</span>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.label}>{factionEmoji} Faction</span>
          <span className={styles.value}>
            {player.faction === 'pirates' ? 'Pirates' : 'Navy'}
          </span>
        </div>

        <div className={styles.stat}>
          <span className={styles.label}>📍 Position</span>
          <span className={styles.value}>
            ({player.x}, {player.y})
          </span>
        </div>

        <div className={styles.stat}>
          <span className={styles.label}>🪵 Logs Contributed</span>
          <span className={styles.value}>{player.logs}</span>
        </div>

        <div className={styles.stat}>
          <span className={styles.label}>💼 Carrying</span>
          <span className={styles.value}>
            {player.carrying ? 'Log' : 'Nothing'}
          </span>
        </div>

        <div className={styles.stat}>
          <span className={styles.label}>⏱️ Moves Remaining</span>
          <span className={styles.value}>{player.revealBudget}</span>
        </div>
      </div>
    </div>
  )
}
