import { useState, useEffect } from 'react'

export default function Settings({ settings, updateSettings, resetData, dm }) {
  const [form, setForm] = useState({
    calories:     settings.calories,
    protein:      settings.protein,
    targetWeight: settings.targetWeight,
    weight:       settings.weight,
    bodyFat:      settings.bodyFat,
  })
  const [saved,       setSaved]       = useState(false)
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

  const border  = dm ? 'border-[#1E1E1E]' : 'border-gray-200'
  const inputCls = `w-full bg-transparent border ${dm ? 'border-[#2A2A2A]' : 'border-gray-300'} p-2.5 text-sm outline-none focus:border-[#C8FF00] transition-colors`

  const FIELDS = [
    { key: 'calories',     label: 'DAILY CALORIES',     unit: 'kcal' },
    { key: 'protein',      label: 'DAILY PROTEIN GOAL', unit: 'g'    },
    { key: 'targetWeight', label: 'TARGET WEIGHT',      unit: 'kg'   },
    { key: 'weight',       label: 'CURRENT WEIGHT',     unit: 'kg'   },
    { key: 'bodyFat',      label: 'EST. BODY FAT',      unit: '%'    },
  ]

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="mb-6">
        <p className="text-[10px] tracking-[0.25em] text-gray-600 mb-0.5">CONFIGURATION</p>
        <h1 className="text-4xl font-bold tracking-tight">SETTINGS</h1>
      </div>

      {/* Dark mode toggle */}
      <div className={`border ${border} p-4 mb-3 flex items-center justify-between`}>
        <div>
          <p className="font-bold text-sm">DARK MODE</p>
          <p className="text-[9px] text-gray-600 mt-0.5">TOGGLE APPEARANCE</p>
        </div>
        <button
          onClick={() => updateSettings({ darkMode: !settings.darkMode })}
          className={`relative w-12 h-6 border transition-colors ${settings.darkMode ? 'border-[#C8FF00]' : dm ? 'border-[#2A2A2A]' : 'border-gray-300'}`}
          aria-label="Toggle dark mode"
        >
          <div
            className={`absolute top-[3px] w-[18px] h-[18px] transition-all duration-200 ${settings.darkMode ? 'left-[22px] bg-[#C8FF00]' : 'left-[3px] bg-gray-400'}`}
          />
        </button>
      </div>

      {/* Goals */}
      <div className={`border ${border} p-4 mb-3`}>
        <p className="text-[9px] tracking-widest text-gray-600 mb-4">GOALS & STATS</p>
        <div className="space-y-3">
          {FIELDS.map(({ key, label, unit }) => (
            <div key={key}>
              <div className="flex justify-between text-[9px] tracking-widest text-gray-600 mb-1.5">
                <span>{label}</span>
                <span>{unit}</span>
              </div>
              <input
                value={form[key]}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                type="number"
                step={key === 'calories' || key === 'protein' ? '1' : '0.1'}
                className={inputCls}
              />
            </div>
          ))}
        </div>
        <button
          onClick={save}
          className={`w-full mt-4 py-3 font-bold text-xs tracking-widest transition-all active:opacity-80
            ${saved ? 'bg-white text-black border border-[#C8FF00]' : 'bg-[#C8FF00] text-black'}`}
        >
          {saved ? '✓ SAVED' : 'SAVE CHANGES'}
        </button>
      </div>

      {/* Profile */}
      <div className={`border ${border} p-4 mb-3`}>
        <p className="text-[9px] tracking-widest text-gray-600 mb-3">PROFILE</p>
        <div className={`space-y-2 text-xs ${dm ? 'text-gray-400' : 'text-gray-600'}`}>
          {[
            ['HEIGHT',    '191cm'],
            ['GOAL',      'LEAN + ATHLETIC'],
            ['PROTOCOL',  '4-DAY SPLIT'],
            ['START DATE', settings.startDate],
          ].map(([k, v]) => (
            <div key={k} className={`flex justify-between border-b ${dm ? 'border-[#1A1A1A]' : 'border-gray-100'} pb-2`}>
              <span className="text-gray-600">{k}</span>
              <span className="font-bold">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Daily targets info */}
      <div className={`border ${border} p-4 mb-3`}>
        <p className="text-[9px] tracking-widest text-gray-600 mb-3">DAILY TARGETS</p>
        <div className={`space-y-2 text-xs ${dm ? 'text-gray-400' : 'text-gray-600'}`}>
          <div className="flex justify-between">
            <span className="text-gray-600">CALORIES</span>
            <span className="font-bold text-[#C8FF00]">{settings.calories} kcal</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">PROTEIN</span>
            <span className="font-bold text-[#C8FF00]">{settings.protein}g</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">TARGET WEIGHT</span>
            <span className="font-bold">{settings.targetWeight}kg</span>
          </div>
          <div className={`pt-2 text-[9px] text-gray-600 border-t ${dm ? 'border-[#1A1A1A]' : 'border-gray-100'}`}>
            ~{(settings.protein * 4 + (settings.calories - settings.protein * 4) * 0.3 / 9).toFixed(0)}g fat ·{' '}
            ~{((settings.calories - settings.protein * 4) * 0.7 / 4).toFixed(0)}g carbs (estimated)
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="border border-red-900/50 p-4">
        <p className="text-[9px] tracking-widest text-red-500/70 mb-3">DANGER ZONE</p>
        {confirmReset ? (
          <>
            <p className="text-xs text-gray-500 mb-3">THIS WILL DELETE ALL LOGS, WORKOUTS AND MEASUREMENTS. THIS CANNOT BE UNDONE.</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setConfirmReset(false)}
                className={`py-2.5 border ${border} text-xs tracking-widest`}
              >CANCEL</button>
              <button
                onClick={() => { resetData(); setConfirmReset(false) }}
                className="py-2.5 bg-red-600 text-white text-xs tracking-widest font-bold"
              >CONFIRM RESET</button>
            </div>
          </>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            className="w-full py-2.5 border border-red-900/50 text-red-500/70 text-xs tracking-widest hover:border-red-500 hover:text-red-400 transition-colors"
          >
            RESET ALL DATA
          </button>
        )}
      </div>
    </div>
  )
}
