import { useState, useEffect, useCallback } from 'react'
import Dashboard from './components/Dashboard'
import WorkoutLogger from './components/WorkoutLogger'
import NutritionTracker from './components/NutritionTracker'
import Progress from './components/Progress'
import Settings from './components/Settings'

const SETTINGS_VERSION = 3

const DEFAULT_SETTINGS = {
  calories: 2400, protein: 190, targetWeight: 78,
  darkMode: true,
  startDate: new Date().toISOString().split('T')[0],
  weight: 82, bodyFat: 20,
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

const TABS = [
  { id: 'dashboard', icon: '⌂', label: 'Home'     },
  { id: 'workout',   icon: '◈', label: 'Train'    },
  { id: 'nutrition', icon: '◉', label: 'Eat'      },
  { id: 'progress',  icon: '◷', label: 'Progress' },
  { id: 'settings',  icon: '◎', label: 'Settings' },
]

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
    let count = 0; const d = new Date()
    if (!workoutLogs[todayStr()]?.completed) d.setDate(d.getDate() - 1)
    while (true) {
      const ds = d.toISOString().split('T')[0]
      if (workoutLogs[ds]?.completed) { count++; d.setDate(d.getDate() - 1) } else break
    }
    return count
  })()

  const daysOnProgram = Math.max(1,
    Math.floor((Date.now() - new Date(settings.startDate).getTime()) / 86400000) + 1
  )

  const weeklyProteinDays = (() => {
    const now = new Date(), dow = (now.getDay() + 6) % 7
    const lastMon = new Date(now); lastMon.setDate(now.getDate() - dow - 7)
    let days = 0
    for (let i = 0; i < 7; i++) {
      const d = new Date(lastMon); d.setDate(lastMon.getDate() + i)
      if ((logs[d.toISOString().split('T')[0]]?.protein || 0) >= settings.protein) days++
    }
    return days
  })()

  const shared = {
    settings, logs, workoutLogs, measurements,
    updateSettings, updateTodayLog, updateWorkoutLog, addMeasurement, resetData,
    streak, daysOnProgram, onNavigate: setActiveTab,
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>

      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className="sidebar">
        {/* Logo */}
        <div style={{ padding: '24px 16px 20px', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
          <span className="gradient-text font-mono" style={{ fontSize: 18, fontWeight: 700, letterSpacing: 1 }}>
            FORGE
          </span>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, paddingTop: 8 }}>
          {TABS.map(t => {
            const active = activeTab === t.id
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 16px',
                  background: active ? 'rgba(167,139,250,0.12)' : 'transparent',
                  border: 'none', cursor: 'pointer',
                  color: active ? '#FFFFFF' : 'rgba(255,255,255,0.45)',
                  fontSize: 13, fontFamily: 'Inter, sans-serif',
                  transition: 'background 150ms ease, color 150ms ease',
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.75)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.45)' }}
              >
                <span style={{ fontSize: 14, flexShrink: 0 }}>{t.icon}</span>
                <span className="sidebar-label">{t.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Bottom version */}
        <div className="sidebar-label" style={{ padding: '12px 16px', borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'Space Mono', letterSpacing: 1 }}>v1.0 · FORGE</p>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────── */}
      <main className="main-content" style={{ flex: 1, minHeight: '100vh', paddingBottom: 0 }}>
        {/* Weekly modal */}
        {weeklyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
            <div className="modal-panel w-full max-w-sm p-6" style={{
              background: 'rgba(255,255,255,0.06)',
              border: '0.5px solid rgba(255,255,255,0.12)',
              borderRadius: 16,
            }}>
              <div className="section-label mb-1">Weekly Debrief</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--strong)', marginBottom: 20 }}>Last week</div>
              <div className="flex justify-between items-center pb-4 mb-4"
                style={{ borderBottom: '0.5px solid var(--border)' }}>
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>Protein goal hit</span>
                <span className="font-mono gradient-text" style={{ fontWeight: 700, fontSize: 18 }}>
                  {weeklyProteinDays}<span style={{ color: 'var(--muted)', fontSize: 13 }}>/7</span>
                </span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
                {weeklyProteinDays >= 5 ? 'Solid week. Keep stacking.' : weeklyProteinDays >= 3 ? 'Decent. Hit protein more consistently.' : 'Protein was the weak link this week.'}
              </p>
              <button onClick={() => setWeeklyModal(false)} className="w-full btn-primary" style={{ padding: '11px 14px', fontSize: 13 }}>
                Let's go →
              </button>
            </div>
          </div>
        )}

        <div key={activeTab} className="page-fade">
          {activeTab === 'dashboard' && <Dashboard {...shared} />}
          {activeTab === 'workout'   && <WorkoutLogger {...shared} />}
          {activeTab === 'nutrition' && <NutritionTracker {...shared} />}
          {activeTab === 'progress'  && <Progress {...shared} />}
          {activeTab === 'settings'  && <Settings {...shared} />}
        </div>
      </main>
    </div>
  )
}
