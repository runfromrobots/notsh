import { MAP_WIDTH, MAP_HEIGHT, paths, falls, startHint, finish } from '@/lib/mapData'
import styles from './CreekMap.module.css'

// A little paper boat, drawn around its own origin
function Boat({ scale = 1 }: { scale?: number }) {
  return (
    <g transform={`scale(${scale})`}>
      <path d="M-16 -2 L16 -2 L10 8 L-10 8 Z" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round" />
      <path d="M-6 -2 L2 -20 L8 -2 Z" fill="var(--red)" stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round" />
    </g>
  )
}

export default function CreekMap() {
  return (
    <figure className={styles.figure}>
      <svg
        className={styles.map}
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        role="img"
        aria-labelledby="map-title map-desc"
      >
        <title id="map-title">Map of Yatesville Creek, Sprakers, New York</title>
        <desc id="map-desc">
          Yatesville Creek flows from Yatesville Falls at the top of the map down to the Mohawk River at the
          bottom. South is up. The race starts at a secret spot upstream and finishes at The Root.
        </desc>

        <defs>
          <clipPath id="map-clip">
            <rect width={MAP_WIDTH} height={MAP_HEIGHT} />
          </clipPath>
          <pattern id="checker" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill="var(--paper)" />
            <rect width="4" height="4" fill="var(--ink)" />
            <rect x="4" y="4" width="4" height="4" fill="var(--ink)" />
          </pattern>
        </defs>

        <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="var(--paper)" />

        <g clipPath="url(#map-clip)">
          {/* Context: roads and rail */}
          <path d={paths.rail} className={styles.rail} />
          <path d={paths.thruway} className={styles.highway} />
          <path d={paths.route5s} className={styles.road} />
          <path d={paths.anderson} className={styles.minorRoad} />
          <path d={paths.preserve} className={styles.minorRoad} />

          {/* Water */}
          <path d={paths.mohawk} className={styles.river} />
          <path d={paths.lasher} className={styles.tributary} />
          <path d={paths.creekUpstream} className={styles.creekFaint} />
          <path d={paths.creekDownstream} className={styles.creekLower} />
          <path d={paths.creekRace} className={styles.creekRace} />
          <path id="race-course" d={paths.creekRace} className={styles.creekShimmer} />
        </g>

        {/* Yatesville Falls */}
        <g transform={`translate(${falls.x} ${falls.y})`}>
          <circle r="16" fill="var(--yellow)" stroke="var(--ink)" strokeWidth="3" />
          <path d="M-6 -4 L-6 6 M0 -6 L0 8 M6 -4 L6 6" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />
          <text x="30" y="0" className={styles.label}>Yatesville Falls</text>
          <text x="34" y="26" className={styles.sublabel}>a.k.a. Buttermilk Falls</text>
        </g>

        {/* Start: location not yet disclosed */}
        <g transform={`translate(${startHint.x} ${startHint.y})`}>
          <line x1="0" y1="0" x2="-96" y2="-28" stroke="var(--ink)" strokeWidth="2" strokeDasharray="2 6" strokeLinecap="round" />
          <g transform="translate(-124 -36)">
            <g className={styles.mystery}>
              <circle r="28" fill="var(--red)" stroke="var(--ink)" strokeWidth="3" />
              <text y="12" textAnchor="middle" className={styles.question}>?</text>
            </g>
          </g>
          <text x="-166" y="-40" textAnchor="end" className={styles.label}>Start</text>
          <text x="-166" y="-14" textAnchor="end" className={styles.sublabel}>somewhere up here,</text>
          <text x="-166" y="10" textAnchor="end" className={styles.sublabel}>revealed soon</text>
        </g>

        {/* Finish: The Root */}
        <g transform={`translate(${finish.x} ${finish.y})`}>
          <rect x="-15" y="-15" width="30" height="30" fill="url(#checker)" stroke="var(--ink)" strokeWidth="3" />
          <text x="-30" y="0" textAnchor="end" className={styles.label}>Finish</text>
          <text x="-30" y="24" textAnchor="end" className={styles.sublabel}>The Root</text>
        </g>

        {/* Road and river labels */}
        <text x="616" y="610" className={styles.roadLabel}>I-90</text>
        <text x={MAP_WIDTH / 2} y={MAP_HEIGHT - 28} textAnchor="middle" className={styles.riverLabel}>
          Mohawk River
        </text>

        {/* The boat sails the course, falls to finish */}
        <g className={styles.boat}>
          <Boat scale={1.1} />
          <animateMotion dur="18s" repeatCount="indefinite" calcMode="linear">
            <mpath href="#race-course" />
          </animateMotion>
        </g>

        {/* Compass: south is up */}
        <g transform={`translate(${MAP_WIDTH - 72} 92)`} className={styles.compass}>
          <circle r="36" fill="var(--paper)" stroke="var(--ink)" strokeWidth="3" />
          <path d="M0 -26 L10 4 L0 -2 L-10 4 Z" fill="var(--ink)" />
          <text y="-46" textAnchor="middle" className={styles.compassLetter}>S</text>
          <text y="24" textAnchor="middle" className={styles.compassSmall}>N</text>
        </g>
      </svg>
      <figcaption className={styles.caption}>
        <span>South is up — read the map the way the boats travel: downstream, top to bottom.</span>
        <span>
          Map data ©{' '}
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
            OpenStreetMap
          </a>{' '}
          contributors
        </span>
      </figcaption>
    </figure>
  )
}
