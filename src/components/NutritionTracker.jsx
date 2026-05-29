import { useState, useRef } from 'react'
import { IllustrationPlate, DecorativeArcs, SparkAccent } from './Illustrations'

const todayStr = () => new Date().toISOString().split('T')[0]

function TrackBar({ label, value, max, theme }) {
  const pct  = Math.min((value / max) * 100, 100)
  const over = value > max
  return (
    <div>
      <div className="flex justify-between text-xs font-sans mb-1.5">
        <span style={{ color: theme.muted }}>{label}</span>
        <span style={{ color: over ? '#B85C4A' : theme.ink }}>{Math.round(pct)}%</span>
      </div>
      <div className="h-px" style={{ background: theme.border }}>
        <div className="bar-fill h-full" style={{ width: `${pct}%`, background: over ? '#B85C4A' : theme.ink }} />
      </div>
    </div>
  )
}

export default function NutritionTracker({ settings, logs, updateTodayLog, theme }) {
  const today    = todayStr()
  const todayLog = logs[today] || { calories: 0, protein: 0, meals: [] }

  const [name,      setName]      = useState('')
  const [kcal,      setKcal]      = useState('')
  const [prot,      setProt]      = useState('')
  const [celebrate, setCelebrate] = useState(false)
  const prevProtRef = useRef(todayLog.protein || 0)

  const calPct  = (todayLog.calories || 0) / settings.calories
  const protPct = (todayLog.protein  || 0) / settings.protein

  const addMeal = () => {
    if (!name.trim() || !kcal) return
    const cal   = parseInt(kcal) || 0
    const pro   = parseInt(prot) || 0
    const meals = [...(todayLog.meals || []), { name: name.trim(), calories: cal, protein: pro, id: Date.now() }]
    const totalCal  = meals.reduce((s, m) => s + m.calories, 0)
    const totalProt = meals.reduce((s, m) => s + m.protein,  0)

    const wasUnder = prevProtRef.current < settings.protein
    updateTodayLog({ meals, calories: totalCal, protein: totalProt })
    prevProtRef.current = totalProt

    if (wasUnder && totalProt >= settings.protein) {
      setCelebrate(true)
      setTimeout(() => setCelebrate(false), 3200)
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

  const inputStyle = {
    background: 'transparent',
    border: `1px solid ${theme.border}`,
    color: theme.text,
    outline: 'none',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '14px',
    padding: '10px 12px',
    width: '100%',
  }

  const calRemaining  = settings.calories - (todayLog.calories || 0)
  const protRemaining = settings.protein  - (todayLog.protein  || 0)

  return (
    <div className="px-5 pt-10 pb-6 relative">

      {/* ── Protein celebration ───────────────────────────────────── */}
      {celebrate && (
        <div className="fixed inset-0 pointer-events-none z-50 flex flex-col items-center justify-center celebrate-fade">
          <div className="celebrate-pop text-center px-10 py-8"
            style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
            <IllustrationPlate size={56} style={{ color: theme.ink, margin: '0 auto 16px' }} />
            <p className="font-display text-4xl font-semibold mb-1">190g</p>
            <p className="text-xs uppercase tracking-widest font-sans" style={{ color: theme.muted }}>Protein goal reached</p>
          </div>
        </div>
      )}

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="relative mb-10 overflow-hidden">
        <DecorativeArcs
          size={160}
          style={{ color: theme.muted, opacity: 0.1, position: 'absolute', top: -30, right: -30, pointerEvents: 'none' }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[10px] uppercase tracking-[0.25em] font-sans" style={{ color: theme.muted }}>Daily fuel</p>
            <SparkAccent size={10} style={{ color: theme.muted, opacity: 0.5 }} />
          </div>
          <h1 className="font-display text-7xl font-semibold tracking-tight leading-none">Nutrition</h1>
        </div>
      </div>

      {/* ── Macro blocks ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: 'Calories', value: todayLog.calories || 0, goal: settings.calories, unit: 'kcal', pct: calPct,  rem: calRemaining },
          { label: 'Protein',  value: todayLog.protein  || 0, goal: settings.protein,  unit: 'g',    pct: protPct, rem: protRemaining },
        ].map(({ label, value, goal, unit, pct, rem }) => (
          <div key={label} className="p-4" style={{ border: `1px solid ${theme.border}` }}>
            <p className="text-[9px] uppercase tracking-widest font-sans mb-2" style={{ color: theme.muted }}>{label}</p>
            <p className="font-display text-3xl font-semibold leading-none mb-1">{value}</p>
            <p className="text-[10px] font-sans"
              style={{ color: pct > 1.05 ? '#B85C4A' : pct >= 0.9 ? theme.ink : theme.muted }}>
              {rem > 0 ? `${rem} ${unit} left` : rem === 0 ? 'Goal reached ✓' : `${Math.abs(rem)} ${unit} over`}
            </p>
          </div>
        ))}
      </div>

      {/* ── Progress bars ────────────────────────────────────────── */}
      <div className="p-5 mb-4 space-y-4" style={{ border: `1px solid ${theme.border}` }}>
        <TrackBar label="Calories" value={todayLog.calories || 0} max={settings.calories} theme={theme} />
        <TrackBar label="Protein"  value={todayLog.protein  || 0} max={settings.protein}  theme={theme} />
      </div>

      {/* ── Add meal ─────────────────────────────────────────────── */}
      <div className="p-5 mb-4" style={{ border: `1px solid ${theme.border}` }}>
        <p className="text-[9px] uppercase tracking-widest font-sans mb-4" style={{ color: theme.muted }}>Log meal</p>
        <input value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addMeal()}
          placeholder="Meal name" style={{ ...inputStyle, marginBottom: 8 }} />
        <div className="grid grid-cols-2 gap-2 mb-4">
          <input value={kcal} onChange={e => setKcal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addMeal()}
            placeholder="Calories" type="number" style={inputStyle} />
          <input value={prot} onChange={e => setProt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addMeal()}
            placeholder="Protein (g)" type="number" style={inputStyle} />
        </div>
        <button onClick={addMeal}
          className="w-full py-3 text-xs uppercase tracking-[0.15em] font-sans font-medium transition-opacity active:opacity-70"
          style={{ background: theme.ink, color: theme.surface }}>
          + Add meal
        </button>
      </div>

      {/* ── Meal list / empty state ───────────────────────────────── */}
      {(todayLog.meals || []).length === 0 ? (
        <div className="py-12 flex flex-col items-center text-center" style={{ border: `1px solid ${theme.border}` }}>
          <IllustrationPlate
            size={64}
            className="illus-float mb-5"
            style={{ color: theme.muted, opacity: 0.25 }}
          />
          <p className="font-display text-xl font-semibold mb-1">The plate is empty.</p>
          <p className="text-xs font-sans" style={{ color: theme.muted }}>Log your first meal above.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {(todayLog.meals || []).map(meal => (
            <div key={meal.id} className="flex items-center justify-between p-4"
              style={{ border: `1px solid ${theme.border}` }}>
              <div className="flex-1 min-w-0 mr-3">
                <p className="font-sans text-sm font-medium truncate">{meal.name}</p>
                <p className="text-xs font-sans mt-0.5" style={{ color: theme.muted }}>
                  {meal.calories} kcal{meal.protein > 0 && ` · ${meal.protein}g protein`}
                </p>
              </div>
              <button onClick={() => removeMeal(meal.id)}
                className="text-xl leading-none transition-colors flex-shrink-0"
                style={{ color: theme.border }}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
