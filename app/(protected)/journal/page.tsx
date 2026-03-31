import { createClient } from '@/lib/supabase/server'
import JournalInterface from '@/components/journal/JournalInterface'

export default async function JournalPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: entries } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const { data: gmailToken } = await supabase
    .from('gmail_tokens')
    .select('id')
    .eq('user_id', user!.id)
    .single()

  return (
    <JournalInterface
      initialEntries={entries || []}
      gmailConnected={!!gmailToken}
    />
  )
}