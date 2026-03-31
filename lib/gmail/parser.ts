import { google } from 'googleapis'
import { getOAuthClient } from './oauth'

// Receipt email search queries — catches most Indian e-commerce receipts
const RECEIPT_QUERIES = [
  'from:amazon.in subject:order',
  'from:swiggy.com subject:order',
  'from:zomato.com',
  'from:uber.com subject:receipt',
  'from:flipkart.com subject:order',
  'from:myntra.com subject:order',
  'from:nykaa.com subject:order',
  'subject:"payment confirmation"',
  'subject:"order confirmed"',
  'subject:"your receipt"',
  'subject:"invoice"',
]

export interface RawEmailData {
  id: string
  subject: string
  from: string
  snippet: string
  body: string
  date: string
}

export async function fetchReceiptEmails(
  accessToken: string,
  refreshToken: string | null,
  daysBack: number = 14
): Promise<RawEmailData[]> {
  const oauth2Client = getOAuthClient()
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

  // Build date filter
  const after = new Date()
  after.setDate(after.getDate() - daysBack)
  const afterStr = Math.floor(after.getTime() / 1000)

  const emails: RawEmailData[] = []
  const seenIds = new Set<string>()

  for (const query of RECEIPT_QUERIES) {
    try {
      const list = await gmail.users.messages.list({
        userId: 'me',
        q: `${query} after:${afterStr}`,
        maxResults: 10,
      })

      const messages = list.data.messages || []

      for (const msg of messages) {
        if (!msg.id || seenIds.has(msg.id)) continue
        seenIds.add(msg.id)

        const full = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'full',
        })

        const headers = full.data.payload?.headers || []
        const subject = headers.find(h => h.name === 'Subject')?.value || ''
        const from = headers.find(h => h.name === 'From')?.value || ''
        const date = headers.find(h => h.name === 'Date')?.value || ''
        const snippet = full.data.snippet || ''

        // Extract plain text body
        const body = extractBody(full.data.payload)

        emails.push({ id: msg.id, subject, from, snippet, body, date })
      }
    } catch {
      // Skip failed queries silently
      continue
    }
  }

  return emails
}

function extractBody(payload: any): string {
  if (!payload) return ''
  
  if (payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64').toString('utf-8')
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return Buffer.from(part.body.data, 'base64').toString('utf-8')
      }
    }
    // fallback to HTML part
    for (const part of payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        const html = Buffer.from(part.body.data, 'base64').toString('utf-8')
        return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      }
    }
  }

  return ''
}