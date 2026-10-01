'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://stuabcdisgmmxprapfai.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0dWFiY2Rpc2dtbXhwcmFwZmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1Njc1NjksImV4cCI6MjEwNjE0MzU2OX0.pGvaQQBWGcbDKgDb_9F1jkUURVXH3bhJ-trQt-GXBZ8'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})

interface Book {
  id: string
  title: string
  author: string
  category: string
  cover_url?: string
  views?: number
  rating?: number
  read_url?: string
}

const SAMPLE_BOOKS: Book[] = [
  {
    id: '1',
    title: 'ZERO SE ARTIST part 1',
    author: 'TIGER SOUL',
    category: 'Music',
    cover_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
    views: 0,
    rating: 0,
  }
]

export default function LibraryPage() {
  const [user, setUser] = useState<any>(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [selectedTab, setSelectedTab] = useState('All Books')
  const [searchQuery, setSearchQuery] = useState('')
  const [headerAvatar, setHeaderAvatar] = useState<string | null>(null)

  // Auth Guard & Dynamic Profile Setup
  useEffect(() => {
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        window.location.replace('/?auth=required')
      } else {
        setUser(session.user)
        const meta = session.user.user_metadata || {}
        const storedAvatar = localStorage.getItem(`readora_profile_avatar_${session.user.id}`)
        setHeaderAvatar(storedAvatar || meta.avatar_url || meta.picture || null)
        setAuthChecking(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Agar user check ho raha hai ya login nahi hai toh content hide rakhein
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

  // Dynamic Avatar Initial (Hardcoded 'W' ko replace kiya)
  const avatarChar = user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() ||
    user?.user_metadata?.name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    'R'

  const categories = ['All Books', 'Music', 'Self Help', 'Business', 'Technology', 'Fiction', 'Writing']

  const filteredBooks = SAMPLE_BOOKS.filter((b) => {
    const matchesCat = selectedTab === 'All Books' || b.category.toLowerCase() === selectedTab.toLowerCase()
    const matchesQuery = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCat && matchesQuery
  })

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#070b14',
      color: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Left Sidebar Navigation */}
      <aside style={{
        width: '220px',
        background: '#070b14',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        padding: '20px 14px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div>
          <div
            onClick={() => window.location.href = '/'}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '19px', fontWeight: '800', marginBottom: '26px', cursor: 'pointer' }}
          >
            <span>📖</span><span>Readora</span>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '13px' }}>
            <div onClick={() => window.location.href = '/'} style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: '#94a3b8' }}>
              🏠 Home
            </div>
            <div style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: '#fff', background: '#1d4ed8', fontWeight: 'bold' }}>
              📖 Library
            </div>
            <div onClick={() => window.location.href = '/#categories-section'} style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: '#94a3b8' }}>
              🗂 Categories
            </div>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />
            <div style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: '#94a3b8' }}>
              📑 My Books (0)
            </div>
            <div style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: '#94a3b8' }}>
              🕒 Recently Read (1)
            </div>
            <div style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: '#94a3b8' }}>
              🤍 Liked (0)
            </div>
            <div onClick={() => window.location.href = '/settings'} style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: '#94a3b8' }}>
              ⚙️ Settings
            </div>
          </nav>
        </div>

        <div style={{ background: '#0b1120', padding: '12px', borderRadius: '12px', fontSize: '11px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ margin: '0 0 4px', fontWeight: '700' }}>Better Books<br />Bigger Dreams</p>
          <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>📖 Readora</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
        {/* Top Header */}
        <header style={{
          padding: '14px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          background: 'rgba(7, 11, 20, 0.95)',
          backdropFilter: 'blur(12px)',
          zIndex: 50
        }}>
          <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>Book Collection</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: '#94a3b8', cursor: 'pointer', fontSize: '16px' }}>🔔</span>
            <div
              onClick={() => window.location.href = '/settings'}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: '#1d4ed8',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '13px',
                cursor: 'pointer',
                backgroundImage: headerAvatar ? `url(${headerAvatar})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '2px solid rgba(255,255,255,0.1)'
              }}
            >
              {!headerAvatar && avatarChar}
            </div>
          </div>
        </header>

        {/* Library Body */}
        <div style={{ padding: '28px', maxWidth: '1200px', width: '100%', boxSizing: 'border-box' }}>
          <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '700', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            LIBRARY
          </span>
          <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '4px 0 2px' }}>Your Collection</h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 20px' }}>Explore, read and grow with curated books.</p>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '24px' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedTab(cat)}
                style={{
                  background: selectedTab === cat ? '#2563eb' : '#0b1120',
                  color: selectedTab === cat ? '#fff' : '#94a3b8',
                  border: selectedTab === cat ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '20px',
                  padding: '7px 16px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: '0.2s'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Books Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                style={{
                  background: '#0b1120',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  maxWidth: '220px'
                }}
              >
                <div style={{
                  height: '240px',
                  borderRadius: '10px',
                  background: '#070b14',
                  backgroundImage: book.cover_url ? `url(${book.cover_url})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  marginBottom: '12px',
                  border: '1px solid rgba(255,255,255,0.05)'
                }} />

                <b style={{ fontSize: '13px', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {book.title}
                </b>
                <span style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 8px' }}>{book.author}</span>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b', marginBottom: '12px' }}>
                  <span>👁 {book.views || 0} views</span>
                  <span>★ {book.rating || 0} (0)</span>
                </div>

                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                  <button type="button" style={{ flex: 1, background: '#070b14', border: '1px solid rgba(255,255,255,0.08)', color: '#cbd5e1', padding: '6px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>
                    🤍 Like
                  </button>
                  <button type="button" style={{ flex: 1, background: '#070b14', border: '1px solid rgba(255,255,255,0.08)', color: '#cbd5e1', padding: '6px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>
                    Save
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button type="button" style={{ flex: 1, background: '#070b14', border: '1px solid rgba(255,255,255,0.08)', color: '#cbd5e1', padding: '7px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>
                    ⭐ Review
                  </button>
                  <button
                    type="button"
                    onClick={() => alert(`Opening ${book.title}...`)}
                    style={{ flex: 1.2, background: '#2563eb', border: 'none', color: '#fff', padding: '7px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    📖 Read
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
        }
