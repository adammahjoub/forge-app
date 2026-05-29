import { useState, useEffect, useCallback } from 'react'
import Dashboard from './components/Dashboard'
import WorkoutLogger from './components/WorkoutLogger'
import NutritionTracker from './components/NutritionTracker'
import Progress from './components/Progress'
import Settings from './components/Settings'

const SETTINGS_VERSION = 3

const DEFAULT_SETTINGS = {
  calories: 2400,
  protein: 190,
  targetWeight: 78,
  darkMode: true,
  startDate: new Date().toISOString().split('T')[0],
  weight: 82,
  bodyFat: 20,
  _v: SETTINGS_VERSION,
}

const todayStr = () => new Date().toISOString().split('T')[0]

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback }
  catch { return fallback }
}
function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem('forge_settings'))
    if (!s || s._v !== SETTINGS_VERSION) return DEFAULT_SETTINGS
    return s
  } catch { return DEFAULT_SETTINGS }
}

export default function App() {
  const [activeTab, setActiveTab]       = useState('dashboard')
  const [settings, setSettings]         = useState(() => loadSettings())
  const [logs, setLogs]                 = useState(() => load('forge_logs', {}))
  const [workoutLogs, setWorkoutLogs]   = useState(() => load('forge_workout_logs', {}))
  const [measurements, setMeasurements] = useState(() => load('forge_measurements', []))
  const [weeklyModal, setWeeklyModal]   = useState(false)

  useEffect(() => { localStorage.setItem('forge_settings',     JSON.stringify(settings))     }, [settings])
  useEffect(() => { localStorage.setItem('forge_logs',         JSON.stringify(logs))          }, [logs])
  useEffect(() => { localStorage.setItem('forge_workout_logs', JSON.stringify(workoutLogs))  }, [workoutLogs])
  useEffect(() => { localStorage.setItem('forge_measurements', JSON.stringify(measurements)) }, [measurements])

  useEffect(() => {
    if (new Date().getDay() === 1) {
      const shown = localStorage.getItem('forge_weekly_shown')
      if (shown !== todayStr()) {
        setWeeklyModal(true)
        localStorage.setItem('forge_weekly_shown', todayStr())
      }
    }
  }, [])

  const updateSettings   = useCallback((u) => setSettings(p => ({ ...p, ...u })), [])
  const updateTodayLog   = useCallback((u) => setLogs(p => ({ ...p, [todayStr()]: { ...p[todayStr()], ...u } })), [])
  const updateWorkoutLog = useCallback((date, u) => setWorkoutLogs(p => ({ ...p, [date]: { ...p[date], ...u } })), [])
  const addMeasurement   = useCallback((m) => {
    setMeasurements(p => [...p.filter(x => x.date !== m.date), m].sort((a, b) => a.date.localeCompare(b.date)))
  }, [])
  const resetData = useCallback(() => {
    setLogs({}); setWorkoutLogs({}); setMeasurements([]); setSettings(DEFAULT_SETTINGS)
  }, [])

  const streak = (() => {
    let count = 0
    const d = new Date()
    if (!workoutLogs[todayStr()]?.completed) d.setDate(d.getDate() - 1)
    while (true) {
      const ds = d.toISOString().split('T')[0]
      if (workoutLogs[ds]?.completed) { count++; d.setDate(d.getDate() - 1) }
      else break
    }
    return count
  })()

  const daysOnProgram = Math.max(1,
    Math.floor((Date.now() - new Date(settings.startDate).getTime()) / 86400000) + 1
  )

  const weeklyProteinDays = (() => {
    const now = new Date()
    const dow = (now.getDay() + 6) % 7
    const lastMon = new Date(now)
    lastMon.setDate(now.getDate() - dow - 7)
    let days = 0
    for (let i = 0; i < 7; i++) {
      const d = new Date(lastMon)
      d.setDate(lastMon.getDate() + i)
      if ((logs[d.toISOString().split('T')[0]]?.protein || 0) >= settings.protein) days++
    }
    return days
  })()

  const shared = {
    settings, logs, workoutLogs, measurements,
    updateSettings, updateTodayLog, updateWorkoutLog, addMeasurement, resetData,
    streak, daysOnProgram,
  }

  const TABS = [
    { id: 'dashboard', icon: '⌂', label: 'HOME'  },
    { id: 'workout',   icon: '◈', label: 'TRAIN' },
    { id: 'nutrition', icon: '◉', label: 'EAT'   },
    { id: 'progress',  icon: '◷', label: 'TRACK' },
    { id: 'settings',  icon: '◎', label: 'SET'   },
  ]

  return (
    <div className="min-h-screen select-none" style={{ background: 'var(--bg)', color: 'var(--text)' }}>

      {/* Weekly modal */}
      {weeklyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="modal-panel w-full max-w-sm p-6" style={{
            background: 'rgba(255,255,255,0.06)',
            border: '0.5px solid rgba(255,255,255,0.12)',
            borderRadius: '16px',
          }}>
            <div className="text-xs tracking-widest mb-1 gradient-text" style={{ fontWeight: 700 }}>WEEKLY DEBRIEF</div>
            <div className="text-2xl font-bold mb-5" style={{ color: 'var(--strong)' }}>LAST WEEK</div>
            <div className="flex justify-between items-center mb-4 pb-4"
              style={{ borderBottom: '0.5px solid var(--border)' }}>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>PROTEIN GOAL HIT</span>
              <span className="font-bold text-lg gradient-text">{weeklyProteinDays}<span className="text-sm" style={{ color: 'var(--muted)' }}>/7</span></span>
            </div>
            <p className="text-xs mb-5" style={{ color: 'var(--muted)' }}>
              {weeklyProteinDays >= 5 ? 'SOLID WEEK. KEEP STACKING.' : weeklyProteinDays >= 3 ? 'DECENT. HIT PROTEIN MORE CONSISTENTLY.' : 'PROTEIN WAS THE WEAK LINK THIS WEEK.'}
            </p>
            <button onClick={() => setWeeklyModal(false)}
              className="w-full py-3 text-xs tracking-widest font-bold btn-primary">
              LET'S GO →
            </button>
          </div>
        </div>
      )}

      {/* Pages */}
      <div key={activeTab} className="pb-20 min-h-screen overflow-y-auto page-fade">
        {activeTab === 'dashboard' && <Dashboard {...shared} />}
        {activeTab === 'workout'   && <WorkoutLogger {...shared} />}
        {activeTab === 'nutrition' && <NutritionTracker {...shared} />}
        {activeTab === 'progress'  && <Progress {...shared} />}
        {activeTab === 'settings'  && <Settings {...shared} />}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40" style={{
        background: 'rgba(13,13,15,0.85)',
        borderTop: '0.5px solid var(--border)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}>
        <div className="flex">
          {TABS.map(t => {
            const active = activeTab === t.id
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className="flex-1 py-3 flex flex-col items-center gap-0.5 transition-opacity active:opacity-60">
                <span className="text-base leading-none" style={active ? {
                  background: 'var(--gradient)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                } : { color: 'var(--muted)' }}>{t.icon}</span>
                <span className="text-[9px] tracking-widest mt-0.5" style={{ color: active ? 'rgba(167,139,250,0.9)' : 'var(--muted)' }}>{t.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
