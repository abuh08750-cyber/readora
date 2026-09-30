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

const filterCategories = [
  'All Books',
  'Music',
  'Self Help',
  'Business',
  'Technology',
  'Education',
  'Fiction',
  'Health',
  'Writing',
]

export default function LibraryPage() {
  const [books, setBooks] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All Books')
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

    async function loadBooks() {
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
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadBooks()

    return () => subscription.unsubscribe()
  }, [])

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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setReadingFile(null)
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

  const filtered = books.filter(b => {
    const matchesSearch =
      b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCat =
      selectedCategory === 'All Books' || b.category?.toLowerCase() === selectedCategory.toLowerCase()
    return matchesSearch && matchesCat
  })

  if (readingFile && htmlData) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#0B0F17', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', background: '#090d16', borderBottom: '1px solid #1e293b' }}>
          <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '15px' }}>📖 {readingTitle}</div>
          <button onClick={() => setReadingFile(null)} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            ✕ Close Reader
          </button>
        </header>
        <iframe srcDoc={htmlData} style={{ width: '100%', flex: 1, border: 'none' }} title={readingTitle} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#070b14', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Left Sidebar */}
      <aside style={{
        width: '240px',
        background: '#070b14',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 16px',
        boxSizing: 'border-box',
        flexShrink: 0
      }}>
        <div>
          <div 
            onClick={() => window.location.href = '/'}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', fontWeight: '800', marginBottom: '32px', paddingLeft: '8px', cursor: 'pointer' }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <span>Readora</span>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div 
              onClick={() => window.location.href = '/'}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#94a3b8' }}
            >
              <span>🏠</span> Home
            </div>

            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#fff', background: '#1d4ed8' }}
            >
              <span>📖</span> Library
            </div>

            <div 
              onClick={() => window.location.href = '/#category-section'}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#94a3b8' }}
            >
              <span>🗂️</span> Categories
            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '14px 0' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', color: '#94a3b8' }}>
              <span>📑</span> My Books
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', color: '#94a3b8' }}>
              <span>🕒</span> Recently Read
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', color: '#94a3b8' }}>
              <span>🤍</span> Favorites
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', color: '#94a3b8' }}>
              <span>⚙️</span> Settings
            </div>
          </nav>
        </div>

        <div style={{
          background: 'linear-gradient(180deg, #111827 0%, #0b0f19 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '14px',
          padding: '16px',
          fontSize: '12px'
        }}>
          <p style={{ margin: '0 0 6px', fontWeight: '700', lineHeight: 1.3 }}>Better Books<br />Bigger Dreams</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '11px', fontWeight: 'bold' }}>
            <span>📖</span> Readora
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* Top Header */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 32px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: '#070b14',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}>
          <div style={{ position: 'relative', width: '380px', maxWidth: '60%' }}>
            <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#64748b', fontSize: '14px' }}>🔍</span>
            <input
              type="text"
              placeholder="Search for books, authors, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: '#0d1322',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '24px',
                padding: '9px 16px 9px 38px',
                color: '#fff',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '16px', cursor: 'pointer' }}>☀️</button>
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <span style={{ color: '#94a3b8', fontSize: '16px' }}>🔔</span>
              <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '6px', height: '6px', background: '#ef4444', borderRadius: '50%' }} />
            </div>

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px' }}>
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <button onClick={handleLogout} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>
                  Logout
                </button>
              </div>
            ) : (
              <button onClick={() => setShowAuthModal(true)} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                Sign In
              </button>
            )}
          </div>
        </header>

        {/* Library Body */}
        <div style={{ padding: '28px 32px 60px', overflowY: 'auto' }}>
          
          {/* Hero Banner */}
          <section style={{
            position: 'relative',
            borderRadius: '20px',
            overflow: 'hidden',
            padding: '36px 36px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundImage: `linear-gradient(to right, #090e1a 40%, rgba(9,14,26,0.8) 60%, rgba(9,14,26,0.3) 100%), url('https://images.unsplash.com/photo-1507842229451-7f01be7ff6ab?w=1600&auto=format&fit=crop&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'right center',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#38bdf8', letterSpacing: '1px', textTransform: 'uppercase' }}>LIBRARY</span>
              <h1 style={{ fontSize: '32px', fontWeight: '900', margin: '6px 0 10px', letterSpacing: '-0.5px' }}>Your Book Collection</h1>
              <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Explore, read and grow with our curated collection of books.</p>
            </div>
          </section>

          {/* Filter Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {filterCategories.map((cat) => {
                const active = selectedCategory === cat
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      background: active ? '#2563eb' : '#0d1322',
                      color: active ? '#ffffff' : '#94a3b8',
                      border: active ? '1px solid #2563eb' : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '20px',
                      padding: '7px 16px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0d1322', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '6px 14px', fontSize: '12px', color: '#94a3b8', cursor: 'pointer' }}>
              <span>Sort by</span>
              <span>⌵</span>
            </div>
          </div>

          {/* Books Grid */}
          {loading ? (
            <p style={{ color: '#64748b' }}>Books load ho rahi hain...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
              {filtered.map((book) => {
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
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative'
                  }}>
                    <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10, background: 'rgba(0,0,0,0.4)', borderRadius: '6px', padding: '4px 6px', cursor: 'pointer' }}>
                      <span style={{ fontSize: '12px', color: '#fff' }}>🔖</span>
                    </div>

                    <div style={{
                      height: '240px',
                      borderRadius: '10px',
                      backgroundColor: '#161f33',
                      backgroundImage: `url(${cover})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      marginBottom: '12px'
                    }}></div>

                    <h4 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {book.title}
                    </h4>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 10px' }}>
                      {book.author || 'Readora'}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{
                        background: 'rgba(56,189,248,0.12)',
                        color: '#38bdf8',
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '3px 8px',
                        borderRadius: '6px'
                      }}>
                        {book.category || 'Music'}
                      </span>
                      <span style={{ color: '#64748b', cursor: 'pointer', fontSize: '14px' }}>•••</span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                      <button style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.05)',
                        color: '#94a3b8',
                        border: '1px solid rgba(255,255,255,0.08)',
                        padding: '8px 0',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        Details
                      </button>
                      <button
                        onClick={() => handleRead(book)}
                        style={{
                          flex: 1.5,
                          background: '#2563eb',
                          color: '#fff',
                          border: 'none',
                          padding: '8px 0',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
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
        </div>
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center'
