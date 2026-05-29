import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const todayStr = () => new Date().toISOString().split('T')[0]
const isMonday = new Date().getDay() === 1

const CustomTooltip = ({ active, payload, label, dm }) => {
  if (!active || !payload?.length) return null
  return (
    <div className={`${dm ? 'bg-[#111] border-[#2A2A2A]' : 'bg-white border-gray-200'} border p-2 text-[10px]`}
         style={{ fontFamily: 'Space Mono' }}>
      <p className="text-[#C8FF00] mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function Progress({ measurements, addMeasurement, settings, dm }) {
  const today = todayStr()
  const [showForm, setShowForm]  = useState(isMonday)
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
    date:   m.date.slice(5),
    weight: m.weight,
    waist:  m.waist,
  }))

  // Overall change since first entry
  const delta = (() => {
    if (measurements.length < 2) return null
    const first = measurements[0]
    const last  = measurements[measurements.length - 1]
    const dw  = ((last.weight || 0) - (first.weight || 0)).toFixed(1)
    const dWs = ((last.waist  || 0) - (first.waist  || 0)).toFixed(1)
    // ~0.5% BF per 1cm waist reduction (rough estimate)
    const dBF = (parseFloat(dWs) * 0.5).toFixed(1)
    return { dw, dWs, dBF, weeks: Math.round((new Date(last.date) - new Date(first.date)) / 604800000) }
  })()

  const border  = dm ? 'border-[#1E1E1E]' : 'border-gray-200'
  const inputCls = `flex-1 bg-transparent border ${dm ? 'border-[#2A2A2A]' : 'border-gray-300'} p-2.5 text-sm outline-none focus:border-[#C8FF00] transition-colors`

  const sign = (v) => (parseFloat(v) > 0 ? '+' : '') + v

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-[10px] tracking-[0.25em] text-gray-600 mb-0.5">BODY METRICS</p>
          <h1 className="text-4xl font-bold tracking-tight">PROGRESS</h1>
        </div>
        {isMonday && (
          <div className="border border-[#C8FF00] px-2 py-1 text-[9px] tracking-widest text-[#C8FF00]">
            CHECK-IN DAY
          </div>
        )}
      </div>

      {/* Monday prompt */}
      {isMonday && !measurements.find(m => m.date === today) && (
        <div className="border border-[#C8FF00] bg-[#C8FF00]/5 p-4 mb-4">
          <p className="text-[#C8FF00] font-bold text-sm mb-1">⚡ MONDAY CHECK-IN</p>
          <p className="text-xs text-gray-500 mb-3">Log your weekly measurements to track progress.</p>
          {!showForm && (
            <button onClick={() => setShowForm(true)}
              className="w-full py-2 bg-[#C8FF00] text-black text-xs tracking-widest font-bold">
              LOG NOW
            </button>
          )}
        </div>
      )}

      {/* Overall delta */}
      {delta && (
        <div className={`grid grid-cols-3 border ${border} mb-3`}>
          {[
            ['WEIGHT Δ', `${sign(delta.dw)}kg`],
            ['WAIST Δ',  `${sign(delta.dWs)}cm`],
            ['EST BF Δ', `${sign(delta.dBF)}%`],
          ].map(([lbl, val], i) => (
            <div key={lbl} className={`py-3 px-2 text-center ${i === 1 ? `border-x ${border}` : ''}`}>
              <p className="text-[9px] tracking-widest text-gray-600 mb-1">{lbl}</p>
              <p className={`text-sm font-bold ${parseFloat(val) < 0 ? 'text-[#C8FF00]' : parseFloat(val) > 0 ? 'text-[#FF8888]' : ''}`}>{val}</p>
            </div>
          ))}
        </div>
      )}
      {delta && (
        <p className="text-[9px] text-gray-600 mb-3 tracking-widest">
          OVER {delta.weeks} WEEK{delta.weeks !== 1 ? 'S' : ''} · ESTIMATED FROM WEIGHT + WAIST TREND
        </p>
      )}

      {/* Chart */}
      {chartData.length >= 2 && (
        <div className={`border ${border} p-4 mb-3`}>
          <p className="text-[9px] tracking-widest text-gray-600 mb-4">WEIGHT + WAIST TREND</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="1 4" stroke={dm ? '#1C1C1C' : '#EEE'} />
              <XAxis
                dataKey="date"
                stroke="transparent"
                tick={{ fontSize: 8, fill: '#555', fontFamily: 'Space Mono' }}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="transparent"
                tick={{ fontSize: 8, fill: '#555', fontFamily: 'Space Mono' }}
              />
              <Tooltip content={<CustomTooltip dm={dm} />} />
              <Line type="monotone" dataKey="weight" stroke="#C8FF00" strokeWidth={2} dot={false} name="WEIGHT" connectNulls />
              <Line type="monotone" dataKey="waist"  stroke="#666"    strokeWidth={1.5} dot={false} name="WAIST" strokeDasharray="3 3" connectNulls />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-5 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-0.5 bg-[#C8FF00]" />
              <span className="text-[9px] text-gray-500">WEIGHT</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-0.5 bg-[#666]" style={{ backgroundImage: 'repeating-linear-gradient(to right,#666 0,#666 3px,transparent 3px,transparent 6px)' }} />
              <span className="text-[9px] text-gray-500">WAIST</span>
            </div>
          </div>
        </div>
      )}

      {/* Log form toggle */}
      {!isMonday && (
        <button
          onClick={() => setShowForm(f => !f)}
          className={`w-full border ${showForm ? 'border-[#C8FF00] text-[#C8FF00]' : border + ' text-gray-500'} py-3 text-[10px] tracking-widest mb-3 transition-colors`}
        >
          {showForm ? 'CANCEL' : '+ LOG MEASUREMENTS'}
        </button>
      )}

      {/* Entry form */}
      {showForm && (
        <div className={`border ${border} p-4 mb-3`}>
          <p className="text-[9px] tracking-widest text-gray-600 mb-3">NEW ENTRY — {today}</p>
          <div className="space-y-2">
            {[
              ['weight', 'WEIGHT (kg)'],
              ['waist',  'WAIST (cm)'],
              ['hips',   'HIPS (cm)'],
              ['chest',  'CHEST (cm)'],
              ['arms',   'ARMS (cm)'],
            ].map(([key, lbl]) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-[9px] tracking-widest text-gray-600 w-24 flex-shrink-0">{lbl}</span>
                <input
                  value={form[key]}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  type="number"
                  step="0.1"
                  className={inputCls}
                  placeholder="—"
                />
              </div>
            ))}
          </div>
          <button
            onClick={submit}
            className="w-full mt-4 py-3 bg-[#C8FF00] text-black text-xs tracking-widest font-bold active:opacity-80"
          >
            SAVE ENTRY
          </button>
        </div>
      )}

      {/* History */}
      <p className="text-[9px] tracking-widest text-gray-600 mb-2">HISTORY</p>
      {measurements.length === 0 && (
        <p className={`text-xs ${dm ? 'text-gray-700' : 'text-gray-400'} text-center py-4 tracking-widest`}>
          NO MEASUREMENTS YET
        </p>
      )}
      <div className="space-y-1">
        {[...measurements].reverse().slice(0, 12).map(m => (
          <div key={m.date} className={`border ${border} p-3`}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[9px] tracking-widest text-gray-600">{m.date}</span>
              <span className="font-bold text-sm">{m.weight ? `${m.weight}kg` : '—'}</span>
            </div>
            <div className="flex flex-wrap gap-3 text-[9px] text-gray-600">
              {m.waist && <span>WAIST {m.waist}cm</span>}
              {m.hips  && <span>HIPS {m.hips}cm</span>}
              {m.chest && <span>CHEST {m.chest}cm</span>}
              {m.arms  && <span>ARMS {m.arms}cm</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
