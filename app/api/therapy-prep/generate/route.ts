import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Mistral } from '@mistralai/mistralai'
import { subDays, format } from 'date-fns'

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! })

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { answers } = await req.json()
  // answers = [{ question: string, answer: string }]

  const since = subDays(new Date(), 14).toISOString()

  const [{ data: entries }, { data: transactions }, { data: correlations }] = await Promise.all([
    supabase.from('journal_entries').select('*')
      .eq('user_id', user.id).gte('created_at', since).order('created_at', { ascending: false }).limit(10),
    supabase.from('transactions').select('*')
      .eq('user_id', user.id).gte('transaction_at', since),
    supabase.from('correlations').select('*')
      .eq('user_id', user.id).order('correlation_score', { ascending: false }).limit(3),
  ])

  const avgSentiment = (entries || []).length
    ? (entries || []).reduce((s, e) => s + (e.sentiment_score || 0), 0) / (entries || []).length
    : 0

  const topEmotions = [...new Set((entries || []).flatMap(e => e.emotion_labels || []))].slice(0, 5)
  const topTriggers = [...new Set((entries || []).flatMap(e => e.triggers || []))].slice(0, 5)
  const totalSpend = (transactions || []).reduce((s, t) => s + (t.amount || 0), 0)
  const patterns = (correlations || []).map(c => c.description).join('\n')

  const qaSection = answers.map((a: any) =>
    `Q: ${a.question}\nA: ${a.answer}`
  ).join('\n\n')

  const prompt = `You are a compassionate therapist assistant. Generate a warm, concise therapy prep note that a person can share with their therapist.

THEIR REFLECTIONS (from guided questions):
${qaSection}

BEHAVIORAL DATA (from their app):
- Mood average this period: ${avgSentiment.toFixed(2)} (-1 very negative, +1 very positive)
- Dominant emotions: ${topEmotions.join(', ')}
- Key triggers identified: ${topTriggers.join(', ')}
- Total spending: ₹${totalSpend}
- Emotional-spending patterns: ${patterns || 'No strong patterns yet'}
- Recent journal entries: ${(entries || []).slice(0, 3).map(e => `"${e.raw_text}"`).join(', ')}

Write a therapy prep note with these sections. Use plain text, no markdown symbols:

SESSION PREP NOTE
Date: ${format(new Date(), 'MMMM d, yyyy')}

What I want to focus on this session:
[2-3 sentences based on their reflections]

How I have been feeling:
[2-3 sentences summarizing emotional state from data + their answers]

Patterns I have noticed:
[2-3 sentences on behavioral/emotional patterns, including spending if relevant]

Something I have been avoiding:
[1-2 sentences based on their reflection answers]

What I need from this session:
[1-2 sentences on what support they are seeking]

Keep it human, warm, and written in first person as if the user wrote it themselves.
Do NOT use bullet points, headers with ##, or any markdown. Plain paragraphs only.`

  const response = await mistral.chat.complete({
    model: 'mistral-small-latest',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.65,
    maxTokens: 800,
  })

  const note = response.choices?.[0]?.message?.content as string || ''

  return NextResponse.json({ note, generatedAt: new Date().toISOString() })
}