import { useState, useRef, useEffect } from 'react'

const todayStr = () => new Date().toISOString().split('T')[0]

function MacroBlock({ label, value, goal, unit, color, dm }) {
  const remaining = goal - value
  return (
    <div className={`border ${dm ? 'border-[#1E1E1E]' : 'border-gray-200'} p-4 flex-1`}>
      <p className="text-[9px] tracking-widest text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold leading-none" style={{ color }}>{value}</p>
      <p className="text-[10px] text-gray-600 mt-1">
        {remaining > 0 ? `${remaining} ${unit} LEFT` : remaining === 0 ? 'GOAL HIT ✓' : `${Math.abs(remaining)} ${unit} OVER`}
      </p>
    </div>
  )
}

function TrackBar({ label, value, max, color, dm }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-1.5">
        <span className="text-gray-500 tracking-widest">{label}</span>
        <span style={{ color }} className="font-bold">{Math.round(pct)}%</span>
      </div>
      <div className={`h-1.5 ${dm ? 'bg-[#1A1A1A]' : 'bg-gray-200'} overflow-hidden`}>
        <div className="bar-fill h-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

export default function NutritionTracker({ settings, logs, updateTodayLog, dm }) {
  const today    = todayStr()
  const todayLog = logs[today] || { calories: 0, protein: 0, meals: [] }

  const [name,     setName]     = useState('')
  const [kcal,     setKcal]     = useState('')
  const [prot,     setProt]     = useState('')
  const [celebrate, setCelebrate] = useState(false)
  const prevProtRef = useRef(todayLog.protein || 0)

  const calPct  = (todayLog.calories || 0) / settings.calories
  const protPct = (todayLog.protein  || 0) / settings.protein
  const calColor  = calPct  > 1.1 ? '#FF5555' : calPct  >= 0.9 ? '#C8FF00' : calPct >= 0.5 ? '#888' : '#444'
  const protColor = protPct > 1.05 ? '#C8FF00' : protPct >= 0.9 ? '#C8FF00' : protPct >= 0.5 ? '#888' : '#444'

  const addMeal = () => {
    if (!name.trim() || !kcal) return
    const cal  = parseInt(kcal)  || 0
    const pro  = parseInt(prot)  || 0
    const meals = [...(todayLog.meals || []), { name: name.trim(), calories: cal, protein: pro, id: Date.now() }]
    const totalCal  = meals.reduce((s, m) => s + m.calories, 0)
    const totalProt = meals.reduce((s, m) => s + m.protein,  0)

    const wasUnder = prevProtRef.current < settings.protein
    const nowOver  = totalProt >= settings.protein
    updateTodayLog({ meals, calories: totalCal, protein: totalProt })
    prevProtRef.current = totalProt

    if (wasUnder && nowOver) {
      setCelebrate(true)
      setTimeout(() => setCelebrate(false), 3000)
    }

    setName(''); setKcal(''); setProt('')
  }

  const removeMeal = (id) => {
    const meals     = (todayLog.meals || []).filter(m => m.id !== id)
    const totalCal  = meals.reduce((s, m) => s + m.calories, 0)
    const totalProt = meals.reduce((s, m) => s + m.protein,  0)
    updateTodayLog({ meals, calories: totalCal, protein: totalProt })
    prevProtRef.current = totalProt
  }

  const border  = dm ? 'border-[#1E1E1E]' : 'border-gray-200'
  const inputCls = `w-full bg-transparent border ${dm ? 'border-[#2A2A2A]' : 'border-gray-300'} p-2.5 text-sm outline-none focus:border-[#C8FF00] transition-colors placeholder-[#3A3A3A]`

  return (
    <div className="px-4 pt-6 pb-4 relative">

      {/* Celebration overlay */}
      {celebrate && (
        <div className="fixed inset-0 pointer-events-none z-50 flex flex-col items-center justify-center celebrate-fade">
          <div className="celebrate-pop text-center">
            <div className="text-7xl mb-3">⚡</div>
            <div className="text-[#C8FF00] font-bold text-xl tracking-widest">PROTEIN GOAL</div>
            <div className="text-[#C8FF00] font-bold text-xl tracking-widest">LOCKED IN</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-[10px] tracking-[0.25em] text-gray-600 mb-0.5">DAILY FUEL</p>
          <h1 className="text-4xl font-bold tracking-tight">NUTRITION</h1>
        </div>
        <div className="text-right">
          <p className="text-[9px] tracking-widest text-gray-600">{today.slice(5)}</p>
        </div>
      </div>

      {/* Macro blocks */}
      <div className="flex gap-2 mb-3">
        <MacroBlock label="CALORIES" value={todayLog.calories || 0} goal={settings.calories} unit="kcal" color={calColor}  dm={dm} />
        <MacroBlock label="PROTEIN"  value={todayLog.protein  || 0} goal={settings.protein}  unit="g"    color={protColor} dm={dm} />
      </div>

      {/* Progress bars */}
      <div className={`border ${border} p-4 mb-3 space-y-3`}>
        <TrackBar label="CALORIES" value={todayLog.calories || 0} max={settings.calories} color={calColor}  dm={dm} />
        <TrackBar label="PROTEIN"  value={todayLog.protein  || 0} max={settings.protein}  color={protColor} dm={dm} />
      </div>

      {/* Add meal form */}
      <div className={`border ${border} p-4 mb-3`}>
        <p className="text-[9px] tracking-widest text-gray-600 mb-3">LOG MEAL</p>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addMeal()}
          placeholder="MEAL NAME"
          className={`${inputCls} mb-2`}
        />
        <div className="grid grid-cols-2 gap-2 mb-3">
          <input
            value={kcal}
            onChange={e => setKcal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addMeal()}
            placeholder="KCAL"
            type="number"
            className={inputCls}
          />
          <input
            value={prot}
            onChange={e => setProt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addMeal()}
            placeholder="PROTEIN (g)"
            type="number"
            className={inputCls}
          />
        </div>
        <button
          onClick={addMeal}
          className="w-full py-3 bg-[#C8FF00] text-black text-xs tracking-widest font-bold active:opacity-80 transition-opacity"
        >
          + ADD MEAL
        </button>
      </div>

      {/* Meal list */}
      <div className="space-y-1">
        {(todayLog.meals || []).length === 0 && (
          <p className={`text-center text-xs ${dm ? 'text-gray-700' : 'text-gray-400'} py-6 tracking-widest`}>
            NO MEALS LOGGED TODAY
          </p>
        )}
        {(todayLog.meals || []).map(meal => (
          <div key={meal.id} className={`border ${border} p-3 flex items-center justify-between`}>
            <div className="flex-1 min-w-0 mr-3">
              <p className="font-bold text-sm truncate">{meal.name}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                {meal.calories} kcal
                {meal.protein > 0 && <> · <span className="text-[#C8FF00]">{meal.protein}g</span> protein</>}
              </p>
            </div>
            <button
              onClick={() => removeMeal(meal.id)}
              className={`text-xl leading-none ${dm ? 'text-[#2A2A2A] hover:text-[#FF5555]' : 'text-gray-300 hover:text-red-400'} transition-colors flex-shrink-0`}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
