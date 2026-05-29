import { useState, useRef } from 'react'

const todayStr = () => new Date().toISOString().split('T')[0]

function Bar({ label, value, max }) {
  const pct  = Math.min((value / max) * 100, 100)
  const over = value > max
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-1.5">
        <span style={{ color: 'var(--muted)' }}>{label}</span>
        <span style={{ color: over ? '#f97316' : 'var(--text)' }}>{Math.round(pct)}%</span>
      </div>
      <div className="h-1.5 bar-track">
        <div className={over ? 'bar-fill-over' : 'bar-fill'} style={{ width: `${pct}%`, height: '100%' }} />
      </div>
    </div>
  )
}

export default function NutritionTracker({ settings, logs, updateTodayLog }) {
  const today    = todayStr()
  const todayLog = logs[today] || { calories: 0, protein: 0, meals: [] }

  const [name,      setName]      = useState('')
  const [kcal,      setKcal]      = useState('')
  const [prot,      setProt]      = useState('')
  const [celebrate, setCelebrate] = useState(false)
  const prevProtRef = useRef(todayLog.protein || 0)

  const addMeal = () => {
    if (!name.trim() || !kcal) return
    const cal   = parseInt(kcal) || 0
    const pro   = parseInt(prot) || 0
    const meals = [...(todayLog.meals || []), { name: name.trim(), calories: cal, protein: pro, id: Date.now() }]
    const totalCal  = meals.reduce((s, m) => s + m.calories, 0)
    const totalProt = meals.reduce((s, m) => s + m.protein,  0)
    const wasUnder  = prevProtRef.current < settings.protein
    updateTodayLog({ meals, calories: totalCal, protein: totalProt })
    prevProtRef.current = totalProt
    if (wasUnder && totalProt >= settings.protein) {
      setCelebrate(true)
      setTimeout(() => setCelebrate(false), 3000)
    }
    setName(''); setKcal(''); setProt('')
  }

  const removeMeal = (id) => {
    const meals    = (todayLog.meals || []).filter(m => m.id !== id)
    const totalCal  = meals.reduce((s, m) => s + m.calories, 0)
    const totalProt = meals.reduce((s, m) => s + m.protein,  0)
    updateTodayLog({ meals, calories: totalCal, protein: totalProt })
    prevProtRef.current = totalProt
  }

  const calRem  = settings.calories - (todayLog.calories || 0)
  const protRem = settings.protein  - (todayLog.protein  || 0)
  const calPct  = (todayLog.calories || 0) / settings.calories
  const protPct = (todayLog.protein  || 0) / settings.protein

  const inputStyle = { width: '100%', padding: '10px 12px', fontSize: '13px' }

  return (
    <div className="px-4 pt-8 pb-4 space-y-3 relative">

      {/* Celebration */}
      {celebrate && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center celebrate-fade">
          <div className="celebrate-pop text-center px-8 py-7 card" style={{ borderColor: 'rgba(167,139,250,0.3)' }}>
            <div className="text-5xl mb-2">⚡</div>
            <p className="font-bold text-xl gradient-text">{settings.protein}g</p>
            <p className="text-xs tracking-widest mt-1" style={{ color: 'var(--muted)' }}>PROTEIN GOAL LOCKED IN</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <p className="text-[10px] tracking-[0.2em] mb-1" style={{ color: 'var(--muted)' }}>DAILY FUEL</p>
        <h1 className="text-5xl font-bold tracking-tight" style={{ color: 'var(--strong)' }}>NUTRITION</h1>
      </div>

      {/* Macro blocks */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'CALORIES', value: todayLog.calories || 0, rem: calRem,  unit: 'kcal', pct: calPct  },
          { label: 'PROTEIN',  value: todayLog.protein  || 0, rem: protRem, unit: 'g',    pct: protPct },
        ].map(({ label, value, rem, unit, pct }) => (
          <div key={label} className="card p-4">
            <p className="text-[9px] tracking-widest mb-2" style={{ color: 'var(--muted)' }}>{label}</p>
            <p className={`text-3xl font-bold leading-none mb-2 ${pct >= 0.9 ? 'gradient-text' : ''}`}
              style={pct < 0.9 ? { color: 'var(--strong)' } : {}}>{value}</p>
            {rem > 0
              ? <span className="badge-medium">{rem} {unit} LEFT</span>
              : rem === 0
              ? <span className="badge-high">GOAL HIT ✓</span>
              : <span className="badge-high">{Math.abs(rem)} {unit} OVER</span>}
          </div>
        ))}
      </div>

      {/* Progress bars */}
      <div className="card p-4 space-y-3">
        <Bar label="CALORIES" value={todayLog.calories || 0} max={settings.calories} />
        <Bar label="PROTEIN"  value={todayLog.protein  || 0} max={settings.protein}  />
      </div>

      {/* Add meal */}
      <div className="card p-4 space-y-2">
        <p className="text-[9px] tracking-widest mb-3" style={{ color: 'var(--muted)' }}>LOG MEAL</p>
        <input value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addMeal()}
          placeholder="MEAL NAME" style={inputStyle} />
        <div className="grid grid-cols-2 gap-2">
          <input value={kcal} onChange={e => setKcal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addMeal()}
            placeholder="KCAL" type="number" style={inputStyle} />
          <input value={prot} onChange={e => setProt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addMeal()}
            placeholder="PROTEIN (g)" type="number" style={inputStyle} />
        </div>
        <button onClick={addMeal} className="w-full py-3 text-xs tracking-widest font-bold btn-primary mt-1">
          + ADD MEAL
        </button>
      </div>

      {/* Meal list */}
      {(todayLog.meals || []).length === 0 ? (
        <div className="card py-10 text-center">
          <p className="text-3xl mb-3">🍽</p>
          <p className="text-sm font-bold" style={{ color: 'var(--muted)' }}>NO MEALS LOGGED</p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-dim)' }}>ADD YOUR FIRST MEAL ABOVE</p>
        </div>
      ) : (
        <div className="space-y-2">
          {(todayLog.meals || []).map(meal => (
            <div key={meal.id} className="card p-3 flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-sm font-bold truncate" style={{ color: 'var(--strong)' }}>{meal.name}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>
                  {meal.calories} kcal{meal.protein > 0 && <> · <span className="gradient-text">{meal.protein}g</span> protein</>}
                </p>
              </div>
              <button onClick={() => removeMeal(meal.id)}
                className="text-xl leading-none flex-shrink-0"
                style={{ color: 'var(--muted-dim)' }}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
