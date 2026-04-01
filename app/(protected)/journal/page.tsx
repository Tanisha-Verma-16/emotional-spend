export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import JournalInterface from '@/components/journal/JournalInterface'
import ProfileButton from '@/components/profile/ProfileButton'

export default async function JournalPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: entries }, { data: gmailToken }, { data: profile }] = await Promise.all([
    supabase.from('journal_entries').select('*')
      .eq('user_id', user!.id).order('created_at', { ascending: false }).limit(20),
    supabase.from('gmail_tokens').select('id').eq('user_id', user!.id).single(),
    supabase.from('profiles').select('name').eq('id', user!.id).single(),
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/70 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-light text-slate-600 tracking-wide">
              {profile?.name ? `Hey, ${profile.name.split(' ')[0]} ✦` : 'How are you feeling?'}
            </h1>
            <p className="text-xs text-slate-400">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {gmailToken ? (
              <SyncButton />
            ) : (
              <a href="/api/gmail/auth"
                className="text-xs px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 
                           hover:bg-slate-200 transition-colors">
                Connect Gmail
              </a>
            )}
            <a href="/insights"
              className="text-xs px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-600 
                         hover:bg-indigo-200 transition-colors">
              Insights →
            </a>
            <ProfileButton hasProfile={!!profile?.name} />
          </div>
        </div>
      </div>

      {/* Journal content */}
      <JournalInterface
        initialEntries={entries || []}
        gmailConnected={!!gmailToken}
      />
    </div>
  )
}

// Keep sync button as client component
function SyncButton() {
  return (
    <form action="/api/gmail/sync" method="POST">
      <button type="submit"
        className="text-xs px-3 py-1.5 rounded-full bg-blue-100 text-blue-600 
                   hover:bg-blue-200 transition-colors">
        ↻ Sync receipts
      </button>
    </form>
  )
}