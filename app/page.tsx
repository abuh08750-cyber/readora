'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://stuabcdisgmmxprapfai.supabase.co',
  'Sb_publishable_AHK5jGqipB4wYQCAtkaYSQ_hwuTecjR',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)

export default function HomePage() {
  const [books, setBooks] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      // 1. Session चेक करें
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
      }

      // 2. Supabase से सीधे किताबें लाएँ (बिना किसी गलत sorting के)
      const { data, error } = await supabase.from('books').select('*')
      if (error) {
        console.error('Books fetch error:', error)
      } else if (data) {
        setBooks(data)
      }
      setLoading(false)
    }

    loadData()

    // Login/Logout इवेंट सुनें
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        setShowAuthModal(false)
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? window.location.origin : 'https://readora-a4-be07.vercel.app'
      }
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const handleReadBook = (book: any) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    // अगर PDF या File URL मौजूद है तो खोलें, नहीं तो /book/[id] पर जाएँ
    const fileUrl = book.file_url || book.pdf_url || book.url || book.file_path
    if (fileUrl) {
      window.open(fileUrl, '_blank')
    } else {
      window.location.href = `/book/${book.id}`
    }
  }

  return (
    <div style={{ backgroundColor: '#090d16', color: '#f8fafc', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', fontWeight: 'bold' }}>
          <span>📖</span> Readora
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', color: '#38bdf8' }}>{user.email?.split('@')[0]}</span>
              <button onClick={handleLogout} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                Logout
              </button>
            </div>
          ) : (
            <button onClick={() => setShowAuthModal(true)} style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Hero Banner */}
      <section style={{ padding: '36px 24px 20px', maxWidth: '600px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', lineHeight: 1.2, margin: '0 0 10px' }}>
          Read More, <br />
          <span style={{ color: '#38bdf8' }}>Grow Further</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>
          Discover amazing books, explore new ideas, and build a better you.
        </p>
      </section>

      {/* Books Section */}
      <section style={{ padding: '10px 24px 60px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Your Books</h2>

        {loading ? (
          <p style={{ color: '#64748b' }}>किताबें लोड हो रही हैं...</p>
        ) : books.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>कोई किताब नहीं मिली।</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
            {books.map((book) => {
              // जो भी इमेज फ़ील्ड मिले उसे कवर बनाएँ
              const cover = book.cover_url || book.cover_image || book.image_url || book.thumbnail
              return (
                <div key={book.id} style={{ background: '#111827', borderRadius: '12px', padding: '12px', border: '1px solid #1f2937' }}>
                  <div style={{
                    height: '190px',
                    borderRadius: '8px',
                    backgroundColor: '#1e293b',
                    backgroundImage: cover ? `url(${cover})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '10px'
                  }}>
                    {!cover && <span style={{ fontSize: '32px' }}>📚</span>}
                  </div>
                  <h4 style={{ fontSize: '14px', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {book.title}
                  </h4>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 10px' }}>
                    {book.author || 'Readora'}
                  </p>
                  <button 
                    onClick={() => handleReadBook(book)} 
                    style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                  >
                    📖 Read Book
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Login Popup Modal */}
      {showAuthModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '30px 24px', width: '100%', maxWidth: '360px', textAlign: 'center', position: 'relative', color: '#0f172a' }}>
            <button 
              onClick={() => setShowAuthModal(false)}
              style={{ position: 'absolute', top: '14px', right: '16px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
            >
              ✕
            </button>

            <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px' }}>Welcome Back!</h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px' }}>किताब पढ़ने के लिए कृपया लॉगिन करें</p>

            <button onClick={handleGoogleLogin} style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '12px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#0f172a',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
              Continue with Google
            </button>
          </div>
        </div>
      )}
    </div>
  )
        }
        
