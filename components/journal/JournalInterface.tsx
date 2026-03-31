'use client'
import { useState } from 'react'
import { format } from 'date-fns'

interface Entry {
  id: string
  raw_text: string
  sentiment_score: number
  emotion_labels: string[]
  triggers: string[]
  created_at: string
}

interface Props {
  initialEntries: Entry[]
  gmailConnected: boolean
}

const sentimentColor = (score: number) => {
  if (score > 0.3) return 'bg-emerald-50 border-emerald-200'
  if (score > -0.3) return 'bg-slate-50 border-slate-200'
  if (score > -0.6) return 'bg-amber-50 border-amber-200'
  return 'bg-rose-50 border-rose-200'
}

const sentimentDot = (score: number) => {
  if (score > 0.3) return 'bg-emerald-400'
  if (score > -0.3) return 'bg-slate-400'
  if (score > -0.6) return 'bg-amber-400'
  return 'bg-rose-400'
}

export default function JournalInterface({ initialEntries, gmailConnected }: Props) {
  const [entries, setEntries] = useState<Entry[]>(initialEntries)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [status, setStatus] = useState('')

  const handleSubmit = async () => {
    if (!text.trim() || loading) return
    setLoading(true)
    setStatus('')

    const res = await fetch('/api/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })

    const data = await res.json()
    if (data.entry) {
      setEntries(prev => [data.entry, ...prev])
      setText('')
    }
    setLoading(false)
  }

  const handleGmailSync = async () => {
    setSyncing(true)
    setStatus('Scanning your inbox...')
    const res = await fetch('/api/gmail/sync', { method: 'POST' })
    const data = await res.json()
    setStatus(`Found ${data.saved} new receipts.`)
    setSyncing(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/70 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-light text-slate-600 tracking-wide">How are you feeling?</h1>
            <p className="text-xs text-slate-400">
              {format(new Date(), 'EEEE, MMMM d')}
            </p>
          </div>
          <div className="flex gap-2">
            {gmailConnected ? (
              <button
                onClick={handleGmailSync}
                disabled={syncing}
                className="text-xs px-3 py-1.5 rounded-full bg-blue-100 text-blue-600 
                           hover:bg-blue-200 transition-colors disabled:opacity-50"
              >
                {syncing ? 'Syncing...' : '↻ Sync receipts'}
              </button>
            ) : (
              <a
                href="/api/gmail/auth"
                className="text-xs px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 
                           hover:bg-slate-200 transition-colors"
              >
                Connect Gmail
              </a>
            )}
            <a href="/insights" className="text-xs px-3 py-1.5 rounded-full bg-indigo-100 
                                           text-indigo-600 hover:bg-indigo-200 transition-colors">
              Insights →
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* Input area */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
            }}
            placeholder="How's your day going? What's on your mind..."
            rows={3}
            className="w-full resize-none text-slate-600 placeholder-slate-300 
                       text-base leading-relaxed focus:outline-none"
          />
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
            {status && <span className="text-xs text-slate-400">{status}</span>}
            <div className="ml-auto flex items-center gap-3">
              <span className="text-xs text-slate-300">{text.length > 0 ? '⌘↵ to send' : ''}</span>
              <button
                onClick={handleSubmit}
                disabled={loading || !text.trim()}
                className="px-5 py-2 bg-blue-400 hover:bg-blue-500 text-white text-sm 
                           rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {loading ? '...' : 'Log'}
              </button>
            </div>
          </div>
        </div>

        {/* Entries */}
        <div className="space-y-3">
          {entries.map((entry, i) => (
            <div
              key={entry.id}
              style={{ animationDelay: `${i * 40}ms` }}
              className={`rounded-xl border p-4 transition-all ${sentimentColor(entry.sentiment_score)}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${sentimentDot(entry.sentiment_score)}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-600 text-sm leading-relaxed">{entry.raw_text}</p>
                  {entry.emotion_labels?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {entry.emotion_labels.map(label => (
                        <span key={label}
                          className="text-xs px-2 py-0.5 bg-white/70 text-slate-500 rounded-full border border-slate-200">
                          {label}
                        </span>
                      ))}
                      {entry.triggers?.map(trigger => (
                        <span key={trigger}
                          className="text-xs px-2 py-0.5 bg-white/40 text-slate-400 rounded-full">
                          #{trigger}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-xs text-slate-300 flex-shrink-0">
                  {format(new Date(entry.created_at), 'h:mm a')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}