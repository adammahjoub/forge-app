const todayStr = () => new Date().toISOString().split('T')[0]

function GradientRing({ value, max, size = 90, stroke = 6, label, sub }) {
  const r    = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const pct  = Math.min(value / max, 1)
  const gap  = circ * (1 - pct)
  const uid  = label.replace(/\s/g, '')

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <defs>
            <linearGradient id={`rg-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>
          {/* Track */}
          <circle cx={size/2} cy={size/2} r={r} fill="none"
            stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
          {/* Fill */}
          {pct > 0 && (
            <circle cx={size/2} cy={size/2} r={r} fill="none"
              stroke={`url(#rg-${uid})`}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={gap}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold" style={{ color: 'var(--strong)' }}>{value}</span>
          <span className="text-[9px]" style={{ color: 'var(--muted)' }}>/{max}</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[9px] tracking-widest" style={{ color: 'var(--muted)' }}>{label}</p>
        {sub && <p className="text-[9px]" style={{ color: 'var(--muted-dim)' }}>{sub}</p>}
      </div>
    </div>
  )
}

function Bar({ label, value, max }) {
  const pct  = Math.min((value / max) * 100, 100)
  const over = value > max
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-1.5">
        <span style={{ color: 'var(--muted)' }}>{label}</span>
        <span style={{ color: over ? '#f97316' : 'var(--text)' }}>
          {value} <span style={{ color: 'var(--muted)' }}>/ {max}</span>
        </span>
      </div>
      <div className="h-1 bar-track">
        <div className={over ? 'bar-fill-over' : 'bar-fill'} style={{ width: `${pct}%`, height: '100%' }} />
      </div>
    </div>
  )
}

export default function Dashboard({ settings, logs, workoutLogs, streak, daysOnProgram }) {
  const today     = todayStr()
  const todayLog  = logs[today] || {}
  const todayWork = workoutLogs[today] || {}

  const weeklyTotals = (() => {
    const now = new Date()
    const dow = (now.getDay() + 6) % 7
    let cal = 0, prot = 0
    for (let i = 0; i <= dow; i++) {
      const d = new Date(now)
      d.setDate(now.getDate() - dow + i)
      const ds = d.toISOString().split('T')[0]
      cal  += logs[ds]?.calories || 0
      prot += logs[ds]?.protein  || 0
    }
    return { cal: Math.round(cal), prot: Math.round(prot), days: dow + 1 }
  })()

  return (
    <div className="px-4 pt-8 pb-4 space-y-3">

      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-[10px] tracking-[0.2em] mb-1" style={{ color: 'var(--muted)' }}>PROGRAM ACTIVE</p>
          <h1 className="text-5xl font-bold tracking-tight gradient-text">FORGE</h1>
        </div>
        <div className="text-right">
          <p className="text-[9px] tracking-widest mb-1" style={{ color: 'var(--muted)' }}>DAY</p>
          <p className="text-5xl font-bold gradient-text leading-none">{daysOnProgram}</p>
        </div>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'WEIGHT',  value: settings.weight,  unit: 'kg', accent: false },
          { label: 'EST BF%', value: `~${settings.bodyFat}`, unit: '%', accent: false },
          { label: 'STREAK',  value: streak, unit: 'd', accent: true },
        ].map(({ label, value, unit, accent }) => (
          <div key={label} className="card py-3 px-2 text-center">
            <p className="text-[9px] tracking-widest mb-1" style={{ color: 'var(--muted)' }}>{label}</p>
            <p className={`text-lg font-bold leading-none ${accent && streak > 0 ? 'gradient-text streak-pulse' : ''}`}
              style={!accent || streak === 0 ? { color: 'var(--strong)' } : {}}>
              {value}<span className="text-xs font-normal" style={{ color: 'var(--muted)' }}>{unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Today's session */}
      <div className="card p-4 flex items-center justify-between"
        style={todayWork.completed ? { borderColor: 'rgba(167,139,250,0.35)' } : {}}>
        <div>
          <p className="text-[9px] tracking-widest mb-1" style={{ color: 'var(--muted)' }}>TODAY'S SESSION</p>
          <p className="font-bold text-sm" style={{ color: todayWork.completed ? 'var(--strong)' : 'var(--text)' }}>
            {todayWork.completed
              ? `✓ ${todayWork.templateName}`
              : todayWork.templateName
              ? `${todayWork.templateName} — IN PROGRESS`
              : 'NO SESSION STARTED'}
          </p>
        </div>
        <div className={`text-2xl leading-none ${todayWork.completed ? 'check-pop gradient-text' : ''}`}
          style={!todayWork.completed ? { color: 'rgba(255,255,255,0.1)' } : {}}>
          {todayWork.completed ? '✓' : '○'}
        </div>
      </div>

      {/* Weekly rings */}
      <div className="card p-5">
        <p className="text-[9px] tracking-widest mb-5" style={{ color: 'var(--muted)' }}>WEEKLY PROGRESS</p>
        <div className="flex justify-around">
          <GradientRing value={weeklyTotals.cal}  max={settings.calories * 7} label="KCAL"    sub={`${weeklyTotals.days} DAYS`} />
          <GradientRing value={weeklyTotals.prot} max={settings.protein  * 7} label="PROTEIN" sub={`${weeklyTotals.days} DAYS`} />
        </div>
      </div>

      {/* Today nutrition */}
      <div className="card p-4 space-y-3">
        <p className="text-[9px] tracking-widest" style={{ color: 'var(--muted)' }}>TODAY</p>
        <Bar label="CALORIES" value={todayLog.calories || 0} max={settings.calories} />
        <Bar label="PROTEIN"  value={todayLog.protein  || 0} max={settings.protein}  />
        {todayLog.meals?.length > 0 && (
          <p className="text-[9px]" style={{ color: 'var(--muted-dim)' }}>
            {todayLog.meals.length} MEAL{todayLog.meals.length !== 1 ? 'S' : ''} LOGGED
          </p>
        )}
      </div>
    </div>
  )
}
