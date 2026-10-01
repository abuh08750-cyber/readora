'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import NotificationDropdown from '@/components/NotificationDropdown'

const SUPABASE_URL = 'https://stuabcdisgmmxprapfai.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0dWFiY2Rpc2dtbXhwcmFwZmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1Njc1NjksImV4cCI6MjEwNjE0MzU2OX0.pGvaQQBWGcbDKgDb_9F1jkUURVXH3bhJ-trQt-GXBZ8'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

const categories = [
  { name: 'Music', icon: '🎵' },
  { name: 'Self Help', icon: '👤' },
  { name: 'Business', icon: '💼' },
  { name: 'Technology', icon: '💻' },
  { name: 'Education', icon: '🎓' },
  { name: 'Fiction', icon: '📖' },
  { name: 'Health', icon: '❤️' },
  { name: 'Writing', icon: '✏️' },
]

function hexToRgb(hex: string) {
  let c = (hex || '#6366f1').replace('#', '')
  if (c.length === 3) c = c.split('').map(x => x + x).join('')
  const num = parseInt(c, 16) || 0
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

export default function HomePage() {
  const [books, setBooks] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [readingFile, setReadingFile] = useState<string | null>(null)
  const [readingTitle, setReadingTitle] = useState('')
  const [htmlData, setHtmlData] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [loading, setLoading] = useState(true)
  const [headerAvatar, setHeaderAvatar] = useState<string | null>(null)

  // Dynamic Theme
  const [themeMode, setThemeMode] = useState<'Dark' | 'Light' | 'Sepia' | 'Custom'>('Dark')
  const [customColor, setCustomColor] = useState('#6366f1')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(session.user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        setShowAuthModal(false)
      } else {
        setUser(null)
      }
    })

    try {
      const savedImg = localStorage.getItem('readora_profile_avatar')
      if (savedImg) setHeaderAvatar(savedImg)

      const savedTheme = localStorage.getItem('readora_app_theme') as any
      if (savedTheme) setThemeMode(savedTheme)
      const savedColor = localStorage.getItem('readora_custom_color')
      if (savedColor) setCustomColor(savedColor)
    } catch {}

    async function loadBooks() {
      try {
        const { data, error } = await supabase.from('books').select('*')
        if (!error && data && data.length > 0) {
          setBooks(data)
        } else {
          setBooks([
            {
              id: 'default-1',
              title: 'ZERO SE ARTIST - Part 1',
              author: 'Readora',
              category: 'Music',
              cover_path: 'https://stuabcdisgmmxprapfai.supabase.co/storage/v1/object/public/covers/1790700033242-teliy6.jpg',
              file_path: 'https://stuabcdisgmmxprapfai.supabase.co/storage/v1/object/public/ebooks/1790700034105-biegrb.html',
            }
          ])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadBooks()

    return () => subscription.unsubscribe()
  }, [])

  const styles = (() => {
    if (themeMode === 'Light') {
      return {
        bg: '#f8fafc',
        header: '#ffffff',
        card: '#ffffff',
        inner: '#f1f5f9',
        text: '#0f172a',
        muted: '#64748b',
        border: 'rgba(0,0,0,0.1)',
        nav: '#2563eb',
        accent: '#2563eb',
      }
    }
    if (themeMode === 'Sepia') {
      return {
        bg: '#fbf0d9',
        header: '#f7e8c8',
        card: '#fdf6e2',
        inner: '#faebd0',
        text: '#5c3d10',
        muted: '#8c6b39',
        border: 'rgba(92,61,16,0.15)',
        nav: '#b45309',
        accent: '#b45309',
      }
    }
    if (themeMode === 'Custom') {
      const { r, g, b } = hexToRgb(customColor)
      return {
        bg: `radial-gradient(ellipse at top, rgba(${r}, ${g}, ${b}, 0.28) 0%, #06080f 85%)`,
        header: `rgba(${Math.floor(r * 0.06)}, ${Math.floor(g * 0.06)}, ${Math.floor(b * 0.06)}, 0.95)`,
        card: `rgba(${Math.floor(r * 0.15 + 10)}, ${Math.floor(g * 0.15 + 14)}, ${Math.floor(b * 0.15 + 24)}, 0.85)`,
        inner: `rgba(${Math.floor(r * 0.08)}, ${Math.floor(g * 0.08)}, ${Math.floor(b * 0.08)}, 0.9)`,
        text: '#f8fafc',
        muted: `rgba(${Math.min(r + 60, 240)}, ${Math.min(g + 60, 240)}, ${Math.min(b + 60, 240)}, 0.85)`,
        border: `rgba(${r}, ${g}, ${b}, 0.35)`,
        nav: customColor,
        accent: customColor,
      }
    }
    return {
      bg: '#040711',
      header: '#040711',
      card: '#0a0f1d',
      inner: '#070b14',
      text: '#f8fafc',
      muted: '#94a3b8',
      border: 'rgba(255,255,255,0.06)',
      nav: '#2563eb',
      accent: '#38bdf8',
    }
  })()

  const handleOAuth = async (provider: 'google' | 'facebook') => {
    setAuthError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    })
    if (error) setAuthError(error.message)
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setAuthError(error.message)
      else setAuthError('Confirmation email bhej diya gaya hai!')
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setAuthError(error.message)
      else if (data?.user) {
        setUser(data.user)
        setShowAuthModal(false)
      }
    }
  }

  const handleRead = async (book: any) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    const rawFile = book.file_path || book.file_url || 'https://stuabcdisgmmxprapfai.supabase.co/storage/v1/object/public/ebooks/1790700034105-biegrb.html'
    const fullUrl = rawFile.startsWith('http')
      ? rawFile
      : `https://stuabcdisgmmxprapfai.supabase.co/storage/v1/object/public/ebooks/${rawFile}`

    setReadingTitle(book.title || 'Book Reader')

    if (fullUrl.includes('.html')) {
      try {
        const res = await fetch(fullUrl)
        const text = await res.text()
        setHtmlData(text)
        setReadingFile(fullUrl)
      } catch {
        window.open(fullUrl, '_blank')
      }
    } else {
      window.open(fullUrl, '_blank')
    }
  }

  const filtered = books.filter(b =>
    b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.author?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const avatarChar = user?.email ? user.email.charAt(0).toUpperCase() : 'W'

  if (readingFile && htmlData) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#0B0F17', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: '#090d16', borderBottom: '1px solid #1e293b' }}>
          <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '15px' }}>📖 {readingTitle}</div>
          <button onClick={() => setReadingFile(null)} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            ✕ Close
          </button>
        </header>
        <iframe srcDoc={htmlData} style={{ width: '100%', flex: 1, border: 'none' }} title={readingTitle} />
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: styles.bg, color: styles.text, minHeight: '100vh', width: '100%', overflowX: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif', transition: 'all 0.25s ease' }}>
      
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: `1px solid ${styles.border}`, background: styles.header, position: 'sticky', top: 0, zIndex: 50, transition: 'all 0.25s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', fontWeight: '800', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span>📖</span>
            <span>Readora</span>
          </div>
          <nav style={{ display: 'flex', gap: '20px', fontSize: '14px', fontWeight: '500' }}>
            <span style={{ color: styles.text, borderBottom: `2px solid ${styles.nav}`, paddingBottom: '4px', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</span>
            <span style={{ color: styles.muted, cursor: 'pointer' }} onClick={() => window.location.href = '/library'}>Library</span>
            <span style={{ color: styles.muted, cursor: 'pointer' }} onClick={() => document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' })}>Categories</span>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user ? (
            <>
              <NotificationDropdown />
              <button
                type="button"
                onClick={() => window.location.href = '/settings'}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: styles.nav,
                  color: '#ffffff',
                  border: `2px solid ${styles.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '13px',
                  cursor: 'pointer',
                  outline: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  backgroundImage: headerAvatar ? `url(${headerAvatar})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
                title="Profile & Settings"
              >
                {!headerAvatar && avatarChar}
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowAuthModal(true)} style={{ background: 'transparent', color: styles.text, border: `1px solid ${styles.border}`, padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                Sign In
              </button>
              <button onClick={() => setShowAuthModal(true)} style={{ background: styles.nav, color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                Get Started
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      <section style={{
        position: 'relative',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        background: "linear-gradient(to right, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0.2) 100%), url('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1600&auto=format&fit=crop&q=80')",
        backgroundSize: 'cover',
        backgroundPosition: 'right 30%',
        padding: '40px 32px',
        borderBottom: `1px solid ${styles.border}`
      }}>
        <div style={{ maxWidth: '540px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '900', lineHeight: 1.1, margin: '0 0 14px', letterSpacing: '-1px', color: '#fff' }}>
            Read More, <br />
            <span style={{ color: styles.accent, fontStyle: 'italic', fontFamily: 'serif' }}>Grow Further</span>
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.5, margin: '0 0 24px' }}>
            Discover amazing books, explore new ideas, and build a better you — one page at a time.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', borderRadius: '40px', padding: '4px 6px 4px 16px', maxWidth: '420px' }}>
            <span style={{ color: '#94a3b8', marginRight: '6px' }}>🔍</span>
            <input
              type="text"
              placeholder="Search books, authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', flex: 1, fontSize: '13px', color: '#1e293b' }}
            />
            <button style={{ background: styles.nav, border: 'none', width: '34px', height: '34px', borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '13px' }}>
              ➔
            </button>
          </div>

          <div style={{ display: 'flex', gap: '22px', marginTop: '22px', fontSize: '12px', color: '#cbd5e1', fontWeight: '500' }}>
            <span>📖 Free to Read</span>
            <span>⚡ Easy Access</span>
            <span>🛡️ Safe & Secure</span>
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section style={{ padding: '36px 32px 20px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 4px', color: styles.text }}>Featured Books</h2>
            <p style={{ color: styles.muted, fontSize: '12px', margin: 0 }}>Handpicked books just for you</p>
          </div>
          <span style={{ color: styles.accent, fontSize: '12px', fontWeight: '600', cursor: 'pointer' }} onClick={() => window.location.href = '/library'}>View All ➔</span>
        </div>

        {loading ? (
          <p style={{ color: styles.muted, fontSize: '13px' }}>Books load ho rahi hain...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '20px' }}>
            {filtered.map((book) => {
              const rawCover = book.cover_path || book.cover_url
              const cover = rawCover && rawCover.startsWith('http')
                ? rawCover
                : `https://stuabcdisgmmxprapfai.supabase.co/storage/v1/object/public/covers/${rawCover || '1790700033242-teliy6.jpg'}`

              return (
                <div key={book.id || book.title} style={{ background: styles.card, borderRadius: '16px', padding: '12px', border: `1px solid ${styles.border}`, display: 'flex', flexDirection: 'column' }}>
                  <div style={{
                    height: '230px',
                    borderRadius: '10px',
                    backgroundColor: '#151d30',
                    backgroundImage: `url(${cover})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    marginBottom: '12px'
                  }}></div>

                  <h4 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: styles.text }}>
                    {book.title}
                  </h4>
                  <p style={{ fontSize: '12px', color: styles.muted, margin: '0 0 10px' }}>
                    {book.author || 'Readora'}
                  </p>

                  <div style={{ marginTop: 'auto' }}>
                    <span style={{ display: 'inline-block', background: 'rgba(56,189,248,0.12)', color: styles.accent, fontSize: '10px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '6px', marginBottom: '8px' }}>
                      {book.category || 'Music'}
                    </span>
                    <button
                      onClick={() => handleRead(book)}
                      style={{ width: '100%', background: styles.nav, color: '#fff', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                    >
                      📖 Read Book
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Categories */}
      <section id="categories-section" style={{ padding: '20px 32px 60px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 4px', color: styles.text }}>Browse by Category</h2>
            <p style={{ color: styles.muted, fontSize: '12px', margin: 0 }}>Find books in your favorite category</p>
          </div>
          <span style={{ color: styles.accent, fontSize: '12px', fontWeight: '600', cursor: 'pointer' }} onClick={() => window.location.href = '/library'}>View All ➔</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
          {categories.map((cat) => (
            <div key={cat.name} onClick={() => window.location.href = '/library'} style={{ background: styles.card, border: `1px solid ${styles.border}`, borderRadius: '12px', padding: '14px 10px', textAlign: 'center', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '12px', fontWeight: '600', color: styles.text }}>
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Auth Modal */}
      {showAuthModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '24px', padding: '30px 24px', width: '100%', maxWidth: '350px', textAlign: 'center', position: 'relative', color: '#0f172a' }}>
            <button onClick={() => setShowAuthModal(false)} style={{ position: 'absolute', top: '14px', right: '16px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
            <div style={{ fontSize: '22px', marginBottom: '6px' }}>📖 Readora</div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 4px' }}>{isSignUp ? 'Create an Account' : 'Welcome Back!'}</h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 18px' }}>Sign in to read this book and access your library.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={() => handleOAuth('google')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                Continue with Google
              </button>
              <button onClick={() => handleOAuth('facebook')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '10px', border: 'none', background: '#1877F2', color: '#fff', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                Continue with Facebook
              </button>
              <button onClick={() => setShowEmailForm(!showEmailForm)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                Continue with Email
              </button>
            </div>

            {showEmailForm && (
              <form onSubmit={handleEmailAuth} style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }} />
                <input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }} />
                <button type="submit" style={{ padding: '9px', borderRadius: '8px', border: 'none', background: '#0f172a', color: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '12px' }}>
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </button>
              </form>
            )}

            {authError && <p style={{ fontSize: '11px', color: '#ef4444', marginTop: '8px' }}>{authError}</p>}

            <p style={{ fontSize: '12px', color: '#64748b', margin: '18px 0 0' }}>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <span onClick={() => { setIsSignUp(!isSignUp); setShowEmailForm(true); }} style={{ color: '#2563eb', fontWeight: '600', cursor: 'pointer' }}>
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
              }
