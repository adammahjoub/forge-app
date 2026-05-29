import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const todayStr = () => new Date().toISOString().split('T')[0]
const isMonday = new Date().getDay() === 1

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="text-xs p-2 card">
      <p className="gradient-text mb-1 font-bold">{label}</p>
      {payload.map(p => <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>)}
    </div>
  )
}

export default function Progress({ measurements, addMeasurement, settings }) {
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
  const inputStyle = { flex: 1, padding: '10px 12px', fontSize: '13px' }

  return (
    <div className="px-4 pt-8 pb-4 space-y-3">

      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-[10px] tracking-[0.2em] mb-1" style={{ color: 'var(--muted)' }}>BODY METRICS</p>
          <h1 className="text-5xl font-bold tracking-tight" style={{ color: 'var(--strong)' }}>PROGRESS</h1>
        </div>
        {isMonday && <span className="badge-medium self-end mb-1">CHECK-IN</span>}
      </div>

      {/* Monday prompt */}
      {isMonday && !measurements.find(m => m.date === today) && !showForm && (
        <div className="card p-5" style={{ borderColor: 'rgba(167,139,250,0.25)' }}>
          <p className="font-bold mb-1 gradient-text">⚡ MONDAY CHECK-IN</p>
          <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>Log your weekly measurements to track your body composition.</p>
          <button onClick={() => setShowForm(true)} className="w-full py-3 text-xs tracking-widest font-bold btn-primary">
            LOG NOW
          </button>
        </div>
      )}

      {/* Delta strip */}
      {delta && (
        <>
          <div className="grid grid-cols-3 gap-2">
            {[
              ['WEIGHT Δ', `${sign(delta.dw)} kg`,  parseFloat(delta.dw)  < 0],
              ['WAIST Δ',  `${sign(delta.dWs)} cm`, parseFloat(delta.dWs) < 0],
              ['EST BF Δ', `${sign(delta.dBF)} %`,  parseFloat(delta.dBF) < 0],
            ].map(([lbl, val, good]) => (
              <div key={lbl} className="card py-3 px-2 text-center">
                <p className="text-[9px] tracking-widest mb-1" style={{ color: 'var(--muted)' }}>{lbl}</p>
                <p className={`text-sm font-bold ${good ? 'gradient-text' : ''}`}
                  style={!good ? { color: 'var(--strong)' } : {}}>{val}</p>
              </div>
            ))}
          </div>
          <p className="text-[9px] tracking-widest" style={{ color: 'var(--muted-dim)' }}>
            OVER {delta.weeks} WEEK{delta.weeks !== 1 ? 'S' : ''} · ESTIMATED FROM WEIGHT + WAIST
          </p>
        </>
      )}

      {/* Chart */}
      {chartData.length >= 2 && (
        <div className="card p-4">
          <p className="text-[9px] tracking-widest mb-4" style={{ color: 'var(--muted)' }}>WEIGHT + WAIST TREND</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -24 }}>
              <CartesianGrid strokeDasharray="1 4" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" stroke="transparent"
                tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono' }}
                interval="preserveStartEnd" />
              <YAxis stroke="transparent"
                tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="weight" stroke="#a78bfa" strokeWidth={2} dot={false} name="WEIGHT" connectNulls />
              <Line type="monotone" dataKey="waist"  stroke="#f97316" strokeWidth={1.5} dot={false} name="WAIST" strokeDasharray="3 3" connectNulls />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 rounded" style={{ background: '#a78bfa' }} />
              <span className="text-[9px] tracking-widest" style={{ color: 'var(--muted)' }}>WEIGHT</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 rounded" style={{ background: '#f97316' }} />
              <span className="text-[9px] tracking-widest" style={{ color: 'var(--muted)' }}>WAIST</span>
            </div>
          </div>
        </div>
      )}

      {/* Log button */}
      {!isMonday && (
        <button onClick={() => setShowForm(f => !f)}
          className="w-full py-3 text-[10px] tracking-widest btn-ghost">
          {showForm ? 'CANCEL' : '+ LOG MEASUREMENTS'}
        </button>
      )}

      {/* Form */}
      {showForm && (
        <div className="card p-4 space-y-2">
          <p className="text-[9px] tracking-widest mb-3" style={{ color: 'var(--muted)' }}>NEW ENTRY — {today}</p>
          {[
            ['weight', 'WEIGHT (kg)'], ['waist', 'WAIST (cm)'],
            ['hips', 'HIPS (cm)'], ['chest', 'CHEST (cm)'], ['arms', 'ARMS (cm)'],
          ].map(([key, lbl]) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-[9px] tracking-widest w-24 flex-shrink-0" style={{ color: 'var(--muted)' }}>{lbl}</span>
              <input value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                type="number" step="0.1" placeholder="—" style={inputStyle} />
            </div>
          ))}
          <button onClick={submit} className="w-full mt-2 py-3 text-xs tracking-widest font-bold btn-primary">
            SAVE ENTRY
          </button>
        </div>
      )}

      {/* History */}
      <p className="text-[9px] tracking-widest pt-2" style={{ color: 'var(--muted)' }}>HISTORY</p>
      {measurements.length === 0 ? (
        <div className="card py-10 text-center">
          <p className="text-3xl mb-3">📏</p>
          <p className="text-sm font-bold" style={{ color: 'var(--muted)' }}>NO MEASUREMENTS YET</p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-dim)' }}>LOG YOUR FIRST CHECK-IN ABOVE</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {[...measurements].reverse().slice(0, 12).map((m, i, arr) => (
            <div key={m.date} className="list-row px-4 py-3"
              style={i < arr.length - 1 ? { borderBottom: '0.5px solid var(--border)' } : {}}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] tracking-widest" style={{ color: 'var(--muted)' }}>{m.date}</span>
                <span className="font-bold" style={{ color: 'var(--strong)' }}>{m.weight ? `${m.weight} kg` : '—'}</span>
              </div>
              <div className="flex flex-wrap gap-3 text-[9px] tracking-widest" style={{ color: 'var(--muted-dim)' }}>
                {m.waist && <span>WAIST {m.waist}cm</span>}
                {m.hips  && <span>HIPS {m.hips}cm</span>}
                {m.chest && <span>CHEST {m.chest}cm</span>}
                {m.arms  && <span>ARMS {m.arms}cm</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
