import { useState } from 'react'
import { WORKOUT_TEMPLATES } from '../data/workouts'
import { IllustrationBarbell, IllustrationHammer, DecorativeArcs, SparkAccent } from './Illustrations'

const todayStr = () => new Date().toISOString().split('T')[0]

export default function WorkoutLogger({ workoutLogs, updateWorkoutLog, theme }) {
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
      onComplete={completeSession} onBack={() => setView('select')} theme={theme}
    />
  }

  const noHistory = Object.values(workoutLogs).filter(l => l.completed).length === 0

  return (
    <div className="px-5 pt-10 pb-6">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="relative mb-10 overflow-hidden">
        <DecorativeArcs
          size={160}
          style={{ color: theme.muted, opacity: 0.1, position: 'absolute', top: -30, right: -30, pointerEvents: 'none' }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[10px] uppercase tracking-[0.25em] font-sans" style={{ color: theme.muted }}>4-day split</p>
            <SparkAccent size={10} style={{ color: theme.muted, opacity: 0.5 }} />
          </div>
          <h1 className="font-display text-7xl font-semibold tracking-tight leading-none">Training</h1>
        </div>
      </div>

      {/* ── Today status ─────────────────────────────────────────── */}
      {todayWork.completed && (
        <div className="p-4 mb-6 flex items-center justify-between"
          style={{ border: `1px solid ${theme.ink}` }}>
          <div>
            <p className="text-[9px] uppercase tracking-widest font-sans mb-0.5" style={{ color: theme.muted }}>Completed today</p>
            <p className="font-sans text-sm font-medium">{todayWork.templateName}</p>
          </div>
          <span className="check-pop text-lg">✓</span>
        </div>
      )}
      {todayWork.templateId && !todayWork.completed && (
        <button onClick={resumeSession}
          className="w-full p-4 mb-6 text-left transition-opacity active:opacity-70"
          style={{ border: `1px solid ${theme.ink}` }}>
          <p className="text-[9px] uppercase tracking-widest font-sans mb-0.5" style={{ color: theme.muted }}>In progress</p>
          <p className="font-sans text-sm font-medium">{todayWork.templateName} — Resume →</p>
        </button>
      )}

      {/* ── Templates ────────────────────────────────────────────── */}
      <p className="text-[9px] uppercase tracking-widest font-sans mb-3" style={{ color: theme.muted }}>Select session</p>
      <div className="space-y-2 mb-8">
        {WORKOUT_TEMPLATES.map(tmpl => (
          <button key={tmpl.id} onClick={() => startSession(tmpl)}
            className="w-full p-4 text-left transition-colors active:opacity-70"
            style={{ border: `1px solid ${theme.border}` }}>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-[9px] uppercase tracking-widest font-sans mb-1" style={{ color: theme.muted }}>{tmpl.tag}</p>
                <p className="font-display text-xl font-semibold mb-1">{tmpl.name}</p>
                <p className="text-xs font-sans truncate" style={{ color: theme.muted }}>
                  {tmpl.exercises.map(e => e.name.split(' ').slice(-1)[0]).join(' · ')}
                </p>
              </div>
              <span className="text-base ml-3" style={{ color: theme.muted }}>→</span>
            </div>
          </button>
        ))}
      </div>

      {/* ── Recent sessions / empty state ────────────────────────── */}
      <p className="text-[9px] uppercase tracking-widest font-sans mb-3" style={{ color: theme.muted }}>Recent sessions</p>
      {noHistory ? (
        <div className="py-12 flex flex-col items-center text-center" style={{ border: `1px solid ${theme.border}` }}>
          <IllustrationBarbell
            size={110}
            className="illus-float mb-5"
            style={{ color: theme.muted, opacity: 0.2 }}
          />
          <p className="font-display text-xl font-semibold mb-1">The bar is unloaded.</p>
          <p className="text-xs font-sans" style={{ color: theme.muted }}>
            Complete your first session<br />to start your history.
          </p>
        </div>
      ) : (
        <div>
          {Object.entries(workoutLogs)
            .filter(([, l]) => l.completed)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .slice(0, 7)
            .map(([date, log]) => (
              <div key={date} className="flex justify-between items-center py-3 text-sm font-sans"
                style={{ borderBottom: `1px solid ${theme.border}` }}>
                <span style={{ color: theme.muted }}>{date}</span>
                <span className="font-medium text-xs uppercase tracking-widest">{log.templateName}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

function ActiveSession({ template, exercises, onAddSet, onRemoveSet, onUpdateSet, onToggleDone, onComplete, onBack, theme }) {
  const totalSets = exercises.reduce((s, ex) => s + ex.sets.length, 0)
  const doneSets  = exercises.reduce((s, ex) => s + ex.sets.filter(s => s.done).length, 0)
  const pct       = totalSets > 0 ? (doneSets / totalSets) * 100 : 0

  const inputStyle = {
    background: 'transparent',
    border: `1px solid ${theme.border}`,
    color: theme.text,
    outline: 'none',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '13px',
    textAlign: 'center',
    padding: '6px',
    width: '56px',
  }

  return (
    <div className="px-5 pt-10 pb-6">
      <div className="flex items-end justify-between mb-2">
        <div>
          <button onClick={onBack}
            className="text-[10px] uppercase tracking-widest font-sans mb-2 block"
            style={{ color: theme.muted }}>← Back</button>
          <h1 className="font-display text-4xl font-semibold leading-tight">{template.name}</h1>
          <p className="text-xs font-sans mt-0.5" style={{ color: theme.muted }}>{template.focus}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] uppercase tracking-widest font-sans mb-1" style={{ color: theme.muted }}>Sets</p>
          <p className="font-display text-3xl font-semibold leading-none">
            {doneSets}<span style={{ color: theme.muted }} className="text-xl">/{totalSets}</span>
          </p>
        </div>
      </div>

      {/* Progress line */}
      <div className="h-px mb-8" style={{ background: theme.border }}>
        <div className="bar-fill h-full" style={{ width: `${pct}%`, background: theme.ink }} />
      </div>

      <div className="space-y-4">
        {exercises.map((ex, ei) => {
          const allDone = ex.sets.every(s => s.done)
          return (
            <div key={ex.name} className="p-4"
              style={{ border: `1px solid ${allDone ? theme.ink : theme.border}` }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-sans text-sm font-semibold">{ex.name}</p>
                  <p className="text-[9px] uppercase tracking-widest font-sans mt-0.5" style={{ color: theme.muted }}>{ex.muscle}</p>
                </div>
                <button onClick={() => onAddSet(ei)}
                  className="text-[10px] uppercase tracking-widest font-sans px-2 py-1 transition-opacity active:opacity-60 ml-2"
                  style={{ border: `1px solid ${theme.border}`, color: theme.muted }}>
                  + Set
                </button>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <div style={{ width: 28 }} />
                <span className="text-[9px] uppercase tracking-widest font-sans text-center" style={{ width: 56, color: theme.muted }}>kg</span>
                <span className="text-[9px] font-sans text-center px-1" style={{ color: theme.muted }}>×</span>
                <span className="text-[9px] uppercase tracking-widest font-sans text-center" style={{ width: 56, color: theme.muted }}>reps</span>
              </div>

              <div className="space-y-2">
                {ex.sets.map((set, si) => (
                  <div key={si} className="flex items-center gap-2"
                    style={{ opacity: set.done ? 0.35 : 1 }}>
                    <button onClick={() => onToggleDone(ei, si)}
                      className={`flex items-center justify-center text-xs transition-all flex-shrink-0 ${set.done ? 'check-pop' : ''}`}
                      style={{
                        width: 28, height: 28,
                        border: `1px solid ${set.done ? theme.ink : theme.border}`,
                        background: set.done ? theme.ink : 'transparent',
                        color: set.done ? theme.surface : theme.muted,
                        fontFamily: 'Inter',
                      }}>
                      {set.done ? '✓' : si + 1}
                    </button>
                    <input value={set.weight} onChange={e => onUpdateSet(ei, si, 'weight', e.target.value)}
                      style={inputStyle} placeholder="—" />
                    <span className="text-xs font-sans" style={{ color: theme.muted }}>×</span>
                    <input value={set.reps} onChange={e => onUpdateSet(ei, si, 'reps', e.target.value)}
                      type="number" style={inputStyle} placeholder="—" />
                    {ex.sets.length > 1 && (
                      <button onClick={() => onRemoveSet(ei, si)}
                        className="text-xl leading-none ml-auto transition-colors"
                        style={{ color: theme.border }}>×</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Complete CTA with hammer illustration */}
      <div className="mt-8">
        {pct < 100 && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <IllustrationHammer size={40} style={{ color: theme.muted, opacity: 0.2 }} />
            <p className="text-xs font-sans" style={{ color: theme.muted }}>
              {totalSets - doneSets} set{totalSets - doneSets !== 1 ? 's' : ''} remaining
            </p>
          </div>
        )}
        <button onClick={onComplete}
          className="w-full py-4 text-sm uppercase tracking-[0.15em] font-sans font-medium transition-opacity active:opacity-70"
          style={{ background: theme.ink, color: theme.surface }}>
          Complete session ✓
        </button>
      </div>
    </div>
  )
}
