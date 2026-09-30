'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://stuabcdisgmmxprapfai.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0dWFiY2Rpc2dtbXhwcmFwZmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1Njc1NjksImV4cCI6MjEwNjE0MzU2OX0.pGvaQQBWGcbDKgDb_9F1jkUURVXH3bhJ-trQt-GXBZ8'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Categories matching reference design
const categoriesList = [
  { name: 'Music', icon: '🎵', color: '#818cf8' },
  { name: 'Self Help', icon: '👤', color: '#34d399' },
  { name: 'Business', icon: '💼', color: '#fb923c' },
  { name: 'Technology', icon: '💻', color: '#c084fc' },
  { name: 'Education', icon: '🎓', color: '#38bdf8' },
  { name: 'Fiction', icon: '📖', color: '#f472b6' },
  { name: 'Health', icon: '❤️', color: '#f87171' },
  { name: 'Writing', icon: '✏️', color: '#2dd4bf' },
]

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

    async function fetchDatabaseBooks() {
      try {
        const { data, error } = await supabase.from('books').select('*')
        if (!error && data && data.length > 0) {
          setBooks(data)
        } else {
          setBooks([
            {
              id: 'dfb9528e-8466-4c5f-aeab-0329ae420bf1',
              title: 'ZERO SE ARTIST - Part 1',
              author: 'Readora',
              category: 'Music',
              cover_path: 'https://stuabcdisgmmxprapfai.supabase.co/storage/v1/object/public/covers/1790700033242-teliy6.jpg',
              file_path: 'https://stuabcdisgmmxprapfai.supabase.co/storage/v1/object/public/ebooks/1790700034105-biegrb.html',
            }
          ])
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchDatabaseBooks()

    return () => subscription.unsubscribe()
  }, [])

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
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
      else setAuthError('Confirmation link email par bhej diya gaya hai!')
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setAuthError(error.message)
      else if (data?.user) {
        setUser(data.user)
        setShowAuthModal(false)
      }
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setReadingFile(null)
  }

  const handleReadBook = async (book: any) => {
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

  const filteredBooks = books.filter(b =>
    b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.author?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // In-App Fullscreen Reader View
  if (readingFile && htmlData) {
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: '#0B0F17', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', backgroundColor: '#090d16', borderBottom: '1px solid #1e293b' }}>
          <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '15px' }}>📖 {readingTitle}</div>
          <button onClick={() => setReadingFile(null)} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            ✕ Close Reader
          </button>
        </header>
        <iframe srcDoc={htmlData} style={{ width: '100%', flex: 1, border: 'none' }} title={readingTitle} />
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#040711', color: '#f8fafc', minHeight: '100vh', width: '100%', overflowX: 'hidden', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      
      {/* 1. Exact Navbar */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 40px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backgroundColor: '#040711',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '21px', fontWeight: '800', letterSpacing: '-0.3px', cursor: 'pointer' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <span>Readora</span>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', gap: '26px', fontSize: '14px', fontWeight: '500' }}>
            <span style={{ color: '#ffffff', cursor: 'pointer', borderBottom: '2px solid #3b82f6', paddingBottom: '6px' }}>Home</span>
            <span style={{ color: '#94a3b8', cursor: 'pointer', paddingBottom: '6px' }}>Library</span>
            <span style={{ color: '#94a3b8', cursor: 'pointer', paddingBottom: '6px' }}>Categories</span>
          </nav>
        </div>

        {/* Right Search + Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: '#0a0f1d',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '8px 14px 8px 34px',
                fontSize: '13px',
                color: '#fff',
                outline: 'none',
                width: '180px'
              }}
            />
            <span style={{ position: 'absolute', left: '11px', fontSize: '13px', color: '#64748b' }}>🔍</span>
          </div>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '13px', color: '#38bdf8', fontWeight: '600' }}>{user.email?.split('@')[0]}</span>
              <button onClick={handleLogout} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowAuthModal(true)} style={{ background: 'transparent', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.14)', padding: '7px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                Sign In
              </button>
              <button onClick={() => setShowAuthModal(true)} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '7px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                Get Started
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 2. Hero Section with Real Lamp & Books Cover */}
      <section style={{
        position: 'relative',
        minHeight: '430px',
        display: 'flex',
        alignItems: 'center',
        background: `
          linear-gradient(to right, #040711 38%, rgba(4, 7, 17, 0.75) 60%, rgba(4, 7, 17, 0.2) 100%),
          url('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1600&auto=format&fit=crop&q=80')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'right 30%',
        padding: '40px 48px',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{ maxWidth: '580px', zIndex: 10 }}>
          <h1 style={{ fontSize: '54px', fontWeight: '900', lineHeight: 1.1, margin: '0 0 16px', letterSpacing: '-1px' }}>
            Read More, <br />
            <span style={{
              color: '#38bdf8',
              fontStyle: 'italic',
              fontFamily: 'Georgia, Cambria, serif',
              fontWeight: '700'
            }}>
              Grow Further
            </span>
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: 1.6, margin: '0 0 28px', maxWidth: '440px' }}>
            Discover amazing books, explore new ideas, and build a better you — one page at a time.
          </p>

          {/* White Pill Search Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#ffffff',
            borderRadius: '40px',
            padding: '5px 6px 5px 18px',
            maxWidth: '430px',
            boxShadow: '0 12px 36px rgba(0,0,0,0.6)'
          }}>
            <span style={{ color: '#94a3b8', marginRight: '8px' }}>🔍</span>
            <input
              type="text"
              placeholder="Search for books, authors, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', flex: 1, fontSize: '13px', color: '#1e293b' }}
            />
            <button style={{
              background: '#2563eb',
              border: 'none',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              ➔
            </button>
          </div>

          {/* 3 Badges */}
          <div style={{ display: 'flex', gap: '28px', marginTop: '28px', fontSize: '12px', color: '#cbd5e1', fontWeight: '500' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>📖 Free to Read</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>⚡ Easy Access</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>🛡️ Safe & Secure</span>
          </div>
        </div>
      </section>

      {/* 3. Featured Books Grid */}
      <section style={{ padding: '42px 48px 24px', maxWidth: '1440px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '22px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 4px', letterSpacing: '-0.3px' }}>Featured Books</h2>
            <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>Handpicked books just for you</p>
          </div>
          <span style={{ color: '#38bdf8', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>View All ➔</span>
        </div>

        {loading ? (
          <p style={{ color: '#64748b', fontSize: '13px' }}>Books load ho rahi hain...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '22px' }}>
            {filteredBooks.map((book) => {
              const rawCover = book.cover_path || book.cover_url
              const cover = rawCover && rawCover.startsWith('http')
                ? rawCover
                : `https://stuabcdisgmmxprapfai.supabase.co/storage/v1/object/public/covers/${rawCover || '1790700033242-teliy6.jpg'}`

              return (
                <div key={book.id || book.title} style={{
                  background: '#0a0f1d',
                  borderRadius: '16px',
                  padding: '14px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{
                    height: '240px',
                    borderRadius: '12px',
                    backgroundColor: '#151d30',
                    backgroundImage: `url(${cover})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    marginBottom: '14px',
                    boxShadow: '0 6px 18px rgba(0,0,0,0.6)'
                  }}></div>

                  <h4 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {book.title}
                  </h4>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 10px' }}>
                    {book.author || 'Readora'}
                  </p>

                  <div style={{ marginTop: 'auto' }}>
                    <span style={{
                      display: 'inline-block',
                      background: 'rgba(56,189,248,0.12)',
                      color: '#38bdf8',
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      marginBottom: '10px'
                    }}>
                      {book.category || 'Music'}
                    </span>
                    <button
                      onClick={() => handleReadBook(book)}
                      style={{
                        width: '100%',
                        background: '#2563eb',
                        color: '#fff',
                        border: 'none',
                        padding: '9px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
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

      {/* 4. Browse by Category */}
      <section style={{ padding: '24px 48px 70px', maxWidth: '1440px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 4px', letterSpacing: '-0.3px' }}>Browse by Category</h2>
            <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>Find books in your favorite category</p>
          </div>
          <span style={{ color: '#38bdf8', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>View All ➔</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '14px' }}>
          {categoriesList.map((cat) => (
            <div key={cat.name} style={{
              background: '#0a0f1d',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
              padding: '16px 12px',
              textAlign: 'center',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'transform 0.2s',
              boxShadow: '0 4px 14px rgba(0,0,0,0.3)'
            }}>
              <span style={{ color: cat.color }}>{cat.icon}</span>
              <span>{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Auth Modal Popup */}
      {showAuthModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '24px', padding: '34px 28px', width: '100%', maxWidth: '370px', textAlign: 'center', position: 'relative', color: '#0f172a' }}>
            <button onClick={() => setShowAuthModal(false)} style={{ position: 'absolute', top: '16px', right: '18px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>✕</button>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📖 Readora</div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 6px' }}>{isSignUp ? 'Create an Account' : 'Welcome Back!'}</h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px' }}>Sign in to read this book and access your library.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={() => handleOAuthLogin('google')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '11px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                Continue with Google
              </button>
              <button onClick={() => handleOAuthLogin('facebook')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '11px', borderRadius: '12px
