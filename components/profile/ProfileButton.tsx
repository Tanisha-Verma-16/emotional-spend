'use client'
import { useState, useEffect } from 'react'
import ProfileModal from './ProfileModal'

interface Props {
  hasProfile: boolean  // passed from server — true if name exists
}

export default function ProfileButton({ hasProfile }: Props) {
  const [open, setOpen] = useState(false)
  const [showNudge, setShowNudge] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [initials, setInitials] = useState('?')

  useEffect(() => {
    // Fetch profile for avatar/initials
    fetch('/api/profile').then(r => r.json()).then(d => {
      if (d.profile?.avatar_url) setAvatarUrl(d.profile.avatar_url)
      if (d.profile?.name) {
        setInitials(
          d.profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        )
      } else if (d.email) {
        setInitials(d.email[0].toUpperCase())
      }
    })

    // Show silent nudge once if profile incomplete
    if (!hasProfile) {
      const nudgeSeen = localStorage.getItem('profile-nudge-seen')
      if (!nudgeSeen) {
        setTimeout(() => {
          setShowNudge(true)
          setOpen(true)
          localStorage.setItem('profile-nudge-seen', 'true')
        }, 3000)  // 3 second delay after page load
      }
    }
  }, [hasProfile])

  return (
    <>
      <button
        onClick={() => { setOpen(true); setShowNudge(false) }}
        className="relative w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br 
                   from-blue-100 to-indigo-100 flex items-center justify-center
                   hover:ring-2 hover:ring-blue-200 transition-all flex-shrink-0"
      >
        {avatarUrl
          ? <img src={avatarUrl} alt="profile" className="w-full h-full object-cover" />
          : <span className="text-xs font-medium text-blue-400">{initials}</span>
        }
        {/* Red dot if profile incomplete */}
        {!hasProfile && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-rose-400 rounded-full 
                           border border-white" />
        )}
      </button>

      {open && (
        <ProfileModal
          onClose={() => { setOpen(false); setShowNudge(false) }}
          showNudge={showNudge}
        />
      )}
    </>
  )
}