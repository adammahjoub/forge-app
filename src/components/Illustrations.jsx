// Minimal monochrome SVG illustrations — all use currentColor

export function IllustrationAnvil({ size = 140, style, className }) {
  return (
    <svg width={size} viewBox="0 0 140 90" fill="none" stroke="currentColor"
      strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
      style={style} className={className}>
      {/* Horn */}
      <path d="M38 38 L8 50 L38 52" />
      {/* Top flat face */}
      <rect x="38" y="18" width="84" height="20" />
      {/* Body taper */}
      <path d="M48 38 L92 38 L86 66 L54 66 Z" />
      {/* Base block */}
      <rect x="54" y="66" width="32" height="11" />
      {/* Feet */}
      <line x1="50" y1="77" x2="90" y2="77" />
      {/* Spark lines upper right */}
      <line x1="110" y1="8"  x2="118" y2="2"  />
      <line x1="118" y1="14" x2="128" y2="10" />
      <line x1="112" y1="20" x2="124" y2="18" />
      {/* Small cross spark */}
      <line x1="105" y1="12" x2="107" y2="12" />
      <line x1="106" y1="11" x2="106" y2="13" />
    </svg>
  )
}

export function IllustrationBarbell({ size = 130, style, className }) {
  return (
    <svg width={size} viewBox="0 0 130 44" fill="none" stroke="currentColor"
      strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
      style={style} className={className}>
      {/* Left plates */}
      <rect x="6"  y="4"  width="7" height="36" />
      <rect x="15" y="10" width="5" height="24" />
      {/* Shaft */}
      <line x1="20" y1="22" x2="110" y2="22" />
      {/* Collars */}
      <rect x="22" y="17" width="6" height="10" />
      <rect x="102" y="17" width="6" height="10" />
      {/* Right plates */}
      <rect x="110" y="10" width="5" height="24" />
      <rect x="117" y="4"  width="7" height="36" />
    </svg>
  )
}

export function IllustrationPlate({ size = 80, style, className }) {
  return (
    <svg width={size} viewBox="0 0 80 80" fill="none" stroke="currentColor"
      strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
      style={style} className={className}>
      {/* Outer plate */}
      <circle cx="40" cy="40" r="34" />
      {/* Inner ring */}
      <circle cx="40" cy="40" r="26" />
      {/* Fork */}
      <line x1="34" y1="16" x2="34" y2="36" />
      <path d="M31 16 L31 26 Q34 29 37 26 L37 16" />
      <line x1="34" y1="36" x2="34" y2="62" />
      {/* Knife */}
      <line x1="46" y1="16" x2="46" y2="62" />
      <path d="M46 16 Q52 22 46 32" />
    </svg>
  )
}

export function IllustrationChart({ size = 110, style, className }) {
  return (
    <svg width={size} viewBox="0 0 110 70" fill="none" stroke="currentColor"
      strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
      style={style} className={className}>
      {/* Axes */}
      <line x1="10" y1="8"  x2="10"  y2="58" />
      <line x1="10" y1="58" x2="102" y2="58" />
      {/* Tick marks Y */}
      <line x1="7" y1="18" x2="10" y2="18" />
      <line x1="7" y1="33" x2="10" y2="33" />
      <line x1="7" y1="48" x2="10" y2="48" />
      {/* Trend line */}
      <polyline points="18,48 36,38 54,42 72,24 90,28" strokeWidth="1.5" />
      {/* Dots */}
      <circle cx="18" cy="48" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="36" cy="38" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="54" cy="42" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="72" cy="24" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="90" cy="28" r="2.5" fill="currentColor" stroke="none" />
      {/* Arrow up */}
      <polyline points="86,14 90,8 94,14" strokeWidth="1" />
      <line x1="90" y1="8" x2="90" y2="28" strokeWidth="1" />
    </svg>
  )
}

export function IllustrationFlame({ size = 48, style, className }) {
  return (
    <svg width={size} viewBox="0 0 40 52" fill="none" stroke="currentColor"
      strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
      style={style} className={className}>
      <path d="M20 48
        C8  38  4  28  10 18
        C12 13  15 16  14 20
        C17 10  20 4   20 4
        C20 4   26 12  23 22
        C27 14  30 19  28 27
        C32 20  31 32  20 48 Z" />
      {/* Inner detail */}
      <path d="M20 42 C14 34 13 27 17 21" opacity="0.5" />
    </svg>
  )
}

export function IllustrationHammer({ size = 90, style, className }) {
  return (
    <svg width={size} viewBox="0 0 90 70" fill="none" stroke="currentColor"
      strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
      style={style} className={className}>
      {/* Handle */}
      <line x1="65" y1="18" x2="20" y2="62" />
      {/* Head */}
      <rect x="50" y="6" width="36" height="20" rx="1"
        transform="rotate(-45 68 16)" />
      {/* Peen (back of head) */}
      <rect x="55" y="4" width="12" height="16" rx="1"
        transform="rotate(-45 61 12)" />
    </svg>
  )
}

export function IllustrationMeasure({ size = 100, style, className }) {
  return (
    <svg width={size} viewBox="0 0 100 60" fill="none" stroke="currentColor"
      strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
      style={style} className={className}>
      {/* Tape body */}
      <rect x="5" y="20" width="90" height="20" rx="2" />
      {/* Tick marks */}
      {[15, 25, 35, 45, 55, 65, 75, 85].map((x, i) => (
        <line key={x} x1={x} y1="20" x2={x} y2={i % 2 === 0 ? "15" : "18"} />
      ))}
      {/* Numbers */}
      <text x="13"  y="13" fontSize="5" textAnchor="middle" fill="currentColor" stroke="none" fontFamily="Inter">10</text>
      <text x="33"  y="13" fontSize="5" textAnchor="middle" fill="currentColor" stroke="none" fontFamily="Inter">20</text>
      <text x="53"  y="13" fontSize="5" textAnchor="middle" fill="currentColor" stroke="none" fontFamily="Inter">30</text>
      <text x="73"  y="13" fontSize="5" textAnchor="middle" fill="currentColor" stroke="none" fontFamily="Inter">40</text>
      {/* Arrow end */}
      <polyline points="90,24 96,30 90,36" />
    </svg>
  )
}

// Decorative background arc cluster for hero areas
export function DecorativeArcs({ size = 200, style, className }) {
  return (
    <svg width={size} viewBox="0 0 200 200" fill="none" stroke="currentColor"
      strokeWidth="0.75" style={style} className={className}>
      <circle cx="190" cy="10" r="60" />
      <circle cx="190" cy="10" r="90" />
      <circle cx="190" cy="10" r="120" />
      <circle cx="190" cy="10" r="150" />
    </svg>
  )
}

// Small cross/spark accent
export function SparkAccent({ size = 20, style, className }) {
  return (
    <svg width={size} viewBox="0 0 20 20" fill="none" stroke="currentColor"
      strokeWidth="1" strokeLinecap="round" style={style} className={className}>
      <line x1="10" y1="2"  x2="10" y2="18" />
      <line x1="2"  y1="10" x2="18" y2="10" />
      <line x1="4"  y1="4"  x2="16" y2="16" />
      <line x1="16" y1="4"  x2="4"  y2="16" />
    </svg>
  )
}
