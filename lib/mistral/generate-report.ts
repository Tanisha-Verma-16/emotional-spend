import { Mistral } from '@mistralai/mistralai'
import { format } from 'date-fns'

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! })

const REPORT_SYSTEM_PROMPT = `You are a compassionate behavioral insight coach.
Write a gentle, non-judgmental weekly reflection for a user based on their 
emotional journal entries and purchase history.

The tone should be:
- Warm, conversational, and supportive
- Never clinical or preachy  
- Focused on observation, not advice
- Written in second person ("you")

Format in clean markdown with these sections:
## 🌱 This Week at a Glance
## 😌 Your Emotional Landscape  
## 🛒 Spending Moments
## 🔗 Patterns Worth Noticing
## 💭 A Gentle Question to Sit With

Keep it under 400 words. Be honest but kind.`

export async function generateWeeklyReport(
  entries: any[],
  transactions: any[],
  correlations: any[],
  weekStart: Date,
  weekEnd: Date
): Promise<{ text: string; metadata: object }> {

  // Build context summary for the prompt
  const avgSentiment = entries.length
    ? entries.reduce((s, e) => s + (e.sentiment_score || 0), 0) / entries.length
    : 0

  const totalSpend = transactions.reduce((s, t) => s + (t.amount || 0), 0)

  const topTriggers = [...new Set(entries.flatMap(e => e.triggers || []))]
    .slice(0, 5)

  const topEmotions = [...new Set(entries.flatMap(e => e.emotion_labels || []))]
    .slice(0, 5)

  const topMerchants = transactions
    .map(t => t.merchant_name)
    .reduce<Record<string, number>>((acc, m) => {
      acc[m] = (acc[m] || 0) + 1
      return acc
    }, {})

  const journalSample = entries
    .slice(0, 5)
    .map(e => `- "${e.raw_text}" (sentiment: ${e.sentiment_score?.toFixed(2)})`)
    .join('\n')

  const correlationSummary = correlations
    .slice(0, 3)
    .map(c => `- ${c.description}`)
    .join('\n')

  const userContext = `
Week: ${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d, yyyy')}
Journal entries: ${entries.length}
Average sentiment: ${avgSentiment.toFixed(2)} (-1 = very negative, 1 = very positive)
Top emotions: ${topEmotions.join(', ')}
Top triggers: ${topTriggers.join(', ')}
Total spending: ₹${totalSpend.toFixed(0)}
Top merchants: ${Object.entries(topMerchants).map(([m, n]) => `${m} (${n}x)`).join(', ')}

Sample journal entries:
${journalSample}

Detected patterns:
${correlationSummary || 'No strong patterns detected this week.'}
  `.trim()

  const response = await mistral.chat.complete({
    model: 'mistral-small-latest',
    messages: [
      { role: 'system', content: REPORT_SYSTEM_PROMPT },
      { role: 'user', content: `Generate a weekly reflection for this user:\n\n${userContext}` }
    ],
    temperature: 0.7,
    maxTokens: 700,
  })

  const text = response.choices?.[0]?.message?.content as string || 'Unable to generate report.'

  const metadata = {
    avg_sentiment: avgSentiment,
    total_spend: totalSpend,
    top_triggers: topTriggers,
    top_emotions: topEmotions,
    entry_count: entries.length,
    transaction_count: transactions.length,
  }

  return { text, metadata }
}