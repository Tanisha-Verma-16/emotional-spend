import { NextRequest, NextResponse } from 'next/server'
import { getOAuthClient } from '@/lib/gmail/oauth'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  if (!code) return NextResponse.redirect('/journal?error=gmail_auth_failed')

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect('/login')

  const oauth2Client = getOAuthClient()
  const { tokens } = await oauth2Client.getToken(code)

  await supabase.from('gmail_tokens').upsert({
    user_id: user.id,
    access_token: tokens.access_token!,
    refresh_token: tokens.refresh_token ?? null,
    expires_at: tokens.expiry_date
      ? new Date(tokens.expiry_date).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  })

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/journal?gmail=connected`)
}