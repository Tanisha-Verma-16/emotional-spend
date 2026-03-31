import { createClient } from '@/lib/supabase/server'

export default async function ReportPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: reports } = await supabase
    .from('weekly_reports')
    .select('*')
    .eq('user_id', user!.id)
    .order('week_start', { ascending: false })
    .limit(4)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <a href="/insights" className="text-sm text-slate-400 hover:text-slate-600">← Insights</a>
          <h1 className="text-xl font-light text-slate-600">Weekly Reports</h1>
        </div>
        {reports && reports.length > 0 ? (
          reports.map(report => (
            <div key={report.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <p className="text-xs text-slate-400 mb-4">
                Week of {new Date(report.week_start).toLocaleDateString('en-IN', { month: 'long', day: 'numeric' })}
              </p>
              <pre className="whitespace-pre-wrap font-sans text-sm text-slate-500 leading-relaxed">
                {report.report_text}
              </pre>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <p className="text-slate-400 text-sm">No reports yet. Generate one from the Insights page after logging some entries.</p>
          </div>
        )}
      </div>
    </div>
  )
}