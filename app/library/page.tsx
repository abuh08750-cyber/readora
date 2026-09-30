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
  const [details, setDetails] = useState<any>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
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
    } catch {}

    async function load() {
      const { data } = await supabase.from('books').select('*')
      if (data && data.length > 0) setBooks(data)
      else setBooks([{
        id: 'dfb9528e-8466-4c5f-aeab-0329ae420bf1',
        title: 'ZERO SE ARTIST part 1',
        author: 'TIGER SOUL',
        category: 'Music',
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

  const openBook = async (b: any) => {
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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setShowUserMenu(false)
    setShowSettings(false)
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
            <div onClick={() => setShowSettings(true)} style={{ padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', color: '#94a3b8' }}>⚙️ Settings</div>
          </nav>
        </div>
        <div style={{ background: '#0d1322', padding: '10px', borderRadius: '8px', fontSize: '11px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <b>Better Books</b><br /><span style={{ color: '#38bdf8' }}>📖 Readora</span>
        </div>
      </aside>

      {/* Main Panel */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* Header Bar */}
        <header style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 100 }}>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>
            {tab === 'all' ? 'Book Collection' : tab === 'mybooks' ? 'My Saved Shelf' : tab === 'recent' ? 'Recently Read' : 'Liked Books'}
          </span>
          
          {/* User Button */}
          <div style={{ position: 'relative' }}>
            <button 
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#2563eb', color: '#fff', border: '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', outline: 'none' }}
            >
              {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </button>

            {/* Dropdown Popup */}
            {showUserMenu && (
              <div style={{ position: 'absolute', right: 0, top: '42px', background: '#0e1628', border: '1px solid #1e293b', borderRadius: '10px', padding: '12px', minWidth: '170px', boxShadow: '0 12px 30px rgba(0,0,0,0.8)', zIndex: 999 }}>
                <p style={{ margin: '0 0 6px', fontSize: '11px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email || 'Guest User'}
                </p>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '6px 0' }} />
                <button onClick={() => { setShowSettings(true); setShowUserMenu(false); }} style={{ width: '100%', background: 'none', border: 'none', color: '#f8fafc', textAlign: 'left', padding: '6px 0', fontSize: '12px', cursor: 'pointer' }}>⚙️ Settings</button>
                {user ? (
                  <button onClick={handleLogout} style={{ width: '100%', background: 'none', border: 'none', color: '#ef4444', textAlign: 'left', padding: '6px 0', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>🚪 Logout</button>
                ) : (
                  <button onClick={() => window.location.href = '/'} style={{ width: '100%', background: 'none', border: 'none', color: '#38bdf8', textAlign: 'left', padding: '6px 0', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>🔑 Sign In</button>
                )}
              </div>
            )}
          </div>
        </header>

        <div style={{ padding: '16px 20px 40px', overflowY: 'auto' }}>
          {/* Banner */}
          <div style={{ padding: '24px 20px', borderRadius: '14px', background: "linear-gradient(to right, #090e1a 45%, rgba(9,14,26,0.85) 75%), url('https://images.unsplash.com/photo-1507842229451-7f01be7ff6ab?w=1000&auto=format&fit=crop&q=80')", backgroundSize: 'cover', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '16px' }}>
            <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: '800' }}>
              {tab === 'recent' ? 'RECENT' : tab === 'mybooks' ? 'SAVED' : tab === 'favorites' ? 'LIKED' : 'LIBRARY'}
            </span>
            <h2 style={{ margin: '4px 0', fontSize: '22px' }}>
              {tab === 'recent' ? 'Recently Read Books' : tab === 'mybooks' ? 'Saved Shelf' : tab === 'favorites' ? 'Liked Books' : 'Your Collection'}
            </h2>
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

          {/* Grid */}
          {loading ? (
            <p style={{ color: '#64748b', fontSize: '12px' }}>Loading books...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '14px' }}>
              {filtered.map((b) => {
                const cover = (b.cover_path || b.cover_url)?.startsWith('http') ? (b.cover_path || b.cover_url) : `https://stuabcdisgmmxprapfai.supabase.co/storage/v1/object/public/covers/${b.cover_path || '1790700033242-teliy6.jpg'}`
                const isLiked = likes.includes(b.id)
                const isSaved = saves.includes(b.id)

                return (
                  <div key={b.id} style={{ background: '#0d1322', borderRadius: '12px', padding: '10px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: '200px', borderRadius: '8px', backgroundImage: `url(${cover})`, backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: '8px' }} />
                    <h4 style={{ fontSize: '13px', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.title}</h4>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 8px' }}>{b.author || 'Readora'}</p>

                    {/* Like & Save Row */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                      <button onClick={() => toggleLike(b.id)} style={{ flex: 1, background: isLiked ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.04)', color: isLiked ? '#ef4444' : '#94a3b8', border: 'none', borderRadius: '6px', padding: '5px 0', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>
                        {isLiked ? '❤️ Liked' : '🤍 Like'}
                      </button>
                      <button onClick={() => toggleSave(b.id)} style={{ flex: 1, background: isSaved ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.04)', color: isSaved ? '#38bdf8' : '#94a3b8', border: 'none', borderRadius: '6px', padding: '5px 0', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>
                        {isSaved ? '🔖 Saved' : '📥 Save'}
                      </button>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
                      <button onClick={() => setDetails(b)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '6px 0', fontSize: '11px', cursor: 'pointer' }}>Details</button>
                      <button onClick={() => openBook(b)} style={{ flex: 1.3, background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 0', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>📖 Read</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* Details Popup */}
      {details && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: '#0d1322', border: '1px solid #1e293b', borderRadius: '12px', padding: '18px', maxWidth: '320px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <b style={{ color: '#38bdf8' }}>{details.title}</b>
              <button onClick={() => setDetails(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>✕</button>
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 12px' }}>Author: {details.author || 'Readora'}</p>
            <p style={{ fontSize: '12px', color: '#cbd5e1', margin: '0 0 16px' }}>{details.description || 'Start reading this amazing book now on Readora.'}</p>
            <button onClick={() => { const b = details; setDetails(null); openBook(b); }} style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Read Now</button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: '#0d1322', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', maxWidth: '320px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <b style={{ fontSize: '15px' }}>App Settings</b>
              <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '16px', cursor: 'pointer' }}>✕</button>
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 6px' }}>User: {user?.email || 'Guest'}</p>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 16px' }}>Theme: Dark Luxury (Default)</p>
            {user && (
              <button onClick={handleLogout} style={{ width: '100%', background: '#dc2626', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
    }
      
