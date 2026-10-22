// Flat drawings for the two releases: a little cat with a big shadow, and lunch in bed.
export type ArtName = 'cat' | 'bedlunch'

// A sitting cat, facing out, in a 100 × 120 box
const CAT_BODY =
  'M28 46 L24 12 L43 31 Q50 29 57 31 L76 12 L72 46 Q77 58 66 66 Q83 78 83 98 Q83 116 66 118 L34 118 Q17 116 17 98 Q17 78 34 66 Q23 58 28 46 Z'
const CAT_TAIL = 'M62 116 Q97 118 95 92 Q94 82 86 85'

function Cat({ fill, eyes, x, y, scale }: { fill: string; eyes: string; x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d={CAT_TAIL} fill="none" stroke={fill} strokeWidth="9" strokeLinecap="round" />
      <path d={CAT_BODY} fill={fill} />
      <ellipse cx="40" cy="47" rx="4" ry="5.5" fill={eyes} />
      <ellipse cx="60" cy="47" rx="4" ry="5.5" fill={eyes} />
    </g>
  )
}

function CatScene() {
  return (
    <>
      <rect width="400" height="440" fill="var(--wall)" />
      {/* The big shadow on the wall */}
      <Cat fill="var(--shadow)" eyes="var(--mustard)" x={58} y={34} scale={2.9} />
      {/* The floor */}
      <rect y="382" width="400" height="58" fill="var(--floor)" />
      <path d="M0 382 H400" stroke="var(--ink)" strokeWidth="3" />
      {/* The little cat casting it */}
      <Cat fill="var(--ink)" eyes="var(--mustard)" x={178} y={323} scale={0.5} />
    </>
  )
}

function BedLunchScene() {
  return (
    <g stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
      <rect width="400" height="440" fill="var(--wall)" stroke="none" />
      {/* Window with a moon */}
      <rect x="236" y="54" width="112" height="112" fill="var(--night)" />
      <path d="M292 54 V166 M236 110 H348" />
      <path d="M326 72 A16 16 0 1 0 336 98 A12 12 0 1 1 326 72 Z" fill="var(--mustard)" />
      <rect y="382" width="400" height="58" fill="var(--floor)" stroke="none" />
      <path d="M0 382 H400" />
      {/* Headboard, mattress, legs */}
      <path d="M44 382 V196 Q44 176 64 176 H96 Q116 176 116 196 V382" fill="var(--mustard)" />
      <rect x="116" y="270" width="250" height="56" fill="var(--paper)" />
      <path d="M362 326 V382 M122 326 V382" strokeWidth="6" />
      {/* Blanket */}
      <path d="M188 262 H368 V340 Q368 352 356 352 H188 Z" fill="var(--tomato)" />
      <path d="M210 262 V352 M250 262 V352 M290 262 V352 M330 262 V352" stroke="var(--paper)" strokeOpacity="0.35" />
      {/* Pillow */}
      <path d="M118 242 Q120 230 134 230 H176 Q192 230 192 244 V266 Q192 274 182 274 H128 Q118 274 118 264 Z" fill="var(--paper)" />
      {/* The lunch: half a sandwich on the pillow */}
      <path d="M128 230 L176 230 L152 196 Z" fill="var(--lettuce)" />
      <path d="M126 226 L178 226 L152 188 Z" fill="var(--bread)" />
      <path d="M134 220 L170 220 L152 194 Z" fill="var(--crumb)" stroke="none" />
    </g>
  )
}

export default function Art({ name, label, className }: { name: ArtName; label: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 440" role="img" aria-label={label}>
      {name === 'cat' ? <CatScene /> : <BedLunchScene />}
    </svg>
  )
}

// The small cat on its own, for the top bar
export function CatMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 100 120" aria-hidden="true" focusable="false">
      <path d={CAT_TAIL} fill="none" stroke="var(--ink)" strokeWidth="9" strokeLinecap="round" />
      <path d={CAT_BODY} fill="var(--ink)" />
      <ellipse cx="40" cy="47" rx="4" ry="5.5" fill="var(--mustard)" />
      <ellipse cx="60" cy="47" rx="4" ry="5.5" fill="var(--mustard)" />
    </svg>
  )
}
