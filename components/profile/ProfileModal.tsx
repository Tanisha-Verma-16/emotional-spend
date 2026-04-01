'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  name?: string
  age?: number
  gender?: string
  bio?: string
  avatar_url?: string
}

interface Props {
  onClose: () => void
  showNudge?: boolean  // silent nudge mode (first time)
}

export default function ProfileModal({ onClose, showNudge = false }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [profile, setProfile] = useState<Profile>({})
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [tab, setTab] = useState<'profile' | 'danger'>('profile')
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(d => {
        setProfile(d.profile || {})
        setEmail(d.email || '')
        setLoading(false)
      })
  }, [])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    setSaving(true)
    let avatarUrl = profile.avatar_url

    // Upload avatar if changed
    if (avatarFile) {
      const fd = new FormData()
      fd.append('avatar', avatarFile)
      const res = await fetch('/api/profile/avatar', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) avatarUrl = data.url
    }

    await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...profile, avatar_url: avatarUrl }),
    })

    setSaving(false)
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      onClose()
      router.refresh()
    }, 1000)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleDelete = async () => {
    await fetch('/api/profile', { method: 'DELETE' })
    router.push('/login')
  }

  const avatar = avatarPreview || profile.avatar_url
  const initials = profile.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : email?.[0]?.toUpperCase() || '?'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>

      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden
                      animate-in slide-in-from-bottom-4 duration-300">

        {/* Nudge banner */}
        {showNudge && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-3 border-b border-blue-100">
            <p className="text-xs text-blue-500 text-center">
              ✦ Add your details so insights feel more personal
            </p>
          </div>
        )}

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-light text-slate-700">Your Profile</h2>
            <p className="text-xs text-slate-400 mt-0.5">{email}</p>
          </div>
          <button onClick={onClose}
            className="text-slate-300 hover:text-slate-500 transition-colors text-xl leading-none">
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6">
          {(['profile', 'danger'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`text-xs pb-3 mr-6 border-b-2 transition-colors capitalize ${
                tab === t
                  ? 'border-blue-400 text-blue-500'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}>
              {t === 'danger' ? 'Account' : 'Profile'}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-400 rounded-full animate-spin" />
            </div>
          ) : tab === 'profile' ? (
            <>
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <button onClick={() => fileRef.current?.click()}
                  className="relative group flex-shrink-0">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br 
                                  from-blue-100 to-indigo-100 flex items-center justify-center">
                    {avatar
                      ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                      : <span className="text-xl font-light text-blue-400">{initials}</span>
                    }
                  </div>
                  <div className="absolute inset-0 rounded-full bg-black/20 opacity-0 
                                  group-hover:opacity-100 transition-opacity flex items-center 
                                  justify-center">
                    <span className="text-white text-xs">Edit</span>
                  </div>
                </button>
                <div>
                  <p className="text-sm text-slate-600 font-light">
                    {profile.name || 'No name set'}
                  </p>
                  <button onClick={() => fileRef.current?.click()}
                    className="text-xs text-blue-400 hover:text-blue-500 mt-0.5">
                    Change photo
                  </button>
                </div>
                <input ref={fileRef} type="file" accept="image/*"
                  onChange={handleAvatarChange} className="hidden" />
              </div>

              {/* Name */}
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Name</label>
                <input
                  type="text"
                  value={profile.name || ''}
                  onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  placeholder="Your name"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 
                             text-sm focus:outline-none focus:border-blue-300 transition-colors"
                />
              </div>

              {/* Age + Gender row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Age</label>
                  <input
                    type="number"
                    value={profile.age || ''}
                    onChange={e => setProfile(p => ({ ...p, age: parseInt(e.target.value) }))}
                    placeholder="e.g. 24"
                    min={10} max={100}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 
                               text-sm focus:outline-none focus:border-blue-300 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Gender</label>
                  <select
                    value={profile.gender || ''}
                    onChange={e => setProfile(p => ({ ...p, gender: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 
                               text-sm focus:outline-none focus:border-blue-300 transition-colors bg-white"
                  >
                    <option value="">Prefer not to say</option>
                    <option value="woman">Woman</option>
                    <option value="man">Man</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">
                  About you <span className="text-slate-300">(helps personalise insights)</span>
                </label>
                <textarea
                  value={profile.bio || ''}
                  onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                  placeholder="e.g. Student, dealing with work stress, trying to spend mindfully..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 
                             text-sm focus:outline-none focus:border-blue-300 transition-colors resize-none"
                />
              </div>

              {/* Save */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 bg-blue-400 hover:bg-blue-500 text-white rounded-xl 
                           transition-all text-sm font-light disabled:opacity-50"
              >
                {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save profile'}
              </button>
            </>
          ) : (
            /* Account tab */
            <div className="space-y-4">
              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-500 
                           rounded-xl transition-colors text-sm border border-slate-200"
              >
                Sign out
              </button>

              {/* Delete account */}
              <div className="border border-red-100 rounded-xl p-4 space-y-3">
                <p className="text-xs text-red-400 font-medium">Danger zone</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Permanently deletes your account, all journal entries, transactions, 
                  and reports. This cannot be undone.
                </p>
                {!deleteConfirm ? (
                  <button
                    onClick={() => setDeleteConfirm(true)}
                    className="w-full py-2.5 border border-red-200 text-red-400 rounded-xl 
                               hover:bg-red-50 transition-colors text-sm"
                  >
                    Delete my account
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-red-500 text-center font-medium">Are you sure?</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setDeleteConfirm(false)}
                        className="py-2.5 bg-slate-50 text-slate-500 rounded-xl text-xs 
                                   hover:bg-slate-100 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDelete}
                        className="py-2.5 bg-red-400 text-white rounded-xl text-xs 
                                   hover:bg-red-500 transition-colors"
                      >
                        Yes, delete everything
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}