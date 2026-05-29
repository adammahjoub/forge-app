import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { IllustrationChart, IllustrationMeasure, DecorativeArcs, SparkAccent } from './Illustrations'

const todayStr = () => new Date().toISOString().split('T')[0]
const isMonday = new Date().getDay() === 1

const CustomTooltip = ({ active, payload, label, theme }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="p-2 text-xs font-sans"
      style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
      <p className="mb-1 font-medium">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function Progress({ measurements, addMeasurement, settings, theme }) {
  const today = todayStr()
  const [showForm, setShowForm] = useState(isMonday && !measurements.find(m => m.date === today))
  const [form, setForm] = useState({ weight: '', waist: '', hips: '', chest: '', arms: '' })

  const submit = () => {
    const m = {
      date:   today,
      weight: parseFloat(form.weight) || null,
      waist:  parseFloat(form.waist)  || null,
      hips:   parseFloat(form.hips)   || null,
      chest:  parseFloat(form.chest)  || null,
      arms:   parseFloat(form.arms)   || null,
    }
    if (!m.weight && !m.waist) return
    addMeasurement(m)
    setShowForm(false)
    setForm({ weight: '', waist: '', hips: '', chest: '', arms: '' })
  }

  const chartData = measurements.slice(-16).map(m => ({
    date: m.date.slice(5), weight: m.weight, waist: m.waist,
  }))

  const delta = (() => {
    if (measurements.length < 2) return null
    const first = measurements[0], last = measurements[measurements.length - 1]
    const dw  = ((last.weight || 0) - (first.weight || 0)).toFixed(1)
    const dWs = ((last.waist  || 0) - (first.waist  || 0)).toFixed(1)
    const dBF = (parseFloat(dWs) * 0.5).toFixed(1)
    const weeks = Math.round((new Date(last.date) - new Date(first.date)) / 604800000)
    return { dw, dWs, dBF, weeks }
  })()

  const sign = v => (parseFloat(v) > 0 ? '+' : '') + v

  const inputStyle = {
    flex: 1,
    background: 'transparent',
    border: `1px solid ${theme.border}`,
    color: theme.text,
    outline: 'none',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '14px',
    padding: '10px 12px',
  }

  return (
    <div className="px-5 pt-10 pb-6">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="relative mb-10 overflow-hidden">
        <DecorativeArcs
          size={160}
          style={{ color: theme.muted, opacity: 0.1, position: 'absolute', top: -30, right: -30, pointerEvents: 'none' }}
        />
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[10px] uppercase tracking-[0.25em] font-sans" style={{ color: theme.muted }}>Body metrics</p>
                <SparkAccent size={10} style={{ color: theme.muted, opacity: 0.5 }} />
              </div>
              <h1 className="font-display text-7xl font-semibold tracking-tight leading-none">Progress</h1>
            </div>
            {isMonday && (
              <div className="px-2 py-1 text-[9px] uppercase tracking-widest font-sans self-end mb-1"
                style={{ border: `1px solid ${theme.ink}`, color: theme.ink }}>
                Check-in
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Monday prompt ────────────────────────────────────────── */}
      {isMonday && !measurements.find(m => m.date === today) && !showForm && (
        <div className="p-5 mb-6" style={{ border: `1px solid ${theme.border}` }}>
          <div className="flex items-center gap-4 mb-3">
            <IllustrationMeasure size={70} style={{ color: theme.ink, opacity: 0.15, flexShrink: 0 }} />
            <div>
              <p className="font-display text-xl font-semibold mb-1">Monday check-in</p>
              <p className="text-xs font-sans" style={{ color: theme.muted }}>
                Log your measurements to track your body composition week by week.
              </p>
            </div>
          </div>
          <button onClick={() => setShowForm(true)}
            className="w-full py-3 text-xs uppercase tracking-[0.15em] font-sans font-medium transition-opacity active:opacity-70"
            style={{ background: theme.ink, color: theme.surface }}>
            Log now
          </button>
        </div>
      )}

      {/* ── Delta strip ───────────────────────────────────────────── */}
      {delta && (
        <>
          <div className="grid grid-cols-3 mb-2" style={{ border: `1px solid ${theme.border}` }}>
            {[
              ['Weight Δ', `${sign(delta.dw)} kg`],
              ['Waist Δ',  `${sign(delta.dWs)} cm`],
              ['Est BF Δ', `${sign(delta.dBF)} %`],
            ].map(([lbl, val], i) => (
              <div key={lbl} className="py-4 px-3 text-center"
                style={i === 1 ? { borderLeft: `1px solid ${theme.border}`, borderRight: `1px solid ${theme.border}` } : {}}>
                <p className="text-[9px] uppercase tracking-widest font-sans mb-1" style={{ color: theme.muted }}>{lbl}</p>
                <p className="font-display text-xl font-semibold">{val}</p>
              </div>
            ))}
          </div>
          <p className="text-[9px] font-sans mb-6 uppercase tracking-widest" style={{ color: theme.muted }}>
            Over {delta.weeks} week{delta.weeks !== 1 ? 's' : ''} · estimated from weight + waist trend
          </p>
        </>
      )}

      {/* ── Chart / chart empty state ─────────────────────────────── */}
      {chartData.length >= 2 ? (
        <div className="p-5 mb-6" style={{ border: `1px solid ${theme.border}` }}>
          <p className="text-[9px] uppercase tracking-widest font-sans mb-5" style={{ color: theme.muted }}>Weight + waist trend</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -24 }}>
              <CartesianGrid strokeDasharray="1 4" stroke={theme.border} />
              <XAxis dataKey="date" stroke="transparent"
                tick={{ fontSize: 8, fill: theme.muted, fontFamily: 'Inter' }} interval="preserveStartEnd" />
              <YAxis stroke="transparent"
                tick={{ fontSize: 8, fill: theme.muted, fontFamily: 'Inter' }} />
              <Tooltip content={<CustomTooltip theme={theme} />} />
              <Line type="monotone" dataKey="weight" stroke={theme.ink}  strokeWidth={1.5} dot={false} name="Weight" connectNulls />
              <Line type="monotone" dataKey="waist"  stroke={theme.muted} strokeWidth={1} dot={false} name="Waist" strokeDasharray="3 3" connectNulls />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-5 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-px" style={{ background: theme.ink }} />
              <span className="text-[9px] font-sans uppercase tracking-widest" style={{ color: theme.muted }}>Weight</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-px" style={{ background: theme.muted }} />
              <span className="text-[9px] font-sans uppercase tracking-widest" style={{ color: theme.muted }}>Waist</span>
            </div>
          </div>
        </div>
      ) : measurements.length > 0 ? (
        <div className="p-6 mb-6 flex flex-col items-center text-center" style={{ border: `1px solid ${theme.border}` }}>
          <IllustrationChart size={90} style={{ color: theme.muted, opacity: 0.2, marginBottom: 16 }} />
          <p className="font-display text-lg font-semibold mb-1">One entry so far.</p>
          <p className="text-xs font-sans" style={{ color: theme.muted }}>Log next week's measurements<br />to reveal the trend.</p>
        </div>
      ) : null}

      {/* ── Log button (non-Monday) ───────────────────────────────── */}
      {!isMonday && (
        <button onClick={() => setShowForm(f => !f)}
          className="w-full py-3 text-[10px] uppercase tracking-widest font-sans mb-4 transition-colors"
          style={{ border: `1px solid ${showForm ? theme.ink : theme.border}`, color: showForm ? theme.ink : theme.muted }}>
          {showForm ? 'Cancel' : '+ Log measurements'}
        </button>
      )}

      {/* ── Form ─────────────────────────────────────────────────── */}
      {showForm && (
        <div className="p-5 mb-4" style={{ border: `1px solid ${theme.border}` }}>
          <p className="text-[9px] uppercase tracking-widest font-sans mb-4" style={{ color: theme.muted }}>New entry — {today}</p>
          <div className="space-y-2">
            {[
              ['weight', 'Weight (kg)'], ['waist', 'Waist (cm)'],
              ['hips', 'Hips (cm)'], ['chest', 'Chest (cm)'], ['arms', 'Arms (cm)'],
            ].map(([key, lbl]) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-[9px] uppercase tracking-widest font-sans flex-shrink-0 w-24"
                  style={{ color: theme.muted }}>{lbl}</span>
                <input value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  type="number" step="0.1" placeholder="—" style={inputStyle} />
              </div>
            ))}
          </div>
          <button onClick={submit}
            className="w-full mt-4 py-3 text-xs uppercase tracking-[0.15em] font-sans font-medium transition-opacity active:opacity-70"
            style={{ background: theme.ink, color: theme.surface }}>
            Save entry
          </button>
        </div>
      )}

      {/* ── History / empty state ─────────────────────────────────── */}
      <p className="text-[9px] uppercase tracking-widest font-sans mb-3" style={{ color: theme.muted }}>History</p>
      {measurements.length === 0 ? (
        <div className="py-12 flex flex-col items-center text-center" style={{ border: `1px solid ${theme.border}` }}>
          <IllustrationMeasure
            size={90}
            className="illus-float mb-5"
            style={{ color: theme.muted, opacity: 0.2 }}
          />
          <p className="font-display text-xl font-semibold mb-1">Nothing tracked yet.</p>
          <p className="text-xs font-sans" style={{ color: theme.muted }}>
            Log your first measurements<br />to start building your record.
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {[...measurements].reverse().slice(0, 12).map(m => (
            <div key={m.date} className="p-4" style={{ border: `1px solid ${theme.border}` }}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] uppercase tracking-widest font-sans" style={{ color: theme.muted }}>{m.date}</span>
                <span className="font-display text-lg font-semibold">{m.weight ? `${m.weight} kg` : '—'}</span>
              </div>
              <div className="flex flex-wrap gap-3 text-[9px] font-sans uppercase tracking-widest" style={{ color: theme.muted }}>
                {m.waist && <span>Waist {m.waist}cm</span>}
                {m.hips  && <span>Hips {m.hips}cm</span>}
                {m.chest && <span>Chest {m.chest}cm</span>}
                {m.arms  && <span>Arms {m.arms}cm</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
