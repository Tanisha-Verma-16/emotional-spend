'use client'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function SignupPage() {
  const supabase = createClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const { data, error } = await supabase.auth.signUp({ email, password })
    
    if (error) {
      setError(error.message)   // show the real error
      setLoading(false)
      return
    }

    // If email confirmation is ON, user gets an email instead of logging in
    if (data.user && !data.session) {
      setMessage('Check your email for a confirmation link.')
      setLoading(false)
      return
    }

    router.push('/journal')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md">
        <h1 className="text-2xl font-light text-slate-700 mb-2">Create account</h1>
        <p className="text-slate-400 text-sm mb-6">Start understanding your patterns</p>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-500 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-blue-50 border border-blue-200 text-blue-500 text-sm rounded-xl px-4 py-3 mb-4">
            {message}
          </div>
        )}
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-600 
                       focus:outline-none focus:border-blue-300 transition-colors"
          />
          <input
            type="password"
            placeholder="password (min 6 characters)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-600 
                       focus:outline-none focus:border-blue-300 transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-400 hover:bg-blue-500 text-white rounded-xl 
                       transition-colors font-light tracking-wide disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>
        <p className="text-center text-slate-400 text-sm mt-4">
          Already have an account?{' '}
          <a href="/login" className="text-blue-400 hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  )
}