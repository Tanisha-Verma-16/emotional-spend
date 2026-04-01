'use client'
import { useState, useEffect, useRef } from 'react'

type Stage = 'intro' | 'loading-questions' | 'questions' | 'generating' | 'note'

interface Answer {
  question: string
  answer: string
}

export default function TherapyPrepFlow() {
  const [stage, setStage] = useState<Stage>('intro')
  const [questions, setQuestions] = useState<string[]>([])
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [note, setNote] = useState('')
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (stage === 'questions' && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [stage, currentQ])

  const loadQuestions = async () => {
    setStage('loading-questions')
    const res = await fetch('/api/therapy-prep/questions')
    const data = await res.json()
    setQuestions(data.questions || [])
    setStage('questions')
  }

  const handleAnswer = async () => {
    if (!currentAnswer.trim()) return

    const newAnswers = [...answers, { question: questions[currentQ], answer: currentAnswer }]
    setAnswers(newAnswers)
    setCurrentAnswer('')

    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1)
    } else {
      // All answered — generate note
      setStage('generating')
      const res = await fetch('/api/therapy-prep/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: newAnswers }),
      })
      const data = await res.json()
      setNote(data.note || '')
      setStage('note')
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(note)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html>
        <head>
          <title>Therapy Prep Note</title>
          <style>
            body { font-family: Georgia, serif; max-width: 600px; margin: 60px auto; 
                   color: #2d2d2d; line-height: 1.8; font-size: 15px; }
            pre { white-space: pre-wrap; font-family: Georgia, serif; }
          </style>
        </head>
        <body><pre>${note}</pre></body>
      </html>
    `)
    win.document.close()
    win.print()
  }

  const progress = questions.length > 0 ? ((currentQ) / questions.length) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <div className="max-w-xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-10">
          <a href="/insights" className="text-sm text-stone-400 hover:text-stone-600 transition-colors">
            ← Insights
          </a>
          <h1 className="text-2xl font-light text-stone-600 mt-3 tracking-wide">
            Therapy Prep
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            A few questions, then a note you can share with your therapist
          </p>
        </div>

        {/* INTRO */}
        {stage === 'intro' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-stone-100 p-6 shadow-sm">
              <p className="text-stone-500 leading-relaxed text-sm">
                I'll ask you 4 short questions. Your answers, combined with your 
                journal entries and spending patterns, will become a therapy prep note 
                you can screenshot, copy, or print to share with your therapist.
              </p>
              <p className="text-stone-400 text-xs mt-3">
                Takes about 2–3 minutes. Be as honest as you'd like.
              </p>
            </div>
            <button
              onClick={loadQuestions}
              className="w-full py-4 bg-rose-400 hover:bg-rose-500 text-white rounded-2xl 
                         transition-all font-light tracking-wider text-sm shadow-sm
                         hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
            >
              Begin →
            </button>
          </div>
        )}

        {/* LOADING QUESTIONS */}
        {stage === 'loading-questions' && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-8 h-8 border-2 border-rose-200 border-t-rose-400 rounded-full animate-spin" />
            <p className="text-stone-400 text-sm">Reading your patterns...</p>
          </div>
        )}

        {/* QUESTIONS */}
        {stage === 'questions' && questions.length > 0 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-stone-400">
                <span>Question {currentQ + 1} of {questions.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-300 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Previous answers (collapsed) */}
            {answers.length > 0 && (
              <div className="space-y-2">
                {answers.map((a, i) => (
                  <div key={i} className="bg-white/40 rounded-xl p-3 border border-stone-100">
                    <p className="text-xs text-stone-400 mb-1">{a.question}</p>
                    <p className="text-sm text-stone-500 leading-relaxed">{a.answer}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Current question */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-stone-100 p-6 shadow-sm">
              <p className="text-stone-600 leading-relaxed mb-4 font-light">
                {questions[currentQ]}
              </p>
              <textarea
                ref={textareaRef}
                value={currentAnswer}
                onChange={e => setCurrentAnswer(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAnswer()
                }}
                placeholder="Take your time..."
                rows={4}
                className="w-full resize-none text-stone-600 placeholder-stone-300 text-sm 
                           leading-relaxed focus:outline-none bg-transparent"
              />
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-100">
                <span className="text-xs text-stone-300">⌘↵ to continue</span>
                <button
                  onClick={handleAnswer}
                  disabled={!currentAnswer.trim()}
                  className="px-5 py-2 bg-rose-400 hover:bg-rose-500 text-white text-sm 
                             rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {currentQ < questions.length - 1 ? 'Next →' : 'Generate note →'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* GENERATING */}
        {stage === 'generating' && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-8 h-8 border-2 border-rose-200 border-t-rose-400 rounded-full animate-spin" />
            <p className="text-stone-400 text-sm">Writing your therapy prep note...</p>
            <p className="text-stone-300 text-xs">Combining your reflections with your patterns</p>
          </div>
        )}

        {/* NOTE */}
        {stage === 'note' && (
          <div className="space-y-4 animate-in fade-in duration-500">
            {/* Action buttons */}
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCopy}
                className="text-xs px-4 py-2 bg-white border border-stone-200 text-stone-500 
                           rounded-xl hover:border-stone-300 transition-colors"
              >
                {copied ? '✓ Copied' : 'Copy text'}
              </button>
              <button
                onClick={handlePrint}
                className="text-xs px-4 py-2 bg-white border border-stone-200 text-stone-500 
                           rounded-xl hover:border-stone-300 transition-colors"
              >
                Print / Save PDF
              </button>
              <button
                onClick={() => {
                  setStage('intro')
                  setAnswers([])
                  setCurrentQ(0)
                  setCurrentAnswer('')
                  setNote('')
                }}
                className="text-xs px-4 py-2 bg-rose-50 text-rose-400 rounded-xl 
                           hover:bg-rose-100 transition-colors"
              >
                Start over
              </button>
            </div>

            {/* The note */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-stone-100">
                <div className="w-2 h-2 rounded-full bg-rose-300" />
                <span className="text-xs text-stone-400 uppercase tracking-widest">
                  Therapy Prep Note
                </span>
              </div>
              <pre className="whitespace-pre-wrap font-serif text-stone-600 leading-relaxed text-sm">
                {note}
              </pre>
            </div>

            <p className="text-center text-xs text-stone-300 pb-4">
              Screenshot this, copy it, or print it to share with your therapist
            </p>
          </div>
        )}

      </div>
    </div>
  )
}