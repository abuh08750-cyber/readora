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

// Categories jaisa photo me tha
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
    // 1. Session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(session.user)
    })

    // 2. Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        setShowAuthModal(false)
      } else {
        setUser(null)
      }
    })

    // 3. Database se SIRF wahi books aayengi jo aapne upload ki hain
    async function fetchDatabaseBooks() {
      try {
        const { data, error } = await supabase.from('books').select('*')
        if (!error && data && data.length > 0) {
          setBooks(data)
        } else {
          // Backup agar DB khali ya slow ho
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
        console.error('Fetch error:', e)
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

  // Reader Handler (HTML aur PDF dono support karega)
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

  // In-App Reader View
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
    <div style={{ backgroundColor: '#060911', color: '#f8fafc', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      
      {/* 1. Header Navigation */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: '1px solid #141b2d', background: 'rgba(6,9,17,0.9)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '22px', fontWeight: '800' }}>
            <span style={{ fontSize: '26px' }}>📖</span> Readora
          </div>
          <nav style={{ display: 'flex', gap: '22px', fontSize: '14px', fontWeight: '500', color: '#94a3b8' }}>
            <span style={{ color: '#38bdf8', cursor: 'pointer', borderBottom: '2px solid #38bdf8', paddingBottom: '4px' }}>Home</span>
            <span style={{ cursor: 'pointer' }}>Library</span>
            <span style={{ cursor: 'pointer' }}>Categories</span>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: '#0e1626', border: '1px solid #1e293b', borderRadius: '20px', padding: '7px 16px 7px 34px', fontSize: '13px', color: '#fff', outline: 'none', width: '200px' }}
            />
            <span style={{ position: 'absolute', left: '12px', fontSize: '13px', color: '#64748b' }}>🔍</span>
          </div>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 'bold' }}>{user.email?.split('@')[0]}</span>
              <button onClick={handleLogout} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowAuthModal(true)} style={{ background: '#111827', color: '#fff', border: '1px solid #1f2937', padding: '7px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                Sign In
              </button>
              <button onClick={() => setShowAuthModal(true)} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '7px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                Get Started
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 2. Hero Banner (Exact Image Look) */}
      <section style={{
        position: 'relative',
        padding: '70px 40px 60px',
        backgroundImage: `linear-gradient(to right, #060911 45%, rgba(6,9,17,0.7) 70%, rgba(6,9,17,0.2) 100%), url('https://images.unsplash.com/photo-1507842229451-7f01be7ff6ab?w=1600&auto=format&fit=crop&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'right center',
        minHeight: '380px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        borderBottom: '1px solid #141b2d'
      }}>
        <div style={{ maxWidth: '580px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '900', lineHeight: 1.15, margin: '0 0 14px', letterSpacing: '-0.5px' }}>
            Read More, <br />
            <span style={{ color: '#38bdf8', fontStyle: 'italic' }}>Grow Further</span>
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: 1.5, margin: '0 0 24px' }}>
            Discover amazing books, explore new ideas, and build a better you — one page at a time.
          </p>

          {/* Search Box */}
          <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', borderRadius: '30px', padding: '4px 6px 4px 18px', maxWidth: '440px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
            <span style={{ color: '#94a3b8', marginRight: '8px' }}>🔍</span>
            <input
              type="text"
              placeholder="Search for books, authors, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', flex: 1, fontSize: '13px', color: '#1e293b' }}
            />
            <button style={{ background: '#2563eb', border: 'none', width: '36px', height: '36px', borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              ➔
            </button>
          </div>

          {/* Feature Badges */}
          <div style={{ display: 'flex', gap: '22px', marginTop: '24px', fontSize: '12px', color: '#cbd5e1', fontWeight: '500' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>📖 Free to Read</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>⚡ Easy Access</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>🛡️ Safe & Secure</span>
          </div>
        </div>
      </section>

      {/* 3. Featured Books Grid (Sirf uploaded books dikhengi) */}
      <section style={{ padding: '40px 40px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '22px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 4px' }}>Featured Books</h2>
            <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>Handpicked books just for you</p>
          </div>
          <span style={{ color: '#38bdf8', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>View All ➔</span>
        </div>

        {loading ? (
          <p style={{ color: '#64748b' }}>Books load ho rahi hain...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '20px' }}>
            {filteredBooks.map((book) => {
              const rawCover = book.cover_path || book.cover_url
              const cover = rawCover && rawCover.startsWith('http')
                ? rawCover
                : `https://stuabcdisgmmxprapfai.supabase.co/storage/v1/object/public/covers/${rawCover || '1790700033242-teliy6.jpg'}`

              return (
                <div key={book.id || book.title} style={{ background: '#0e1626', borderRadius: '16px', padding: '14px', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column' }}>
                  <div style={{
                    height: '240px',
                    borderRadius: '10px',
                    backgroundColor: '#1e293b',
                    backgroundImage: `url(${cover})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    marginBottom: '12px'
                  }}></div>

                  <h4 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {book.title}
                  </h4>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 8px' }}>
                    {book.author || 'Author'}
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
      <section style={{ padding: '30px 40px 60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 4px' }}>Browse by Category</h2>
            <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>Find books in your favorite category</p>
          </div>
          <span style={{ color: '#38bdf8', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>View All ➔</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '14px' }}>
          {categoriesList.map((cat) => (
            <div key={cat.name} style={{
              background: '#0e1626',
              border: '1px solid #1e293b',
              borderRadius: '12px',
              padding: '14px 10px',
              textAlign: 'center',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '13px',
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '24px', padding: '34px 28px', width: '100%', maxWidth: '380px', textAlign: 'center', position: 'relative', color: '#0f172a' }}>
            <button onClick={() => setShowAuthModal(false)} style={{ position: 'absolute', top: '16px', right: '18px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>✕</button>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>📖 Readora</div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 6px' }}>{isSignUp ? 'Create an Account' : 'Welcome Back!'}</h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px' }}>Sign in to read this book and access your library.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={() => handleOAuthLogin('google')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '11px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                Continue with Google
              </button>
              <button onClick={() => handleOAuthLogin('facebook')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '11px', borderRadius: '12px', border: 'none', background: '#1877F2', color: '#fff', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                Continue with Facebook
              </button>
              <button onClick={() => setShowEmailForm(!showEmailForm)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '11px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                Continue with Email
              </button>
            </div>

            {showEmailForm && (
              <form onSubmit={handleEmailAuth} style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }} />
                <input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }} />
                <button type="submit" style={{ padding: '10px', borderRadius: '8px', border: 'none', background: '#0f172a', color: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </button>
              </form>
            )}

            {authError && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '10px' }}>{authError}</p>}

            <p style={{ fontSize: '13px', color: '#64748b', margin: '20px 0 0' }}>
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
    
