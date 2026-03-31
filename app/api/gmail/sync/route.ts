import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchReceiptEmails } from '@/lib/gmail/parser'
import { extractTransaction } from '@/lib/mistral/extract-transaction'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get stored Gmail token
  const { data: tokenData } = await supabase
    .from('gmail_tokens')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!tokenData) {
    return NextResponse.json({ error: 'Gmail not connected' }, { status: 400 })
  }

  const emails = await fetchReceiptEmails(
    tokenData.access_token,
    tokenData.refresh_token,
    14 // last 14 days
  )

  const results = { processed: 0, saved: 0, skipped: 0 }

  for (const email of emails) {
    results.processed++

    const transaction = await extractTransaction(email)
    if (!transaction) { results.skipped++; continue }

    // Check if already stored (avoid duplicates)
    const { data: existing } = await supabase
      .from('transactions')
      .select('id')
      .eq('source_email_id', email.id)
      .eq('user_id', user.id)
      .single()

    if (existing) { results.skipped++; continue }

    const { error } = await supabase.from('transactions').insert({
      user_id: user.id,
      merchant_name: transaction.merchant_name,
      category: transaction.category,
      amount: transaction.amount,
      currency: transaction.currency,
      transaction_at: transaction.transaction_date,
      source_email_id: email.id,
      raw_snippet: email.snippet,
    })

    if (!error) results.saved++
  }

  return NextResponse.json({ success: true, ...results })
}