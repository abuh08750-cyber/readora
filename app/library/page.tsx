'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://stuabcdisgmmxprapfai.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0dWFiY2Rpc2dtbXhwcmFwZmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1Njc1NjksImV4cCI6MjEwNjE0MzU2OX0.pGvaQQBWGcbDKgDb_9F1jkUURVXH3bhJ-trQt-GXBZ8'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})

const filterCategories = ['All Books', 'Music', 'Self Help', 'Business', 'Technology', 'Education', 'Fiction', 'Health', 'Writing']

export default function LibraryPage() {
  const [books, setBooks] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [selectedCategory, setSelectedCategory] = useState('All Books')
  const [searchQuery, setSearchQuery] = useState('')
  const [readingFile, setReadingFile] = useState<string | null>(null)
  const [readingTitle, setReadingTitle] = useState('')
  const [htmlData, setHtmlData] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(session.user)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })
    async function loadBooks() {
      try {
        const { data, error } = await supabase.from('books').select('*')
        if (!error && data && data.length > 0) {
          setBooks(data)
        } else {
          setBooks([{
            id: 'dfb9528e-8466-4c5f-aeab-0329ae420bf1',
            title: 'ZERO SE ARTIST - Part 1',
            author: 'Readora',
            category: 'Music',
            cover_path: 'https://stuabcdisgmmxprapfai.supabase.co/storage/v1/object/public/covers/1790700033242-teliy6.jpg',
            file_path: 'https://stuabcdisgmmxprapfai.supabase.co/storage/v1/object/public/ebooks/1790700034105-biegrb.html',
          }])
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

  const handleRead = async (book: any) => {
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

  const filtered = books.filter(b => {
    const matchSearch = b.title?.toLowerCase().includes(searchQuery.toLowerCase()) || b.author?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchCat = selectedCategory === 'All Books' || b.category?.toLowerCase() === selectedCategory.toLowerCase()
    return matchSearch && matchCat
  })

  if (readingFile && htmlData) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#0B0F17', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', background: '#090d16', borderBottom: '1px solid #1e293b' }}>
          <div style={{ color: '#fff', fontWeight: 'bold' }}>📖 {readingTitle}</div>
          <button onClick={() => setReadingFile(null)} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>✕ Close</button>
        </header>
        <iframe srcDoc={htmlData} style={{ width: '100%', flex: 1, border: 'none' }} title={readingTitle} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#070b14', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ width: '230px', background: '#070b14', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '24px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', flexShrink: 0 }}>
        <div>
          <div onClick={() => window.location.href = '/'} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', fontWeight: '800', marginBottom: '30px', cursor: 'pointer' }}>
            <span>📖</span><span>Readora</span>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div onClick={() => window.location.href = '/'} style={{ padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', color: '#94a3b8', fontSize: '13px' }}>🏠 Home</div>
            <div style={{ padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', color: '#fff', background: '#1d4ed8', fontSize: '13px', fontWeight: '600' }}>📖 Library</div>
            <div onClick={() => window.location.href = '/#category-section'} style={{ padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', color: '#94a3b8', fontSize: '13px' }}>🗂️ Categories</div>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '12px 0' }} />
            <div style={{ padding: '8px 14px', color: '#94a3b8', fontSize: '13px' }}>📑 My Books</div>
            <div style={{ padding: '8px 14px', color: '#94a3b8', fontSize: '13px' }}>🕒 Recently Read</div>
            <div style={{ padding: '8px 14px', color: '#94a3b8', fontSize: '13px' }}>🤍 Favorites</div>
            <div style={{ padding: '8px 14px', color: '#94a3b8', fontSize: '13px' }}>⚙️ Settings</div>
          </nav>
        </div>
        <div style={{ background: '#0d1322', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px', fontSize: '12px' }}>
          <p style={{ margin: '0 0 4px', fontWeight: '700' }}>Better Books<br />Bigger Dreams</p>
          <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>📖 Readora</span>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#070b14', position: 'sticky', top: 0, zIndex: 40 }}>
          <div style={{ position: 'relative', width: '360px', maxWidth: '60%' }}>
            <span style={{ position: 'absolute', left: '12px', top: '9px', color: '#64748b' }}>🔍</span>
            <input
              type="text"
              placeholder="Search for books, authors, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', background: '#0d1322', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '8px 14px 8px 36px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>☀️</span>
            <span>🔔</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>
              {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </header>

        {/* Library Page Content */}
        <div style={{ padding: '24px 28px 60px', overflowY: 'auto' }}>
          {/* Banner */}
          <section style={{
            position: 'relative',
            borderRadius: '16px',
            overflow: 'hidden',
            padding: '32px',
            marginBottom: '24px',
            backgroundImage: "linear-gradient(to right, #090e1a 40%, rgba(9,14,26,0.8) 60%, rgba(9,14,26,0.3) 100%), url('https://images.unsplash.com/photo-1507842229451-7f01be7ff6ab?w=1600&auto=format&fit=crop&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'right center',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#38bdf8', letterSpacing: '1px' }}>LIBRARY</span>
            <h1 style={{ fontSize: '30px', fontWeight: '900', margin: '6px 0 8px' }}>Your Book Collection</h1>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Explore, read and grow with our curated collection of books.</p>
          </section>

          {/* Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
              {filterCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    background: selectedCategory === cat ? '#2563eb' : '#0d1322',
                    color: selectedCategory === cat ? '#fff' : '#94a3b8',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '20px',
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div style={{ background: '#0d1322', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', color: '#94a3b8' }}>
              Sort by ⌵
            </div>
          </div>

          {/* Books Grid */}
          {loading ? (
            <p style={{ color: '#64748b' }}>Books load ho rahi hain...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '18px' }}>
              {filtered.map((book) => {
                const rawCover = book.cover_path || book.cover_url
                const cover = rawCover && rawCover.startsWith('http') ? rawCover : `https://stuabcdisgmmxprapfai.supabase.co/storage/v1/object/public/covers/${rawCover || '1790700033242-teliy6.jpg'}`

                return (
                  <div key={book.id || book.title} style={{ background: '#0d1322', borderRadius: '14px', padding: '12px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: '220px', borderRadius: '8px', backgroundColor: '#161f33', backgroundImage: `url(${cover})`, backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: '10px' }} />
                    <h4 style={{ fontSize: '13px', fontWeight: '700', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.title}</h4>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 8px' }}>{book.author || 'Readora'}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ background: 'rgba(56,189,248,0.12)', color: '#38bdf8', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>{book.category || 'Music'}</span>
                      <span style={{ color: '#64748b' }}>•••</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
                      <button style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)', padding: '7px 0', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>Details</button>
                      <button onClick={() => handleRead(book)} style={{ flex: 1.4, background: '#2563eb', color: '#fff', border: 'none', padding: '7px 0', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>📖 Read Book</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
                                         }
    
