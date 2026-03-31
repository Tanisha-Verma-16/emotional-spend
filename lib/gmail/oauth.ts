import { google } from 'googleapis'

export const getOAuthClient = () =>
  new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI  // must match Google Console exactly
  )

export const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
]

export const getAuthUrl = () => {
  const oauth2Client = getOAuthClient()
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: GMAIL_SCOPES,
    prompt: 'consent',
  })
}