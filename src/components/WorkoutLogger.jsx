import { useState } from 'react'
import { WORKOUT_TEMPLATES } from '../data/workouts'

const todayStr = () => new Date().toISOString().split('T')[0]

export default function WorkoutLogger({ workoutLogs, updateWorkoutLog }) {
  const today     = todayStr()
  const todayWork = workoutLogs[today] || {}

  const [view,      setView]      = useState('select')
  const [template,  setTemplate]  = useState(null)
  const [exercises, setExercises] = useState([])

  const startSession = (tmpl) => {
    const exs = tmpl.exercises.map(ex => ({
      ...ex, sets: [{ reps: ex.defaultReps, weight: ex.defaultWeight, done: false }],
    }))
    setTemplate(tmpl); setExercises(exs); setView('active')
    updateWorkoutLog(today, { templateId: tmpl.id, templateName: tmpl.name, completed: false, exercises: exs })
  }

  const resumeSession = () => {
    const tmpl = WORKOUT_TEMPLATES.find(t => t.id === todayWork.templateId)
    if (!tmpl) return
    setTemplate(tmpl); setExercises(todayWork.exercises || []); setView('active')
  }

  const addSet = (ei) => {
    const updated = exercises.map((ex, i) => {
      if (i !== ei) return ex
      const last = ex.sets[ex.sets.length - 1]
      return { ...ex, sets: [...ex.sets, { ...last, done: false }] }
    })
    setExercises(updated); updateWorkoutLog(today, { exercises: updated })
  }

  const removeSet = (ei, si) => {
    if (exercises[ei].sets.length <= 1) return
    const updated = exercises.map((ex, i) =>
      i !== ei ? ex : { ...ex, sets: ex.sets.filter((_, j) => j !== si) }
    )
    setExercises(updated); updateWorkoutLog(today, { exercises: updated })
  }

  const updateSet = (ei, si, field, val) => {
    const updated = exercises.map((ex, i) =>
      i !== ei ? ex : { ...ex, sets: ex.sets.map((s, j) => j !== si ? s : { ...s, [field]: val }) }
    )
    setExercises(updated); updateWorkoutLog(today, { exercises: updated })
  }

  const toggleDone      = (ei, si) => updateSet(ei, si, 'done', !exercises[ei].sets[si].done)
  const completeSession = () => { updateWorkoutLog(today, { completed: true }); setView('select') }

  if (view === 'active' && template) {
    return <ActiveSession
      template={template} exercises={exercises}
      onAddSet={addSet} onRemoveSet={removeSet}
      onUpdateSet={updateSet} onToggleDone={toggleDone}
      onComplete={completeSession} onBack={() => setView('select')}
    />
  }

  const noHistory = Object.values(workoutLogs).filter(l => l.completed).length === 0

  return (
    <div style={{ padding: '24px 20px', maxWidth: 680, width: '100%' }} className="space-y-3">
      <div className="mb-6">
        <p className="text-[10px] tracking-[0.2em] mb-1" style={{ color: 'var(--muted)' }}>4-DAY SPLIT</p>
        <h1 className="text-5xl font-bold tracking-tight" style={{ color: 'var(--strong)' }}>TRAINING</h1>
      </div>

      {/* Today status */}
      {todayWork.completed && (
        <div className="card p-4 flex items-center justify-between" style={{ borderColor: 'rgba(249,115,22,0.25)' }}>
          <div>
            <p className="text-[9px] tracking-widest mb-2" style={{ color: 'var(--muted)' }}>TODAY</p>
            <span className="badge-high">✓ {todayWork.templateName}</span>
          </div>
          <span className="check-pop gradient-text text-xl">✓</span>
        </div>
      )}
      {todayWork.templateId && !todayWork.completed && (
        <button onClick={resumeSession} className="w-full card p-4 text-left"
          style={{ borderColor: 'rgba(167,139,250,0.25)' }}>
          <p className="text-[9px] tracking-widest mb-2" style={{ color: 'var(--muted)' }}>TODAY</p>
          <span className="badge-medium">{todayWork.templateName} — RESUME →</span>
        </button>
      )}

      {/* Templates */}
      <p className="text-[9px] tracking-widest pt-2" style={{ color: 'var(--muted)' }}>SELECT SESSION</p>
      <div className="space-y-2">
        {WORKOUT_TEMPLATES.map(tmpl => (
          <button key={tmpl.id} onClick={() => startSession(tmpl)}
            className="w-full card list-row p-4 text-left active:scale-[0.98]">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <span className="badge-medium mb-2 inline-block">{tmpl.tag}</span>
                <p className="font-bold text-base mb-1" style={{ color: 'var(--strong)' }}>{tmpl.name}</p>
                <p className="text-[10px] truncate" style={{ color: 'var(--muted)' }}>
                  {tmpl.exercises.map(e => e.name.split(' ').slice(-1)[0]).join(' · ')}
                </p>
              </div>
              <span className="text-xl ml-3" style={{ color: 'var(--muted)' }}>→</span>
            </div>
          </button>
        ))}
      </div>

      {/* Recent */}
      <p className="text-[9px] tracking-widest pt-2" style={{ color: 'var(--muted)' }}>RECENT SESSIONS</p>
      {noHistory ? (
        <div className="card py-10 text-center">
          <p className="text-3xl mb-3">🏋️</p>
          <p className="text-sm font-bold" style={{ color: 'var(--muted)' }}>NO SESSIONS YET</p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-dim)' }}>START YOUR FIRST SESSION ABOVE</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {Object.entries(workoutLogs)
            .filter(([, l]) => l.completed)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .slice(0, 7)
            .map(([date, log], i, arr) => (
              <div key={date} className="list-row flex justify-between items-center px-4 py-3"
                style={i < arr.length - 1 ? { borderBottom: '0.5px solid var(--border)' } : {}}>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>{date}</span>
                <span className="text-xs font-bold gradient-text">{log.templateName}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

function ActiveSession({ template, exercises, onAddSet, onRemoveSet, onUpdateSet, onToggleDone, onComplete, onBack }) {
  const totalSets = exercises.reduce((s, ex) => s + ex.sets.length, 0)
  const doneSets  = exercises.reduce((s, ex) => s + ex.sets.filter(s => s.done).length, 0)
  const pct       = totalSets > 0 ? (doneSets / totalSets) * 100 : 0

  const inputStyle = {
    width: '54px', padding: '6px', fontSize: '13px', textAlign: 'center',
  }

  return (
    <div className="px-4 pt-8 pb-4 space-y-4">
      <div className="flex items-end justify-between mb-2">
        <div>
          <button onClick={onBack} className="text-[10px] tracking-widest mb-2 block"
            style={{ color: 'var(--muted)' }}>← BACK</button>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--strong)' }}>{template.name}</h1>
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>{template.focus}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] tracking-widest mb-1" style={{ color: 'var(--muted)' }}>SETS</p>
          <p className="text-3xl font-bold leading-none">
            <span className="gradient-text">{doneSets}</span>
            <span style={{ color: 'var(--muted)' }} className="text-xl">/{totalSets}</span>
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bar-track">
        <div className="bar-fill" style={{ width: `${pct}%`, height: '100%' }} />
      </div>

      {exercises.map((ex, ei) => {
        const allDone = ex.sets.every(s => s.done)
        return (
          <div key={ex.name} className="card p-4"
            style={allDone ? { borderColor: 'rgba(167,139,250,0.35)' } : {}}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-bold text-sm" style={{ color: 'var(--strong)' }}>{ex.name}</p>
                <p className="text-[9px] tracking-widest mt-0.5" style={{ color: 'var(--muted)' }}>{ex.muscle}</p>
              </div>
              <button onClick={() => onAddSet(ei)} className="btn-ghost text-[10px] px-2 py-1 ml-2">+ SET</button>
            </div>

            <div className="flex gap-2 mb-2 items-center">
              <div style={{ width: 28 }} />
              <span className="text-[9px] tracking-widest text-center" style={{ width: 54, color: 'var(--muted)' }}>KG</span>
              <span className="text-[9px] text-center px-1" style={{ color: 'var(--muted)' }}>×</span>
              <span className="text-[9px] tracking-widest text-center" style={{ width: 54, color: 'var(--muted)' }}>REPS</span>
            </div>

            <div className="space-y-2">
              {ex.sets.map((set, si) => (
                <div key={si} className="flex items-center gap-2" style={{ opacity: set.done ? 0.35 : 1 }}>
                  <button onClick={() => onToggleDone(ei, si)}
                    className={`flex items-center justify-center text-xs flex-shrink-0 ${set.done ? 'check-pop' : ''}`}
                    style={{
                      width: 28, height: 28,
                      borderRadius: '6px',
                      background: set.done ? 'linear-gradient(135deg, #a78bfa, #f97316)' : 'rgba(255,255,255,0.04)',
                      border: set.done ? 'none' : '0.5px solid rgba(255,255,255,0.15)',
                      color: set.done ? '#fff' : 'var(--muted)',
                    }}>
                    {set.done ? '✓' : si + 1}
                  </button>
                  <input value={set.weight} onChange={e => onUpdateSet(ei, si, 'weight', e.target.value)}
                    style={inputStyle} placeholder="—" />
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>×</span>
                  <input value={set.reps} onChange={e => onUpdateSet(ei, si, 'reps', e.target.value)}
                    type="number" style={inputStyle} placeholder="—" />
                  {ex.sets.length > 1 && (
                    <button onClick={() => onRemoveSet(ei, si)}
                      className="text-xl leading-none ml-auto"
                      style={{ color: 'var(--muted-dim)' }}>×</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}

      <button onClick={onComplete} className="w-full py-4 text-sm tracking-widest font-bold btn-primary">
        COMPLETE SESSION ✓
      </button>
    </div>
  )
}
