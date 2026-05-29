const todayStr = () => new Date().toISOString().split('T')[0]

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function GradientRing({ value, max, size = 84, stroke = 6, label, sub }) {
  const r    = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const pct  = Math.min(value / max, 1)
  const gap  = circ * (1 - pct)
  const uid  = label.replace(/\s/g, '')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <defs>
            <linearGradient id={`rg-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
          {pct > 0 && (
            <circle cx={size/2} cy={size/2} r={r} fill="none"
              stroke={`url(#rg-${uid})`} strokeWidth={stroke}
              strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={gap} />
          )}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span className="font-mono" style={{ fontSize: 14, fontWeight: 700, color: pct > 0 ? 'transparent' : 'var(--muted)',
            background: pct > 0 ? 'linear-gradient(135deg,#a78bfa,#f97316)' : 'none',
            WebkitBackgroundClip: pct > 0 ? 'text' : 'unset',
            WebkitTextFillColor: pct > 0 ? 'transparent' : 'var(--muted)',
          }}>{value}</span>
          <span style={{ fontSize: 9, color: 'var(--muted)' }}>/{max}</span>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p className="section-label">{label}</p>
        {sub && <p style={{ fontSize: 9, color: 'var(--muted-dim)' }}>{sub}</p>}
      </div>
    </div>
  )
}

function Bar({ label, value, max }) {
  const pct = Math.min((value / max) * 100, 100)
  const over = value > max
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6, color: 'var(--muted)' }}>
        <span>{label}</span>
        <span className="font-mono" style={{ color: over ? '#f97316' : 'var(--text)' }}>
          {value} <span style={{ color: 'var(--muted)' }}>/ {max}</span>
        </span>
      </div>
      <div className="bar-track" style={{ height: 4 }}>
        <div className={over ? 'bar-fill-over' : 'bar-fill'} style={{ width: `${pct}%`, height: '100%' }} />
      </div>
    </div>
  )
}

export default function Dashboard({ settings, logs, workoutLogs, streak, daysOnProgram, onNavigate }) {
  const today     = todayStr()
  const todayLog  = logs[today] || {}
  const todayWork = workoutLogs[today] || {}

  const weeklyTotals = (() => {
    const now = new Date(), dow = (now.getDay() + 6) % 7
    let cal = 0, prot = 0
    for (let i = 0; i <= dow; i++) {
      const d = new Date(now); d.setDate(now.getDate() - dow + i)
      const ds = d.toISOString().split('T')[0]
      cal  += logs[ds]?.calories || 0
      prot += logs[ds]?.protein  || 0
    }
    return { cal: Math.round(cal), prot: Math.round(prot), days: dow + 1 }
  })()

  const todayWorkout = workoutLogs[today]
  const nextSession  = !todayWorkout?.templateId

  return (
    <div style={{ padding: '24px 20px', maxWidth: 680, width: '100%' }}>

      {/* ── Header: greeting + CTA ───────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <p className="section-label" style={{ marginBottom: 4 }}>{greeting()}</p>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--strong)', margin: 0 }}>
            Day <span className="gradient-text font-mono">{daysOnProgram}</span>
          </h1>
        </div>
        <button
          onClick={() => onNavigate(nextSession ? 'workout' : 'nutrition')}
          className="btn-primary"
          style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
          {nextSession ? '+ Start session' : '+ Log meal'}
        </button>
      </div>

      {/* ── Stat grid (3 cards) ──────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 24 }}>
        {[
          { label: 'Weight',  value: `${settings.weight}`, unit: 'kg', accent: false },
          { label: 'Est. BF', value: `~${settings.bodyFat}`, unit: '%', accent: false },
          { label: 'Streak',  value: String(streak), unit: 'd', accent: true },
        ].map(({ label, value, unit, accent }) => (
          <div key={label} className="card" style={{ padding: '14px 12px', textAlign: 'center' }}>
            <p className="section-label" style={{ marginBottom: 6 }}>{label}</p>
            <p className={`stat-value font-mono ${accent && streak > 0 ? 'gradient-text streak-pulse' : ''}`}
              style={!accent || streak === 0 ? { color: 'var(--strong)' } : {}}>
              {value}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--muted)' }}>{unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* ── Today's session ──────────────────────────────────────── */}
      <p className="section-label" style={{ marginBottom: 8 }}>Today's session</p>
      <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24,
        ...(todayWork.completed ? { borderColor: 'rgba(167,139,250,0.35)' } : {}) }}>
        <div>
          {todayWork.completed
            ? <span className="badge-high">✓ {todayWork.templateName}</span>
            : todayWork.templateName
            ? <span className="badge-medium">{todayWork.templateName} — in progress</span>
            : <span className="badge-low">No session started</span>}
        </div>
        <div className={`font-mono ${todayWork.completed ? 'check-pop gradient-text' : ''}`}
          style={{ fontSize: 20, color: todayWork.completed ? undefined : 'rgba(255,255,255,0.08)' }}>
          {todayWork.completed ? '✓' : '○'}
        </div>
      </div>

      {/* ── Weekly progress ──────────────────────────────────────── */}
      <p className="section-label" style={{ marginBottom: 8 }}>This week</p>
      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <GradientRing value={weeklyTotals.cal}  max={settings.calories * 7} label="Calories" sub={`${weeklyTotals.days} days`} />
          <GradientRing value={weeklyTotals.prot} max={settings.protein  * 7} label="Protein"  sub={`${weeklyTotals.days} days`} />
        </div>
      </div>

      {/* ── Today nutrition ──────────────────────────────────────── */}
      <p className="section-label" style={{ marginBottom: 8 }}>Today</p>
      <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Bar label="Calories" value={todayLog.calories || 0} max={settings.calories} />
        <Bar label="Protein"  value={todayLog.protein  || 0} max={settings.protein}  />
        {todayLog.meals?.length > 0 && (
          <p style={{ fontSize: 11, color: 'var(--muted-dim)', margin: 0 }}>
            {todayLog.meals.length} meal{todayLog.meals.length !== 1 ? 's' : ''} logged
          </p>
        )}
      </div>
    </div>
  )
}
