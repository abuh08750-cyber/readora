'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://stuabcdisgmmxprapfai.supabase.co',
  'Sb_publishable_AHK5jGqipB4wYQCAtkaYSQ_hwuTecjR'
)

interface Book {
  id: string | number
  title: string
  author?: string
  cover_url?: string
  file_url?: string
  category?: string
}

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([])
  const [user, setUser] = useState<any>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [loading, setLoading] = useState(true)

  // 1. यूज़र सेशन और डेटाबेस से किताबें लोड करें
  useEffect(() => {
    async function loadData() {
      // यूज़र चेक करें
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
      }

      // Supabase से असली किताबें लाएँ
      const { data: booksData } = await supabase
        .from('books')
        .select('*')
        .order('id', { ascending: false })

      if (booksData && booksData.length > 0) {
        setBooks(booksData)
      }
      setLoading(false)
    }

    loadData()

    // लॉगिन होने का इवेंट सुनें
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

  // Google Login
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
  }

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  // Read Book बटन क्लिक हैंडलर
  const handleReadBook = (book: Book) => {
    if (!user) {
      // अगर लॉगिन नहीं है तो पॉपअप खोलें
      setShowAuthModal(true)
      return
    }

    // अगर लॉगिन है तो किताब खोलें
    if (book.file_url) {
      window.open(book.file_url, '_blank')
    } else {
      window.location.href = `/book/${book.id}`
    }
  }

  return (
    <div style={{ backgroundColor: '#090d16', color: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', fontWeight: 'bold' }}>
          <span>📖</span> Readora
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', color: '#38bdf8' }}>{user.email?.split('@')[0]}</span>
              <button onClick={handleLogout} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
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
      <section style={{ padding: '40px 24px 20px', maxWidth: '600px' }}>
        <h1 style={{ fontSize: '38px', fontWeight: '800', lineHeight: 1.2, margin: '0 0 12px' }}>
          Read More, <br />
          <span style={{ color: '#38bdf8' }}>Grow Further</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>
          Discover amazing books, explore new ideas, and build a better you.
        </p>
      </section>

      {/* Books Section */}
      <section style={{ padding: '20px 24px 60px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Your Books</h2>

        {loading ? (
          <p style={{ color: '#64748b' }}>किताबें लोड हो रही हैं...</p>
        ) : books.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>कोई किताब नहीं मिली। कृपया एडमिन पैनल से किताब अपलोड करें।</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
            {books.map((book) => (
              <div key={book.id} style={{ background: '#111827', borderRadius: '12px', padding: '12px', border: '1px solid #1f2937' }}>
                <div style={{
                  height: '190px',
                  borderRadius: '8px',
                  backgroundColor: '#1e293b',
                  backgroundImage: book.cover_url ? `url(${book.cover_url})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '10px'
                }}>
                  {!book.cover_url && <span style={{ fontSize: '30px' }}>📚</span>}
                </div>
                <h4 style={{ fontSize: '14px', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.title}</h4>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 10px' }}>{book.author || 'Readora'}</p>
                <button 
                  onClick={() => handleReadBook(book)} 
                  style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                >
                  📖 Read Book
                </button>
              </div>
            ))}
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
      
