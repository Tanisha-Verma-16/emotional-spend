import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeJournalEntry } from '@/lib/mistral/analyze-entry'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { text } = await req.json()
  if (!text?.trim()) return NextResponse.json({ error: 'Empty entry' }, { status: 400 })

  // Run NLP analysis
  const analysis = await analyzeJournalEntry(text)

  // Store in Supabase
  const { data, error } = await supabase
    .from('journal_entries')
    .insert({
      user_id: user.id,
      raw_text: text,
      sentiment_score: analysis.sentiment_score,
      emotion_intensity: analysis.emotion_intensity,
      emotion_labels: analysis.emotion_labels,
      triggers: analysis.triggers,
      extracted_entities: analysis.extracted_entities,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ entry: data, analysis })
}

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') || '20')

  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ entries: data })
}