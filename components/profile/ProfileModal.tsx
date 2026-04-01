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
  showNudge?: boolean
}

export default function ProfileModal({ onClose, showNudge = false }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [profile, setProfile] = useState<Profile>({})
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [tab, setTab] = useState<'profile' | 'account'>('profile')

  // Delete flow
  const [deleteStep, setDeleteStep] = useState<'idle' | 'confirm' | 'password'>('idle')
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [deleting, setDeleting] = useState(false)

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

  const handleDeleteConfirmed = async () => {
    if (!deletePassword.trim()) {
      setDeleteError('Please enter your password')
      return
    }
    setDeleting(true)
    setDeleteError('')

    // Re-authenticate first
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: deletePassword,
    })

    if (authError) {
      setDeleteError('Incorrect password. Please try again.')
      setDeleting(false)
      return
    }

    // Password correct — delete everything
    await fetch('/api/profile', { method: 'DELETE' })
    router.push('/login')
  }

  const avatar = avatarPreview || profile.avatar_url
  const initials = profile.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : email?.[0]?.toUpperCase() || '?'

  return (
    // Full screen overlay — fixed, high z-index
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal — sits above backdrop */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md z-10
                      flex flex-col max-h-[90vh]">

        {/* Nudge banner */}
        {showNudge && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-2.5
                          border-b border-blue-100 rounded-t-3xl flex-shrink-0">
            <p className="text-xs text-blue-500 text-center">
              ✦ Add your details so insights feel more personal
            </p>
          </div>
        )}

        {/* Header */}
        <div className="px-6 pt-5 pb-3 flex items-start justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-light text-slate-700">Your Profile</h2>
            <p className="text-xs text-slate-400 mt-0.5">{email}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 
                       transition-colors flex items-center justify-center text-slate-500 text-sm"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6 flex-shrink-0">
          <button
            onClick={() => setTab('profile')}
            className={`text-xs pb-3 mr-6 border-b-2 transition-colors ${
              tab === 'profile'
                ? 'border-blue-400 text-blue-500'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setTab('account')}
            className={`text-xs pb-3 mr-6 border-b-2 transition-colors ${
              tab === 'account'
                ? 'border-blue-400 text-blue-500'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Account
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-400
                              rounded-full animate-spin" />
            </div>

          ) : tab === 'profile' ? (
            <>
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="relative group w-16 h-16 rounded-full flex-shrink-0 overflow-hidden
                             bg-gradient-to-br from-blue-100 to-indigo-100
                             flex items-center justify-center"
                >
                  {avatar
                    ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                    : <span className="text-xl font-light text-blue-400">{initials}</span>
                  }
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100
                                  transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs">Edit</span>
                  </div>
                </button>
                <div>
                  <p className="text-sm text-slate-600 font-light">
                    {profile.name || 'No name yet'}
                  </p>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="text-xs text-blue-400 hover:text-blue-500 mt-0.5"
                  >
                    Change photo
                  </button>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
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

              {/* Age + Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Age</label>
                  <input
                    type="number"
                    value={profile.age || ''}
                    onChange={e => setProfile(p => ({ ...p, age: parseInt(e.target.value) || undefined }))}
                    placeholder="e.g. 24"
                    min={10}
                    max={100}
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
                  About you{' '}
                  <span className="text-slate-300">(helps personalise insights)</span>
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
            /* ── ACCOUNT TAB ── */
            <div className="space-y-3">

              {/* User info summary */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-1">
                <p className="text-sm text-slate-600">{profile.name || 'No name set'}</p>
                <p className="text-xs text-slate-400">{email}</p>
                {profile.bio && (
                  <p className="text-xs text-slate-400 pt-1 border-t border-slate-100 mt-2">
                    {profile.bio}
                  </p>
                )}
              </div>

              {/* Sign out */}
              <button
                onClick={handleLogout}
                className="w-full py-3 bg-white border border-slate-200 text-slate-500
                           hover:bg-slate-50 rounded-xl transition-colors text-sm"
              >
                Sign out
              </button>

              {/* Delete account */}
              <div className="border border-red-100 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-red-50">
                  <p className="text-xs font-medium text-red-400">Delete account</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    Permanently deletes all your journal entries, transactions, reports,
                    and profile. This cannot be undone.
                  </p>
                </div>

                <div className="p-4 space-y-3">
                  {deleteStep === 'idle' && (
                    <button
                      onClick={() => setDeleteStep('confirm')}
                      className="w-full py-2.5 border border-red-200 text-red-400 rounded-xl
                                 hover:bg-red-50 transition-colors text-sm"
                    >
                      Delete my account
                    </button>
                  )}

                  {deleteStep === 'confirm' && (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-500 text-center">
                        Are you sure? This will permanently delete:
                      </p>
                      <ul className="text-xs text-slate-400 space-y-1 pl-3">
                        <li>• All journal entries</li>
                        <li>• All transactions & receipts</li>
                        <li>• All weekly reports</li>
                        <li>• Your profile and account</li>
                      </ul>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => setDeleteStep('idle')}
                          className="py-2.5 bg-slate-50 text-slate-500 rounded-xl text-xs
                                     hover:bg-slate-100 transition-colors border border-slate-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => setDeleteStep('password')}
                          className="py-2.5 bg-red-400 text-white rounded-xl text-xs
                                     hover:bg-red-500 transition-colors"
                        >
                          Yes, continue
                        </button>
                      </div>
                    </div>
                  )}

                  {deleteStep === 'password' && (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-500 text-center">
                        Enter your password to confirm
                      </p>
                      <input
                        type="password"
                        value={deletePassword}
                        onChange={e => {
                          setDeletePassword(e.target.value)
                          setDeleteError('')
                        }}
                        placeholder="Your password"
                        autoFocus
                        className="w-full px-4 py-2.5 rounded-xl border border-red-200 text-slate-600
                                   text-sm focus:outline-none focus:border-red-300 transition-colors"
                      />
                      {deleteError && (
                        <p className="text-xs text-red-400 text-center">{deleteError}</p>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setDeleteStep('idle')
                            setDeletePassword('')
                            setDeleteError('')
                          }}
                          className="py-2.5 bg-slate-50 text-slate-500 rounded-xl text-xs
                                     hover:bg-slate-100 transition-colors border border-slate-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDeleteConfirmed}
                          disabled={deleting}
                          className="py-2.5 bg-red-500 text-white rounded-xl text-xs
                                     hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                          {deleting ? 'Deleting...' : 'Delete everything'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}