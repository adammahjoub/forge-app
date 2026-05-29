import { DecorativeArcs, SparkAccent, IllustrationAnvil } from './Illustrations'

const todayStr = () => new Date().toISOString().split('T')[0]

function Ring({ value, max, size = 84, stroke = 5, label, sub, theme }) {
  const r    = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const pct  = Math.min(value / max, 1)
  const gap  = circ * (1 - pct)
  const over = value > max

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={theme.border} strokeWidth={stroke} />
          <circle cx={size/2} cy={size/2} r={r} fill="none"
            stroke={over ? '#B85C4A' : theme.ink}
            strokeWidth={stroke} strokeLinecap="square"
            strokeDasharray={circ} strokeDashoffset={gap}
            opacity={pct === 0 ? 0 : 1}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-base font-semibold leading-none">{value}</span>
          <span className="text-[9px] font-sans mt-0.5" style={{ color: theme.muted }}>/{max}</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[10px] uppercase tracking-widest font-sans" style={{ color: theme.muted }}>{label}</p>
        {sub && <p className="text-[9px] font-sans" style={{ color: theme.muted }}>{sub}</p>}
      </div>
    </div>
  )
}

function Bar({ label, value, max, theme }) {
  const pct  = Math.min((value / max) * 100, 100)
  const over = value > max
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5 font-sans">
        <span style={{ color: theme.muted }}>{label}</span>
        <span style={{ color: over ? '#B85C4A' : theme.ink }}>
          {value} <span style={{ color: theme.muted }}>/ {max}</span>
        </span>
      </div>
      <div className="h-px overflow-hidden" style={{ background: theme.border }}>
        <div className="bar-fill h-full" style={{ width: `${pct}%`, background: over ? '#B85C4A' : theme.ink }} />
      </div>
    </div>
  )
}

export default function Dashboard({ settings, logs, workoutLogs, streak, daysOnProgram, theme }) {
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

  const noDataToday = !todayLog.calories && !todayLog.protein && !todayWork.templateId

  return (
    <div className="px-5 pt-10 pb-6">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="relative mb-10 overflow-hidden">
        {/* Decorative arcs — top right */}
        <DecorativeArcs
          size={180}
          style={{ color: theme.muted, opacity: 0.12, position: 'absolute', top: -40, right: -40, pointerEvents: 'none' }}
        />

        <div className="flex items-end justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[10px] uppercase tracking-[0.25em] font-sans" style={{ color: theme.muted }}>Program active</p>
              <SparkAccent size={10} style={{ color: theme.muted, opacity: 0.5 }} />
            </div>
            <h1 className="font-display text-7xl font-semibold tracking-tight leading-none">Forge</h1>
          </div>
          <div className="text-right pb-1">
            <p className="text-[10px] uppercase tracking-widest font-sans mb-1" style={{ color: theme.muted }}>Day</p>
            <p className="font-display text-5xl font-semibold leading-none">{daysOnProgram}</p>
          </div>
        </div>
      </div>

      {/* ── Stat strip ───────────────────────────────────────────── */}
      <div className="grid grid-cols-3 mb-4" style={{ border: `1px solid ${theme.border}` }}>
        {[
          { label: 'Weight',  value: settings.weight,  unit: 'kg', pulse: false },
          { label: 'Est. BF', value: `~${settings.bodyFat}`, unit: '%', pulse: false, mid: true },
          { label: 'Streak',  value: streak, unit: 'd', pulse: streak > 0 },
        ].map(({ label, value, unit, pulse, mid }) => (
          <div key={label} className="py-4 px-3 text-center"
            style={mid ? { borderLeft: `1px solid ${theme.border}`, borderRight: `1px solid ${theme.border}` } : {}}>
            <p className="text-[9px] uppercase tracking-widest font-sans mb-1" style={{ color: theme.muted }}>{label}</p>
            <p className={`font-display text-2xl font-semibold leading-none ${pulse ? 'streak-pulse' : ''}`}>
              {value}<span className="text-base font-sans font-normal" style={{ color: theme.muted }}>{unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* ── Today's session ──────────────────────────────────────── */}
      <div className="p-4 mb-4" style={{ border: `1px solid ${todayWork.completed ? theme.ink : theme.border}` }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-widest font-sans mb-1" style={{ color: theme.muted }}>Today's session</p>
            <p className="font-sans text-sm font-medium">
              {todayWork.completed
                ? todayWork.templateName
                : todayWork.templateName
                ? `${todayWork.templateName} — in progress`
                : 'No session started'}
            </p>
          </div>
          <span className={`text-xl leading-none ${todayWork.completed ? 'check-pop' : ''}`}
            style={{ color: todayWork.completed ? theme.ink : theme.border }}>
            {todayWork.completed ? '✓' : '○'}
          </span>
        </div>
      </div>

      {/* ── Weekly rings ─────────────────────────────────────────── */}
      <div className="p-5 mb-4" style={{ border: `1px solid ${theme.border}` }}>
        <p className="text-[9px] uppercase tracking-widest font-sans mb-5" style={{ color: theme.muted }}>Weekly progress</p>
        <div className="flex justify-around">
          <Ring value={weeklyTotals.cal}  max={settings.calories * 7} label="Calories" sub={`${weeklyTotals.days} days`} theme={theme} />
          <Ring value={weeklyTotals.prot} max={settings.protein  * 7} label="Protein"  sub={`${weeklyTotals.days} days`} theme={theme} />
        </div>
      </div>

      {/* ── Today bars OR first-run empty state ──────────────────── */}
      {noDataToday ? (
        <div className="p-8 flex flex-col items-center text-center" style={{ border: `1px solid ${theme.border}` }}>
          <IllustrationAnvil
            size={120}
            className="illus-float mb-5"
            style={{ color: theme.muted, opacity: 0.2 }}
          />
          <p className="font-display text-2xl font-semibold mb-2">The forge is cold.</p>
          <p className="text-xs font-sans leading-relaxed" style={{ color: theme.muted }}>
            Log a meal or start a session<br />to bring it to life.
          </p>
        </div>
      ) : (
        <div className="p-5" style={{ border: `1px solid ${theme.border}` }}>
          <p className="text-[9px] uppercase tracking-widest font-sans mb-4" style={{ color: theme.muted }}>Today</p>
          <div className="space-y-4">
            <Bar label="Calories" value={todayLog.calories || 0} max={settings.calories} theme={theme} />
            <Bar label="Protein"  value={todayLog.protein  || 0} max={settings.protein}  theme={theme} />
          </div>
          {todayLog.meals?.length > 0 && (
            <p className="text-[9px] font-sans mt-3" style={{ color: theme.muted }}>
              {todayLog.meals.length} meal{todayLog.meals.length !== 1 ? 's' : ''} logged
            </p>
          )}
        </div>
      )}
    </div>
  )
}
