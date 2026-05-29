import { useState } from 'react'
import { WORKOUT_TEMPLATES } from '../data/workouts'

const todayStr = () => new Date().toISOString().split('T')[0]

export default function WorkoutLogger({ workoutLogs, updateWorkoutLog, dm }) {
  const today     = todayStr()
  const todayWork = workoutLogs[today] || {}

  const [view,      setView]      = useState('select') // 'select' | 'active'
  const [template,  setTemplate]  = useState(null)
  const [exercises, setExercises] = useState([])

  const startSession = (tmpl) => {
    const exs = tmpl.exercises.map(ex => ({
      ...ex,
      sets: [{ reps: ex.defaultReps, weight: ex.defaultWeight, done: false }],
    }))
    setTemplate(tmpl)
    setExercises(exs)
    setView('active')
    updateWorkoutLog(today, { templateId: tmpl.id, templateName: tmpl.name, completed: false, exercises: exs })
  }

  const resumeSession = () => {
    const tmpl = WORKOUT_TEMPLATES.find(t => t.id === todayWork.templateId)
    if (!tmpl) return
    setTemplate(tmpl)
    setExercises(todayWork.exercises || [])
    setView('active')
  }

  const addSet = (ei) => {
    const updated = exercises.map((ex, i) => {
      if (i !== ei) return ex
      const last = ex.sets[ex.sets.length - 1]
      return { ...ex, sets: [...ex.sets, { ...last, done: false }] }
    })
    setExercises(updated)
    updateWorkoutLog(today, { exercises: updated })
  }

  const removeSet = (ei, si) => {
    if (exercises[ei].sets.length <= 1) return
    const updated = exercises.map((ex, i) =>
      i !== ei ? ex : { ...ex, sets: ex.sets.filter((_, j) => j !== si) }
    )
    setExercises(updated)
    updateWorkoutLog(today, { exercises: updated })
  }

  const updateSet = (ei, si, field, val) => {
    const updated = exercises.map((ex, i) =>
      i !== ei ? ex : {
        ...ex,
        sets: ex.sets.map((s, j) => j !== si ? s : { ...s, [field]: val }),
      }
    )
    setExercises(updated)
    updateWorkoutLog(today, { exercises: updated })
  }

  const toggleDone = (ei, si) => {
    updateSet(ei, si, 'done', !exercises[ei].sets[si].done)
  }

  const completeSession = () => {
    updateWorkoutLog(today, { completed: true })
    setView('select')
  }

  if (view === 'active' && template) {
    return (
      <ActiveSession
        template={template}
        exercises={exercises}
        onAddSet={addSet}
        onRemoveSet={removeSet}
        onUpdateSet={updateSet}
        onToggleDone={toggleDone}
        onComplete={completeSession}
        onBack={() => setView('select')}
        dm={dm}
      />
    )
  }

  const border = dm ? 'border-[#1E1E1E]' : 'border-gray-200'

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-[10px] tracking-[0.25em] text-gray-600 mb-0.5">4-DAY SPLIT</p>
          <h1 className="text-4xl font-bold tracking-tight">TRAINING</h1>
        </div>
      </div>

      {/* Today status banner */}
      {todayWork.completed && (
        <div className="border border-[#C8FF00] p-4 mb-4">
          <p className="text-[#C8FF00] font-bold">✓ {todayWork.templateName} COMPLETE</p>
          <p className="text-[9px] text-gray-600 mt-1">SESSION LOCKED IN FOR TODAY</p>
        </div>
      )}
      {todayWork.templateId && !todayWork.completed && (
        <button
          onClick={resumeSession}
          className="w-full border border-[#C8FF00] p-4 mb-4 text-left"
        >
          <p className="text-[9px] tracking-widest text-[#C8FF00] mb-1">IN PROGRESS</p>
          <p className="font-bold">{todayWork.templateName} — RESUME →</p>
        </button>
      )}

      {/* Template grid */}
      <p className="text-[9px] tracking-widest text-gray-600 mb-3">SELECT SESSION</p>
      <div className="space-y-2 mb-6">
        {WORKOUT_TEMPLATES.map(tmpl => (
          <button
            key={tmpl.id}
            onClick={() => startSession(tmpl)}
            className={`w-full border ${border} p-4 text-left hover:border-[#C8FF00] transition-colors active:opacity-80`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-[9px] tracking-widest text-gray-600 mb-0.5">{tmpl.tag}</p>
                <p className="font-bold text-base mb-1">{tmpl.name}</p>
                <p className="text-[10px] text-gray-600 truncate">
                  {tmpl.exercises.map(e => e.name.split(' ').slice(-1)[0]).join(' · ')}
                </p>
              </div>
              <span className="text-[#C8FF00] text-xl ml-3">→</span>
            </div>
          </button>
        ))}
      </div>

      {/* Recent sessions */}
      <p className="text-[9px] tracking-widest text-gray-600 mb-2">RECENT SESSIONS</p>
      {(() => {
        const recent = Object.entries(workoutLogs)
          .filter(([, l]) => l.completed)
          .sort((a, b) => b[0].localeCompare(a[0]))
          .slice(0, 7)
        if (!recent.length)
          return <p className={`text-xs ${dm ? 'text-gray-700' : 'text-gray-400'} text-center py-4 tracking-widest`}>NO SESSIONS YET — START TRAINING</p>
        return (
          <div className="space-y-1">
            {recent.map(([date, log]) => (
              <div key={date} className={`flex justify-between items-center py-2.5 border-b ${border} text-sm`}>
                <span className="text-gray-500 text-xs">{date}</span>
                <span className="text-[#C8FF00] text-xs tracking-widest">{log.templateName}</span>
              </div>
            ))}
          </div>
        )
      })()}
    </div>
  )
}

