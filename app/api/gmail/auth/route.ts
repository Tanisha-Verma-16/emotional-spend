import { NextRequest, NextResponse } from 'next/server'
import { getAuthUrl } from '@/lib/gmail/oauth'

export async function GET(req: NextRequest) {
  const url = getAuthUrl()
  return NextResponse.redirect(url)
}