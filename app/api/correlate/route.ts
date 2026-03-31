import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { computeCorrelations } from '@/lib/correlation/engine'
import { subDays } from 'date-fns'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const since = subDays(new Date(), 14).toISOString()

  const [entriesResult, txnsResult] = await Promise.all([
    supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', since),
    supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('transaction_at', since),
  ])

  const entries = entriesResult.data || []
  const transactions = txnsResult.data || []

  if (entries.length === 0 || transactions.length === 0) {
    return NextResponse.json({ message: 'Not enough data', correlations: [] })
  }

  const totalSpend = transactions.reduce((sum, t) => sum + (t.amount || 0), 0)
  const avgDailySpend = totalSpend / 14

  const candidates = computeCorrelations(entries, transactions, avgDailySpend)

  if (candidates.length > 0) {
    await supabase
      .from('correlations')
      .delete()
      .eq('user_id', user.id)
      .gte('created_at', since)

    await supabase.from('correlations').insert(
      candidates.map(c => ({ ...c, user_id: user.id }))
    )
  }

  return NextResponse.json({ correlations: candidates, count: candidates.length })
}