import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return NextResponse.json({ profile: data, email: user.email })
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      name: body.name || null,
      age: body.age ? parseInt(body.age) : null,
      gender: body.gender || null,
      bio: body.bio || null,
      avatar_url: body.avatar_url || null,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ profile: data })
}

export async function DELETE() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Delete all user data then the auth user
  await supabase.from('journal_entries').delete().eq('user_id', user.id)
  await supabase.from('transactions').delete().eq('user_id', user.id)
  await supabase.from('correlations').delete().eq('user_id', user.id)
  await supabase.from('weekly_reports').delete().eq('user_id', user.id)
  await supabase.from('gmail_tokens').delete().eq('user_id', user.id)
  await supabase.from('profiles').delete().eq('id', user.id)
  await supabase.auth.signOut()

  return NextResponse.json({ success: true })
}