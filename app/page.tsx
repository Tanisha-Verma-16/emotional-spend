// import { redirect } from 'next/navigation'
// import { createClient } from '@/lib/supabase/server'

// export default async function Home() {
//   const supabase = createClient()
//   const { data: { user } } = await supabase.auth.getUser()
//   redirect(user ? '/journal' : '/login')
// }

'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ fontFamily: "'Instrument Sans', 'DM Sans', system-ui, sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes floatDelay { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
        @keyframes orbit { from{transform:rotate(0deg) translateX(48px) rotate(0deg)} to{transform:rotate(360deg) translateX(48px) rotate(-360deg)} }
        @keyframes draw { from{stroke-dashoffset:300} to{stroke-dashoffset:0} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes slideRight { from{width:0} to{width:60%} }

        .nav { 
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          transition: all 0.3s ease;
        }
        .nav.scrolled {
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(148,163,184,0.15);
        }

        .btn-primary {
          background: #3b82f6; color: white; border: none;
          padding: 10px 24px; border-radius: 100px; font-size: 14px;
          font-weight: 500; cursor: pointer; text-decoration: none;
          display: inline-flex; align-items: center; gap: 6px;
          transition: all 0.2s ease; font-family: inherit;
        }
        .btn-primary:hover { background: #2563eb; transform: translateY(-1px); }

        .btn-ghost {
          background: transparent; color: #475569; border: 1px solid #e2e8f0;
          padding: 10px 20px; border-radius: 100px; font-size: 14px;
          font-weight: 500; cursor: pointer; text-decoration: none;
          display: inline-flex; align-items: center; gap: 6px;
          transition: all 0.2s ease; font-family: inherit;
        }
        .btn-ghost:hover { background: #f8fafc; border-color: #cbd5e1; }

        .feature-card {
          background: white; border: 1px solid #e2e8f0;
          border-radius: 20px; padding: 28px;
          transition: all 0.3s ease; cursor: default;
        }
        .feature-card:hover {
          border-color: #93c5fd; transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(59,130,246,0.1);
        }
        .feature-card:hover .card-icon { transform: scale(1.1) rotate(-5deg); }

        .card-icon { transition: transform 0.3s ease; display: inline-block; }

        .step-card {
          background: white; border: 1px solid #e2e8f0;
          border-radius: 16px; padding: 24px;
          transition: all 0.3s ease;
        }
        .step-card:hover { border-color: #a5b4fc; background: #fafbff; }

        .hero-pill {
          display: inline-flex; align-items: center; gap: 8px;
          background: #eff6ff; border: 1px solid #bfdbfe;
          border-radius: 100px; padding: 6px 14px; font-size: 13px;
          color: #1d4ed8; margin-bottom: 24px;
        }
        .pill-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #3b82f6;
          animation: blink 2s ease-in-out infinite;
        }

        .gradient-text {
          background: linear-gradient(135deg, #1e40af, #6366f1, #8b5cf6);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .section-fade { animation: fadeUp 0.7s ease both; }

        .floating-card {
          background: white; border: 1px solid #e2e8f0;
          border-radius: 16px; padding: 16px;
          position: absolute; animation: float 4s ease-in-out infinite;
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
        }

        .tag {
          display: inline-block; padding: 4px 10px; border-radius: 100px;
          font-size: 12px; font-weight: 500;
        }

        .connector-line {
          stroke-dasharray: 300;
          animation: draw 1.5s ease forwards;
        }

        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .floating-card { display: none; }
        }
      `}</style>

      {/* NAV */}
      <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="14" fill="#eff6ff"/>
              <path d="M8 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="14" cy="17" r="3" fill="#3b82f6"/>
              <path d="M11 20h6" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span style={{ fontWeight: 600, fontSize: 16, color: '#0f172a', letterSpacing: '-0.01em' }}>Mira</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <div style={{ display: 'flex', gap: 28 }}>
              {['How it works', 'Features', 'Who it helps'].map(item => (
                <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                  style={{ fontSize: 14, color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#0f172a')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
                >{item}</a>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Link href="/login" className="btn-ghost">Sign in</Link>
              <Link href="/signup" className="btn-primary">
                Get started
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #f0f7ff 0%, #f8faff 40%, #fdf4ff 100%)', display: 'flex', alignItems: 'center', paddingTop: 80 }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '80px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }} className="hero-grid">

          {/* Left */}
          <div style={{ animation: 'fadeUp 0.8s ease both' }}>
            <div className="hero-pill">
              <span className="pill-dot" />
              Behaviour reflection · not therapy
            </div>

            <h1 style={{ fontSize: 52, fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.03em', color: '#0f172a', marginBottom: 20 }}>
              Your emotions and your{' '}
              <span className="gradient-text">spending are connected</span>
            </h1>

            <p style={{ fontSize: 18, color: '#475569', lineHeight: 1.7, marginBottom: 36, maxWidth: 480 }}>
              Mira quietly tracks how you feel and what you spend — then surfaces the patterns you never noticed. A mirror, not a judgment.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 48 }}>
              <Link href="/signup" className="btn-primary" style={{ padding: '13px 28px', fontSize: 15 }}>
                Start reflecting free
              </Link>
              <Link href="/login" className="btn-ghost" style={{ padding: '13px 28px', fontSize: 15 }}>
                Sign in
              </Link>
            </div>

            <div style={{ display: 'flex', gap: 32 }}>
              {[['100%', 'private'], ['free', 'to start'], ['2 min', 'to set up']].map(([val, label]) => (
                <div key={label}>
                  <div style={{ fontSize: 20, fontWeight: 600, color: '#0f172a' }}>{val}</div>
                  <div style={{ fontSize: 13, color: '#94a3b8' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — animated illustration */}
          {/* Right — animated illustration */}
          {/* Right — animated illustration */}
<div style={{ position: 'relative', height: 520, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

  {/* Person image — furthest back */}
  <img
    src="https://i.pinimg.com/1200x/f3/c5/a7/f3c5a772705cb80fbe152aea96cc2514.jpg"
    alt="Person journaling with laptop"
    style={{
      width: 300,
      height: 300,
      objectFit: 'contain',
      position: 'relative',
      zIndex: 1,
      animation: 'float 5.5s ease-in-out infinite',
    }}
  />

  {/* Blobs — above image, below cards */}
  <div style={{ position: 'absolute', width: 110, height: 110, borderRadius: '50%', background: '#ede9fe', top: 40, left: '42%', zIndex: 2, animation: 'pulse 4s ease infinite' }} />
  <div style={{ position: 'absolute', width: 70, height: 70, borderRadius: '50%', background: '#dbeafe', bottom: 40, right: '36%', zIndex: 2, animation: 'pulse 5s ease 1.5s infinite' }} />
  <div style={{ position: 'absolute', width: 50, height: 50, borderRadius: '50%', background: '#fce7f3', bottom: 80, left: '28%', zIndex: 2, animation: 'pulse 6s ease 0.8s infinite' }} />

  {/* Card 1 — Journal entry, top left */}
  <div className="floating-card" style={{ top: 24, left: 0, width: 196, zIndex: 10, animationDelay: '0s', animationDuration: '4s' }}>
    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 7 }}>Today, 2:34 PM</div>
    <div style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.45, marginBottom: 10 }}>
      "Feeling overwhelmed after back-to-back meetings..."
    </div>
    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
      <span className="tag" style={{ background: '#fef3c7', color: '#92400e' }}>stress</span>
      <span className="tag" style={{ background: '#fee2e2', color: '#991b1b' }}>overwhelmed</span>
    </div>
  </div>

  {/* Card 2 — Spending, top right */}
  <div className="floating-card" style={{ top: 16, right: 0, width: 176, zIndex: 10, animationDelay: '1.2s', animationDuration: '5s' }}>
    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 7 }}>Receipt detected</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
      <div style={{ width: 34, height: 34, borderRadius: 8, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="2" y="2" width="14" height="14" rx="3" fill="#fed7aa" />
          <path d="M6 9h6M6 12h4" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>Swiggy</div>
        <div style={{ fontSize: 12, color: '#64748b' }}>Food delivery</div>
      </div>
    </div>
    <div style={{ fontSize: 20, fontWeight: 600, color: '#0f172a' }}>₹680</div>
  </div>

  {/* Card 3 — Pattern, bottom left */}
  <div className="floating-card" style={{ bottom: 36, left: 4, width: 212, zIndex: 10, animationDelay: '2s', animationDuration: '6s' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#7c3aed', display: 'inline-block', animation: 'blink 2s ease-in-out infinite', flexShrink: 0 }} />
      <span style={{ fontSize: 11, color: '#7c3aed', fontWeight: 500 }}>Pattern detected</span>
    </div>
    <div style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.45 }}>
      High stress entries often precede food delivery orders within 6h
    </div>
    <div style={{ background: '#ede9fe', borderRadius: 4, height: 4, marginTop: 9 }}>
      <div style={{ width: '75%', height: '100%', background: '#7c3aed', borderRadius: 4 }} />
    </div>
    <div style={{ fontSize: 11, color: '#7c3aed', marginTop: 5 }}>75% correlation</div>
  </div>

  {/* Card 4 — Therapy prep, bottom right */}
  <div className="floating-card" style={{ bottom: 24, right: 2, width: 172, zIndex: 10, animationDelay: '0.8s', animationDuration: '4.5s' }}>
    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 7 }}>Therapy prep ✓</div>
    <div style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.45 }}>
      "3 stress triggers this week, 2 emotional purchases"
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="6" fill="#d1fae5" />
        <path d="M4 7l2 2 4-4" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ fontSize: 11, color: '#059669' }}>Ready to share</span>
    </div>
  </div>

</div>
        </div>
      </section>

      {/* PROBLEM */}
      <section style={{ background: 'white', padding: '100px 24px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span className="tag" style={{ background: '#fef2f2', color: '#991b1b', marginBottom: 16, display: 'inline-block' }}>The problem</span>
            <h2 style={{ fontSize: 40, fontWeight: 600, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 16 }}>
              You track your spending.<br/>But not why you spent it.
            </h2>
            <p style={{ fontSize: 17, color: '#64748b', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
              Most finance apps show you numbers. None of them tell you that you ordered food delivery every time you had a hard week at work.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }} className="steps-grid">
            {[
              {
                icon: (
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <rect width="40" height="40" rx="12" fill="#fef2f2"/>
                    <path d="M20 12v8l4 4" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="20" cy="20" r="10" stroke="#ef4444" strokeWidth="1.5"/>
                  </svg>
                ),
                title: 'Emotions go untracked',
                desc: 'Stress, loneliness, excitement — the feelings that drive decisions disappear the moment they pass.'
              },
              {
                icon: (
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <rect width="40" height="40" rx="12" fill="#fff7ed"/>
                    <rect x="12" y="16" width="16" height="12" rx="2" fill="none" stroke="#f97316" strokeWidth="1.5"/>
                    <path d="M16 16v-2a4 4 0 018 0v2" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="20" cy="22" r="1.5" fill="#f97316"/>
                  </svg>
                ),
                title: 'Spending has no context',
                desc: '₹800 on food delivery looks the same whether you were celebrating or coping. The why is invisible.'
              },
              {
                icon: (
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <rect width="40" height="40" rx="12" fill="#fdf4ff"/>
                    <path d="M14 26l4-8 4 4 3-6" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="26" cy="16" r="2" fill="#a855f7"/>
                  </svg>
                ),
                title: 'Patterns stay hidden',
                desc: 'The connection between how you feel Monday and what you buy Thursday never gets surfaced — until now.'
              }
            ].map(item => (
              <div key={item.title} className="step-card">
                <div style={{ marginBottom: 16 }}>{item.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 500, color: '#0f172a', marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ background: '#f8faff', padding: '100px 24px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span className="tag" style={{ background: '#eff6ff', color: '#1d4ed8', marginBottom: 16, display: 'inline-block' }}>How it works</span>
            <h2 style={{ fontSize: 40, fontWeight: 600, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Three inputs. One clear picture.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 0, position: 'relative' }} className="features-grid">
            {/* Connector lines */}
            <div style={{ position: 'absolute', top: 56, left: '25%', right: '25%', height: 2, background: 'linear-gradient(90deg, #bfdbfe, #c4b5fd)', borderRadius: 2, zIndex: 0 }} />

            {[
              {
                step: '01',
                color: '#3b82f6',
                bg: '#eff6ff',
                title: 'Journal freely',
                desc: 'Type how you feel in plain language — no forms, no checkboxes. Just a quick message to yourself.',
                icon: (
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <rect x="6" y="4" width="20" height="24" rx="4" fill="#bfdbfe"/>
                    <line x1="10" y1="11" x2="22" y2="11" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="10" y1="16" x2="20" y2="16" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="10" y1="21" x2="16" y2="21" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                )
              },
              {
                step: '02',
                color: '#8b5cf6',
                bg: '#f5f3ff',
                title: 'AI reads emotions',
                desc: 'Mistral AI extracts sentiment, intensity, and triggers from your words — automatically, every time.',
                icon: (
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="12" fill="#ddd6fe"/>
                    <circle cx="11" cy="13" r="2" fill="#7c3aed"/>
                    <circle cx="21" cy="13" r="2" fill="#7c3aed"/>
                    <path d="M11 20 Q16 24 21 20" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                    <circle cx="16" cy="4" r="2" fill="#c4b5fd" style={{ animation: 'pulse 2s ease infinite' }}/>
                  </svg>
                )
              },
              {
                step: '03',
                color: '#10b981',
                bg: '#f0fdf4',
                title: 'Gmail syncs receipts',
                desc: 'Connect your inbox once. Mira finds purchase emails automatically — Swiggy, Amazon, Uber and more.',
                icon: (
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <rect x="4" y="6" width="24" height="20" rx="4" fill="#bbf7d0"/>
                    <path d="M4 10l12 9 12-9" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                )
              },
              {
                step: '04',
                color: '#f59e0b',
                bg: '#fffbeb',
                title: 'Patterns surface',
                desc: 'Weekly reflections and therapy prep notes connect the dots between how you felt and what you spent.',
                icon: (
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <rect x="4" y="4" width="24" height="24" rx="6" fill="#fde68a"/>
                    <path d="M9 20l5-8 5 5 4-7" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="23" cy="10" r="2.5" fill="#f59e0b"/>
                  </svg>
                )
              }
            ].map((item, i) => (
              <div key={item.step} style={{ padding: '0 16px', position: 'relative', zIndex: 1 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, border: `1px solid ${item.color}22` }}>
                  {item.icon}
                </div>
                <div style={{ fontSize: 12, color: item.color, fontWeight: 500, marginBottom: 8, letterSpacing: '0.05em' }}>STEP {item.step}</div>
                <h3 style={{ fontSize: 16, fontWeight: 500, color: '#0f172a', marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ background: 'white', padding: '100px 24px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span className="tag" style={{ background: '#f0fdf4', color: '#166534', marginBottom: 16, display: 'inline-block' }}>Features</span>
            <h2 style={{ fontSize: 40, fontWeight: 600, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Everything in one quiet space
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }} className="features-grid">
            {[
              {
                emoji: '📓',
                color: '#eff6ff',
                accent: '#3b82f6',
                title: 'Micro-journaling',
                desc: 'A chat-style interface that feels like texting yourself. No lengthy forms. Just type and go.',
                tags: ['Sentiment analysis', 'Emotion labels', 'Trigger detection']
              },
              {
                emoji: '📧',
                color: '#f5f3ff',
                accent: '#7c3aed',
                title: 'Gmail receipt scanner',
                desc: 'Connects to your inbox and automatically extracts purchase data from Swiggy, Amazon, Uber, Flipkart and more.',
                tags: ['Auto-detection', 'Amount extraction', 'Category tagging']
              },
              {
                emoji: '🔗',
                color: '#fff7ed',
                accent: '#ea580c',
                title: 'Correlation engine',
                desc: 'Finds temporal patterns — stress on Monday, impulsive purchase Wednesday — with a heuristic scoring model.',
                tags: ['Time proximity', 'Sentiment threshold', 'Spending spikes']
              },
              {
                emoji: '📊',
                color: '#f0fdf4',
                accent: '#16a34a',
                title: 'Weekly AI reflections',
                desc: 'A compassionate weekly summary written by Mistral AI — warm, non-judgmental, always personalised to your data.',
                tags: ['Trigger highlights', 'Mood summary', 'Spending context']
              },
              {
                emoji: '🧘',
                color: '#fdf4ff',
                accent: '#9333ea',
                title: 'Therapy prep notes',
                desc: 'Answer 4 guided questions, get a structured note you can screenshot or print to share with your therapist.',
                tags: ['Guided Q&A', 'Shareable note', 'Print / copy']
              },
              {
                emoji: '👤',
                color: '#fefce8',
                accent: '#ca8a04',
                title: 'Profile context',
                desc: 'Your name, age, bio feeds into every AI response — insights and reflections that actually know who you are.',
                tags: ['Personalised AI', 'Avatar upload', 'Private & secure']
              }
            ].map(item => (
              <div key={item.title} className="feature-card">
                <div className="card-icon" style={{ fontSize: 28, display: 'block', marginBottom: 16 }}>{item.emoji}</div>
                <h3 style={{ fontSize: 16, fontWeight: 500, color: '#0f172a', marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 14 }}>{item.desc}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {item.tags.map(tag => (
                    <span key={tag} className="tag" style={{ background: item.color, color: item.accent, border: `1px solid ${item.accent}22` }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO IT HELPS */}
      <section id="who-it-helps" style={{ background: 'linear-gradient(160deg, #f8faff 0%, #fdf4ff 100%)', padding: '100px 24px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }} className="hero-grid">
          <div>
            <span className="tag" style={{ background: '#ede9fe', color: '#6d28d9', marginBottom: 20, display: 'inline-block' }}>Who it helps</span>
            <h2 style={{ fontSize: 40, fontWeight: 600, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 20 }}>
              For anyone who wants to understand themselves better
            </h2>
            <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.7, marginBottom: 32 }}>
              Mira is not a therapy app. It is a behaviour reflection tool — a private space to notice patterns and prepare for the conversations that matter.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { who: 'Students & young professionals', what: 'Understand how academic and work stress affects spending habits' },
                { who: 'People in therapy', what: 'Arrive prepared with data about your emotional week and what triggered purchases' },
                { who: 'Mindful spenders', what: 'Go beyond budgeting apps — know the emotions behind every transaction' },
                { who: 'Curious self-trackers', what: 'Build a private log of your emotional and financial life over time' }
              ].map(item => (
                <div key={item.who} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#0f172a', marginBottom: 2 }}>{item.who}</div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>{item.what}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Animated mock weekly report card */}
          <div style={{ position: 'relative' }}>
            <div style={{ background: 'white', borderRadius: 24, border: '1px solid #e2e8f0', padding: 32, boxShadow: '0 20px 60px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#a78bfa' }} />
                <span style={{ fontSize: 11, color: '#7c3aed', fontWeight: 500, letterSpacing: '0.08em' }}>WEEKLY REFLECTION · APRIL 1</span>
              </div>

              {[
                { label: 'Mood this week', value: 'Mixed — tired but curious', color: '#f59e0b' },
                { label: 'Top trigger', value: 'Work deadlines', color: '#ef4444' },
                { label: 'Total spending', value: '₹2,840', color: '#10b981' },
                { label: 'Pattern detected', value: 'Stress → food delivery (3x)', color: '#8b5cf6' }
              ].map((row, i) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 14, marginBottom: 14, borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none' }}>
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: row.color }}>{row.value}</span>
                </div>
              ))}

              <div style={{ marginTop: 8, background: '#fdf4ff', borderRadius: 12, padding: 16 }}>
                <p style={{ fontSize: 13, color: '#6d28d9', lineHeight: 1.6, fontStyle: 'italic' }}>
                  "What would it feel like to pause before ordering next time you feel this kind of tired?"
                </p>
              </div>

              <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
                <div style={{ flex: 1, background: '#f8fafc', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>Therapy prep</div>
                  <div style={{ fontSize: 13, color: '#10b981', fontWeight: 500 }}>Ready ✓</div>
                </div>
                <div style={{ flex: 1, background: '#f8fafc', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>Journal entries</div>
                  <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 500 }}>7 this week</div>
                </div>
              </div>
            </div>

            {/* Decorative blob */}
            <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: '#ede9fe', opacity: 0.5, zIndex: -1, animation: 'pulse 3s ease infinite' }} />
            <div style={{ position: 'absolute', bottom: -10, left: -10, width: 50, height: 50, borderRadius: '50%', background: '#dbeafe', opacity: 0.6, zIndex: -1, animation: 'pulse 4s ease infinite 1s' }} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#0f172a', padding: '100px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid rgba(59,130,246,0.3)' }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path d="M13 3C7.5 3 3 7.5 3 13s4.5 10 10 10 10-4.5 10-10S18.5 3 13 3z" stroke="#60a5fa" strokeWidth="1.5"/>
              <path d="M13 8v5l3 3" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>

          <h2 style={{ fontSize: 40, fontWeight: 600, color: 'white', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 16 }}>
            Start understanding your patterns today
          </h2>
          <p style={{ fontSize: 16, color: '#94a3b8', lineHeight: 1.7, marginBottom: 40 }}>
            Free to start. No credit card. Your data never leaves your account.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" className="btn-primary" style={{ padding: '14px 32px', fontSize: 15, background: '#3b82f6' }}>
              Create free account
            </Link>
            <Link href="/login" style={{ padding: '14px 28px', fontSize: 15, color: '#94a3b8', border: '1px solid #334155', borderRadius: 100, textDecoration: 'none', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#64748b' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#334155' }}
            >
              Sign in to your account
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0a0f1e', padding: '24px', textAlign: 'center', borderTop: '1px solid #1e293b' }}>
        <p style={{ fontSize: 13, color: '#475569' }}>
          Mira · Built with care · Not a therapy app · Your data stays private
        </p>
      </footer>
    </div>
  )
}