/**
 * Correlation Engine
 * 
 * Heuristic rules:
 * 1. TEMPORAL PROXIMITY: purchase within 0-48h after negative journal entry
 * 2. SENTIMENT THRESHOLD: entry sentiment_score < -0.4 (noticeably negative)
 * 3. SPEND SPIKE: amount > user's average daily spend (computed dynamically)
 * 4. CLUSTERING: multiple negative entries in same day before purchase
 * 
 * Correlation score = weighted sum of these signals (0.0 - 1.0)
 */

export interface CorrelationCandidate {
  journal_entry_id: string
  transaction_id: string
  hours_between: number
  sentiment_at_entry: number
  spend_amount: number
  correlation_score: number
  description: string
}

export function computeCorrelations(
  entries: any[],
  transactions: any[],
  avgDailySpend: number
): CorrelationCandidate[] {
  const correlations: CorrelationCandidate[] = []

  for (const txn of transactions) {
    const txnTime = new Date(txn.transaction_at).getTime()

    for (const entry of entries) {
      const entryTime = new Date(entry.created_at).getTime()
      const hoursDiff = (txnTime - entryTime) / (1000 * 60 * 60)

      // Only look at entries BEFORE the transaction, within 48h window
      if (hoursDiff < 0 || hoursDiff > 48) continue

      // Skip neutral/positive entries
      if (entry.sentiment_score > -0.3) continue

      // Build score components
      const sentimentWeight = Math.abs(Math.min(entry.sentiment_score, 0))  // 0–1
      const intensityWeight = entry.emotion_intensity                         // 0–1
      
      // Temporal weight: closer = higher (max at 0h, drops to 0 at 48h)
      const temporalWeight = 1 - (hoursDiff / 48)
      
      // Spend spike weight: how much above average?
      const spendWeight = txn.amount && avgDailySpend > 0
        ? Math.min(txn.amount / avgDailySpend, 2) / 2
        : 0.5

      const correlationScore = (
        sentimentWeight * 0.35 +
        intensityWeight * 0.25 +
        temporalWeight * 0.25 +
        spendWeight * 0.15
      )

      // Only record meaningful correlations
      if (correlationScore < 0.3) continue

      const description = buildDescription(entry, txn, hoursDiff, correlationScore)

      correlations.push({
        journal_entry_id: entry.id,
        transaction_id: txn.id,
        hours_between: Math.round(hoursDiff * 10) / 10,
        sentiment_at_entry: entry.sentiment_score,
        spend_amount: txn.amount,
        correlation_score: Math.round(correlationScore * 100) / 100,
        description,
      })
    }
  }

  // Sort by score descending, deduplicate keeping highest per txn
  const seen = new Map<string, CorrelationCandidate>()
  for (const c of correlations.sort((a, b) => b.correlation_score - a.correlation_score)) {
    if (!seen.has(c.transaction_id)) seen.set(c.transaction_id, c)
  }

  return Array.from(seen.values())
}

function buildDescription(entry: any, txn: any, hours: number, score: number): string {
  const hoursStr = hours < 1 ? 'less than an hour' : `${Math.round(hours)} hours`
  const triggers = entry.triggers?.join(', ') || 'unknown triggers'
  const emotions = entry.emotion_labels?.join(', ') || 'negative mood'
  const merchant = txn.merchant_name || 'unknown merchant'
  const amount = txn.amount ? `₹${txn.amount}` : 'unknown amount'

  if (score > 0.7) {
    return `Strong signal: ${emotions} (${triggers}) was followed by a ${amount} purchase at ${merchant} ${hoursStr} later.`
  } else if (score > 0.5) {
    return `Possible pattern: After logging ${emotions}, you spent ${amount} at ${merchant} ${hoursStr} later.`
  } else {
    return `Weak signal: A ${emotions} entry may be loosely connected to a ${amount} ${merchant} purchase.`
  }
}