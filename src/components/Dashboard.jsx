const todayStr = () => new Date().toISOString().split('T')[0]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bonjour'
  if (h < 18) return 'Bon après-midi'
  return 'Bonsoir'
}

function GradientRing({ value, max, size = 72, stroke = 5, label }) {
  const r    = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const pct  = Math.min(value / max, 1)
  const gap  = circ * (1 - pct)
  const uid  = label.replace(/\s/g, '')
  const pctNum = Math.round(pct * 100)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
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
          <span className="font-mono" style={{
            fontSize: 13, fontWeight: 700,
            background: pct > 0 ? 'linear-gradient(135deg,#a78bfa,#f97316)' : 'none',
            WebkitBackgroundClip: pct > 0 ? 'text' : 'unset',
            WebkitTextFillColor: pct > 0 ? 'transparent' : 'var(--muted)',
            color: pct === 0 ? 'var(--muted)' : undefined,
          }}>{pctNum}%</span>
        </div>
      </div>
      <p className="section-label">{label}</p>
    </div>
  )
}

function Bar({ label, value, max }) {
  const pct = Math.min((value / max) * 100, 100)
  const over = value > max
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5, color: 'var(--muted)' }}>
        <span>{label}</span>
        <span className="font-mono" style={{ color: over ? '#f97316' : 'var(--text)', fontSize: 11 }}>
          {value}<span style={{ color: 'var(--muted)' }}>/{max}</span>
        </span>
      </div>
      <div className="bar-track" style={{ height: 3 }}>
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
      cal  += logs[d.toISOString().split('T')[0]]?.calories || 0
      prot += logs[d.toISOString().split('T')[0]]?.protein  || 0
    }
    return { cal: Math.round(cal), prot: Math.round(prot), days: dow + 1 }
  })()

  const nextSession = !todayWork?.templateId

  return (
    <div style={{ padding: '20px 16px', height: '100%', boxSizing: 'border-box' }}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 2 }}>{getGreeting()},</p>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--strong)', margin: 0, lineHeight: 1.2 }}>
            Adam 👋
          </h1>
        </div>
        <button onClick={() => onNavigate(nextSession ? 'workout' : 'nutrition')}
          className="btn-primary" style={{ fontSize: 12 }}>
          {nextSession ? '+ Session' : '+ Repas'}
        </button>
      </div>

      {/* ── Stat strip ──────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 }}>
        {[
          { label: 'Poids',   value: `${settings.weight}`, unit: 'kg', grad: false },
          { label: 'BF est.', value: `~${settings.bodyFat}`, unit: '%',  grad: false },
          { label: 'Streak',  value: String(streak),          unit: 'd',  grad: true  },
        ].map(({ label, value, unit, grad }) => (
          <div key={label} className="card" style={{ padding: '10px 8px', textAlign: 'center' }}>
            <p className="section-label" style={{ marginBottom: 4, fontSize: 10 }}>{label}</p>
            <p className={`font-mono ${grad && streak > 0 ? 'gradient-text streak-pulse' : ''}`}
              style={{ fontSize: 18, fontWeight: 600, margin: 0, color: (!grad || streak === 0) ? 'var(--strong)' : undefined }}>
              {value}<span style={{ fontSize: 10, color: 'var(--muted)' }}>{unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* ── Main grid: left col + right col on desktop ───────────
           On mobile this renders as a single column via CSS       */}
      <div className="dashboard-grid">

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Session status */}
          <div className="card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            ...(todayWork.completed ? { borderColor: 'rgba(167,139,250,0.35)' } : {}) }}>
            <div>
              <p className="section-label" style={{ marginBottom: 5, fontSize: 10 }}>Séance du jour</p>
              {todayWork.completed
                ? <span className="badge-high">✓ {todayWork.templateName}</span>
                : todayWork.templateName
                ? <span className="badge-medium">{todayWork.templateName} — en cours</span>
                : <span className="badge-low">Aucune séance</span>}
            </div>
            <span className={`font-mono ${todayWork.completed ? 'check-pop gradient-text' : ''}`}
              style={{ fontSize: 18, color: todayWork.completed ? undefined : 'rgba(255,255,255,0.08)' }}>
              {todayWork.completed ? '✓' : '○'}
            </span>
          </div>

          {/* Today bars */}
          <div className="card" style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p className="section-label" style={{ fontSize: 10 }}>Aujourd'hui</p>
            <Bar label="Calories" value={todayLog.calories || 0} max={settings.calories} />
            <Bar label="Protéines" value={todayLog.protein || 0} max={settings.protein} />
          </div>
        </div>

        {/* Right column — weekly rings */}
        <div className="card" style={{ padding: '14px', display: 'flex', flexDirection: 'column' }}>
          <p className="section-label" style={{ marginBottom: 12, fontSize: 10 }}>Cette semaine</p>
          <div style={{ display: 'flex', justifyContent: 'space-around', flex: 1, alignItems: 'center' }}>
            <GradientRing value={weeklyTotals.cal}  max={settings.calories * 7} label="Calories" />
            <GradientRing value={weeklyTotals.prot} max={settings.protein  * 7} label="Protéines" />
          </div>
          <p style={{ textAlign: 'center', fontSize: 10, color: 'var(--muted-dim)', marginTop: 8 }}>
            {weeklyTotals.days} jour{weeklyTotals.days > 1 ? 's' : ''} sur 7
          </p>
        </div>

      </div>
    </div>
  )
}
