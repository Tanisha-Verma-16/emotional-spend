import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Mistral } from '@mistralai/mistralai'
import { subDays } from 'date-fns'

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! })

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const since = subDays(new Date(), 14).toISOString()

  const [{ data: entries }, { data: transactions }, { data: correlations }] = await Promise.all([
    supabase.from('journal_entries').select('raw_text, emotion_labels, triggers, sentiment_score')
      .eq('user_id', user.id).gte('created_at', since).order('created_at', { ascending: false }).limit(10),
    supabase.from('transactions').select('merchant_name, category, amount')
      .eq('user_id', user.id).gte('transaction_at', since),
    supabase.from('correlations').select('description')
      .eq('user_id', user.id).order('correlation_score', { ascending: false }).limit(3),
  ])

  const topEmotions = [...new Set((entries || []).flatMap(e => e.emotion_labels || []))].slice(0, 4)
  const topTriggers = [...new Set((entries || []).flatMap(e => e.triggers || []))].slice(0, 4)
  const recentEntries = (entries || []).slice(0, 3).map(e => e.raw_text).join(' | ')
  const totalSpend = (transactions || []).reduce((s, t) => s + (t.amount || 0), 0)
  const patterns = (correlations || []).map(c => c.description).join(' ')

  const prompt = `You are a compassionate therapist assistant preparing someone for their therapy session.

Based on this person's recent data:
- Recent journal entries: "${recentEntries}"
- Dominant emotions: ${topEmotions.join(', ')}
- Triggers noticed: ${topTriggers.join(', ')}
- Total spending this period: ₹${totalSpend}
- Behavioral patterns: ${patterns || 'none detected yet'}

Generate exactly 4 warm, open-ended questions to help them reflect before therapy.
Questions should feel personal and specific to THEIR data, not generic.
Return ONLY a JSON array of 4 strings. No markdown, no explanation.
Example: ["Question 1?", "Question 2?", "Question 3?", "Question 4?"]`

  const response = await mistral.chat.complete({
    model: 'mistral-small-latest',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.6,
    maxTokens: 400,
  })

  const raw = (response.choices?.[0]?.message?.content as string || '[]')
    .replace(/```json|```/g, '').trim()

  try {
    const questions = JSON.parse(raw)
    return NextResponse.json({ questions })
  } catch {
    return NextResponse.json({
      questions: [
        "What has been weighing on you most this past week?",
        "When did you feel most like yourself recently, and when did you feel most distant from yourself?",
        "Is there something you've been avoiding thinking about that keeps coming back?",
        "What do you most want your therapist to understand about where you are right now?"
      ]
    })
  }
}