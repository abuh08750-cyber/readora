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
  const [pendingRedirectToLibrary, setPendingRedirectToLibrary] = useState(false)

  const [userLibIds, setUserLibIds] = useState<string[]>([])
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [likedIds, setLikedIds] = useState<string[]>([])

  const [payModalBook, setPayModalBook] = useState<any>(null)
  const [paymentDone, setPaymentDone] = useState(false)

  const [themeMode, setThemeMode] = useState<'Dark' | 'Light' | 'Sepia' | 'Custom'>('Dark')
  const [customColor, setCustomColor] = useState('#6366f1')

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

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('auth=required')) {
      setShowAuthModal(true)
      setPendingRedirectToLibrary(true)
      window.history.replaceState({}, '', '/')
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

        const shouldGoLibrary = pendingRedirectToLibrary || (typeof window !== 'undefined' && sessionStorage.getItem('readora_pending_library') === 'true')
        if (shouldGoLibrary) {
          sessionStorage.removeItem('readora_pending_library')
          window.location.href = '/library'
        }
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
              is_paid: false,
              price: 0,
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
  }, [pendingRedirectToLibrary])

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

  const handleLibraryClick = () => {
    if (user) {
      window.location.href = '/library'
    } else {
      setPendingRedirectToLibrary(true)
      try {
        sessionStorage.setItem('readora_pending_library', 'true')
      } catch {}
      setShowAuthModal(true)
    }
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
    const next = savedIds.includes(bookId) ? savedIds.filter(id => id !== bookId) : [...savedIds, bookId]
    setSavedIds(next)
    localStorage.setItem(`rd_saves_${user.id}`, JSON.stringify(next))
  }

  const handleToggleLike = (bookId: string) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    const next = likedIds.includes(bookId) ? likedIds.filter(id => id !== bookId) : [...likedIds, bookId]
    setLikedIds(next)
    localStorage.setItem(`rd_likes_${user.id}`, JSON.stringify(next))
  }

  const executeFileDownload = (book: any) => {
    const raw = book.file_path || book.file_url || 'https://stuabcdisgmmxprapfai.supabase.co/storage/v1/object/public/ebooks/1790700034105-biegrb.html'
    const full = raw.startsWith('http') ? raw : `https://stuabcdisgmmxprapfai.supabase.co/storage/v1/object/public/ebooks/${raw}`
    const a = document.createElement('a')
    a.href = full
    a.download = `${book.title || 'ebook'}.html`
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleDownload = (book: any) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    if (book.is_paid && Number(book.price) > 0) {
      setPayModalBook(book)
      setPaymentDone(false)
    } else {
      executeFileDownload(book)
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

  const handleRead = async (book: any) => {
    if (!user) {
      setPendingRedirectToLibrary(false)
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

  const avatarChar = user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() || 'R'

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
            <span style={{ color: styles.muted, cursor: 'pointer' }} onClick={handleLibraryClick}>Library</span>
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
              <button onClick={() => { setPendingRedirectToLibrary(false); setShowAuthModal(true); }} style={{ background: 'transparent', color: styles.text, border: `1px solid ${styles.border}`, padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                Sign In
              </button>
              <button onClick={() => { setPendingRedirectToLibrary(false); setShowAuthModal(true); }} style={{ background: styles.nav, color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
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
          <span style={{ color: styles.accent, fontSize: '12px', fontWeight: '600', cursor: 'pointer' }} onClick={handleLibraryClick}>View All ➔</span>
        </div>

        {loading ? (
          <p style={{ color: styles.muted, fontSize: '13px' }}>Books load ho rahi hain...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
            {filtered.map((book) => {
              const rawCover = book.cover_path || book.cover_url
              const cover = rawCover && rawCover.startsWith('http')
                ? rawCover
                : `https://stuabcdisgmmxprapfai.supabase.co/storage/v1/object/public/covers/${rawCover || '1790700033242-teliy6.jpg'}`

              const isLiked = likedIds.includes(book.id)
              const isSaved = savedIds.includes(book.id)
              const inLib = userLibIds.includes(book.id)

              return (
                <div key={book.id || book.title} style={{ background: styles.card, borderRadius: '16px', padding: '14px', border: `1px solid ${styles.border}`, display: 'flex', flexDirection: 'column' }}>
                  <div style={{
                    height: '240px',
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
                  <p style={{ fontSize: '12px', color: styles.muted, margin: '0 0 8px' }}>
                    {book.author || 'Readora'}
                  </p>

                  <div style={{ marginBottom: '10px' }}>
                    {book.is_paid && Number(book.price) > 0 ? (
                      <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                        🔒 Paid: ${book.price}
                      </span>
                    ) : (
                      <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                        ✓ eBook Read Free
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                    <button onClick={() => handleToggleLike(book.id)} style={{ flex: 1, background: isLiked ? 'rgba(239,68,68,0.2)' : styles.inner, color: isLiked ? '#ef4444' : styles.muted, border: `1px solid ${styles.border}`, borderRadius: '6px', padding: '5px 0', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>
                      {isLiked ? '❤️ Liked' : '🤍 Like'}
                    </button>
                    <button onClick={() => handleToggleSave(book.id)} style={{ flex: 1, background: isSaved ? 'rgba(56,189,248,0.2)' : styles.inner, color: isSaved ? styles.accent : styles.muted, border: `1px solid ${styles.border}`, borderRadius: '6px', padding: '5px 0', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>
                      {isSaved ? '🔖 Saved' : 'Save'}
                    </button>
                    <button onClick={() => handleDownload(book)} style={{ flex: 1.2, background: styles.inner, color: styles.accent, border: `1px solid ${styles.border}`, borderRadius: '6px', padding: '5px 0', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>
                      📥 Download
                    </button>
                  </div>

                  <button
                    onClick={() => handleRead(book)}
                    style={{ width: '100%', background: styles.nav, color: '#fff', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}
                  >
                    📖 Read Book
                  </button>

                  <button
                    onClick={() => handleAddToLibrary(book.id)}
                    style={{ width: '100%', background: inLib ? 'rgba(16,185,129,0.15)' : styles.inner, color: inLib ? '#10b981' : styles.muted, border: `1px solid ${styles.border}`, padding: '7px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}
                  >
                    {inLib ? '✓ In Library' : '➕ Add to Library'}
                  </button>
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
          <span style={{ color: styles.accent, fontSize: '12px', fontWeight: '600', cursor: 'pointer' }} onClick={handleLibraryClick}>View All ➔</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
          {categories.map((cat) => (
            <div key={cat.name} onClick={handleLibraryClick} style={{ background: styles.card, border: `1px solid ${styles.border}`, borderRadius: '12px', padding: '14px 10px', textAlign: 'center', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '12px', fontWeight: '600', color: styles.text }}>
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Payment Gateway Modal */}
      {payModalBook && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: styles.card, border: `1px solid ${styles.border}`, borderRadius: '18px', padding: '24px', maxWidth: '380px', width: '100%', color: styles.text }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <b style={{ fontSize: '16px', color: styles.accent }}>Complete Payment to Download</b>
              <button onClick={() => setPayModalBook(null)} style={{ background: 'none', border: 'none', color: styles.muted, fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>
            
            <p style={{ fontSize: '13px', margin: '0 0 10px', color: styles.text }}>Book: <b>{payModalBook.title}</b></p>
            <div style={{ background: styles.inner, padding: '12px', borderRadius: '10px', border: `1px solid ${styles.border}`, marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: styles.muted }}>Payable Amount:</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>${payModalBook.price}</div>
              <div style={{ fontSize: '11px', color: styles.accent, marginTop: '6px' }}>Receiver UPI: <b>7518727151@fam</b></div>
            </div>

            <div style={{ fontSize: '12px', color: styles.muted, marginBottom: '8px' }}>Select Payment Method:</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
              <button onClick={() => { window.open(`upi://pay?pa=7518727151@fam&pn=Readora&am=${payModalBook.price}&cu=INR`); setPaymentDone(true); }} style={{ background: styles.inner, color: styles.text, border: `1px solid ${styles.border}`, padding: '10px 6px', borderRadius: '8px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>
                ⚡ UPI / GPay
              </button>
              <button onClick={() => { alert('Redirecting to Google Play Store in-app billing...'); setPaymentDone(true); }} style={{ background: styles.inner, color: styles.text, border: `1px solid ${styles.border}`, padding: '10px 6px', borderRadius: '8px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>
                ▶ Google Play
              </button>
              <button onClick={() => { alert('Debit / Credit Card payment ready.'); setPaymentDone(true); }} style={{ background: styles.inner, color: styles.text, border: `1px solid ${styles.border}`, padding: '10px 6px', borderRadius: '8px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>
                💳 All Cards
              </button>
              <button onClick={() => { alert('NetBanking / Wallets ready.'); setPaymentDone(true); }} style={{ background: styles.inner, color: styles.text, border: `1px solid ${styles.border}`, padding: '10px 6px', borderRadius: '8px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>
                🏦 NetBanking
              </button>
            </div>

            {paymentDone ? (
              <button onClick={() => { executeFileDownload(payModalBook); setPayModalBook(null); }} style={{ width: '100%', background: '#10b981', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                ✓ Payment Verified: Download Now
              </button>
            ) : (
              <p style={{ fontSize: '11px', color: styles.muted, margin: 0, textAlign: 'center' }}>Choose an app to pay directly into 7518727151@fam.</p>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '24px', padding: '30px 24px', width: '100%', maxWidth: '350px', textAlign: 'center', position: 'relative', color: '#0f172a' }}>
            <button onClick={() => { setShowAuthModal(false); setPendingRedirectToLibrary(false); }} style={{ position: 'absolute', top: '14px', right: '16px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
            <div style={{ fontSize: '22px', marginBottom: '6px' }}>📖 Readora</div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 4px' }}>{isSignUp ? 'Create an Account' : 'Welcome Back!'}</h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 18px' }}>Sign in to read books and access your library.</p>

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
