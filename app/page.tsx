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

const categoriesList = [
  { name: 'Music', icon: '🎵' },
  { name: 'Self Help', icon: '👤' },
  { name: 'Business', icon: '💼' },
  { name: 'Technology', icon: '💻' },
  { name: 'Education', icon: '🎓' },
  { name: 'Fiction', icon: '📖' },
  { name: 'Health', icon: '❤️' },
  { name: 'Writing', icon: '✏️' },
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
              title: 'ZERO SE ARTIST part 1',
              author: 'TIGER SOUL',
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

  if (readingFile && htmlData) {
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: '#0B0F17', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', backgroundColor: '#090d16', borderBottom: '1px solid #1e293b' }}>
          <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px', maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            📖 {readingTitle}
          </div>
          <button onClick={() => setReadingFile(null)} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
            ✕ Close
          </button>
        </header>
        <iframe srcDoc={htmlData} style={{ width: '100%', flex: 1, border: 'none' }} title={readingTitle} />
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#060911', color: '#f8fafc', minHeight: '100vh', width: '100%', overflowX: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      
      {/* 1. Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(6,9,17,0.92)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', fontWeight: '800' }}>
          <span>📖</span>
          <span>Readora</span>
        </div>

        <div>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', color: '#38bdf8', fontWeight: '600', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email?.split('@')[0]}
              </span>
              <button onClick={handleLogout} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowAuthModal(true)} style={{ background: '#111827', color: '#fff', border: '1px solid #1f2937', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                Sign In
              </button>
              <button onClick={() => setShowAuthModal(true)} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                Get Started
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 2. Hero Section with Real Background Depth */}
      <section style={{
        position: 'relative',
        padding: '50px 20px 45px',
        backgroundImage: `linear-gradient(to right, rgba(6,9,17,0.95) 0%, rgba(6,9,17,0.8) 50%, rgba(6,9,17,0.88) 100%), url('https://images.unsplash.com/photo-1507842229451-7f01be7ff6ab?w=1600&auto=format&fit=crop&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center right',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: '580px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '42px', fontWeight: '900', lineHeight: 1.12, margin: '0 0 12px', letterSpacing: '-0.8px' }}>
            Read More, <br />
            <span style={{ color: '#38bdf8', fontStyle: 'italic' }}>Grow Further</span>
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.5, margin: '0 0 24px', opacity: 0.9 }}>
            Discover amazing books, explore new ideas, and build a better you — one page at a time.
          </p>

          {/* Search Box */}
          <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', borderRadius: '32px', padding: '5px 7px 5px 16px', maxWidth: '100%', boxShadow: '0 10px 30px rgba(0,0,0,0.6)' }}>
            <span style={{ color: '#94a3b8', marginRight: '6px', fontSize: '14px' }}>🔍</span>
            <input
              type="text"
              placeholder="Search for books, authors, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', flex: 1, fontSize: '13px', color: '#0f172a', minWidth: '0' }}
            />
            <button style={{ background: '#2563eb', border: 'none', width: '36px', height: '36px', borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, fontSize: '13px' }}>
              ➔
            </button>
          </div>

          {/* Feature Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '22px', fontSize: '12px', color: '#e2e8f0', fontWeight: '500' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>📖 Free to Read</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>⚡ Easy Access</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>🛡️ Safe & Secure</span>
          </div>
        </div>
      </section>

      {/* 3. Featured Books Grid */}
      <section style={{ padding: '30px 20px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 4px' }}>Featured Books</h2>
            <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>Handpicked books just for you</p>
          </div>
          <span style={{ color: '#38bdf8', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>View All ➔</span>
        </div>

        {loading ? (
          <p style={{ color: '#64748b', fontSize: '13px' }}>Books load ho rahi hain...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '18px' }}>
            {filteredBooks.map((book) => {
              const rawCover = book.cover_path || book.cover_url
              const cover = rawCover && rawCover.startsWith('http')
                ? rawCover
                : `https://stuabcdisgmmxprapfai.supabase.co/storage/v1/object/public/covers/${rawCover || '1790700033242-teliy6.jpg'}`

              return (
                <div key={book.id || book.title} style={{
                  background: '#0d1322',
                  borderRadius: '16px',
                  padding: '12px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{
                    height: '240px',
                    borderRadius: '10px',
                    backgroundColor: '#161f33',
                    backgroundImage: `url(${cover})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    marginBottom: '12px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.5)'
                  }}></div>

                  <h4 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {book.title}
                  </h4>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 10px' }}>
                    {book.author || 'Tiger Soul'}
                  </p>

                  <div style={{ marginTop: 'auto' }}>
                    <span style={{ display: 'inline-block', background: 'rgba(56,189,248,0.1)', color: '#38bdf8', fontSize: '10px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '6px', marginBottom: '10px' }}>
                      {book.category || 'Music'}
                    </span>
                    <button
                      onClick={() => handleReadBook(book)}
                      style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '9px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
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
      <section style={{ padding: '20px 20px 60px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 4px' }}>Browse by Category</h2>
            <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>Find books in your favorite category</p>
          </div>
          <span style={{ color: '#38bdf8', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>View All ➔</span>
        </div>

        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
          {categoriesList.map((cat) => (
            <div key={cat.name} style={{
              background: '#0d1322',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '24px',
              padding: '10px 16px',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Auth Modal Popup */}
      {showAuthModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '24px', padding: '28px 24px', width: '100%', maxWidth: '350px', textAlign: 'center', position: 'relative', color: '#0f172a' }}>
            <button onClick={() => setShowAuthModal(false)} style={{ position: 'absolute', top: '14px', right: '16px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
            <div style={{ fontSize: '22px', marginBottom: '6px' }}>📖 Readora</div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 4px' }}>{isSignUp ? 'Create an Account' : 'Welcome Back!'}</h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 18px' }}>Sign in to read this book and access your library.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={() => handleOAuthLogin('google')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                Continue with Google
              </button>
              <button onClick={() => handleOAuthLogin('facebook')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '10px', border: 'none', background: '#1877F2', color: '#fff', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                Continue with Facebook
              </button>
              <button onClick={() => setShowEmailForm(!showEmailForm)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                Continue with Email
              </button>
            </div>

            {showEmailForm && (
              <form onSubmit={handleEmailAuth} style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }} />
                <input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }} />
                <button type="submit" style={{ padding: '9px', borderRadius: '8px', border: 'none', background: '#0f172a', color: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '12px' }}>
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </button>
              </form>
            )}

            {authError && <p style={{ fontSize: '11px', color: '#ef4444', marginTop: '8px' }}>{authError}</p>}

            <p style={{ fontSize: '12px', color: '#64748b', margin: '16px 0 0' }}>
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
    
