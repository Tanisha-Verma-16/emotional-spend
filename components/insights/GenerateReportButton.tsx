'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GenerateReportButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleGenerate = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/report/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weeksAgo: 0 }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to generate')
        setLoading(false)
        return
      }

      // Refresh the page to show the new report
      router.refresh()
    } catch (e) {
      setError('Something went wrong')
    }

    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-red-400">{error}</span>}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-500 rounded-full 
                   hover:bg-indigo-100 transition-colors disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'Generate →'}
      </button>
    </div>
  )
}