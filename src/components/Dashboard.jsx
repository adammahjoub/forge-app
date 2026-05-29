const todayStr = () => new Date().toISOString().split('T')[0]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bonjour'
  if (h < 18) return 'Bon après-midi'
  return 'Bonsoir'
}

function GradientRing({ value, max, size = 80, stroke = 6, label }) {
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
          <span className="font-mono" style={{
            fontSize: 15, fontWeight: 700,
            background: pct > 0 ? 'linear-gradient(135deg,#a78bfa,#f97316)' : 'none',
            WebkitBackgroundClip: pct > 0 ? 'text' : 'unset',
            WebkitTextFillColor: pct > 0 ? 'transparent' : 'var(--muted)',
            color: pct === 0 ? 'var(--muted)' : undefined,
          }}>{Math.round(pct * 100)}%</span>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 7, color: 'var(--muted)' }}>
        <span>{label}</span>
        <span className="font-mono" style={{ color: over ? '#f97316' : 'var(--text)', fontSize: 12 }}>
          {value}<span style={{ color: 'var(--muted)' }}>/{max}</span>
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
      cal  += logs[d.toISOString().split('T')[0]]?.calories || 0
      prot += logs[d.toISOString().split('T')[0]]?.protein  || 0
    }
    return { cal: Math.round(cal), prot: Math.round(prot), days: dow + 1 }
  })()

  const nextSession = !todayWork?.templateId

  return (
    <div style={{
      padding: '20px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      minHeight: 'calc(100vh - 68px)', // mobile: minus bottom nav
    }}>

      {/* ── Greeting ─────────────────────────────────────────────── */}
      <div className="card" style={{ padding: '22px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>{getGreeting()},</p>
          <h1 style={{ fontSize: 36, fontWeight: 700, color: 'var(--strong)', margin: 0, lineHeight: 1.1 }}>
            Adam 👋
          </h1>
          <p style={{ fontSize: 12, color: 'var(--muted-dim)', marginTop: 6 }}>
            Jour <span className="gradient-text font-mono" style={{ fontSize: 14, fontWeight: 700 }}>{daysOnProgram}</span> du programme
          </p>
        </div>
        <button onClick={() => onNavigate(nextSession ? 'workout' : 'nutrition')}
          className="btn-primary" style={{ fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0 }}>
          {nextSession ? '+ Session' : '+ Repas'}
        </button>
      </div>

      {/* ── Stats 3-col ──────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {[
          { label: 'Poids',   value: `${settings.weight}`, unit: 'kg', grad: false },
          { label: 'BF est.', value: `~${settings.bodyFat}`, unit: '%', grad: false },
          { label: 'Streak',  value: String(streak),          unit: 'd', grad: true  },
        ].map(({ label, value, unit, grad }) => (
          <div key={label} className="card" style={{ padding: '14px 8px', textAlign: 'center' }}>
            <p className="section-label" style={{ marginBottom: 6, fontSize: 10 }}>{label}</p>
            <p className={`font-mono ${grad && streak > 0 ? 'gradient-text streak-pulse' : ''}`}
              style={{ fontSize: 22, fontWeight: 600, margin: 0, color: (!grad || streak === 0) ? 'var(--strong)' : undefined }}>
              {value}<span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400 }}>{unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* ── Session status ───────────────────────────────────────── */}
      <div className="card" style={{
        padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        ...(todayWork.completed ? { borderColor: 'rgba(167,139,250,0.35)' } : {}),
      }}>
        <div>
          <p className="section-label" style={{ marginBottom: 8, fontSize: 10 }}>Séance du jour</p>
          {todayWork.completed
            ? <span className="badge-high">✓ {todayWork.templateName}</span>
            : todayWork.templateName
            ? <span className="badge-medium">{todayWork.templateName} — en cours</span>
            : <span className="badge-low">Aucune séance démarrée</span>}
        </div>
        <span className={`font-mono ${todayWork.completed ? 'check-pop gradient-text' : ''}`}
          style={{ fontSize: 22, color: todayWork.completed ? undefined : 'rgba(255,255,255,0.08)' }}>
          {todayWork.completed ? '✓' : '○'}
        </span>
      </div>

      {/* ── Bottom 2-col: Today bars + Weekly rings ──────────────── */}
      <div className="dashboard-grid" style={{ flex: 1 }}>

        {/* Today nutrition */}
        <div className="card" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'center' }}>
          <p className="section-label" style={{ fontSize: 10 }}>Aujourd'hui</p>
          <Bar label="Calories"  value={todayLog.calories || 0} max={settings.calories} />
          <Bar label="Protéines" value={todayLog.protein  || 0} max={settings.protein}  />
          {todayLog.meals?.length > 0 && (
            <p style={{ fontSize: 11, color: 'var(--muted-dim)', margin: 0 }}>
              {todayLog.meals.length} repas enregistré{todayLog.meals.length > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Weekly rings */}
        <div className="card" style={{ padding: '16px 14px', display: 'flex', flexDirection: 'column' }}>
          <p className="section-label" style={{ marginBottom: 12, fontSize: 10 }}>Cette semaine</p>
          <div style={{ display: 'flex', justifyContent: 'space-around', flex: 1, alignItems: 'center' }}>
            <GradientRing value={weeklyTotals.cal}  max={settings.calories * 7} label="Calories" />
            <GradientRing value={weeklyTotals.prot} max={settings.protein  * 7} label="Protéines" />
          </div>
          <p style={{ textAlign: 'center', fontSize: 10, color: 'var(--muted-dim)', marginTop: 10 }}>
            {weeklyTotals.days} / 7 jours
          </p>
        </div>

      </div>
    </div>
  )
}
