import { NextRequest, NextResponse } from 'next/server'
import { getOAuthClient } from '@/lib/gmail/oauth'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  // User denied access
  if (error) {
    return NextResponse.redirect(
      new URL('/journal?gmail=denied', req.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/journal?gmail=error', req.url)
    )
  }

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

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

    return NextResponse.redirect(
      new URL('/journal?gmail=connected', req.url)
    )
  } catch (err) {
    console.error('Gmail OAuth callback error:', err)
    return NextResponse.redirect(
      new URL('/journal?gmail=error', req.url)
    )
  }
}