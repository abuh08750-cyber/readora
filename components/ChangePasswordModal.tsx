'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://stuabcdisgmmxprapfai.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0dWFiY2Rpc2dtbXhwcmFwZmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1Njc1NjksImV4cCI6MjEwNjE0MzU2OX0.pGvaQQBWGcbDKgDb_9F1jkUURVXH3bhJ-trQt-GXBZ8'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
  userEmail?: string
  isRecoveryMode?: boolean
}

export default function ChangePasswordModal({ isOpen, onClose, userEmail, isRecoveryMode = false }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [pwdLoading, setPwdLoading] = useState(false)
  const [pwdErrorMsg, setPwdErrorMsg] = useState('')
  const [pwdSuccessMsg, setPwdSuccessMsg] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotMsg, setForgotMsg] = useState('')

  if (!isOpen) return null

  // Live Password Requirements Checkers
  const reqMinLength = newPassword.length >= 8
  const reqAlphaNumeric = /[a-zA-Z]/.test(newPassword) && /[0-9]/.test(newPassword)
  const reqDifferent = isRecoveryMode ? true : (newPassword !== '' && newPassword !== currentPassword)
  const reqMatches = confirmPassword !== '' && newPassword === confirmPassword

  const resetForm = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setShowCurrentPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
    setPwdErrorMsg('')
    setPwdSuccessMsg('')
    setForgotMsg('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwdErrorMsg('')
    setPwdSuccessMsg('')
    setForgotMsg('')

    if (!isRecoveryMode && !currentPassword) {
      setPwdErrorMsg('Please enter your current password.')
      return
    }

    if (!newPassword || !confirmPassword) {
      setPwdErrorMsg('Please fill in both new password fields.')
      return
    }

    if (newPassword.length < 8) {
      setPwdErrorMsg('Password must be at least 8 characters.')
      return
    }

    if (!reqAlphaNumeric) {
      setPwdErrorMsg('Password must contain both letters and numbers.')
      return
    }

    if (!isRecoveryMode && newPassword === currentPassword) {
      setPwdErrorMsg('New password must be different from your current password.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPwdErrorMsg('New password and confirm password do not match.')
      return
    }

    setPwdLoading(true)

    try {
      // अगर रिकवरी मोड नहीं है, तो पहले करंट पासवर्ड वेरिफ़ाई करें
      if (!isRecoveryMode) {
        const email = userEmail || 'waqasabu186@gmail.com'
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password: currentPassword,
        })

        if (signInErr) {
          setPwdErrorMsg('Current password is incorrect.')
          setPwdLoading(false)
          return
        }
      }

      // Supabase Auth से पासवर्ड अपडेट करें
      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateErr) {
        setPwdErrorMsg(updateErr.message || 'Something went wrong. Please try again.')
        setPwdLoading(false)
        return
      }

      setPwdSuccessMsg('Password changed successfully.')
      setTimeout(() => {
        handleClose()
        if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) {
          // URL से टोकन साफ़ करें
          window.history.replaceState(null, '', window.location.pathname)
        }
      }, 1600)
    } catch {
      setPwdErrorMsg('Something went wrong. Please try again.')
    } finally {
      setPwdLoading(false)
    }
    }

  const handleForgotPassword = async () => {
    const email = userEmail || 'waqasabu186@gmail.com'
    setForgotLoading(true)
    setPwdErrorMsg('')
    setForgotMsg('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/settings`,
      })

      if (error) {
        setPwdErrorMsg(error.message || 'Unable to send reset email. Please try again.')
      } else {
        setForgotMsg(`Password reset link sent to ${email}. Please check your inbox.`)
      }
    } catch {
      setPwdErrorMsg('Something went wrong. Please try again.')
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(3, 7, 18, 0.82)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#090e1a',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          borderRadius: '20px',
          padding: '24px 22px',
          maxWidth: '460px',
          width: '100%',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 25px rgba(37, 99, 235, 0.15)',
          color: '#f8fafc',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* Top Close Button (✕) */}
        <button
          type="button"
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '4px 6px',
            lineHeight: 1,
          }}
          title="Close"
        >
          ✕
        </button>

        {/* Header: Lock Icon + Title & Subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            color: '#fff',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(37,99,235,0.4)',
          }}>
            🔒
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', letterSpacing: '-0.3px', color: '#fff' }}>
              {isRecoveryMode ? 'Reset Password' : 'Change Password'}
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>
              {isRecoveryMode ? 'Set a new secure password for your account.' : 'Keep your account secure. Choose a strong password.'}
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Current Password Field (सिर्फ सामान्य मोड में दिखेगा) */}
          {!isRecoveryMode && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#e2e8f0', marginBottom: '6px' }}>
                Current Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required={!isRecoveryMode}
                  style={{
                    width: '100%',
                    background: '#0d1527',
                    border: '1px solid rgba(255, 255, 255, 0.09)',
                    borderRadius: '10px',
                    padding: '11px 42px 11px 14px',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: 0,
                  }}
                >
                  {showCurrentPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
          )}

          {/* New Password Field */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#e2e8f0', marginBottom: '6px' }}>
              New Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  background: '#0d1527',
                  border: '1px solid rgba(255, 255, 255, 0.09)',
                  borderRadius: '10px',
                  padding: '11px 42px 11px 14px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '16px',
                  padding: 0,
                }}
              >
                {showNewPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Confirm New Password Field */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#e2e8f0', marginBottom: '6px' }}>
              Confirm New Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  background: '#0d1527',
                  border: (confirmPassword && !reqMatches) ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.09)',
                  borderRadius: '10px',
                  padding: '11px 42px 11px 14px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '16px',
                  padding: 0,
                }}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {confirmPassword && !reqMatches && (
              <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                Passwords do not match.
              </span>
            )}
          </div>

          {/* Password Requirements Card Box */}
          <div style={{
            background: '#0c1322',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '12px',
            padding: '12px 14px',
            marginTop: '2px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '15px' }}>🛡️</span>
              <b style={{ fontSize: '12px', color: '#60a5fa' }}>Password Requirements</b>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: reqMinLength ? '#10b981' : '#94a3b8' }}>
                <span>{reqMinLength ? '✓' : '•'}</span>
                <span>Minimum 8 characters</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: reqAlphaNumeric ? '#10b981' : '#94a3b8' }}>
                <span>{reqAlphaNumeric ? '✓' : '•'}</span>
                <span>Must contain both letters and numbers</span>
              </div>
              {!isRecoveryMode && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: reqDifferent ? '#10b981' : '#94a3b8' }}>
                  <span>{reqDifferent ? '✓' : '•'}</span>
                  <span>New password current password se different ho</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: reqMatches ? '#10b981' : '#94a3b8' }}>
                <span>{reqMatches ? '✓' : '•'}</span>
                <span>New password aur confirm password same hone chahiye</span>
              </div>
            </div>
          </div>

          {/* Forgot Password Action Link (केवल सामान्य मोड में दिखेगा) */}
          {!isRecoveryMode && (
            <div
              onClick={handleForgotPassword}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '8px 2px',
              }}
            >
              <div>
                <b style={{ fontSize: '12px', color: '#38bdf8', display: 'block' }}>Forgot password?</b>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Use email verification to reset your password.</span>
              </div>
              <span style={{ color: '#38bdf8', fontSize: '14px', fontWeight: 'bold' }}>
                {forgotLoading ? '⌛' : '›'}
              </span>
            </div>
          )}

          {/* Status Messages */}
          {pwdErrorMsg && (
            <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '9px 12px', borderRadius: '8px', fontSize: '11px', lineHeight: 1.4 }}>
              ⚠️ {pwdErrorMsg}
            </div>
          )}
          {pwdSuccessMsg && (
            <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', padding: '9px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}>
              ✅ {pwdSuccessMsg}
            </div>
          )}
          {forgotMsg && (
            <div style={{ background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', padding: '9px 12px', borderRadius: '8px', fontSize: '11px' }}>
              📬 {forgotMsg}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                flex: 1,
                background: '#0d1527',
                color: '#e2e8f0',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                padding: '11px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pwdLoading}
              style={{
                flex: 1.3,
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '11px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: pwdLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(37,99,235,0.4)',
                opacity: pwdLoading ? 0.7 : 1,
              }}
            >
              <span>🔄</span>
              <span>{pwdLoading ? 'Updating...' : (isRecoveryMode ? 'Save Password' : 'Update Password')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
        }
