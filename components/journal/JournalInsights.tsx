'use client'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface Entry {
  id: string
  raw_text: string
  sentiment_score: number
  emotion_labels: string[]
  triggers: string[]
  created_at: string
}

interface Props {
  entries: Entry[]
}

// ─── WORD CLOUD ───────────────────────────────────────────
function WordCloudPopup({ entries, onClose }: { entries: Entry[], onClose: () => void }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Build word frequency from raw text + emotion labels + triggers
  const wordFreq: Record<string, { count: number; sentiment: number }> = {}

  entries.forEach(entry => {
    // From raw text
    const words = entry.raw_text
      .toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3 && !['that', 'this', 'with', 'have', 'been', 'from', 'they', 'will', 'your', 'just', 'dont', 'feel', 'like', 'very', 'some', 'what', 'when', 'then', 'there', 'about', 'more', 'know'].includes(w))

    words.forEach(w => {
      if (!wordFreq[w]) wordFreq[w] = { count: 0, sentiment: 0 }
      wordFreq[w].count++
      wordFreq[w].sentiment += entry.sentiment_score || 0
    })

    // From emotion labels
    entry.emotion_labels?.forEach(label => {
      if (!wordFreq[label]) wordFreq[label] = { count: 0, sentiment: 0 }
      wordFreq[label].count += 2
      wordFreq[label].sentiment += entry.sentiment_score || 0
    })

    // From triggers
    entry.triggers?.forEach(trigger => {
      if (!wordFreq[trigger]) wordFreq[trigger] = { count: 0, sentiment: 0 }
      wordFreq[trigger].count += 1.5
      wordFreq[trigger].sentiment += entry.sentiment_score || 0
    })
  })

  const words = Object.entries(wordFreq)
    .map(([word, data]) => ({
      word,
      count: data.count,
      avgSentiment: data.count > 0 ? data.sentiment / data.count : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 40)

  const maxCount = Math.max(...words.map(w => w.count), 1)

  const getColor = (sentiment: number) => {
    if (sentiment > 0.3) return { bg: '#dcfce7', text: '#166534', border: '#86efac' }
    if (sentiment > 0) return { bg: '#e0f2fe', text: '#075985', border: '#7dd3fc' }
    if (sentiment > -0.3) return { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' }
    if (sentiment > -0.6) return { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' }
    return { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' }
  }

  const getFontSize = (count: number) => {
    const ratio = count / maxCount
    return Math.round(12 + ratio * 22)
  }

  if (!mounted) return null

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999 }}>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)' }} />
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, pointerEvents: 'none' }}>
        <div style={{
          background: 'white', borderRadius: 24, width: '100%', maxWidth: 560,
          maxHeight: '85vh', display: 'flex', flexDirection: 'column',
          pointerEvents: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.15)'
        }}>
          {/* Header */}
          <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 500, color: '#0f172a', margin: 0 }}>Word cloud</h3>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>Sized by frequency · coloured by mood</p>
            </div>
            <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: '50%', background: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#64748b', flexShrink: 0 }}>×</button>
          </div>

          {/* Legend */}
          <div style={{ padding: '10px 24px', borderBottom: '1px solid #f8fafc', display: 'flex', gap: 12, flexWrap: 'wrap', flexShrink: 0 }}>
            {[
              { label: 'Positive', bg: '#dcfce7', text: '#166534', border: '#86efac' },
              { label: 'Neutral', bg: '#f3f4f6', text: '#374151', border: '#d1d5db' },
              { label: 'Mild stress', bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
              { label: 'Negative', bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: l.bg, border: `1px solid ${l.border}` }} />
                <span style={{ fontSize: 11, color: '#64748b' }}>{l.label}</span>
              </div>
            ))}
          </div>

          {/* Cloud */}
          <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
            {words.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 14, padding: '40px 0' }}>
                Log some journal entries to see your word cloud
              </p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
                {words.map(({ word, count, avgSentiment }) => {
                  const color = getColor(avgSentiment)
                  const size = getFontSize(count)
                  return (
                    <span key={word} style={{
                      fontSize: size, fontWeight: size > 24 ? 500 : 400,
                      background: color.bg, color: color.text,
                      border: `1px solid ${color.border}`,
                      padding: '3px 10px', borderRadius: 100,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      cursor: 'default', display: 'inline-block',
                      lineHeight: 1.4,
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)' }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none' }}
                    >
                      {word}
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ─── MOOD GRAPH ───────────────────────────────────────────
function MoodGraphPopup({ entries, onClose }: { entries: Entry[], onClose: () => void }) {
  const [mounted, setMounted] = useState(false)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  const sorted = [...entries]
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(-30)

  const W = 480, H = 200, padX = 40, padY = 20

  const getY = (score: number) => {
    const clamped = Math.max(-1, Math.min(1, score))
    return padY + ((1 - clamped) / 2) * (H - padY * 2)
  }

  const getX = (i: number) => {
    if (sorted.length < 2) return padX + (W - padX * 2) / 2
    return padX + (i / (sorted.length - 1)) * (W - padX * 2)
  }

  const getDotColor = (score: number) => {
    if (score > 0.4) return '#22c55e'
    if (score > 0.1) return '#86efac'
    if (score > -0.1) return '#94a3b8'
    if (score > -0.4) return '#fbbf24'
    return '#ef4444'
  }

  const getAreaColor = (score: number) => {
    if (score > 0.3) return 'rgba(34,197,94,0.15)'
    if (score > -0.3) return 'rgba(148,163,184,0.1)'
    return 'rgba(239,68,68,0.1)'
  }

  // Build SVG path
  const points = sorted.map((e, i) => ({ x: getX(i), y: getY(e.sentiment_score || 0), entry: e, score: e.sentiment_score || 0 }))
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${H - padY} L ${points[0].x} ${H - padY} Z`
    : ''

  const avgScore = sorted.length > 0
    ? sorted.reduce((s, e) => s + (e.sentiment_score || 0), 0) / sorted.length
    : 0

  const trend = sorted.length >= 2
    ? (sorted[sorted.length - 1].sentiment_score || 0) - (sorted[0].sentiment_score || 0)
    : 0

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
  }

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  const moodLabel = (score: number) => {
    if (score > 0.5) return 'Very positive'
    if (score > 0.2) return 'Positive'
    if (score > -0.2) return 'Neutral'
    if (score > -0.5) return 'Low'
    return 'Very low'
  }

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999 }}>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)' }} />
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, pointerEvents: 'none' }}>
        <div style={{
          background: 'white', borderRadius: 24, width: '100%', maxWidth: 580,
          maxHeight: '90vh', display: 'flex', flexDirection: 'column',
          pointerEvents: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.15)'
        }}>
          {/* Header */}
          <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 500, color: '#0f172a', margin: 0 }}>Mood over time</h3>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>Last {sorted.length} journal entries</p>
            </div>
            <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: '50%', background: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#64748b', flexShrink: 0 }}>×</button>
          </div>

          <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Average mood', value: avgScore.toFixed(2), color: avgScore >= 0 ? '#22c55e' : '#ef4444', sub: moodLabel(avgScore) },
                { label: 'Entries tracked', value: String(sorted.length), color: '#3b82f6', sub: 'journal logs' },
                { label: 'Trend', value: trend >= 0 ? `↑ ${trend.toFixed(2)}` : `↓ ${Math.abs(trend).toFixed(2)}`, color: trend >= 0 ? '#22c55e' : '#ef4444', sub: trend >= 0 ? 'improving' : 'declining' }
              ].map(stat => (
                <div key={stat.label} style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>{stat.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 500, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{stat.sub}</div>
                </div>
              ))}
            </div>

            {/* SVG Chart */}
            {sorted.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 14, padding: '40px 0' }}>
                Log some journal entries to see your mood graph
              </p>
            ) : (
              <div style={{ position: 'relative', background: '#fafbff', borderRadius: 16, padding: '16px 8px', border: '1px solid #f1f5f9' }}>
                <svg width="100%" viewBox={`0 0 ${W} ${H + 30}`} style={{ overflow: 'visible' }}>
                  {/* Y-axis labels */}
                  {[
                    { y: padY, label: 'Great', color: '#22c55e' },
                    { y: H / 2, label: 'Okay', color: '#94a3b8' },
                    { y: H - padY, label: 'Low', color: '#ef4444' }
                  ].map(item => (
                    <text key={item.label} x={padX - 6} y={item.y + 4} textAnchor="end"
                      style={{ fontSize: 10, fill: item.color, fontFamily: 'system-ui' }}>
                      {item.label}
                    </text>
                  ))}

                  {/* Horizontal grid lines */}
                  {[padY, H / 2, H - padY].map((y, i) => (
                    <line key={i} x1={padX} y1={y} x2={W - 10} y2={y}
                      stroke={i === 1 ? '#e2e8f0' : '#f1f5f9'} strokeWidth={i === 1 ? 1.5 : 1} strokeDasharray={i === 1 ? '4,4' : '2,4'} />
                  ))}

                  {/* Area fill */}
                  {areaPath && (
                    <path d={areaPath} fill={getAreaColor(avgScore)} />
                  )}

                  {/* Line */}
                  {linePath && (
                    <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round" />
                  )}

                  {/* Dots */}
                  {points.map((p, i) => (
                    <g key={i}
                      onMouseEnter={() => setHoveredIdx(i)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      style={{ cursor: 'pointer' }}
                    >
                      <circle cx={p.x} cy={p.y} r={8} fill="transparent" />
                      <circle cx={p.x} cy={p.y} r={hoveredIdx === i ? 7 : 5}
                        fill={getDotColor(p.score)}
                        stroke="white" strokeWidth="2"
                        style={{ transition: 'r 0.15s' }}
                      />

                      {/* Tooltip */}
                      {hoveredIdx === i && (
                        <g>
                          <rect
                            x={Math.min(Math.max(p.x - 60, padX), W - 130)}
                            y={p.y - 58}
                            width={120} height={52} rx={8}
                            fill="white" stroke="#e2e8f0" strokeWidth={1}
                            style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}
                          />
                          <text x={Math.min(Math.max(p.x - 60, padX), W - 130) + 60} y={p.y - 40}
                            textAnchor="middle" style={{ fontSize: 11, fill: '#64748b', fontFamily: 'system-ui' }}>
                            {formatDate(p.entry.created_at)} {formatTime(p.entry.created_at)}
                          </text>
                          <text x={Math.min(Math.max(p.x - 60, padX), W - 130) + 60} y={p.y - 25}
                            textAnchor="middle" style={{ fontSize: 12, fontWeight: 500, fill: getDotColor(p.score), fontFamily: 'system-ui' }}>
                            {moodLabel(p.score)} ({p.score.toFixed(2)})
                          </text>
                          <text x={Math.min(Math.max(p.x - 60, padX), W - 130) + 60} y={p.y - 12}
                            textAnchor="middle" style={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'system-ui' }}>
                            {p.entry.emotion_labels?.slice(0, 2).join(', ') || 'no labels'}
                          </text>
                        </g>
                      )}
                    </g>
                  ))}

                  {/* X-axis date labels — show 4 evenly spaced */}
                  {sorted.length > 1 && [0, Math.floor(sorted.length / 3), Math.floor(sorted.length * 2 / 3), sorted.length - 1]
                    .filter((v, i, a) => a.indexOf(v) === i)
                    .map(i => (
                      <text key={i} x={getX(i)} y={H + 16} textAnchor="middle"
                        style={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'system-ui' }}>
                        {formatDate(sorted[i].created_at)}
                      </text>
                    ))
                  }
                </svg>
              </div>
            )}

            {/* Emotion breakdown */}
            {sorted.length > 0 && (() => {
              const freq: Record<string, number> = {}
              sorted.forEach(e => e.emotion_labels?.forEach(l => { freq[l] = (freq[l] || 0) + 1 }))
              const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 6)
              const total = top.reduce((s, [, c]) => s + c, 0)

              const emoColors: Record<string, string> = {
                joy: '#22c55e', calm: '#06b6d4', excited: '#f59e0b', content: '#84cc16',
                stress: '#f97316', anxiety: '#fb923c', overwhelmed: '#ef4444',
                frustrated: '#dc2626', anger: '#b91c1c', sadness: '#6366f1',
                lonely: '#8b5cf6', tired: '#94a3b8'
              }

              return top.length > 0 ? (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12, fontWeight: 500 }}>Emotion breakdown</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {top.map(([label, count]) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 64, fontSize: 12, color: '#475569', textAlign: 'right', flexShrink: 0 }}>{label}</div>
                        <div style={{ flex: 1, height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: 4,
                            background: emoColors[label] || '#6366f1',
                            width: `${(count / (top[0][1])) * 100}%`,
                            transition: 'width 0.6s ease'
                          }} />
                        </div>
                        <div style={{ width: 24, fontSize: 12, color: '#94a3b8', flexShrink: 0 }}>{count}x</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null
            })()}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ─── MAIN EXPORT ──────────────────────────────────────────
export default function JournalInsights({ entries }: Props) {
  const [showCloud, setShowCloud] = useState(false)
  const [showGraph, setShowGraph] = useState(false)

  return (
    <>
      {/* Buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => setShowCloud(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 100,
            background: '#f0f9ff', border: '1px solid #bae6fd',
            color: '#0369a1', fontSize: 12, fontWeight: 500,
            cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#e0f2fe'; e.currentTarget.style.borderColor = '#7dd3fc' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#f0f9ff'; e.currentTarget.style.borderColor = '#bae6fd' }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M2 8a3 3 0 013-3h.5A3.5 3.5 0 019 2.5a3.5 3.5 0 013.5 3.5A2.5 2.5 0 0111 10.5H3.5A2 2 0 012 8z" stroke="#0369a1" strokeWidth="1.2" fill="none"/>
          </svg>
          Word cloud
        </button>

        <button
          onClick={() => setShowGraph(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 100,
            background: '#fdf4ff', border: '1px solid #e9d5ff',
            color: '#7c3aed', fontSize: 12, fontWeight: 500,
            cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f5f3ff'; e.currentTarget.style.borderColor = '#c4b5fd' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fdf4ff'; e.currentTarget.style.borderColor = '#e9d5ff' }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M1 10l3-4 3 2 3-5 2 2" stroke="#7c3aed" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          Mood graph
        </button>
      </div>

      {showCloud && <WordCloudPopup entries={entries} onClose={() => setShowCloud(false)} />}
      {showGraph && <MoodGraphPopup entries={entries} onClose={() => setShowGraph(false)} />}
    </>
  )
}