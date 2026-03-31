import { createClient } from '@/lib/supabase/server'
import { subDays, format } from 'date-fns'

export default async function InsightsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const since = subDays(new Date(), 14).toISOString()

  const [{ data: entries }, { data: transactions }, { data: correlations }, { data: report }] = 
    await Promise.all([
      supabase.from('journal_entries').select('*').eq('user_id', user!.id)
        .gte('created_at', since).order('created_at'),
      supabase.from('transactions').select('*').eq('user_id', user!.id)
        .gte('transaction_at', since).order('transaction_at'),
      supabase.from('correlations').select('*').eq('user_id', user!.id)
        .order('correlation_score', { ascending: false }).limit(5),
      supabase.from('weekly_reports').select('*').eq('user_id', user!.id)
        .order('week_start', { ascending: false }).limit(1).single(),
    ])

  const avgSentiment = entries?.length
    ? entries.reduce((s, e) => s + (e.sentiment_score || 0), 0) / entries.length
    : 0

  const totalSpend = transactions?.reduce((s, t) => s + (t.amount || 0), 0) || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        
        {/* Back nav */}
        <div className="flex items-center gap-3">
          <a href="/journal" className="text-sm text-slate-400 hover:text-slate-600">← Journal</a>
          <h1 className="text-xl font-light text-slate-600">Your Insights</h1>
        </div>

        {/* At a glance */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Avg Mood" value={avgSentiment >= 0 ? `+${avgSentiment.toFixed(1)}` : avgSentiment.toFixed(1)} 
            sub="past 14 days" color={avgSentiment >= 0 ? 'text-emerald-500' : 'text-rose-400'} />
          <StatCard label="Entries" value={String(entries?.length || 0)} sub="logged" color="text-blue-400" />
          <StatCard label="Spent" value={`₹${totalSpend.toFixed(0)}`} sub="from receipts" color="text-violet-400" />
        </div>

        {/* Correlations */}
        {correlations && correlations.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-sm font-medium text-slate-500 mb-4 uppercase tracking-wider">
              Patterns Detected
            </h2>
            <div className="space-y-3">
              {correlations.map(c => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-1.5 rounded-full bg-gradient-to-b from-amber-300 to-rose-300 flex-shrink-0" />
                  <p className="text-sm text-slate-600 leading-relaxed">{c.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weekly report */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
              Weekly Reflection
            </h2>
            <GenerateReportButton hasReport={!!report} />
          </div>
          {report ? (
            <div className="prose prose-sm prose-slate max-w-none 
                            prose-headings:font-medium prose-headings:text-slate-600
                            prose-p:text-slate-500 prose-p:leading-relaxed">
              {/* Render markdown as simple paragraphs — install react-markdown for full rendering */}
              <pre className="whitespace-pre-wrap font-sans text-sm text-slate-500 leading-relaxed">
                {report.report_text}
              </pre>
            </div>
          ) : (
            <p className="text-slate-400 text-sm">
              Generate your first weekly reflection once you have some entries logged.
            </p>
          )}
        </div>

        {/* Transactions list */}
        {transactions && transactions.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-sm font-medium text-slate-500 mb-4 uppercase tracking-wider">
              Recent Receipts
            </h2>
            <div className="divide-y divide-slate-50">
              {transactions.slice(0, 8).map(t => (
                <div key={t.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">{t.merchant_name}</p>
                    <p className="text-xs text-slate-400">{t.category} · {format(new Date(t.transaction_at), 'MMM d')}</p>
                  </div>
                  <p className="text-sm font-medium text-slate-500">₹{t.amount}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, color }: any) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className={`text-2xl font-light ${color}`}>{value}</p>
      <p className="text-xs text-slate-300 mt-0.5">{sub}</p>
    </div>
  )
}

function GenerateReportButton({ hasReport }: { hasReport: boolean }) {
  return (
    <form action={async () => {
      'use server'
      // This calls the API - use client component for real interactivity
    }}>
      <a
        href="/report"
        className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-500 rounded-full hover:bg-indigo-100 transition-colors"
      >
        {hasReport ? 'View report' : 'Generate →'}
      </a>
    </form>
  )
}