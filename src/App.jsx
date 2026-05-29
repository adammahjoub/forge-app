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
  darkMode: true,
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

  useEffect(() => { localStorage.setItem('forge_settings',      JSON.stringify(settings))     }, [settings])
  useEffect(() => { localStorage.setItem('forge_logs',          JSON.stringify(logs))          }, [logs])
  useEffect(() => { localStorage.setItem('forge_workout_logs',  JSON.stringify(workoutLogs))  }, [workoutLogs])
  useEffect(() => { localStorage.setItem('forge_measurements',  JSON.stringify(measurements)) }, [measurements])

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

  const updateSettings = useCallback((updates) => {
    setSettings(p => ({ ...p, ...updates }))
  }, [])

  const updateTodayLog = useCallback((updates) => {
    setLogs(p => ({ ...p, [todayStr()]: { ...p[todayStr()], ...updates } }))
  }, [])

  const updateWorkoutLog = useCallback((date, updates) => {
    setWorkoutLogs(p => ({ ...p, [date]: { ...p[date], ...updates } }))
  }, [])

  const addMeasurement = useCallback((m) => {
    setMeasurements(p => {
      const filtered = p.filter(x => x.date !== m.date)
      return [...filtered, m].sort((a, b) => a.date.localeCompare(b.date))
    })
  }, [])

  const resetData = useCallback(() => {
    setLogs({})
    setWorkoutLogs({})
    setMeasurements([])
    setSettings(DEFAULT_SETTINGS)
  }, [])

  // Streak: consecutive completed workout days ending today or yesterday
  const streak = (() => {
    let count = 0
    const d = new Date()
    // Allow today's workout to count (if done) or count from yesterday
    let checkDate = new Date(d)
    const todayDone = workoutLogs[todayStr()]?.completed
    if (!todayDone) checkDate.setDate(checkDate.getDate() - 1)
    while (true) {
      const ds = checkDate.toISOString().split('T')[0]
      if (workoutLogs[ds]?.completed) {
        count++
        checkDate.setDate(checkDate.getDate() - 1)
      } else break
    }
    return count
  })()

  const daysOnProgram = Math.max(1,
    Math.floor((Date.now() - new Date(settings.startDate).getTime()) / 86400000) + 1
  )

  // Last week protein days (Mon–Sun)
  const weeklyProteinDays = (() => {
    const now = new Date()
    const dow = (now.getDay() + 6) % 7 // Mon=0
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
  const bg      = dm ? 'bg-[#0A0A0A]' : 'bg-[#F5F5F0]'
  const textCol = dm ? 'text-[#EEEEEE]' : 'text-[#111111]'

  const shared = {
    settings, logs, workoutLogs, measurements,
    updateSettings, updateTodayLog, updateWorkoutLog, addMeasurement, resetData,
    streak, daysOnProgram, dm,
  }

  const TABS = [
    { id: 'dashboard', icon: '⌂', label: 'HOME'  },
    { id: 'workout',   icon: '◈', label: 'TRAIN' },
    { id: 'nutrition', icon: '◉', label: 'EAT'   },
    { id: 'progress',  icon: '◷', label: 'TRACK' },
    { id: 'settings',  icon: '◎', label: 'SET'   },
  ]

  return (
    <div className={`min-h-screen ${bg} ${textCol} font-mono select-none`}>
      {/* Weekly modal */}
      {weeklyModal && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-6">
          <div className={`w-full max-w-sm border border-[#C8FF00] ${dm ? 'bg-[#111]' : 'bg-white'} p-6`}>
            <div className="text-[#C8FF00] text-[10px] tracking-widest mb-1">WEEKLY DEBRIEF</div>
            <div className="text-2xl font-bold mb-5">LAST WEEK</div>
            <div className={`border-b ${dm ? 'border-[#222]' : 'border-gray-200'} pb-4 mb-4`}>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">PROTEIN GOAL HIT</span>
                <span className="text-[#C8FF00] font-bold text-lg">{weeklyProteinDays}<span className="text-gray-500 text-sm">/7</span></span>
              </div>
            </div>
            <div className="text-xs text-gray-500 mb-5">
              {weeklyProteinDays >= 5
                ? 'SOLID WEEK. KEEP STACKING.'
                : weeklyProteinDays >= 3
                ? 'DECENT. HIT PROTEIN MORE CONSISTENTLY.'
                : 'PROTEIN WAS THE WEAK LINK THIS WEEK.'}
            </div>
            <button onClick={() => setWeeklyModal(false)}
              className="w-full py-3 bg-[#C8FF00] text-black text-xs tracking-widest font-bold">
              LET'S GO →
            </button>
          </div>
        </div>
      )}

      {/* Page content */}
      <div className="pb-20 min-h-screen overflow-y-auto">
        {activeTab === 'dashboard' && <Dashboard {...shared} />}
        {activeTab === 'workout'   && <WorkoutLogger {...shared} />}
        {activeTab === 'nutrition' && <NutritionTracker {...shared} />}
        {activeTab === 'progress'  && <Progress {...shared} />}
        {activeTab === 'settings'  && <Settings {...shared} />}
      </div>

      {/* Bottom nav */}
      <nav className={`fixed bottom-0 left-0 right-0 z-40 ${dm ? 'bg-[#0D0D0D] border-t border-[#1E1E1E]' : 'bg-white border-t border-gray-200'}`}>
        <div className="flex">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors active:opacity-70
                ${activeTab === t.id ? 'text-[#C8FF00]' : dm ? 'text-[#3A3A3A]' : 'text-gray-400'}`}>
              <span className="text-base leading-none">{t.icon}</span>
              <span className="text-[9px] tracking-widest mt-0.5">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
