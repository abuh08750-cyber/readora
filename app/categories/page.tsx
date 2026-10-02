'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import NotificationDropdown from '@/components/NotificationDropdown'

const SUPABASE_URL = 'https://stuabcdisgmmxprapfai.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0dWFiY2Rpc2dtbXhwcmFwZmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1Njc1NjksImV4cCI6MjEwNjE0MzU2OX0.pGvaQQBWGcbDKgDb_9F1jkUURVXH3bhJ-trQt-GXBZ8'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})

const categoriesData = [
  { name: 'Fiction', icon: '📕', group: 'Fiction' },
  { name: 'Non-Fiction', icon: '📖', group: 'Non-Fiction' },
  { name: 'Romance', icon: '❤️', group: 'Fiction' },
  { name: 'Mystery', icon: '🔍', group: 'Fiction' },
  { name: 'Thriller', icon: '🕵️', group: 'Fiction' },
  { name: 'Crime', icon: '🚧', group: 'Fiction' },
  { name: 'Horror', icon: '💀', group: 'Fiction' },
  { name: 'Fantasy', icon: '🐉', group: 'Fiction' },
  { name: 'Science Fiction', icon: '🪐', group: 'Science & Tech' },
  { name: 'Adventure', icon: '🏔️️', group: 'Fiction' },
  { name: 'Historical Fiction', icon: '🏰', group: 'Fiction' },
  { name: 'Historical', icon: '🏛️', group: 'Non-Fiction' },
  { name: 'Biography', icon: '👤', group: 'Non-Fiction' },
  { name: 'Autobiography', icon: '✍️', group: 'Non-Fiction' },
  { name: 'Memoir', icon: '📔', group: 'Non-Fiction' },
  { name: 'Self-Help', icon: '🌱', group: 'Health & Wellness' },
  { name: 'Personal Development', icon: '📈', group: 'Health & Wellness' },
  { name: 'Motivation', icon: '☀️', group: 'Health & Wellness' },
  { name: 'Psychology', icon: '🧠', group: 'Health & Wellness' },
  { name: 'Philosophy', icon: '🗿', group: 'Non-Fiction' },
  { name: 'Spirituality', icon: '🪷', group: 'Health & Wellness' },
  { name: 'Religion', icon: '🙏', group: 'Non-Fiction' },
  { name: 'Health & Wellness', icon: '❤️‍🩹', group: 'Health & Wellness' },
  { name: 'Fitness', icon: '🏋️', group: 'Health & Wellness' },
  { name: 'Nutrition', icon: '🥗', group: 'Health & Wellness' },
  { name: 'Business', icon: '💼', group: 'Business' },
  { name: 'Entrepreneurship', icon: '🚀', group: 'Business' },
  { name: 'Finance & Investing', icon: '🪙', group: 'Business' },
  { name: 'Economics', icon: '📊', group: 'Business' },
  { name: 'Marketing', icon: '📢', group: 'Business' },
  { name: 'Management', icon: '👥', group: 'Business' },
  { name: 'Technology', icon: '💻', group: 'Science & Tech' },
  { name: 'Programming & Coding', icon: '👨‍💻', group: 'Science & Tech' },
  { name: 'Artificial Intelligence', icon: '🤖', group: 'Science & Tech' },
  { name: 'Science', icon: '🔬', group: 'Science & Tech' },
  { name: 'Mathematics', icon: 'π', group: 'Science & Tech' },
  { name: 'Education', icon: '🎓', group: 'Non-Fiction' },
  { name: 'Study Guides', icon: '📚', group: 'Non-Fiction' },
  { name: 'Competitive Exams', icon: '🎯', group: 'Non-Fiction' },
  { name: 'Career & Jobs', icon: '👔', group: 'Business' },
  { name: 'Communication Skills', icon: '💬', group: 'Health & Wellness' },
  { name: 'Language Learning', icon: '🗣️', group: 'Non-Fiction' },
  { name: 'Literature', icon: '🪶', group: 'Fiction' },
  { name: 'Poetry', icon: '📜', group: 'Fiction' },
  { name: 'Short Stories', icon: '📑', group: 'Fiction' },
  { name: 'Essays', icon: '📄', group: 'Non-Fiction' },
  { name: 'Politics & Society', icon: '🏛️', group: 'Non-Fiction' },
  { name: 'Law', icon: '⚖️', group: 'Non-Fiction' },
  { name: 'Travel', icon: '✈️', group: 'Non-Fiction' },
  { name: 'Cooking & Food', icon: '🍳', group: 'Health & Wellness' },
  { name: 'Parenting & Family', icon: '👨‍👩‍👧', group: 'Health & Wellness' },
  { name: "Children's Books", icon: '🧸', group: 'Fiction' },
  { name: 'Young Adult', icon: '🧑', group: 'Fiction' },
  { name: 'Art & Design', icon: '🎨', group: 'Non-Fiction' },
  { name: 'Music', icon: '🎵', group: 'Non-Fiction' },
  { name: 'Photography', icon: '📷', group: 'Non-Fiction' },
  { name: 'Environment & Nature', icon: '🌿', group: 'Science & Tech' },
  { name: 'True Stories', icon: '📰', group: 'Non-Fiction' },
  { name: 'Productivity', icon: '✅', group: 'Health & Wellness' },
  { name: 'Indian Literature', icon: '🪷', group: 'Fiction' },
]

