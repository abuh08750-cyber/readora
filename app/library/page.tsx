'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import NotificationDropdown from '@/components/NotificationDropdown'

const SUPABASE_URL = 'https://stuabcdisgmmxprapfai.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0dWFiY2Rpc2dtbXhwcmFwZmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1Njc1NjksImV4cCI6MjEwNjE0MzU2OX0.pGvaQQBWGcbDKgDb_9F1jkUURVXH3bhJ-trQt-GXBZ8'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})

const categories = ['All Books', 'Music', 'Self Help', 'Business', 'Technology', 'Fiction', 'Writing']

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

export default function LibraryPage() {
  const [books, setBooks] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [cat, setCat] = useState('All Books')
  const [tab, setTab] = useState<'all' | 'mybooks' | 'recent' | 'favorites'>('all')
  const [likes, setLikes] = useState<string[]>([])
  const [saves, setSaves] = useState<string[]>([])
  const [recent, setRecent] = useState<string[]>([])

  // Global Theme
  const [themeMode, setThemeMode] = useState<'Dark' | 'Light' | 'Sepia' | 'Custom'>('Dark')
  const [customColor, setCustomColor] = useState('#6366f1')
  const [headerAvatar, setHeaderAvatar] = useState<string | null>(null)

  // Views & Reviews
  const [viewsMap, setViewsMap] = useState<Record<string, number>>({})
  const [reviewsMap, setReviewsMap] = useState<Record<string, any[]>>({})
  const [activeReviewBook, setActiveReviewBook] = useState<any>(null)
  const [inputRating, setInputRating] = useState(5)
  const [inputComment, setInputComment] = useState('')

  const [reader, setReader] = useState<{ url: string; title: string; html: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Auth Verification
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        window.location.replace('/?auth=required')
        return
      }
      setUser(session.user)
      const meta = session.user.user_metadata || {}
      const storedAvatar = localStorage.getItem(`readora_profile_avatar_${session.user.id}`)
      setHeaderAvatar(storedAvatar || meta.avatar_url || meta.picture || null)
      setAuthChecking(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        window.location.replace('/?auth=required')
      } else {
        setUser(session.user)
        const meta = session.user.user_metadata || {}
        const storedAvatar = localStorage.getItem(`readora_profile_avatar_${session.user.id}`)
        setHeaderAvatar(storedAvatar || meta.avatar_url || meta.picture || null)
        setAuthChecking(false)
      }
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

      const savedTheme = localStorage.getItem('readora_app_theme') as any
      if (savedTheme) setThemeMode(savedTheme)
      const savedColor = localStorage.getItem('readora_custom_color')
      if (savedColor) setCustomColor(savedColor)
    } catch {}

    async function load() {
      const { data } = await supabase.from('books').select('*')
      if (data && data.length > 0) {
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
      setLoading(false)
    }

    load()
    return () => subscription.unsubscribe()
  }, [])

  if (authChecking) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#070b14',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94a3b8',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        Verifying account access...
      </div>
    )
           }

  const styles = (() => {
    if (themeMode === 'Light') {
      return {
        bg: '#f8fafc',
        sidebar: '#ffffff',
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
        sidebar: '#f4e4c1',
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
        sidebar: `rgba(${Math.floor(r * 0.08)}, ${Math.floor(g * 0.08)}, ${Math.floor(b * 0.08)}, 0.95)`,
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
      bg: '#070b14',
      sidebar: '#070b14',
      header: '#070b14',
      card: '#0b1120',
      inner: '#070b14',
      text: '#f8fafc',
      muted: '#94a3b8',
      border: 'rgba(255,255,255,0.06)',
      nav: '#1d4ed8',
      accent: '#38bdf8',
    }
  })()

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

  const openBook = async (b: any) => {
    const currentViews = (viewsMap[b.id] || 0) + 1
    const nextViews = { ...viewsMap, [b.id]: currentViews }
    setViewsMap(nextViews)
    try { localStorage.setItem('rd_views', JSON.stringify(nextViews)) } catch {}

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

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeReviewBook) return
    const bookId = activeReviewBook.id
    const newEntry = {
      id: Date.now().toString(),
      user: user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'Guest Reader'),
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

  // Dynamic Avatar Initial
  const avatarChar = user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() ||
    user?.user_metadata?.name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    'R'

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
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: styles.bg,
      color: styles.text,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      transition: 'all 0.25s ease'
    }}>
      
      {/* Sidebar Navigation */}
      <aside style={{
        width: '200px',
        background: styles.sidebar,
        borderRight: `1px solid ${styles.border}`,
        padding: '20px 12px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div>
          <div onClick={() => window.location.href = '/'} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '18px', fontWeight: '800', marginBottom: '24px', cursor: 'pointer' }}>
            <span>📖</span><span>Readora</span>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
            <div onClick={() => window.location.href = '/'} style={{ padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', color: styles.muted }}>🏠 Home</div>
            <div onClick={() => { setTab('all'); setCat('All Books'); }} style={{ padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', color: '#fff', background: styles.nav, fontWeight: 'bold' }}>📖 Library</div>
            <div onClick={() => setTab('mybooks')} style={{ padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', color: tab === 'mybooks' ? '#fff' : styles.muted, background: tab === 'mybooks' ? styles.nav : 'transparent' }}>📑 My Books ({saves.length})</div>
            <div onClick={() => setTab('recent')} style={{ padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', color: tab === 'recent' ? '#fff' : styles.muted, background: tab === 'recent' ? styles.nav : 'transparent' }}>🕒 Recently Read ({recent.length})</div>
            <div onClick={() => setTab('favorites')} style={{ padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', color: tab === 'favorites' ? '#fff' : styles.muted, background: tab === 'favorites' ? styles.nav : 'transparent' }}>❤️ Liked ({likes.length})</div>
            <div onClick={() => window.location.href = '/settings'} style={{ padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', color: styles.muted }}>⚙️ Settings</div>
          </nav>
        </div>
        <div style={{ background: styles.inner, padding: '10px', borderRadius: '8px', fontSize: '11px', border: `1px solid ${styles.border}` }}>
          <b>Better Books</b><br /><span style={{ color: styles.accent }}>📖 Readora</span>
        </div>
      </aside>

      {/* Main Panel */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{
          padding: '12px 20px',
          borderBottom: `1px solid ${styles.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          background: styles.header,
          backdropFilter: 'blur(10px)',
          zIndex: 30
        }}>
          <span style={{ fontSize: '13px', color: styles.muted }}>
            {tab === 'all' ? 'Book Collection' : tab === 'mybooks' ? 'My Saved Shelf' : tab === 'recent' ? 'Recently Read' : 'Liked Books'}
          </span>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <NotificationDropdown />
            <button
              type="button"
              onClick={() => window.location.href = '/settings'}
              style={{
                width: '32px',
                height: '32px',
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
                backgroundPosition: 'center'
              }}
              title="Profile & Settings"
            >
              {!headerAvatar && avatarChar}
            </button>
          </div>
        </header>

        <div style={{ padding: '16px 20px 40px', overflowY: 'auto' }}>
          {/* Banner */}
          <div style={{
            padding: '24px 20px',
            borderRadius: '14px',
            background: "linear-gradient(to right, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.6) 75%), url('https://images.unsplash.com/photo-1507842229451-7f01be7ff6ab?w=1000&auto=format&fit=crop&q=80')",
            backgroundSize: 'cover',
            border: `1px solid ${styles.border}`,
            marginBottom: '16px'
          }}>
            <span style={{ fontSize: '10px', color: styles.accent, fontWeight: '800' }}>LIBRARY</span>
            <h2 style={{ margin: '4px 0', fontSize: '22px', color: '#fff' }}>Your Collection</h2>
            <p style={{ margin: 0, color: '#cbd5e1', fontSize: '12px' }}>Explore, read and grow with curated books.</p>
          </div>

          {/* Filter Bar */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '4px' }}>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                style={{
                  background: cat === c ? styles.nav : styles.card,
                  color: cat === c ? '#fff' : styles.muted,
                  border: `1px solid ${styles.border}`,
                  borderRadius: '14px',
                  padding: '5px 12px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Books Grid */}
          {loading ? (
            <p style={{ color: styles.muted, fontSize: '12px' }}>Loading books...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px' }}>
              {filtered.map((b) => {
                const cover = (b.cover_path || b.cover_url)?.startsWith('http') ? (b.cover_path || b.cover_url) : `https://stuabcdisgmmxprapfai.supabase.co/storage/v1/object/public/covers/${b.cover_path || '1790700033242-teliy6.jpg'}`
                const isLiked = likes.includes(b.id)
                const isSaved = saves.includes(b.id)
                const views = viewsMap[b.id] || 0
                const stats = getBookRatingStats(b.id)

                return (
                  <div key={b.id} style={{
                    background: styles.card,
                    borderRadius: '12px',
                    padding: '10px',
                    border: `1px solid ${styles.border}`,
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ height: '200px', borderRadius: '8px', backgroundImage: `url(${cover})`, backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: '8px' }} />
                    
                    <h4 style={{ fontSize: '13px', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: styles.text }}>{b.title}</h4>
                    <p style={{ fontSize: '11px', color: styles.muted, margin: '0 0 6px' }}>{b.author || 'Readora'}</p>

                    {/* Views & Badges */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', marginBottom: '8px', background: styles.inner, padding: '4px 6px', borderRadius: '6px' }}>
                      <span style={{ color: styles.accent, fontWeight: 'bold' }}>👁️ {views} views</span>
                      <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>⭐ {stats.avg} ({stats.count})</span>
                    </div>

                    {/* Like & Save Row */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                      <button onClick={() => toggleLike(b.id)} style={{ flex: 1, background: isLiked ? 'rgba(239,68,68,0.2)' : styles.inner, color: isLiked ? '#ef4444' : styles.muted, border: `1px solid ${styles.border}`, borderRadius: '6px', padding: '5px 0', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>
                        {isLiked ? '❤️ Liked' : '🤍 Like'}
                      </button>
                      <button onClick={() => toggleSave(b.id)} style={{ flex: 1, background: isSaved ? 'rgba(56,189,248,0.2)' : styles.inner, color: isSaved ? styles.accent : styles.muted, border: `1px solid ${styles.border}`, borderRadius: '6px', padding: '5px 0', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>
                        {isSaved ? '🔖 Saved' : '📥 Save'}
                      </button>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
                      <button onClick={() => setActiveReviewBook(b)} style={{ flex: 1, background: styles.inner, color: styles.muted, border: `1px solid ${styles.border}`, borderRadius: '6px', padding: '6px 0', fontSize: '11px', cursor: 'pointer' }}>⭐ Review</button>
                      <button onClick={() => openBook(b)} style={{ flex: 1.3, background: styles.nav, color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 0', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>📖 Read</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* Star Rating Modal */}
      {activeReviewBook && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: styles.card, border: `1px solid ${styles.border}`, borderRadius: '14px', padding: '20px', maxWidth: '340px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <b style={{ color: styles.accent, fontSize: '14px' }}>Review & Ratings</b>
              <button onClick={() => setActiveReviewBook(null)} style={{ background: 'none', border: 'none', color: styles.muted, fontSize: '16px', cursor: 'pointer' }}>✕</button>
            </div>

            <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 'bold', color: styles.text }}>{activeReviewBook.title}</p>

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
                style={{ width: '100%', background: styles.inner, border: `1px solid ${styles.border}`, borderRadius: '8px', padding: '8px 10px', color: styles.text, fontSize: '12px', outline: 'none', boxSizing: 'border-box', marginBottom: '8px' }}
              />
              <button type="submit" style={{ width: '100%', background: styles.nav, color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>
                Submit Review
              </button>
            </form>

            <div style={{ borderTop: `1px solid ${styles.border}`, paddingTop: '12px' }}>
              <h5 style={{ margin: '0 0 8px', fontSize: '12px', color: styles.muted }}>User Reviews ({(reviewsMap[activeReviewBook.id] || []).length})</h5>
              {(reviewsMap[activeReviewBook.id] || []).length === 0 ? (
                <p style={{ fontSize: '11px', color: styles.muted }}>Abhi tak koi review nahi aaya.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(reviewsMap[activeReviewBook.id] || []).map((rev) => (
                    <div key={rev.id} style={{ background: styles.inner, padding: '8px', borderRadius: '6px', border: `1px solid ${styles.border}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                        <b style={{ color: styles.accent }}>{rev.user}</b>
                        <span style={{ color: '#fbbf24' }}>{'★'.repeat(rev.rating)}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '11px', color: styles.text }}>{rev.comment}</p>
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
