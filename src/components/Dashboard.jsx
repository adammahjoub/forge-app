const todayStr = () => new Date().toISOString().split('T')[0]

function Ring({ value, max, size = 88, stroke = 7, label, sub }) {
  const r   = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const pct  = Math.min(value / max, 1)
  const gap  = circ * (1 - pct)

  const ringColor = pct >= 1 ? '#C8FF00' : pct >= 0.6 ? '#C8FF00CC' : '#3A3A3A'

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1C1C1C" strokeWidth={stroke} />
          <circle
            cx={size/2} cy={size/2} r={r}
            fill="none"
            stroke={ringColor}
            strokeWidth={stroke}
            strokeLinecap="square"
            strokeDasharray={circ}
            strokeDashoffset={gap}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold leading-none">{value}</span>
          <span className="text-[9px] text-gray-600 mt-0.5">/{max}</span>
        </div>
      </div>
      <span className="text-[9px] tracking-widest text-gray-500">{label}</span>
      {sub && <span className="text-[9px] text-gray-700">{sub}</span>}
    </div>
  )
}

function Bar({ label, value, max, dm }) {
  const pct  = Math.min((value / max) * 100, 100)
  const over = value > max
  const color = value === 0 ? '#2A2A2A' : over ? '#FF5555' : pct >= 90 ? '#C8FF00' : '#555'
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-1">
        <span className={dm ? 'text-gray-500' : 'text-gray-400'}>{label}</span>
        <span style={{ color }}>{value} <span className={dm ? 'text-gray-700' : 'text-gray-400'}>/ {max}</span></span>
      </div>
      <div className={`h-[3px] ${dm ? 'bg-[#1C1C1C]' : 'bg-gray-200'} overflow-hidden`}>
        <div className="bar-fill h-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

export default function Dashboard({ settings, logs, workoutLogs, streak, daysOnProgram, dm }) {
  const today     = todayStr()
  const todayLog  = logs[today] || {}
  const todayWork = workoutLogs[today] || {}

  // Weekly aggregates Mon → today
  const weeklyTotals = (() => {
    const now  = new Date()
    const dow  = (now.getDay() + 6) % 7 // Mon=0
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

  const weekCalGoal  = settings.calories * 7
  const weekProtGoal = settings.protein  * 7

  const border  = dm ? 'border-[#1E1E1E]' : 'border-gray-200'
  const surface = dm ? 'bg-[#111111]' : 'bg-white'

  return (
    <div className="px-4 pt-6 pb-4">

      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-[10px] tracking-[0.25em] text-gray-600 mb-0.5">PROGRAM ACTIVE</p>
          <h1 className="text-4xl font-bold tracking-tight">FORGE</h1>
        </div>
        <div className="text-right">
          <p className="text-[9px] tracking-widest text-gray-600">DAY</p>
          <p className="text-4xl font-bold text-[#C8FF00] leading-none">{daysOnProgram}</p>
        </div>
      </div>

      {/* Stat strip */}
      <div className={`grid grid-cols-3 border ${border} mb-3`}>
        <div className="py-3 px-3 text-center">
          <p className="text-[9px] tracking-widest text-gray-600 mb-1">WEIGHT</p>
          <p className="text-base font-bold">{settings.weight}<span className="text-gray-600 text-xs">kg</span></p>
        </div>
        <div className={`py-3 px-3 text-center border-x ${border}`}>
          <p className="text-[9px] tracking-widest text-gray-600 mb-1">EST BF%</p>
          <p className="text-base font-bold">~{settings.bodyFat}<span className="text-gray-600 text-xs">%</span></p>
        </div>
        <div className="py-3 px-3 text-center">
          <p className="text-[9px] tracking-widest text-gray-600 mb-1">STREAK</p>
          <p className={`text-base font-bold text-[#C8FF00] ${streak > 0 ? 'streak-pulse' : ''}`}>
            {streak}<span className="text-gray-600 text-xs">d</span>
          </p>
        </div>
      </div>

      {/* Today's session */}
      <div className={`border ${todayWork.completed ? 'border-[#C8FF00]' : border} p-4 mb-3 flex items-center justify-between`}>
        <div>
          <p className="text-[9px] tracking-widest text-gray-600 mb-1">TODAY'S SESSION</p>
          <p className={`font-bold text-sm ${todayWork.completed ? 'text-[#C8FF00]' : ''}`}>
            {todayWork.completed
              ? `✓ ${todayWork.templateName}`
              : todayWork.templateName
              ? `${todayWork.templateName} — IN PROGRESS`
              : 'NO SESSION STARTED'}
          </p>
        </div>
        <div className={`text-2xl leading-none ${todayWork.completed ? 'text-[#C8FF00] check-pop' : dm ? 'text-[#2A2A2A]' : 'text-gray-300'}`}>
          {todayWork.completed ? '✓' : '○'}
        </div>
      </div>

      {/* Weekly rings */}
      <div className={`border ${border} p-4 mb-3`}>
        <p className="text-[9px] tracking-widest text-gray-600 mb-4">WEEKLY PROGRESS</p>
        <div className="flex justify-around">
          <Ring value={weeklyTotals.cal}  max={weekCalGoal}  label="KCAL"    sub={`${weeklyTotals.days} DAYS`} />
          <Ring value={weeklyTotals.prot} max={weekProtGoal} label="PROTEIN" sub={`${weeklyTotals.days} DAYS`} />
        </div>
      </div>

      {/* Today nutrition */}
      <div className={`border ${border} p-4`}>
        <p className="text-[9px] tracking-widest text-gray-600 mb-3">TODAY</p>
        <div className="space-y-3">
          <Bar label="CALORIES" value={todayLog.calories || 0} max={settings.calories} dm={dm} />
          <Bar label="PROTEIN"  value={todayLog.protein  || 0} max={settings.protein}  dm={dm} />
        </div>
        {todayLog.meals?.length > 0 && (
          <p className="text-[9px] text-gray-600 mt-3">{todayLog.meals.length} MEAL{todayLog.meals.length !== 1 ? 'S' : ''} LOGGED</p>
        )}
      </div>
    </div>
  )
}