export default function CategoriesPage() {
  const [user, setUser] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('All')
  const [headerAvatar, setHeaderAvatar] = useState<string | null>(null)
  
  // Real database counts per category
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        const stored = localStorage.getItem(`readora_profile_avatar_${session.user.id}`)
        setHeaderAvatar(stored || session.user.user_metadata?.avatar_url || null)
      }
    })

    fetchLiveCategoryCounts()
  }, [])

  // Supabase se books fetch karke exact real count calculate karna
  async function fetchLiveCategoryCounts() {
    try {
      const { data, error } = await supabase.from('books').select('category')
      if (!error && data) {
        const counts: Record<string, number> = {}
        data.forEach((book: { category: string }) => {
          if (book.category) {
            const key = book.category.trim().toLowerCase()
            counts[key] = (counts[key] || 0) + 1
          }
        })
        setCategoryCounts(counts)
      }
    } catch {}
  }

  const groups = ['All', 'Fiction', 'Non-Fiction', 'Science & Tech', 'Business', 'Health & Wellness']

  const filteredCategories = categoriesData.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
    const matchGroup = selectedGroup === 'All' || item.group === selectedGroup
    return matchSearch && matchGroup
  })

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#050a15', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Sidebar Navigation */}
      <aside style={{ width: '220px', background: '#070d1d', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '20px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div onClick={() => window.location.href = '/'} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: '800', marginBottom: '24px', cursor: 'pointer' }}>
            <span>📖</span><span>Readora</span>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '13px' }}>
            <div onClick={() => window.location.href = '/'} style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: '#94a3b8' }}>🏠 Home</div>
            <div onClick={() => window.location.href = '/library'} style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: '#94a3b8' }}>📖 Library</div>
            <div style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: '#fff', background: '#2563eb', fontWeight: 'bold' }}>📁 Categories</div>
            <div onClick={() => window.location.href = '/library'} style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: '#94a3b8' }}>📑 My Books</div>
            <div onClick={() => window.location.href = '/settings'} style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: '#94a3b8' }}>⚙️ Settings</div>
          </nav>
        </div>

        <div style={{ background: '#0b1428', border: '1px solid rgba(56,189,248,0.15)', borderRadius: '12px', padding: '14px', fontSize: '11px' }}>
          <b style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>Read More. Grow More.</b>
          <span style={{ color: '#94a3b8' }}>Discover new worlds through books.</span>
        </div>
      </aside>

      {/* Main Container */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header */}
        <header style={{ padding: '14px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#070d1d', position: 'sticky', top: 0, zIndex: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#0a1329', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '6px 14px', width: '360px' }}>
            <span style={{ color: '#94a3b8', marginRight: '8px' }}>🔍</span>
            <input
              type="text"
              placeholder="Search for books, authors, or categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '12px', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <NotificationDropdown />
            <div onClick={() => window.location.href = '/settings'} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', cursor: 'pointer', backgroundImage: headerAvatar ? `url(${headerAvatar})` : 'none', backgroundSize: 'cover' }}>
              {!headerAvatar && (user?.email?.charAt(0).toUpperCase() || 'R')}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div style={{ padding: '28px 32px 60px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '24px', fontWeight: '800' }}>
                <span style={{ color: '#ec4899' }}>🏷️</span>
                <span>Categories</span>
              </div>
              <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '13px' }}>
                Explore books by your favorite categories. Find something new, read what you love.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', background: '#0a1329', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '6px 12px', width: '220px' }}>
              <span style={{ color: '#94a3b8', marginRight: '6px', fontSize: '12px' }}>🔍</span>
              <input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '12px', width: '100%' }}
              />
            </div>
          </div>

          {/* Group Filter Chips */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '24px', paddingBottom: '4px' }}>
            {groups.map((grp) => (
              <button
                key={grp}
                onClick={() => setSelectedGroup(grp)}
                style={{
                  background: selectedGroup === grp ? '#2563eb' : '#0c162f',
                  color: selectedGroup === grp ? '#fff' : '#94a3b8',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '20px',
                  padding: '6px 16px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: selectedGroup === grp ? 'bold' : '500',
                  whiteSpace: 'nowrap',
                }}
              >
                {grp === 'All' ? `All Categories (${categoriesData.length})` : grp}
              </button>
            ))}
          </div>

          {/* Real Count Categories Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
            {filteredCategories.map((cat) => {
              const count = categoryCounts[cat.name.toLowerCase()] || 0
              const countText = count === 1 ? '1 book' : `${count} books`

              return (
                <div
                  key={cat.name}
                  onClick={() => window.location.href = `/?category=${encodeURIComponent(cat.name)}`}
                  style={{
                    background: '#091024',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '14px',
                    padding: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#2563eb')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <span style={{ fontSize: '20px' }}>{cat.icon}</span>
                    <div style={{ minWidth: 0 }}>
                      <b style={{ fontSize: '13px', display: 'block', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.name}</b>
                      <span style={{ fontSize: '11px', color: count > 0 ? '#38bdf8' : '#64748b', fontWeight: count > 0 ? 'bold' : 'normal' }}>
                        {countText}
                      </span>
                    </div>
                  </div>
                  <span style={{ color: '#475569', fontSize: '12px', marginLeft: '6px' }}>›</span>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
   }
    
