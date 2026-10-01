'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://stuabcdisgmmxprapfai.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0dWFiY2Rpc2dtbXhwcmFwZmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1Njc1NjksImV4cCI6MjEwNjE0MzU2OX0.pGvaQQBWGcbDKgDb_9F1jkUURVXH3bhJ-trQt-GXBZ8'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})

const categories = ['All Books', 'Music', 'Self Help', 'Business', 'Technology', 'Fiction', 'Writing']

export default function LibraryPage() {
  const [books, setBooks] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [cat, setCat] = useState('All Books')
  const [tab, setTab] = useState<'all' | 'mybooks' | 'recent' | 'favorites'>('all')
  const [likes, setLikes] = useState<string[]>([])
  const [saves, setSaves] = useState<string[]>([])
  const [recent, setRecent] = useState<string[]>([])
  
  // Views & Reviews State
  const [viewsMap, setViewsMap] = useState<Record<string, number>>({})
  const [reviewsMap, setReviewsMap] = useState<Record<string, any[]>>({})
  const [activeReviewBook, setActiveReviewBook] = useState<any>(null)
  const [inputRating, setInputRating] = useState(5)
  const [inputComment, setInputComment] = useState('')

  const [reader, setReader] = useState<{ url: string; title: string; html: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user || null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    try {
      const l = localStorage.getItem('rd_likes')
      if (l) setLikes(JSON.parse(l))
      const s = localStorage.getItem('rd_saves')
      if (s) setSaves(JSON.parse(s))
      const r = localStorage.getItem('rd_recent')
      if (r) setRecent(JSON.parse(r))
      const v = localStorage.getItem('rd_views')
      if (v) setViewsMap(JSON.parse(v))
      const rev = localStorage.getItem('rd_reviews')
      if (rev) setReviewsMap(JSON.parse(rev))
    } catch {}

    async function load() {
      const { data } = await supabase.from('books').select('*')
      if (data && data.length > 0) setBooks(data)
      else setBooks([{
        id: 'dfb9528e-8466-4c5f-aeab-0329ae420bf1',
        title: 'ZERO SE ARTIST part 1',
        author: 'TIGER SOUL',
        category: 'Music',
        description: 'Artist banne ki shuruat - apni pehchan banao, apna sound dhoondo, apna safar shuru karo.',
        cover_path: 'https://stuabcdisgmmxprapfai.supabase.co/storage/v1/object/public/covers/1790700033242-teliy6.jpg',
        file_path: 'https://stuabcdisgmmxprapfai.supabase.co/storage/v1/object/public/ebooks/1790700034105-biegrb.html',
      }])
      setLoading(false)
    }
    load()
    return () => subscription.unsubscribe()
  }, [])

  const toggleLike = (id: string) => {
    const next = likes.includes(id) ? likes.filter(x => x !== id) : [...likes, id]
    setLikes(next)
    try { localStorage.setItem('rd_likes', JSON.stringify(next)) } catch {}
  }

  const toggleSave = (id: string) => {
    const next = saves.includes(id) ? saves.filter(x => x !== id) : [...saves, id]
    setSaves(next)
    try { localStorage.setItem('rd_saves', JSON.stringify(next)) } catch {}
  }

  // Open Reader and Increment Views
  const openBook = async (b: any) => {
    // 1. Update Views
    const currentViews = (viewsMap[b.id] || 0) + 1
    const nextViews = { ...viewsMap, [b.id]: currentViews }
    setViewsMap(nextViews)
    try { localStorage.setItem('rd_views', JSON.stringify(nextViews)) } catch {}

    // 2. Update Recent
    const updatedRecent = [b.id, ...recent.filter(id => id !== b.id)]
    setRecent(updatedRecent)
    try { localStorage.setItem('rd_recent', JSON.stringify(updatedRecent)) } catch {}

    const raw = b.file_path || b.file_url || 'https://stuabcdisgmmxprapfai.supabase.co/storage/v1/object/public/ebooks/1790700034105-biegrb.html'
    const full = raw.startsWith('http') ? raw : `https://stuabcdisgmmxprapfai.supabase.co/storage/v1/object/public/ebooks/${raw}`
    if (full.includes('.html')) {
      try {
        const res = await fetch(full)
        const text = await res.text()
        setReader({ url: full, title: b.title, html: text })
      } catch { window.open(full, '_blank') }
    } else { window.open(full, '_blank') }
  }

  // Submit Review Handler
  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeReviewBook) return
    const bookId = activeReviewBook.id
    const newEntry = {
      id: Date.now().toString(),
      user: user?.email ? user.email.split('@')[0] : 'Guest Reader',
      rating: inputRating,
      comment: inputComment || 'Bahut badhiya kitaab!',
      date: new Date().toLocaleDateString(),
    }
    const currentList = reviewsMap[bookId] || []
    const updated = [newEntry, ...currentList]
    const nextReviews = { ...reviewsMap, [bookId]: updated }
    setReviewsMap(nextReviews)
    try { localStorage.setItem('rd_reviews', JSON.stringify(nextReviews)) } catch {}
    setInputComment('')
  }

  const getBookRatingStats = (bookId: string) => {
    const list = reviewsMap[bookId] || []
    if (list.length === 0) return { avg: 5.0, count: 0 }
    const sum = list.reduce((acc, curr) => acc + curr.rating, 0)
    return { avg: (sum / list.length).toFixed(1), count: list.length }
  }

  const filtered = books.filter(b => {
    const matchCat = cat === 'All Books' || b.category?.toLowerCase() === cat.toLowerCase()
    const matchTab = tab === 'all' 
      || (tab === 'mybooks' && saves.includes(b.id)) 
      || (tab === 'favorites' && likes.includes(b.id))
      || (tab === 'recent' && recent.includes(b.id))
    return matchCat && matchTab
  })

  if (reader) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#0B0F17', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 18px', background: '#090d16', borderBottom: '1px solid #1e293b' }}>
          <span style={{ color: '#fff', fontWeight: 'bold' }}>📖 {reader.title}</span>
          <button onClick={() => setReader(null)} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>✕ Close</button>
        </div>
        <iframe srcDoc={reader.html} style={{ width: '100%', flex: 1, border: 'none' }} title={reader.title} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#070b14', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Sidebar Navigation */}
      <aside style={{ width: '200px', background: '#070b14', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '20px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div onClick={() => window.location.href = '/'} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '18px', fontWeight: '800', marginBottom: '24px', cursor: 'pointer' }}>
            <span>📖</span><span>Readora</span>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
            <div onClick={() => window.location.href = '/'} style={{ padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', color: '#94a3b8' }}>🏠 Home</div>
            <div onClick={() => { setTab('all'); setCat('All Books'); }} style={{ padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', color: '#fff', background: tab === 'all' ? '#1d4ed8' : 'transparent', fontWeight: 'bold' }}>📖 Library</div>
            <div onClick={() => setTab('mybooks')} style={{ padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', color: tab === 'mybooks' ? '#fff' : '#94a3b8', background: tab === 'mybooks' ? '#1d4ed8' : 'transparent' }}>📑 My Books ({saves.length})</div>
            <div onClick={() => setTab('recent')} style={{ padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', color: tab === 'recent' ? '#fff' : '#94a3b8', background: tab === 'recent' ? '#1d4ed8' : 'transparent' }}>🕒 Recently Read ({recent.length})</div>
            <div onClick={() => setTab('favorites')} style={{ padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', color: tab === 'favorites' ? '#fff' : '#94a3b8', background: tab === 'favorites' ? '#1d4ed8' : 'transparent' }}>❤️ Liked ({likes.length})</div>
          </nav>
        </div>
        <div style={{ background: '#0d1322', padding: '10px', borderRadius: '8px', fontSize: '11px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <b>Better Books</b><br /><span style={{ color: '#38bdf8' }}>📖 Readora</span>
        </div>
      </aside>

      {/* Main Panel */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>
            {tab === 'all' ? 'Book Collection' : tab === 'mybooks' ? 'My Saved Shelf' : tab === 'recent' ? 'Recently Read' : 'Liked Books'}
          </span>
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>
            {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
          </div>
        </header>

        <div style={{ padding: '16px 20px 40px', overflowY: 'auto' }}>
          {/* Banner */}
          <div style={{ padding: '24px 20px', borderRadius: '14px', background: "linear-gradient(to right, #090e1a 45%, rgba(9,14,26,0.85) 75%), url('https://images.unsplash.com/photo-1507842229451-7f01be7ff6ab?w=1000&auto=format&fit=crop&q=80')", backgroundSize: 'cover', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '16px' }}>
            <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: '800' }}>LIBRARY</span>
            <h2 style={{ margin: '4px 0', fontSize: '22px' }}>Your Collection</h2>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>Explore, read and grow with curated books.</p>
          </div>

          {/* Filter Bar */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '4px' }}>
            {categories.map((c) => (
              <button key={c} onClick={() => setCat(c)} style={{ background: cat === c ? '#2563eb' : '#0d1322', color: cat === c ? '#fff' : '#94a3b8', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '5px 12px', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {c}
              </button>
            ))}
          </div>

          {/* Books Grid */}
          {loading ? (
            <p style={{ color: '#64748b', fontSize: '12px' }}>Loading books...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px' }}>
              {filtered.map((b) => {
                const cover = (b.cover_path || b.cover_url)?.startsWith('http') ? (b.cover_path || b.cover_url) : `https://stuabcdisgmmxprapfai.supabase.co/storage/v1/object/public/covers/${b.cover_path || '1790700033242-teliy6.jpg'}`
                const isLiked = likes.includes(b.id)
                const isSaved = saves.includes(b.id)
                const views = viewsMap[b.id] || 0
                const stats = getBookRatingStats(b.id)

                return (
                  <div key={b.id} style={{ background: '#0d1322', borderRadius: '12px', padding: '10px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: '200px', borderRadius: '8px', backgroundImage: `url(${cover})`, backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: '8px' }} />
                    
                    <h4 style={{ fontSize: '13px', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.title}</h4>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 6px' }}>{b.author || 'Readora'}</p>

                    {/* Views & Star Rating Badges */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', marginBottom: '8px', background: 'rgba(255,255,255,0.03)', padding: '4px 6px', borderRadius: '6px' }}>
                      <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>👁️ {views} views</span>
                      <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>⭐ {stats.avg} ({stats.count})</span>
                    </div>

                    {/* Like & Save Row */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                      <button onClick={() => toggleLike(b.id)} style={{ flex: 1, background: isLiked ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.04)', color: isLiked ? '#ef4444' : '#94a3b8', border: 'none', borderRadius: '6px', padding: '5px 0', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>
                        {isLiked ? '❤️ Liked' : '🤍 Like'}
                      </button>
                      <button onClick={() => toggleSave(b.id)} style={{ flex: 1, background: isSaved ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.04)', color: isSaved ? '#38bdf8' : '#94a3b8', border: 'none', borderRadius: '6px', padding: '5px 0', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>
                        {isSaved ? '🔖 Saved' : '📥 Save'}
                      </button>
                    </div>

                    {/* Actions: Review / Read */}
                    <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
                      <button onClick={() => setActiveReviewBook(b)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '6px 0', fontSize: '11px', cursor: 'pointer' }}>⭐ Review</button>
                      <button onClick={() => openBook(b)} style={{ flex: 1.3, background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 0', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>📖 Read</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* Star Rating & Review Modal */}
      {activeReviewBook && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: '#0d1322', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px', maxWidth: '340px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <b style={{ color: '#38bdf8', fontSize: '14px' }}>Review & Ratings</b>
              <button onClick={() => setActiveReviewBook(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '16px', cursor: 'pointer' }}>✕</button>
            </div>

            <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 'bold' }}>{activeReviewBook.title}</p>

            {/* Rating Stars Input */}
            <form onSubmit={handleAddReview} style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setInputRating(star)}
                    style={{ fontSize: '22px', cursor: 'pointer', color: star <= inputRating ? '#fbbf24' : '#475569' }}
                  >
                    ★
                  </span>
                ))}
                <span style={{ fontSize: '12px', color: '#fbbf24', marginLeft: '6px', alignSelf: 'center', fontWeight: 'bold' }}>{inputRating} / 5</span>
              </div>

              <input
                type="text"
                placeholder="Write your review..."
                value={inputComment}
                onChange={(e) => setInputComment(e.target.value)}
                style={{ width: '100%', background: '#080d1a', border: '1px solid #1e293b', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '12px', outline: 'none', boxSizing: 'border-box', marginBottom: '8px' }}
              />
              <button type="submit" style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>
                Submit Review
              </button>
            </form>

            {/* List of user reviews */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
              <h5 style={{ margin: '0 0 8px', fontSize: '12px', color: '#94a3b8' }}>User Reviews ({(reviewsMap[activeReviewBook.id] || []).length})</h5>
              {(reviewsMap[activeReviewBook.id] || []).length === 0 ? (
                <p style={{ fontSize: '11px', color: '#64748b' }}>Abhi tak koi review nahi aaya. Pehla review aap de sakte hain!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(reviewsMap[activeReviewBook.id] || []).map((rev) => (
                    <div key={rev.id} style={{ background: '#080d1a', padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                        <b style={{ color: '#38bdf8' }}>{rev.user}</b>
                        <span style={{ color: '#fbbf24' }}>{'★'.repeat(rev.rating)}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '11px', color: '#cbd5e1' }}>{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
    }
      
