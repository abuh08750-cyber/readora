'use client'

import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

const SUPABASE_URL = 'https://stuabcdisgmmxprapfai.supabase.co'
const SUPABASE_KEY = 'Sb_publishable_AHK5jGqipB4wYQCAtkaYSQ_hwuTecjR'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export default function AuthPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUserEmail(session.user.email ?? 'User')
      }
    }
    getUser()
  }, [])

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: 'https://readora-a4-be07.vercel.app/auth'
      }
    })
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else setMessage('Check your email for confirmation link!')
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else if (data?.user) setUserEmail(data.user.email ?? 'User')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUserEmail(null)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(10, 15, 25, 0.85)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        padding: '36px 32px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        textAlign: 'center',
        position: 'relative'
      }}>
        
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#0f172a">
            <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <span style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>Readora</span>
        </div>

        {userEmail ? (
          <div>
            <h3 style={{ color: '#0f172a', margin: '20px 0 10px' }}>Welcome!</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>{userEmail}</p>
            <button onClick={handleLogout} style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              background: '#ef4444',
              color: '#fff',
              fontWeight: '600',
              cursor: 'pointer'
            }}>Log Out</button>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px' }}>
              {isSignUp ? 'Create an Account' : 'Welcome Back!'}
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 24px' }}>
              Sign in to read this book and access your library.
            </p>

            {/* Social Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Google */}
              <button onClick={() => handleOAuthLogin('google')} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                padding: '12px', borderRadius: '14px', border: '1px solid #e2e8f0',
                background: '#ffffff', color: '#0f172a', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                Continue with Google
              </button>

              {/* Facebook */}
              <button onClick={() => handleOAuthLogin('facebook')} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                padding: '12px', borderRadius: '14px', border: 'none',
                background: '#1877F2', color: '#ffffff', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Continue with Facebook
              </button>

              {/* Email Button */}
              <button onClick={() => setShowEmailForm(!showEmailForm)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                padding: '12px', borderRadius: '14px', border: '1px solid #e2e8f0',
                background: '#ffffff', color: '#0f172a', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                Continue with Email
              </button>

              {/* Instagram Button */}
              <button onClick={() => alert('Instagram Direct OAuth Supabase par available nahi hai, Facebook Login use karein!')} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                padding: '12px', borderRadius: '14px', border: 'none',
                background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                color: '#ffffff', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
                Continue with Instagram
              </button>
            </div>

            {/* Email Form Toggle */}
            {showEmailForm && (
              <form onSubmit={handleEmailAuth} style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                />
                <button type="submit" style={{
                  padding: '11px', borderRadius: '10px', border: 'none',
                  background: '#0f172a', color: '#ffffff', fontWeight: '600', cursor: 'pointer'
                }}>
                  {isSignUp ? 'Sign Up with Email' : 'Sign In with Email'}
                </button>
              </form>
            )}

            {message && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '10px' }}>{message}</p>}

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', margin: '22px 0 16px' }}>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
              <span style={{ padding: '0 10px', fontSize: '12px', color: '#94a3b8' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
            </div>

            {/* Sign In / Sign Up Switch */}
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <span
                onClick={() => { setIsSignUp(!isSignUp); setShowEmailForm(true); }}
                style={{ color: '#2563eb', fontWeight: '600', cursor: 'pointer' }}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  )
      }
      
