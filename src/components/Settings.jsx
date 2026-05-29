import { useState, useEffect } from 'react'

export default function Settings({ settings, updateSettings, resetData }) {
  const [form, setForm] = useState({
    calories:     settings.calories,
    protein:      settings.protein,
    targetWeight: settings.targetWeight,
    weight:       settings.weight,
    bodyFat:      settings.bodyFat,
  })
  const [saved,        setSaved]        = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

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

  const inputStyle = { width: '100%', padding: '10px 12px', fontSize: '13px' }

  const FIELDS = [
    { key: 'calories',     label: 'DAILY CALORIES',     unit: 'kcal' },
    { key: 'protein',      label: 'DAILY PROTEIN GOAL', unit: 'g'    },
    { key: 'targetWeight', label: 'TARGET WEIGHT',      unit: 'kg'   },
    { key: 'weight',       label: 'CURRENT WEIGHT',     unit: 'kg'   },
    { key: 'bodyFat',      label: 'EST. BODY FAT',      unit: '%'    },
  ]

  return (
    <div className="px-4 pt-8 pb-4 space-y-3">

      <div className="mb-6">
        <p className="text-[10px] tracking-[0.2em] mb-1" style={{ color: 'var(--muted)' }}>CONFIGURATION</p>
        <h1 className="text-5xl font-bold tracking-tight" style={{ color: 'var(--strong)' }}>SETTINGS</h1>
      </div>

      {/* Goals */}
      <div className="card p-4 space-y-3">
        <p className="text-[9px] tracking-widest mb-1" style={{ color: 'var(--muted)' }}>GOALS & STATS</p>
        {FIELDS.map(({ key, label, unit }) => (
          <div key={key}>
            <div className="flex justify-between text-[9px] tracking-widest mb-1.5" style={{ color: 'var(--muted)' }}>
              <span>{label}</span><span>{unit}</span>
            </div>
            <input value={form[key]}
              onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
              type="number"
              step={key === 'calories' || key === 'protein' ? '1' : '0.1'}
              style={inputStyle} />
          </div>
        ))}
        <button onClick={save}
          className={`w-full py-3 text-xs tracking-widest font-bold mt-1 ${saved ? 'btn-ghost' : 'btn-primary'}`}>
          {saved ? '✓ SAVED' : 'SAVE CHANGES'}
        </button>
      </div>

      {/* Profile */}
      <div className="card p-4">
        <p className="text-[9px] tracking-widest mb-4" style={{ color: 'var(--muted)' }}>PROFILE</p>
        <div className="space-y-3">
          {[
            ['HEIGHT',     '191 cm'],
            ['GOAL',       'LEAN + ATHLETIC'],
            ['PROTOCOL',   '4-DAY SPLIT'],
            ['START DATE', settings.startDate],
          ].map(([k, v], i, arr) => (
            <div key={k} className="flex justify-between text-xs pb-3"
              style={i < arr.length - 1 ? { borderBottom: '0.5px solid var(--border)' } : {}}>
              <span style={{ color: 'var(--muted)' }}>{k}</span>
              <span className="font-bold" style={{ color: 'var(--strong)' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Daily targets */}
      <div className="card p-4">
        <p className="text-[9px] tracking-widest mb-4" style={{ color: 'var(--muted)' }}>DAILY TARGETS</p>
        <div className="space-y-3 text-xs">
          <div className="flex justify-between">
            <span style={{ color: 'var(--muted)' }}>CALORIES</span>
            <span className="font-bold gradient-text">{settings.calories} kcal</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--muted)' }}>PROTEIN</span>
            <span className="font-bold gradient-text">{settings.protein}g</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--muted)' }}>TARGET WEIGHT</span>
            <span className="font-bold" style={{ color: 'var(--strong)' }}>{settings.targetWeight} kg</span>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="card p-4" style={{ borderColor: 'rgba(249,115,22,0.2)' }}>
        <p className="text-[9px] tracking-widest mb-4" style={{ color: 'rgba(249,115,22,0.7)' }}>DANGER ZONE</p>
        {confirmReset ? (
          <>
            <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>
              THIS WILL DELETE ALL LOGS, WORKOUTS AND MEASUREMENTS. THIS CANNOT BE UNDONE.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setConfirmReset(false)} className="py-2.5 text-xs tracking-widest btn-ghost">
                CANCEL
              </button>
              <button onClick={() => { resetData(); setConfirmReset(false) }}
                className="py-2.5 text-xs tracking-widest font-bold text-white"
                style={{ background: 'rgba(249,115,22,0.8)', borderRadius: '8px' }}>
                CONFIRM RESET
              </button>
            </div>
          </>
        ) : (
          <button onClick={() => setConfirmReset(true)}
            className="w-full py-2.5 text-xs tracking-widest btn-ghost"
            style={{ borderColor: 'rgba(249,115,22,0.25)', color: 'rgba(249,115,22,0.7)' }}>
            RESET ALL DATA
          </button>
        )}
      </div>
    </div>
  )
}
