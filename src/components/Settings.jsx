import { useState, useEffect } from 'react'

export default function Settings({ settings, updateSettings, resetData, theme }) {
  const [form, setForm] = useState({
    calories:     settings.calories,
    protein:      settings.protein,
    targetWeight: settings.targetWeight,
    weight:       settings.weight,
    bodyFat:      settings.bodyFat,
  })
  const [saved,         setSaved]         = useState(false)
  const [confirmReset,  setConfirmReset]  = useState(false)

  useEffect(() => {
    setForm({
      calories:     settings.calories,
      protein:      settings.protein,
      targetWeight: settings.targetWeight,
      weight:       settings.weight,
      bodyFat:      settings.bodyFat,
    })
  }, [settings])

  const save = () => {
    updateSettings({
      calories:     parseInt(form.calories)       || 2400,
      protein:      parseInt(form.protein)        || 190,
      targetWeight: parseFloat(form.targetWeight) || 78,
      weight:       parseFloat(form.weight)       || 82,
      bodyFat:      parseFloat(form.bodyFat)      || 20,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const inputStyle = {
    width: '100%',
    background: 'transparent',
    border: `1px solid ${theme.border}`,
    color: theme.text,
    outline: 'none',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '14px',
    padding: '10px 12px',
  }

  const FIELDS = [
    { key: 'calories',     label: 'Daily calories',     unit: 'kcal' },
    { key: 'protein',      label: 'Daily protein goal', unit: 'g'    },
    { key: 'targetWeight', label: 'Target weight',      unit: 'kg'   },
    { key: 'weight',       label: 'Current weight',     unit: 'kg'   },
    { key: 'bodyFat',      label: 'Est. body fat',      unit: '%'    },
  ]

  return (
    <div className="px-5 pt-10 pb-6">
      <div className="mb-10">
        <p className="text-[10px] uppercase tracking-[0.25em] font-sans mb-1" style={{ color: theme.muted }}>Configuration</p>
        <h1 className="font-display text-6xl font-semibold tracking-tight leading-none">Settings</h1>
      </div>

      {/* Dark mode */}
      <div className="flex items-center justify-between p-4 mb-4" style={{ border: `1px solid ${theme.border}` }}>
        <div>
          <p className="font-sans text-sm font-medium">Dark mode</p>
          <p className="text-[9px] uppercase tracking-widest font-sans mt-0.5" style={{ color: theme.muted }}>Toggle appearance</p>
        </div>
        <button
          onClick={() => updateSettings({ darkMode: !settings.darkMode })}
          className="relative flex-shrink-0 transition-colors"
          style={{
            width: 44, height: 24,
            border: `1px solid ${settings.darkMode ? theme.ink : theme.border}`,
            background: 'transparent',
          }}>
          <div className="absolute top-[3px] transition-all duration-200"
            style={{
              width: 16, height: 16,
              left: settings.darkMode ? 22 : 4,
              background: settings.darkMode ? theme.ink : theme.border,
            }} />
        </button>
      </div>

      {/* Goals */}
      <div className="p-5 mb-4" style={{ border: `1px solid ${theme.border}` }}>
        <p className="text-[9px] uppercase tracking-widest font-sans mb-5" style={{ color: theme.muted }}>Goals & stats</p>
        <div className="space-y-3">
          {FIELDS.map(({ key, label, unit }) => (
            <div key={key}>
              <div className="flex justify-between text-[9px] uppercase tracking-widest font-sans mb-1.5" style={{ color: theme.muted }}>
                <span>{label}</span><span>{unit}</span>
              </div>
              <input
                value={form[key]}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                type="number"
                step={key === 'calories' || key === 'protein' ? '1' : '0.1'}
                style={inputStyle}
              />
            </div>
          ))}
        </div>
        <button onClick={save}
          className="w-full mt-5 py-3 text-xs uppercase tracking-[0.15em] font-sans font-medium transition-all active:opacity-70"
          style={{
            background: saved ? 'transparent' : theme.ink,
            color: saved ? theme.ink : theme.surface,
            border: saved ? `1px solid ${theme.ink}` : 'none',
          }}>
          {saved ? '✓ Saved' : 'Save changes'}
        </button>
      </div>

      {/* Profile */}
      <div className="p-5 mb-4" style={{ border: `1px solid ${theme.border}` }}>
        <p className="text-[9px] uppercase tracking-widest font-sans mb-4" style={{ color: theme.muted }}>Profile</p>
        <div className="space-y-3">
          {[
            ['Height',     '191 cm'],
            ['Goal',       'Lean + athletic'],
            ['Protocol',   '4-day split'],
            ['Start date', settings.startDate],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm font-sans pb-3"
              style={{ borderBottom: `1px solid ${theme.border}` }}>
              <span style={{ color: theme.muted }}>{k}</span>
              <span className="font-medium">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Daily targets */}
      <div className="p-5 mb-4" style={{ border: `1px solid ${theme.border}` }}>
        <p className="text-[9px] uppercase tracking-widest font-sans mb-4" style={{ color: theme.muted }}>Daily targets</p>
        <div className="space-y-3 text-sm font-sans">
          <div className="flex justify-between">
            <span style={{ color: theme.muted }}>Calories</span>
            <span className="font-semibold">{settings.calories} kcal</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: theme.muted }}>Protein</span>
            <span className="font-semibold">{settings.protein} g</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: theme.muted }}>Target weight</span>
            <span className="font-semibold">{settings.targetWeight} kg</span>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="p-5" style={{ border: '1px solid #E5C5C0' }}>
        <p className="text-[9px] uppercase tracking-widest font-sans mb-4" style={{ color: '#B85C4A' }}>Danger zone</p>
        {confirmReset ? (
          <>
            <p className="text-xs font-sans mb-4" style={{ color: theme.muted }}>
              This will delete all logs, workouts, and measurements. This cannot be undone.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setConfirmReset(false)}
                className="py-2.5 text-xs uppercase tracking-widest font-sans transition-opacity active:opacity-70"
                style={{ border: `1px solid ${theme.border}`, color: theme.muted }}>
                Cancel
              </button>
              <button onClick={() => { resetData(); setConfirmReset(false) }}
                className="py-2.5 text-xs uppercase tracking-widest font-sans font-medium transition-opacity active:opacity-70"
                style={{ background: '#B85C4A', color: '#FFFFFF' }}>
                Confirm
              </button>
            </div>
          </>
        ) : (
          <button onClick={() => setConfirmReset(true)}
            className="w-full py-2.5 text-xs uppercase tracking-widest font-sans transition-opacity active:opacity-70"
            style={{ border: '1px solid #E5C5C0', color: '#B85C4A' }}>
            Reset all data
          </button>
        )}
      </div>
    </div>
  )
}
