'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import NotificationDropdown from '@/components/NotificationDropdown'

const SUPABASE_URL = 'https://stuabcdisgmmxprapfai.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0dWFiY2Rpc2dtbXhwcmFwZmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1Njc1NjksImV4cCI6MjEwNjE0MzU2OX0.pGvaQQBWGcbDKgDb_9F1jkUURVXH3bhJ-trQt-GXBZ8'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})

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
  const [pendingRedirectToLibrary, setPendingRedirectToLibrary] = useState(false)

  const [userLibIds, setUserLibIds] = useState<string[]>([])
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [likedIds, setLikedIds] = useState<string[]>([])
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const cat = params.get('category')
      if (cat) setSelectedCategoryFilter(cat)
      if (params.get('auth') === 'required') {
        setShowAuthModal(true)
        setPendingRedirectToLibrary(true)
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        loadUserShelves(session.user.id)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        loadUserShelves(session.user.id)
        setShowAuthModal(false)
        if (pendingRedirectToLibrary || (typeof window !== 'undefined' && sessionStorage.getItem('readora_pending_library') === 'true')) {
          sessionStorage.removeItem('readora_pending_library')
          window.location.href = '/library'
        }
      } else {
        setUser(null)
      }
    })

    async function loadBooks() {
      try {
        const { data, error } = await supabase.from('books').select('*').order('created_at', { ascending: false })
        if (!error && data && data.length > 0) {
          setBooks(data)
        } else {
          setBooks([
            {
              id: 'default-1',
              title: 'ZERO SE ARTIST part 1',
              author: 'TIGER SOUL',
              category: 'Music',
              is_paid: false,
              price: 0,
              cover_path: 'https://stuabcdisgmmxprapfai.supabase.co/storage/v1/object/public/covers/1790700033242-teliy6.jpg',
              file_path: 'https://stuabcdisgmmxprapfai.supabase.co/storage/v1/object/public/ebooks/1790700034105-biegrb.html',
            },
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
  }, [pendingRedirectToLibrary])

  const loadUserShelves = (uid: string) => {
    try {
      const lib = localStorage.getItem(`readora_user_library_${uid}`)
      if (lib) setUserLibIds(JSON.parse(lib))
      const s = localStorage.getItem(`rd_saves_${uid}`)
      if (s) setSavedIds(JSON.parse(s))
      const l = localStorage.getItem(`rd_likes_${uid}`)
      if (l) setLikedIds(JSON.parse(l))
    } catch {}
  }

  const handleAddToLibrary = (bookId: string) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    const next = userLibIds.includes(bookId) ? userLibIds : [...userLibIds, bookId]
    setUserLibIds(next)
    localStorage.setItem(`readora_user_library_${user.id}`, JSON.stringify(next))
    alert('Book aapki Library mein add kar di gayi hai!')
    }

  const handleToggleSave = (bookId: string) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    const next = savedIds.includes(bookId) ? savedIds.filter((id) => id !== bookId) : [...savedIds, bookId]
    setSavedIds(next)
    localStorage.setItem(`rd_saves_${user.id}`, JSON.stringify(next))
  }

  const handleToggleLike = (bookId: string) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    const next = likedIds.includes(bookId) ? likedIds.filter((id) => id !== bookId) : [...likedIds, bookId]
    setLikedIds(next)
    localStorage.setItem(`rd_likes_${user.id}`, JSON.stringify(next))
  }

  const executeFileDownload = async (book: any) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    const raw = book.file_path || book.file_url || 'https://stuabcdisgmmxprapfai.supabase.co/storage/v1/object/public/ebooks/1790700034105-biegrb.html'
    const full = raw.startsWith('http') ? raw : `https://stuabcdisgmmxprapfai.supabase.co/storage/v1/object/public/ebooks/${raw}`

    try {
      const response = await fetch(full)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${(book.title || 'ebook').replace(/[^a-zA-Z0-9_-]/g, '_')}.html`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch {
      window.open(full, '_blank')
    }
  }

  const handleRead = async (book: any) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    const rawFile = book.file_path || book.file_url || 'https://stuabcdisgmmxprapfai.supabase.co/storage/v1/object/public/ebooks/1790700034105-biegrb.html'
    const fullUrl = rawFile.startsWith('http') ? rawFile : `https://stuabcdisgmmxprapfai.supabase.co/storage/v1/object/public/ebooks/${rawFile}`

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
      if (error) {
        setAuthError(error.message)
      } else if (data?.user) {
        setUser(data.user)
        setShowAuthModal(false)
        if (pendingRedirectToLibrary || sessionStorage.getItem('readora_pending_library') === 'true') {
          sessionStorage.removeItem('readora_pending_library')
          window.location.href = '/library'
        }
      }
    }
  }

  const filtered = books.filter((b) => {
    const matchSearch = b.title?.toLowerCase().includes(searchQuery.toLowerCase()) || b.author?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchCategory = !selectedCategoryFilter || b.category?.toLowerCase() === selectedCategoryFilter.toLowerCase()
    return matchSearch && matchCategory
  })

  if (readingFile && htmlData) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#0B0F17', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: '#090d16', borderBottom: '1px solid #1e293b' }}>
          <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '15px' }}>📖 {readingTitle}</div>
          <button onClick={() => setReadingFile(null)} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>✕ Close</button>
        </header>
        <iframe srcDoc={htmlData} style={{ width: '100%', flex: 1, border: 'none' }} title={readingTitle} />
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#040711', color: '#f8fafc', minHeight: '100vh', width: '100%', overflowX: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#040711', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', fontWeight: '800', cursor: 'pointer' }} onClick={() => { setSelectedCategoryFilter(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <span>📖</span><span>Readora</span>
          </div>
          <nav style={{ display: 'flex', gap: '20px', fontSize: '14px', fontWeight: '500' }}>
            <span style={{ color: '#fff', borderBottom: '2px solid #2563eb', paddingBottom: '4px', cursor: 'pointer' }} onClick={() => { setSelectedCategoryFilter(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Home</span>
            <span style={{ color: '#94a3b8', cursor: 'pointer' }} onClick={() => user ? window.location.href = '/library' : setShowAuthModal(true)}>Library</span>
            <span style={{ color: '#94a3b8', cursor: 'pointer' }} onClick={() => window.location.href = '/categories'}>Categories</span>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user ? (
            <>
              <NotificationDropdown />
              <button type="button" onClick={() => (window.location.href = '/settings')} style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#2563eb', color: '#ffffff', border: '2px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px', cursor: 'pointer', backgroundImage: headerAvatar ? `url(${headerAvatar})` : 'none', backgroundSize: 'cover' }}>
                {!headerAvatar && (user?.email?.charAt(0).toUpperCase() || 'R')}
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowAuthModal(true)} style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Sign In</button>
              <button onClick={() => setShowAuthModal(true)} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Get Started</button>
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      <section style={{ position: 'relative', minHeight: '360px', display: 'flex', alignItems: 'center', background: "linear-gradient(to right, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0.2) 100%), url('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1600&auto=format&fit=crop&q=80')", backgroundSize: 'cover', backgroundPosition: 'right 30%', padding: '40px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '540px' }}>
          <h1 style={{ fontSize: '44px', fontWeight: '900', lineHeight: 1.1, margin: '0 0 14px', letterSpacing: '-1px', color: '#fff' }}>
            Read More, <br /><span style={{ color: '#38bdf8', fontStyle: 'italic', fontFamily: 'serif' }}>Grow Further</span>
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.5, margin: '0 0 20px' }}>
            Discover amazing books, explore new ideas, and build a better you — one page at a time.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', borderRadius: '40px', padding: '4px 6px 4px 16px', maxWidth: '420px' }}>
            <span style={{ color: '#94a3b8', marginRight: '6px' }}>🔍</span>
            <input type="text" placeholder="Search books, authors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ border: 'none', outline: 'none', flex: 1, fontSize: '13px', color: '#1e293b' }} />
            <button style={{ background: '#2563eb', border: 'none', width: '34px', height: '34px', borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '13px' }}>➔</button>
          </div>
        </div>
      </section>

      {/* Featured Books Grid */}
      <section style={{ padding: '36px 28px 60px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#fff' }}>Featured Books</h2>
              {selectedCategoryFilter && (
                <span style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                  {selectedCategoryFilter} <span onClick={() => setSelectedCategoryFilter(null)} style={{ cursor: 'pointer', marginLeft: '4px' }}>✕</span>
                </span>
              )}
            </div>
            <p style={{ color: '#94a3b8', fontSize: '12px', margin: '4px 0 0' }}>Handpicked books just for you</p>
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#94a3b8', fontSize: '13px' }}>Books load ho rahi hain...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
            {filtered.map((book) => {
              const rawCover = book.cover_path || book.cover_url
              const cover = rawCover && rawCover.startsWith('http') ? rawCover : `https://stuabcdisgmmxprapfai.supabase.co/storage/v1/object/public/covers/${rawCover || '1790700033242-teliy6.jpg'}`
              const isLiked = likedIds.includes(book.id)
              const isSaved = savedIds.includes(book.id)
              const inLib = userLibIds.includes(book.id)

              return (
                <div key={book.id || book.title} style={{ background: '#0a0f1d', borderRadius: '16px', padding: '14px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '280px', borderRadius: '10px', backgroundColor: '#070b14', backgroundImage: `url(${cover})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', marginBottom: '12px', border: '1px solid rgba(255,255,255,0.04)' }} />
                  <h4 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fff' }}>{book.title}</h4>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 8px' }}>{book.author || 'Readora'}</p>

                  <div style={{ marginBottom: '10px' }}>
                    <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>✓ eBook Read Free</span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                    <button onClick={() => handleToggleLike(book.id)} style={{ flex: 1, background: isLiked ? 'rgba(239,68,68,0.2)' : '#070b14', color: isLiked ? '#ef4444' : '#94a3b8', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '6px 0', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>{isLiked ? '❤️ Liked' : '🤍 Like'}</button>
                    <button onClick={() => handleToggleSave(book.id)} style={{ flex: 1, background: isSaved ? 'rgba(56,189,248,0.2)' : '#070b14', color: isSaved ? '#38bdf8' : '#94a3b8', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '6px 0', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>{isSaved ? '🔖 Saved' : 'Save'}</button>
                    <button onClick={() => executeFileDownload(book)} style={{ flex: 1.2, background: '#070b14', color: '#38bdf8', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '6px 0', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>📥 Download</button>
                  </div>

                  <button onClick={() => handleRead(book)} style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>📖 Read Book</button>
                  <button onClick={() => handleAddToLibrary(book.id)} style={{ width: '100%', background: inLib ? 'rgba(16,185,129,0.15)' : '#070b14', color: inLib ? '#10b981' : '#94a3b8', border: '1px solid rgba(255,255,255,0.06)', padding: '7px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>{inLib ? '✓ In Library' : '➕ Add to Library'}</button>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Auth Modal */}
      {showAuthModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '24px', padding: '30px 24px', width: '100%', maxWidth: '350px', textAlign: 'center', position: 'relative', color: '#0f172a' }}>
            <button onClick={() => { setShowAuthModal(false); setPendingRedirectToLibrary(false); }} style={{ position: 'absolute', top: '14px', right: '16px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
            <div style={{ fontSize: '22px', marginBottom: '6px' }}>📖 Readora</div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 4px' }}>{isSignUp ? 'Create an Account' : 'Welcome Back!'}</h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 18px' }}>Sign in to read books and access your library.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={() => handleOAuth('google')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>Continue with Google</button>
              <button onClick={() => handleOAuth('facebook')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '10px', border: 'none', background: '#1877F2', color: '#fff', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>Continue with Facebook</button>
              <button onClick={() => setShowEmailForm(!showEmailForm)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>Continue with Email</button>
            </div>
            {showEmailForm && (
              <form onSubmit={handleEmailAuth} style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }} />
                <input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }} />
                <button type="submit" style={{ padding: '9px', borderRadius: '8px', border: 'none', background: '#0f172a', color: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '12px' }}>{isSignUp ? 'Sign Up' : 'Sign In'}</button>
              </form>
            )}
            {authError && <p style={{ fontSize: '11px', color: '#ef4444', marginTop: '8px' }}>{authError}</p>}
            <p style={{ fontSize: '12px', color: '#64748b', margin: '18px 0 0' }}>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <span onClick={() => { setIsSignUp(!isSignUp); setShowEmailForm(true); }} style={{ color: '#2563eb', fontWeight: '600', cursor: 'pointer' }}>{isSignUp ? 'Sign In' : 'Sign Up'}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
      }
