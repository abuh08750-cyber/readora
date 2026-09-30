'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://stuabcdisgmmxprapfai.supabase.co',
  'Sb_publishable_AHK5jGqipB4wYQCAtkaYSQ_hwuTecjR',
  {
    auth: {
      flowType: 'implicit',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)

const featuredBooks = [
  { id: 1, title: 'ZERO SE ARTIST - Part 1', author: 'Readora', tag: 'Music', bg: 'linear-gradient(135deg, #1e3a8a, #0f172a)' },
  { id: 2, title: 'The Mindset', author: 'James Clear', tag: 'Self Help', bg: 'linear-gradient(135deg, #065f46, #022c22)' },
  { id: 3, title: 'Digital Marketing Basics', author: 'Neil Patel', tag: 'Business', bg: 'linear-gradient(135deg, #1e293b, #0f172a)' },
  { id: 4, title: 'Productivity Habits', author: 'James Clear', tag: 'Self Improvement', bg: 'linear-gradient(135deg, #854d0e, #451a03)' },
  { id: 5, title: 'Self Improvement', author: 'Robin Sharma', tag: 'Self Help', bg: 'linear-gradient(135deg, #9a3412, #431407)' },
  { id: 6, title: 'Creative Writing', author: 'Stephen King', tag: 'Writing', bg: 'linear-gradient(135deg, #374151, #111827)' },
]

const categories = [
  { name: 'Music', icon: '🎵' },
  { name: 'Self Help', icon: '👤' },
  { name: 'Business', icon: '💼' },
  { name: 'Technology', icon: '💻' },
  { name: 'Education', icon: '🎓' },
  { name: 'Fiction', icon: '📖' },
  { name: 'Health', icon: '❤️' },
  { name: 'Writing', icon: '✏️' },
]

export default function HomePage() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUserEmail(session.user.email ?? 'Reader')
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserEmail(session.user.email ?? 'Reader')
        setShowAuthModal(false)
      } else {
        setUserEmail(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: typeof window !== 'undefined' ? window.location.origin : 'https://readora-a4-be07.vercel.app'
      }
    })
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else setMessage('Check email for confirmation link!')
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else if (data?.user) {
        setUserEmail(data.user.email ?? 'Reader')
        setShowAuthModal(false)
      }
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUserEmail(null)
  }

  return (
    <div style={{ backgroundColor: '#090d16', color: '#f8fafc', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      
      {/* 1. Header Navigation */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 48px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '22px', fontWeight: 'bold' }}>
            <span>📖</span> Readora
          </div>
          <nav style={{ display: 'flex', gap: '24px', fontSize: '15px', color: '#94a3b8' }}>
            <span style={{ color: '#fff', cursor: 'pointer', borderBottom: '2px solid #3b82f6', paddingBottom: '4px' }}>Home</span>
            <span style={{ cursor: 'pointer' }}>Library</span>
            <span style={{ cursor: 'pointer' }}>Categories</span>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Search books..." 
              style={{ background: '#131b2e', border: '1px solid #1e293b', borderRadius: '20px', padding: '8px 16px', color: '#fff', fontSize: '14px', width: '220px', outline: 'none' }}
            />
          </div>

          {userEmail ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px', color: '#38bdf8' }}>{userEmail.split('@')[0]}</span>
              <button onClick={handleLogout} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowAuthModal(true)} style={{ background: 'transparent', color: '#f8fafc', border: '1px solid #334155', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                Sign In
              </button>
              <button onClick={() => setShowAuthModal(true)} style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                Get Started
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 2. Hero Section */}
      <section style={{ padding: '60px 48px', background: 'radial-gradient(circle at 80% 20%, rgba(37,99,235,0.12), transparent 50%)' }}>
        <div style={{ maxWidth: '620px' }}>
          <h1 style={{ fontSize: '54px', fontWeight: '800', lineHeight: 1.15, margin: '0 0 16px' }}>
            Read More, <br />
            <span style={{ color: '#38bdf8', fontStyle: 'italic' }}>Grow Further</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: 1.6, marginBottom: '28px' }}>
            Discover amazing books, explore new ideas, and build a better you — one page at a time.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', borderRadius: '30px', padding: '6px 8px 6px 20px', maxWidth: '480px', marginBottom: '28px' }}>
            <input 
              type="text" 
              placeholder="Search for books, authors, or categories..." 
              style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', color: '#0f172a' }}
            />
            <button style={{ background: '#2563eb', border: 'none', borderRadius: '50%', width: '36px', height: '36px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ➜
            </button>
          </div>

          <div style={{ display: 'flex', gap: '28px', color: '#cbd5e1', fontSize: '14px' }}>
            <span>📖 Free to Read</span>
            <span>⚡ Easy Access</span>
            <span>🛡️ Safe & Secure</span>
          </div>
        </div>
      </section>

      {/* 3. Featured Books */}
      <section style={{ padding: '30px 48px 50px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', margin: 0 }}>Featured Books</h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>Handpicked books just for you</p>
          </div>
          <span style={{ color: '#38bdf8', fontSize: '14px', cursor: 'pointer' }}>View All →</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
          {featuredBooks.map((book) => (
            <div key={book.id} style={{ background: '#111827', borderRadius: '14px', padding: '12px', border: '1px solid #1f2937' }}>
              <div style={{ height: '170px', borderRadius: '10px', background: book.bg, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '12px', textAlign: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '28px', marginBottom: '8px' }}>📚</span>
                <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{book.title}</span>
              </div>
              <h4 style={{ fontSize: '14px', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.title}</h4>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 10px' }}>{book.author}</p>
              <button 
                onClick={() => setShowAuthModal(true)} 
                style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
              >
                📖 Read Book
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Browse by Category */}
      <section style={{ padding: '0 48px 60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', margin: 0 }}>Browse by Category</h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>Find books in your favorite category</p>
          </div>
          <span style={{ color: '#38bdf8', fontSize: '14px', cursor: 'pointer' }}>View All →</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '14px' }}>
          {categories.map((c, i) => (
            <div key={i} style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '10px', padding: '14px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <span>{c.icon}</span>
              <span style={{ fontSize: '13px', fontWeight: '500' }}>{c.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Auth Modal Popup */}
      {showAuthModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '24px', padding: '36px 32px', width: '100%', maxWidth: '400px', textAlign: 'center', position: 'relative', color: '#0f172a' }}>
            
            {/* Close Button */}
            <button 
              onClick={() => setShowAuthModal(false)}
              style={{ position: 'absolute', top: '16px', right: '18px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
            >
              ✕
            </button>

            {/* Modal Logo */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '14px' }}>
              <span style={{ fontSize: '24px' }}>📖</span>
              <span style={{ fontSize: '22px', fontWeight: '800' }}>Readora</span>
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 6px' }}>{isSignUp ? 'Create an Account' : 'Welcome Back!'}</h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px' }}>Sign in to read this book and access your library.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={() => handleOAuthLogin('google')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '11px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                Continue with Google
              </button>
              <button onClick={() => handleOAuthLogin('facebook')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '11px', borderRadius: '12px', border: 'none', background: '#1877f2', color: '#fff', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                Continue with Facebook
              </button>
              <button onClick={() => setShowEmailForm(!showEmailForm)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '11px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                Continue with Email
              </button>
            </div>

            {showEmailForm && (
              <form onSubmit={handleEmailAuth} style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                <button type="submit" style={{ padding: '10px', borderRadius: '8px', background: '#0f172a', color: '#fff', border: 'none', fontWeight: '600', cursor: 'pointer' }}>
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </button>
              </form>
            )}

            {message && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '8px' }}>{message}</p>}

            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '18px' }}>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <span onClick={() => { setIsSignUp(!isSignUp); setShowEmailForm(true); }} style={{ color: '#2563eb', fontWeight: '600', cursor: 'pointer' }}>
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
    }
  
