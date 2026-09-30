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
  const [activeTab, setActiveTab] = useState<'all' | 'mybooks' | 'recent' | 'favorites'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Like & Save States (IDs stored)
  const [likedBookIds, setLikedBookIds] = useState<string[]>([])
  const [savedBookIds, setSavedBookIds] = useState<string[]>([])

  const [selectedBookForDetails, setSelectedBookForDetails] = useState<any>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [readingFile, setReadingFile] = useState<string | null>(null)
  const [readingTitle, setReadingTitle] = useState('')
  const [htmlData, setHtmlData] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(session.user)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    // 2. Load stored Likes and Saves from localStorage
    try {
      const storedLikes = localStorage.getItem('readora_liked_books')
      if (storedLikes) setLikedBookIds(JSON.parse(storedLikes))
      const storedSaves = localStorage.getItem('readora_saved_books')
      if (storedSaves) setSavedBookIds(JSON.parse(storedSaves))
    } catch (e) {
      console.error(e)
    }

    // 3. Load books
    async function loadBooks() {
      try {
        const { data, error } = await supabase.from('books').select('*')
        if (!error && data && data.length > 0) {
          setBooks(data)
        } else {
          setBooks([{
            id: 'dfb9528e-8466-4c5f-aeab-0329ae420bf1',
            title: 'ZERO SE ARTIST part 1',
            author: 'TIGER SOUL',
            category: 'Music',
            description: 'Artist banne ki shuruat - apni pehchan banao, apna sound dhoondo, apna safar shuru karo.',
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

  // Toggle Like Handler
  const handleToggleLike = (bookId: string) => {
    setLikedBookIds((prev) => {
      const updated = prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
      try { localStorage.setItem('readora_liked_books', JSON.stringify(updated)) } catch {}
      return updated
    })
  }

  // Toggle Save Handler
  const handleToggleSave = (bookId: string) => {
    setSavedBookIds((prev) => {
      const updated = prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
      try { localStorage.setItem('readora_saved_books', JSON.stringify(updated)) } catch {}
      return updated
    })
  }

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
    const matchTab = activeTab === 'all' 
      || (activeTab === 'mybooks' && savedBookIds.includes(b.id))
      || (activeTab === 'favorites' && likedBookIds.includes(b.id)) 
      || activeTab === 'recent'
    return matchSearch && matchCat && matchTab
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
    <div style={{ display: 'flex', minHeight: '100vh', background: '#070b14', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', width: '100%', overflowX: 'hidden' }}>
      
      {/* 1. Sidebar */}
      <aside style={{ width: '220px', minWidth: '200px', background: '#070b14', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '20px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
        <div>
          <div onClick={() => window.location.href = '/'} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '19px', fontWeight: '800', marginBottom: '26px', cursor: 'pointer' }}>
            <span>📖</span><span>Readora</span>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div onClick={() => window.location.href = '/'} style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: '#94a3b8', fontSize: '13px' }}>🏠 Home</div>
            <div onClick={() => { setActiveTab('all'); setSelectedCategory('All Books'); }} style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: '#fff', background: activeTab === 'all' ? '#1d4ed8' : 'transparent', fontSize: '13px', fontWeight: '600' }}>📖 Library</div>
            <div onClick={() => window.location.href = '/#categories-section'} style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: '#94a3b8', fontSize: '13px' }}>🗂️️ Categories</div>
            
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '10px 0' }} />
            
            <div onClick={() => setActiveTab('mybooks')} style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: activeTab === 'mybooks' ? '#fff' : '#94a3b8', background: activeTab === 'mybooks' ? '#1d4ed8' : 'transparent', fontSize: '13px' }}>
              📑 My Books ({savedBookIds.length})
            </div>
            <div onClick={() => setActiveTab('recent')} style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: activeTab === 'recent' ? '#fff' : '#94a3b8', background: activeTab === 'recent' ? '#1d4ed8' : 'transparent', fontSize: '13px' }}>
              🕒 Recently Read
            </div>
            <div onClick={() => setActiveTab('favorites')} style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: activeTab === 'favorites' ? '#fff' : '#94a3b8', background: activeTab === 'favorites' ? '#1d4ed8' : 'transparent', fontSize: '13px' }}>
              ❤️ Liked ({likedBookIds.length})
            </div>
            <div onClick={() => setShowSettings(true)} style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: '#94a3b8', fontSize: '13px' }}>⚙️ Settings</div>
          </nav>
        </div>

        <div style={{ background: '#0d1322', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px', fontSize: '11px' }}>
          <p style={{ margin: '0 0 4px', fontWeight: '700' }}>Better Books<br />Bigger Dreams</p>
          <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>📖 Readora</span>
        </div>
      </aside>

      {/* 2. Main Body Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#070b14', position: 'sticky', top: 0, zIndex: 40 }}>
          <div style={{ position: 'relative', width: '320px', maxWidth: '65%' }}>
            <span style={{ position: 'absolute', left: '10px', top: '8px', color: '#64748b', fontSize: '13px' }}>🔍</span>
            <input
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', background: '#0d1322', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '7px 12px 7px 30px', color: '#fff', fontSize: '12px', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={() => setShowSettings(true)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '15px', cursor: 'pointer' }}>⚙️</button>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '11px' }}>
              {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </header>

        <div style={{ padding: '20px 20px 50px', overflowY: 'auto' }}>
          
          {/* Banner */}
          <section style={{
            position: 'relative',
            borderRadius: '16px',
            overflow: 'hidden',
            padding: '28px 24px',
            marginBottom: '20px',
            backgroundImage: "linear-gradient(to right, #090e1a 45%, rgba(9,14,26,0.8) 65%, rgba(9,14,26,0.3) 100%), url('https://images.unsplash.com/photo-1507842229451-7f01be7ff6ab?w=1600&auto=format&fit=crop&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'right center',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <span style={{ fontSize: '10px', fontWeight: '800', color: '#38bdf8', letterSpacing: '1px' }}>
              {activeTab === 'favorites' ? 'LIKED BOOKS' : activeTab === 'mybooks' ? 'SAVED SHELF' : 'LIBRARY'}
            </span>
            <h1 style={{ fontSize: '26px', fontWeight: '900', margin: '4px 0 6px' }}>
              {activeTab === 'favorites' ? 'Your Liked Books' : activeTab === 'mybooks' ? 'Your Saved Collection' : 'Your Book Collection'}
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>Explore, read and grow with our curated collection of books.</p>
          </section>

          {/* Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
              {filterCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    background: selectedCategory === cat ? '#2563eb' : '#0d1322',
                    color: selectedCategory === cat ? '#fff' : '#94a3b8',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    padding: '5px 12px',
                    fontSize: '11px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Books Grid */}
          {loading ? (
            <p style={{ color: '#64748b' }}>Books load ho rahi hain...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
              {filtered.map((book) => {
                const rawCover = book.cover_path || book.cover_url
                const cover = rawCover && rawCover.startsWith('http') ? rawCover : `https://stuabcdisgmmxprapfai.supabase.co/storage/v1/object/public/covers/${rawCover || '1790700033242-teliy6.jpg'}`
                const isLiked = likedBookIds.includes(book.id)
                const isSaved = savedBookIds.includes(book.id)

                return (
                  <div key={book.id || book.title} style={{ background: '#0d1322', borderRadius: '14px', padding: '10px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    
                    {/* Top Quick Bookmark */}
                    <div onClick={() => handleToggleSave(book.id)} style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10, background: 'rgba(0,0,0,0.6)', borderRadius: '6px', padding: '4px 6px', cursor: 'pointer' }}>
                      <span style={{ fontSize: '12px' }}>{isSaved ? '🔖' : '🏷️'}</span>
                    </div>

                    {/* Book Cover */}
                    <div style={{ height: '210px', borderRadius: '8px', backgroundColor: '#161f33', backgroundImage: `url(${cover})`, backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: '8px' }} />
                    
                    {/* Title & Author */}
                    <h4 style={{ fontSize: '13px', fontWeight: '700', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.title}</h4>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 6px' }}>{book.author || 'Readora'}</p>
                    
                    {/* Category Tag */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ background: 'rgba(56,189,248,0.12)', color: '#38bdf8', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>{book.category || 'Music'}</span>
                    </div>

                    {/* Like & Save Buttons Bar */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                      <button 
                        onClick={() => handleToggleLike(book.id)}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          background: isLiked ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.04)',
                          color: isLiked ? '#ef4444' : '#94a3b8',
                          border: isLiked ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '6px',
                          padding: '6px 0',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}
                      >
                        <span>{isLiked ? '❤️' : '🤍'}</span>
                        <span>{isLiked ? 'Liked' : 'Like'}</span>
                      </button>

                      <button 
                        onClick={() => handleToggleSave(book.id)}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          background: isSaved ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.04)',
                          color: isSaved ? '#38bdf8' : '#94a3b8',
                          border: isSaved ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '6px',
                          padding: '6px 0',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}
                      >
                        <span>{isSaved ? '🔖' : '📥'}</span>
                        <span>{isSaved ? 'Saved' : 'Save'}</span>
                      </button>
                    </div>

                    {/* Action Buttons: Details + Read */}
                    <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
                      <button onClick={() => setSelectedBookForDetails(book)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)', padding: '6px 0', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>Details</button>
                      <button onClick={() => handleRead(book)} style={{ flex: 1.4, background: '#2563eb', color: '#fff', border: 'none', padding: '6px 0', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>📖 Read</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* Book Details Modal */}
      {selectedBookForDetails && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#0d1322', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '360px', color: '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Book Details</h3>
              <button onClick={() => setSelectedBookForDetails(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>
            <p style={{ margin: '0 0 6px', fontWeight: 'bold', fontSize: '14px', color: '#38bdf8' }}>{selectedBookForDetails.title}</p>
            <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#94a3b8' }}>Author: {selectedBookForDetails.author || 'Readora'}</p>
            <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#cbd5e1', lineHeight: 1.5 }}>
        
