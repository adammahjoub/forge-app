import { useState, useEffect, useCallback } from 'react'
import Dashboard from './components/Dashboard'
import WorkoutLogger from './components/WorkoutLogger'
import NutritionTracker from './components/NutritionTracker'
import Progress from './components/Progress'
import Settings from './components/Settings'

const DEFAULT_SETTINGS = {
  calories: 2400,
  protein: 190,
  targetWeight: 78,
  darkMode: false,
  startDate: new Date().toISOString().split('T')[0],
  weight: 82,
  bodyFat: 20,
}

const todayStr = () => new Date().toISOString().split('T')[0]

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback }
  catch { return fallback }
}

export default function App() {
  const [activeTab, setActiveTab]       = useState('dashboard')
  const [settings, setSettings]         = useState(() => load('forge_settings', DEFAULT_SETTINGS))
  const [logs, setLogs]                 = useState(() => load('forge_logs', {}))
  const [workoutLogs, setWorkoutLogs]   = useState(() => load('forge_workout_logs', {}))
  const [measurements, setMeasurements] = useState(() => load('forge_measurements', []))
  const [weeklyModal, setWeeklyModal]   = useState(false)

  useEffect(() => { localStorage.setItem('forge_settings',     JSON.stringify(settings))     }, [settings])
  useEffect(() => { localStorage.setItem('forge_logs',         JSON.stringify(logs))          }, [logs])
  useEffect(() => { localStorage.setItem('forge_workout_logs', JSON.stringify(workoutLogs))  }, [workoutLogs])
  useEffect(() => { localStorage.setItem('forge_measurements', JSON.stringify(measurements)) }, [measurements])

  // Monday weekly summary
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
    setMeasurements(p => {
      const filtered = p.filter(x => x.date !== m.date)
      return [...filtered, m].sort((a, b) => a.date.localeCompare(b.date))
    })
  }, [])
  const resetData = useCallback(() => {
    setLogs({}); setWorkoutLogs({}); setMeasurements([]); setSettings(DEFAULT_SETTINGS)
  }, [])

  // Streak
  const streak = (() => {
    let count = 0
    const d = new Date()
    const todayDone = workoutLogs[todayStr()]?.completed
    if (!todayDone) d.setDate(d.getDate() - 1)
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
      const ds = d.toISOString().split('T')[0]
      if ((logs[ds]?.protein || 0) >= settings.protein) days++
    }
    return days
  })()

  const dm = settings.darkMode

  // Theme tokens passed to all components
  const theme = {
    bg:      dm ? '#0A0A0A'  : '#FAFAF9',
    surface: dm ? '#111111'  : '#FFFFFF',
    border:  dm ? '#1E1E1E'  : '#E5E0DA',
    text:    dm ? '#EEEEEE'  : '#111111',
    muted:   dm ? '#9A928A'  : '#9A928A',
    ink:     dm ? '#EEEEEE'  : '#1a1a1a',
    inputBg: dm ? 'transparent' : '#FFFFFF',
    navBg:   dm ? '#0D0D0D'  : '#FFFFFF',
    navBorder: dm ? '#1E1E1E' : '#E5E0DA',
  }

  const shared = {
    settings, logs, workoutLogs, measurements,
    updateSettings, updateTodayLog, updateWorkoutLog, addMeasurement, resetData,
    streak, daysOnProgram, dm, theme,
  }

  const TABS = [
    { id: 'dashboard', icon: '◇', label: 'Home'  },
    { id: 'workout',   icon: '◈', label: 'Train' },
    { id: 'nutrition', icon: '○', label: 'Eat'   },
    { id: 'progress',  icon: '◷', label: 'Track' },
    { id: 'settings',  icon: '◎', label: 'Set'   },
  ]

  return (
    <div style={{ background: theme.bg, color: theme.text }} className="min-h-screen font-sans select-none">

      {/* Weekly summary modal */}
      {weeklyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="w-full max-w-sm p-8" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
            <p className="text-xs tracking-[0.2em] uppercase mb-1" style={{ color: theme.muted }}>Weekly Debrief</p>
            <h2 className="font-display text-4xl font-semibold mb-6">Last Week</h2>
            <div className="flex justify-between items-center mb-2 text-sm">
              <span style={{ color: theme.muted }}>Protein goal hit</span>
              <span className="font-semibold">{weeklyProteinDays}<span style={{ color: theme.muted }}>/7 days</span></span>
            </div>
            <p className="text-xs mb-8" style={{ color: theme.muted }}>
              {weeklyProteinDays >= 5 ? 'Solid week. Keep stacking.' : weeklyProteinDays >= 3 ? 'Decent. Hit protein more consistently.' : 'Protein was the weak link this week.'}
            </p>
            <button onClick={() => setWeeklyModal(false)}
              className="w-full py-3 text-xs tracking-[0.15em] uppercase font-medium transition-opacity active:opacity-70"
              style={{ background: theme.ink, color: theme.surface }}>
              Let's go →
            </button>
          </div>
        </div>
      )}

      {/* Page */}
      <div className="pb-20 min-h-screen overflow-y-auto">
        {activeTab === 'dashboard' && <Dashboard {...shared} />}
        {activeTab === 'workout'   && <WorkoutLogger {...shared} />}
        {activeTab === 'nutrition' && <NutritionTracker {...shared} />}
        {activeTab === 'progress'  && <Progress {...shared} />}
        {activeTab === 'settings'  && <Settings {...shared} />}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40"
        style={{ background: theme.navBg, borderTop: `1px solid ${theme.navBorder}` }}>
        <div className="flex">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className="flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors active:opacity-60"
              style={{ color: activeTab === t.id ? theme.ink : theme.muted }}>
              <span className="text-sm leading-none">{t.icon}</span>
              <span className="text-[9px] tracking-widest uppercase mt-0.5 font-sans">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