function ActiveSession({ template, exercises, onAddSet, onRemoveSet, onUpdateSet, onToggleDone, onComplete, onBack, dm }) {
  const totalSets = exercises.reduce((s, ex) => s + ex.sets.length, 0)
  const doneSets  = exercises.reduce((s, ex) => s + ex.sets.filter(s => s.done).length, 0)
  const pct       = totalSets > 0 ? (doneSets / totalSets) * 100 : 0

  const border   = dm ? 'border-[#1E1E1E]' : 'border-gray-200'
  const inputCls = `w-14 bg-transparent border ${dm ? 'border-[#2A2A2A]' : 'border-gray-300'} text-center text-sm p-1.5 outline-none focus:border-[#C8FF00] transition-colors`

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="flex items-end justify-between mb-2">
        <div>
          <button onClick={onBack} className="text-[10px] text-gray-600 tracking-widest mb-1 block">← BACK</button>
          <h1 className="text-3xl font-bold">{template.name}</h1>
          <p className="text-[9px] text-gray-600 mt-0.5">{template.focus}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] tracking-widest text-gray-600">SETS</p>
          <p className="text-3xl font-bold text-[#C8FF00]">{doneSets}<span className="text-gray-600 text-lg">/{totalSets}</span></p>
        </div>
      </div>

      {/* Session progress bar */}
      <div className={`h-[3px] ${dm ? 'bg-[#1C1C1C]' : 'bg-gray-200'} mb-6 overflow-hidden`}>
        <div className="bar-fill h-full bg-[#C8FF00]" style={{ width: `${pct}%` }} />
      </div>

      <div className="space-y-3">
        {exercises.map((ex, ei) => {
          const allDone = ex.sets.every(s => s.done)
          return (
            <div key={ex.name} className={`border ${allDone ? 'border-[#C8FF00]/40' : border} p-4`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-sm leading-tight">{ex.name}</p>
                  <p className="text-[9px] text-gray-600 mt-0.5">{ex.muscle}</p>
                </div>
                <button
                  onClick={() => onAddSet(ei)}
                  className={`text-[10px] border ${dm ? 'border-[#2A2A2A] text-gray-500 hover:border-[#C8FF00] hover:text-[#C8FF00]' : 'border-gray-300 text-gray-400 hover:border-[#C8FF00] hover:text-[#C8FF00]'} px-2 py-1 transition-colors flex-shrink-0 ml-2`}
                >
                  + SET
                </button>
              </div>

              {/* Column headers */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7" />
                <span className="text-[9px] text-gray-600 w-14 text-center">KG</span>
                <span className="text-[9px] text-gray-600 w-3 text-center" />
                <span className="text-[9px] text-gray-600 w-12 text-center">REPS</span>
                <div className="flex-1" />
              </div>

              <div className="space-y-2">
                {ex.sets.map((set, si) => (
                  <div key={si} className={`flex items-center gap-2 ${set.done ? 'opacity-40' : ''}`}>
                    <button
                      onClick={() => onToggleDone(ei, si)}
                      className={`w-7 h-7 border flex-shrink-0 flex items-center justify-center text-xs transition-all
                        ${set.done ? 'border-[#C8FF00] bg-[#C8FF00] text-black check-pop' : dm ? 'border-[#2A2A2A]' : 'border-gray-300'}`}
                    >
                      {set.done ? '✓' : <span className="text-gray-600 text-[10px]">{si + 1}</span>}
                    </button>
                    <input
                      value={set.weight}
                      onChange={e => onUpdateSet(ei, si, 'weight', e.target.value)}
                      className={inputCls}
                      placeholder="—"
                    />
                    <span className="text-gray-600 text-xs">×</span>
                    <input
                      value={set.reps}
                      onChange={e => onUpdateSet(ei, si, 'reps', e.target.value)}
                      type="number"
                      className={inputCls}
                      placeholder="—"
                    />
                    {ex.sets.length > 1 && (
                      <button
                        onClick={() => onRemoveSet(ei, si)}
                        className="text-[#2A2A2A] hover:text-[#FF5555] text-lg leading-none ml-auto transition-colors"
                      >×</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <button
        onClick={onComplete}
        className="w-full mt-6 py-4 bg-[#C8FF00] text-black font-bold tracking-widest text-sm active:opacity-80 transition-opacity"
      >
        COMPLETE SESSION ✓
      </button>
    </div>
  )
}
