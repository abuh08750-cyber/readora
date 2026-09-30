'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://stuabcdisgmmxprapfai.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0dWFiY2Rpc2dtbXhwcmFwZmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1Njc1NjksImV4cCI6MjEwNjE0MzU2OX0.pGvaQQBWGcbDKgDb_9F1jkUURVXH3bhJ-trQt-GXBZ8'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Aapki book ka direct aur confirmed data
const staticBook = {
  id: 'dfb9528e-8466-4c5f-aeab-0329ae420bf1',
  title: 'ZERO SE ARTIST - Part 1',
  author: 'Readora',
  cover_path: 'https://stuabcdisgmmxprapfai.supabase.co/storage/v1/object/public/covers/1790700033242-teliy6.jpg',
  file_path: 'https://stuabcdisgmmxprapfai.supabase.co/storage/v1/object/public/ebooks/1790700033242-teliy6.pdf',
}

export default function HomePage() {
  const [books, setBooks] = useState<any[]>([staticBook])
  const [user, setUser] = useState<any>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    // Session check
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
      }
    }
    checkUser()

    // Auth change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        setShowAuthModal(false)
      } else {
        setUser(null)
      }
    })

    // Supabase se books lana (agar DB slow ho toh bhi staticBook hamesha rahegi)
    async function fetchBooks() {
      const { data } = await supabase.from('books').select('*')
      if (data && data.length > 0) {
        setBooks(data)
      }
    }
    fetchBooks()

    return () => subscription.unsubscribe()
  }, [])

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    setAuthError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    })
    if (error) setAuthError(error.message)
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setAuthError(error.message)
      else setAuthError('Confirmation email bhej diya gaya hai!')
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setAuthError(error.message)
      else if (data?.user) {
        setUser(data.user)
        setShowAuthModal(false)
      }
    }
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

    const file = book.file_path || book.file_url || book.pdf_url
    if (file) {
      window.open(file, '_blank')
    } else {
      alert(`Book open ho rahi hai: ${book.title}`)
    }
  }

  return (
    <div style={{ backgroundColor: '#090d16', color: '#f8fafc', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', fontWeight: 'bold' }}>
          <span>📖</span> Readora
        </div>

        <div>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', color: '#38bdf8', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email?.split('@')[0]}
              </span>
              <button onClick={handleLogout} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
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

      {/* Hero Section */}
      <section style={{ padding: '30px 20px 15px', maxWidth: '600px' }}>
        <h1 style={{ fontSize: '34px', fontWeight: '800', lineHeight: 1.2, margin: '0 0 10px' }}>
          Read More, <br />
          <span style={{ color: '#38bdf8' }}>Grow Further</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 20px' }}>
          Discover amazing books, explore new ideas, and build a better you.
        </p>
      </section>

      {/* Books List */}
      <section style={{ padding: '10px 20px 60px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Featured Books</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
          {books.map((book) => {
            const cover = book.cover_path || book.cover_url || staticBook.cover_path
            return (
              <div key={book.id || 'default-book'} style={{ background: '#111827', borderRadius: '14px', padding: '14px', border: '1px solid #1f2937' }}>
                <div style={{
                  height: '220px',
                  borderRadius: '10px',
                  backgroundColor: '#1e293b',
                  backgroundImage: `url(${cover})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  marginBottom: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                }}>
                </div>
                <h4 style={{ fontSize: '14px', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {book.title}
                </h4>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 12px' }}>
                  {book.author || 'Readora'}
                </p>
                <button 
                  onClick={() => handleReadBook(book)} 
                  style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '9px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                >
                  📖 Read Book
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {/* Auth Modal Popup */}
      {showAuthModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '34px 28px',
            width: '100%',
            maxWidth: '380px',
            textAlign: 'center',
            position: 'relative',
            color: '#0f172a',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
          }}>
            <button 
              onClick={() => setShowAuthModal(false)}
              style={{ position: 'absolute', top: '16px', right: '18px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
            >
              ✕
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '24px' }}>📖</span>
              <span style={{ fontSize: '22px', fontWeight: '800' }}>Readora</span>
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 6px' }}>
              {isSignUp ? 'Create an Account' : 'Welcome Back!'}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px' }}>
              Sign in to read this book and access your library.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={() => handleOAuthLogin('google')} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                padding: '11px', borderRadius: '12px', border: '1px solid #e2e8f0',
                background: '#ffffff', color: '#0f172a', fontWeight: '600', fontSize: '14px', cursor: 'pointer'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                Continue with Google
              </button>

              <button onClick={() => handleOAuthLogin('facebook')} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                padding: '11px', borderRadius: '12px', border: 'none',
                background: '#1877F2', color: '#ffffff', fontWeight: '600', fontSize: '14px', cursor: 'pointer'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Continue with Facebook
              </button>

              <button onClick={() => setShowEmailForm(!showEmailForm)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                padding: '11px', borderRadius: '12px', border: '1px solid #e2e8f0',
                background: '#ffffff', color: '#0f172a', fontWeight: '600', fontSize: '14px', cursor: 'pointer'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                Continue with Email
              </button>
            </div>

            {showEmailForm && (
              <form onSubmit={handleEmailAuth} style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
                <button type="submit" style={{
                  padding: '10px', borderRadius: '8px', border: 'none',
                  background: '#0f172a', color: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '13px'
                }}>
                  {isSignUp ? 'Sign Up with Email' : 'Sign In with Email'}
                </button>
              </form>
            )}

            {authError && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '10px' }}>{authError}</p>}

            <div style={{ display: 'flex', alignItems: 'center', margin: '18px 0 14px' }}>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
              <span style={{ padding: '0 8px', fontSize: '12px', color: '#94a3b8' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
            </div>

            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <span
                onClick={() => { setIsSignUp(!isSignUp); setShowEmailForm(true); }}
                style={{ color: '#2563eb', fontWeight: '600', cursor: 'pointer' }}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
    }
      
