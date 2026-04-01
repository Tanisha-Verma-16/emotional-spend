import { createClient } from '@/lib/supabase/server'
import { subDays } from 'date-fns'
import GenerateReportButton from '@/components/insights/GenerateReportButton'

export const dynamic = 'force-dynamic'

export default async function InsightsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const since = subDays(new Date(), 14).toISOString()

  const [{ data: entries }, { data: transactions }, { data: correlations }, { data: report }] =
    await Promise.all([
      supabase.from('journal_entries').select('*').eq('user_id', user!.id).gte('created_at', since),
      supabase.from('transactions').select('*').eq('user_id', user!.id).gte('transaction_at', since),
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

        <div className="flex items-center gap-3">
          <a href="/journal" className="text-sm text-slate-400 hover:text-slate-600">← Journal</a>
          <h1 className="text-xl font-light text-slate-600">Your Insights</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <p className="text-xs text-slate-400 mb-1">Avg Mood</p>
            <p className={`text-2xl font-light ${avgSentiment >= 0 ? 'text-emerald-500' : 'text-rose-400'}`}>
              {avgSentiment >= 0 ? `+${avgSentiment.toFixed(1)}` : avgSentiment.toFixed(1)}
            </p>
            <p className="text-xs text-slate-300 mt-0.5">past 14 days</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <p className="text-xs text-slate-400 mb-1">Entries</p>
            <p className="text-2xl font-light text-blue-400">{entries?.length || 0}</p>
            <p className="text-xs text-slate-300 mt-0.5">logged</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <p className="text-xs text-slate-400 mb-1">Spent</p>
            <p className="text-2xl font-light text-violet-400">₹{totalSpend.toFixed(0)}</p>
            <p className="text-xs text-slate-300 mt-0.5">from receipts</p>
          </div>
        </div>

        {/* Correlations */}
        {correlations && correlations.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-sm font-medium text-slate-500 mb-4 uppercase tracking-wider">
              Patterns Detected
            </h2>
            <div className="space-y-3">
              {correlations.map((c: any) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-1.5 rounded-full bg-gradient-to-b from-amber-300 to-rose-300 flex-shrink-0" />
                  <p className="text-sm text-slate-600 leading-relaxed">{c.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weekly Report */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
              Weekly Reflection
            </h2>
            <GenerateReportButton />
          </div>
          {report ? (
            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-500 leading-relaxed">
              {(report as any).report_text}
            </pre>
          ) : (
            <p className="text-slate-400 text-sm">
              Hit Generate to create your first weekly reflection.
            </p>
          )}
        </div>

      </div>
    </div>
  )
}