import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateWeeklyReport } from '@/lib/mistral/generate-report'
import { startOfWeek, endOfWeek, subWeeks, format } from 'date-fns'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { weeksAgo = 0 } = await req.json().catch(() => ({}))

  const weekStart = startOfWeek(subWeeks(new Date(), weeksAgo), { weekStartsOn: 1 })
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })

  // Fetch week data
// Add this to the existing Promise.all in the route
const [entriesRes, txnsRes, correlationsRes, profileRes] = await Promise.all([
  supabase.from('journal_entries').select('*').eq('user_id', user.id)
    .gte('created_at', weekStart.toISOString())
    .lte('created_at', weekEnd.toISOString()),
  supabase.from('transactions').select('*').eq('user_id', user.id)
    .gte('transaction_at', weekStart.toISOString())
    .lte('transaction_at', weekEnd.toISOString()),
  supabase.from('correlations').select('*').eq('user_id', user.id)
    .gte('created_at', weekStart.toISOString())
    .lte('created_at', weekEnd.toISOString()),
  supabase.from('profiles').select('*').eq('id', user.id).single(),  // add this
])



  const entries = entriesRes.data || []
  const transactions = txnsRes.data || []
  const correlations = correlationsRes.data || []

  if (entries.length === 0 && transactions.length === 0) {
    return NextResponse.json({ error: 'No data for this week' }, { status: 400 })
  }

  const { text, metadata } = await generateWeeklyReport(
    entries, transactions, correlations, weekStart, weekEnd,
    profileRes.data  
  )

  // Upsert report
  const { data: report, error } = await supabase
    .from('weekly_reports')
    .upsert({
      user_id: user.id,
      week_start: format(weekStart, 'yyyy-MM-dd'),
      week_end: format(weekEnd, 'yyyy-MM-dd'),
      report_text: text,
      metadata,
    }, { onConflict: 'user_id,week_start' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ report })
}