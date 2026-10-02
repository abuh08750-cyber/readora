'use client'

import { useState } from 'react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onOAuth: (provider: 'google' | 'facebook') => void
  onEmailAuth: (e: React.FormEvent, email: string, pass: string, isSignUp: boolean) => void
  authError?: string
}

export default function AuthModal({
  isOpen,
  onClose,
  onOAuth,
  onEmailAuth,
  authError,
}: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onEmailAuth(e, email, password, isSignUp)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          background: '#080e1e',
          border: '1px solid rgba(56, 189, 248, 0.12)',
          borderRadius: '24px',
          maxWidth: '860px',
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexWrap: 'wrap',
          position: 'relative',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.9), 0 0 35px rgba(37,99,235,0.15)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            fontSize: '20px',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          ✕
        </button>

        {/* Left Side: Branding & Features Visual */}
        <div
          style={{
            flex: '1 1 340px',
            background: 'linear-gradient(180deg, #0b152d 0%, #060b17 100%)',
            padding: '36px 30px',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '22px' }}>
              <span style={{ fontSize: '24px' }}>📖</span>
              <span style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>Readora</span>
            </div>

            <h2 style={{ fontSize: '26px', fontWeight: '900', lineHeight: 1.2, margin: '0 0 10px', color: '#fff' }}>
              Your Next <br />
              <span style={{ color: '#38bdf8' }}>Chapter Awaits</span>
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.5, margin: '0 0 24px' }}>
              Join Readora and get access to thousands of eBooks, anytime, anywhere.
            </p>

            {/* Illustration Banner */}
            <div
              style={{
                height: '140px',
                borderRadius: '16px',
                backgroundImage:
                  "linear-gradient(to top, rgba(8,14,30,0.9), transparent), url('https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                marginBottom: '24px',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            />

            {/* Bullet features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(37,99,235,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#38bdf8' }}>
                  📖
                </div>
                <div>
                  <b style={{ fontSize: '12px', display: 'block', color: '#fff' }}>Access to 1000+ eBooks</b>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>Fiction, non-fiction, self-help and more</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(37,99,235,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#38bdf8' }}>
                  ☁️
                </div>
                <div>
                  <b style={{ fontSize: '12px', display: 'block', color: '#fff' }}>Read Anytime, Anywhere</b>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>On any device, at your convenience</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(37,99,235,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#38bdf8' }}>
                  🛡️
                </div>
                <div>
                  <b style={{ fontSize: '12px', display: 'block', color: '#fff' }}>Secure & Safe</b>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>Your data and privacy matter to us</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login / Register Form */}
        <div
          style={{
            flex: '1 1 380px',
            padding: '36px 32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: '800', color: '#fff' }}>
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h3>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              {isSignUp ? 'Sign up to start reading immediately' : 'Log in to your Readora account'}
            </span>
          </div>

          {/* Social Logins 2x2 Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
            <button
              type="button"
              onClick={() => onOAuth('google')}
              style={{
                background: '#0d162c',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#f8fafc',
                padding: '9px 12px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <span>🌐</span> Google
            </button>
            <button
              type="button"
              onClick={() => onOAuth('facebook')}
              style={{
                background: '#0d162c',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#f8fafc',
                padding: '9px 12px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <span style={{ color: '#1877f2' }}>📘</span> Facebook
            </button>
            <button
              type="button"
              onClick={() => {}}
              style={{
                background: '#0d162c',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#f8fafc',
                padding: '9px 12px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <span>✉️</span> Gmail / Email
            </button>
            <button
              type="button"
              onClick={() => {}}
              style={{
                background: '#0d162c',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#f8fafc',
                padding: '9px 12px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <span>📸</span> Instagram
            </button>
          </div>

          {/* OR Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '6px 0 16px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {authError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', padding: '8px 12px', borderRadius: '8px', fontSize: '11px', marginBottom: '12px' }}>
              ⚠️ {authError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              style={{
                background: '#0d162c',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span style={{ color: '#94a3b8', fontSize: '14px' }}>✉️</span>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '13px', width: '100%' }}
              />
            </div>

            <div
              style={{
                background: '#0d162c',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span style={{ color: '#94a3b8', fontSize: '14px' }}>🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '13px', width: '100%' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '13px' }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            {/* Remember & Forgot */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#94a3b8', margin: '2px 0 6px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#2563eb' }}
                />
                Remember me
              </label>
              <span style={{ color: '#38bdf8', cursor: 'pointer' }} onClick={() => alert('Password reset link will be sent to your email.')}>
                Forgot password?
              </span>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              style={{
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                padding: '12px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
              }}
            >
              {isSignUp ? 'Sign Up' : 'Log In'}
            </button>
          </form>

          {/* Toggle Login/Signup */}
          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#94a3b8' }}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <span
              onClick={() => setIsSignUp(!isSignUp)}
              style={{ color: '#38bdf8', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {isSignUp ? 'Log In' : 'Sign Up'}
            </span>
          </div>

          <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '10px', color: '#64748b' }}>
            🛡️ Your information is safe with us
          </div>
        </div>
      </div>
    </div>
  )
          }
            
