import { Mistral } from '@mistralai/mistralai'
import type { RawEmailData } from '../gmail/parser'

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! })

export interface ExtractedTransaction {
  merchant_name: string
  category: string
  amount: number | null
  currency: string
  transaction_date: string
  is_purchase: boolean
}

const SYSTEM_PROMPT = `You are a purchase receipt parser.
Extract transaction data from email content and return ONLY valid JSON. No markdown.

Return this exact structure:
{
  "merchant_name": "<string>",
  "category": "<string>",
  "amount": <number or null>,
  "currency": "<string>",
  "transaction_date": "<ISO date string>",
  "is_purchase": <boolean>
}

Category options: food_delivery, ecommerce, travel, groceries, entertainment, 
fashion, electronics, health, utilities, other

Rules:
- is_purchase: true only if this is an actual purchase receipt/confirmation
- amount: numeric value only, no currency symbols
- currency: default "INR" for Indian merchants
- If no clear purchase data exists, set is_purchase to false
`

export async function extractTransaction(
  email: RawEmailData
): Promise<ExtractedTransaction | null> {
  const content = `
Subject: ${email.subject}
From: ${email.from}
Date: ${email.date}
Content: ${email.body.slice(0, 2000)}
  `.trim()

  const response = await mistral.chat.complete({
    model: 'mistral-small-latest',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: content }
    ],
    temperature: 0.05,
    maxTokens: 300,
  })

  const raw = response.choices?.[0]?.message?.content as string

  try {
    const cleaned = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned) as ExtractedTransaction
    return parsed.is_purchase ? parsed : null
  } catch {
    return null
  }
}