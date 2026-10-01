'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import ProfilePhotoUploader from '@/components/ProfilePhotoUploader'
import NotificationDropdown from '@/components/NotificationDropdown'

const SUPABASE_URL = 'https://stuabcdisgmmxprapfai.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0dWFiY2Rpc2dtbXhwcmFwZmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1Njc1NjksImV4cCI6MjEwNjE0MzU2OX0.pGvaQQBWGcbDKgDb_9F1jkUURVXH3bhJ-trQt-GXBZ8'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [fullName, setFullName] = useState('Abu Huzaifa')
  const [savedFullName, setSavedFullName] = useState('Abu Huzaifa')
  const [emailVal, setEmailVal] = useState('waqasabu186@gmail.com')
  const [username, setUsername] = useState('waqasabu186')
  const [savedUsername, setSavedUsername] = useState('waqasabu186')

  const [selectedTheme, setSelectedTheme] = useState('Dark')
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [headerAvatar, setHeaderAvatar] = useState<string | null>(null)

  const [nameError, setNameError] = useState('')
  const [usernameError, setUsernameError] = useState('')

  // Toggles
  const [notifReleases, setNotifReleases] = useState(true)
  const [notifReminders, setNotifReminders] = useState(false)
  const [notifReplies, setNotifReplies] = useState(true)
  const [notifMarketing, setNotifMarketing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(true)
  const [autoSavePos, setAutoSavePos] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        if (session.user.email) setEmailVal(session.user.email)
      }
    })

    try {
      const storedName = localStorage.getItem('readora_profile_fullname')
      const storedUser = localStorage.getItem('readora_profile_username')
      if (storedName) {
        setFullName(storedName)
        setSavedFullName(storedName)
      }
      if (storedUser) {
        setUsername(storedUser)
        setSavedUsername(storedUser)
      }
      const savedImg = localStorage.getItem('readora_profile_avatar')
      if (savedImg) setHeaderAvatar(savedImg)
    } catch (e) {
      console.error(e)
    }
  }, [])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setNameError('')
    setUsernameError('')

    const now = Date.now()
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000
    const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000

    let hasError = false

    let nameHistory: number[] = []
    try {
      const storedHistory = localStorage.getItem('readora_name_change_history')
      if (storedHistory) nameHistory = JSON.parse(storedHistory)
    } catch {}

    const recentNameChanges = nameHistory.filter(timestamp => now - timestamp < THIRTY_DAYS_MS)
    const isNameChanged = fullName.trim() !== savedFullName.trim()

    if (isNameChanged && recentNameChanges.length >= 3) {
      const oldestChange = Math.min(...recentNameChanges)
      const daysLeft = Math.ceil((oldestChange + THIRTY_DAYS_MS - now) / (24 * 60 * 60 * 1000))
      setNameError(`You can only change your name 3 times every 30 days. Please try again in ${daysLeft} days.`)
      hasError = true
    }

    let usernameHistory: number[] = []
    try {
      const storedUserHistory = localStorage.getItem('readora_username_change_history')
      if (storedUserHistory) usernameHistory = JSON.parse(storedUserHistory)
    } catch {}

    const recentUserChanges = usernameHistory.filter(timestamp => now - timestamp < SIXTY_DAYS_MS)
    const isUsernameChanged = username.trim() !== savedUsername.trim()

    if (isUsernameChanged && recentUserChanges.length >= 3) {
      const oldestUserChange = Math.min(...recentUserChanges)
      const daysLeft = Math.ceil((oldestUserChange + SIXTY_DAYS_MS - now) / (24 * 60 * 60 * 1000))
      setUsernameError(`You can only change your username 3 times every 60 days (2 months). Please try again in ${daysLeft} days.`)
      hasError = true
    }

    if (hasError) return

    try {
      if (isNameChanged) {
        localStorage.setItem('readora_name_change_history', JSON.stringify([...recentNameChanges, now]))
        localStorage.setItem('readora_profile_fullname', fullName.trim())
        setSavedFullName(fullName.trim())
      }
      if (isUsernameChanged) {
        localStorage.setItem('readora_username_change_history', JSON.stringify([...recentUserChanges, now]))
        localStorage.setItem('readora_profile_username', username.trim())
        setSavedUsername(username.trim())
      }
    } catch (err) {
      console.error(err)
    }

    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2500)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const avatarChar = user?.email ? user.email.charAt(0).toUpperCase() : 'W'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#070b14', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Sidebar Navigation */}
      <aside style={{ width: '220px', background: '#070b14', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '20px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div onClick={() => window.location.href = '/'} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '19px', fontWeight: '800', marginBottom: '26px', cursor: 'pointer' }}>
            <span>📖</span><span>Readora</span>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '13px' }}>
            <div onClick={() => window.location.href = '/'} style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: '#94a3b8' }}>🏠 Home</div>
            <div onClick={() => window.location.href = '/library'} style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: '#94a3b8' }}>📖 Library</div>
            <div onClick={() => window.location.href = '/#categories-section'} style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: '#94a3b8' }}>🗂 Categories</div>
            
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />

            <div onClick={() => window.location.href = '/library'} style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: '#94a3b8' }}>📑 My Books</div>
            <div onClick={() => window.location.href = '/library'} style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: '#94a3b8' }}>🕒 Recently Read</div>
            <div onClick={() => window.location.href = '/library'} style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: '#94a3b8' }}>🤍 Favorites</div>
            <div style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: '#fff', background: '#1d4ed8', fontWeight: 'bold' }}>⚙️ Settings</div>
          </nav>
        </div>

        <div style={{ background: '#0d1322', padding: '12px', borderRadius: '12px', fontSize: '11px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ margin: '0 0 4px', fontWeight: '700' }}>Better Books<br />Bigger Dreams</p>
          <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>📖 Readora</span>
        </div>
      </aside>

      {/* Main Panel */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
        
        {/* Top Header */}
        <header style={{ padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#070b14', zIndex: 100 }}>
          <div style={{ position: 'relative', width: '320px', maxWidth: '65%' }}>
            <span style={{ position: 'absolute', left: '10px', top: '8px', color: '#64748b', fontSize: '13px' }}>🔍</span>
            <input
              type="text"
              placeholder="Search for books, authors, or categories..."
              style={{ width: '100%', background: '#0d1322', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '7px 12px 7px 30px', color: '#fff', fontSize: '12px', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: '#94a3b8', cursor: 'pointer', fontSize: '16px' }}>☀️</span>

            {/* Separate Modular Notification Dropdown */}
            <NotificationDropdown />

            {/* Profile Avatar */}
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: '#2563eb',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '13px',
              backgroundImage: headerAvatar ? `url(${headerAvatar})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: '2px solid rgba(255,255,255,0.2)'
            }}>
              {!headerAvatar && avatarChar}
            </div>
          </div>
        </header>

        {/* Settings Content Dashboard */}
        <div style={{ padding: '24px 28px 60px', maxWidth: '1280px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px', color: '#38bdf8' }}>⚙️</span>
                <h1 style={{ fontSize: '26px', fontWeight: '800', margin: 0, letterSpacing: '-0.3px' }}>Settings</h1>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0' }}>Manage your account, preferences and app settings.</p>
            </div>

            <div style={{ background: '#0e1628', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '22px' }}>📖</span>
              <div>
                <b style={{ fontSize: '13px', color: '#fff', display: 'block' }}>Read. Learn. Grow.</b>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Your reading journey, your control.</span>
              </div>
            </div>
          </div>

          {/* 6 Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
            
            {/* Card 1: Account Settings */}
            <div style={{ background: '#0b1120', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '16px', color: '#38bdf8' }}>👤</span>
                <b style={{ fontSize: '15px' }}>Account Settings</b>
              </div>
              <p style={{ color: '#64748b', fontSize: '11px', margin: '0 0 16px' }}>Update your personal information and account details.</p>

              <ProfilePhotoUploader
                defaultChar={avatarChar}
                onPhotoChange={(newPhoto) => setHeaderAvatar(newPhoto)}
              />

              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Full Name</span>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>Max 3 edits / 30 days</span>
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); setNameError(''); }}
                    style={{ width: '100%', background: '#070b14', border: nameError ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                  />
                  {nameError && (
                    <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block', lineHeight: 1.4 }}>
                      ⚠️ {nameError}
                    </span>
                  )}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Email Address</span>
                    <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 'bold' }}>🔒 Locked</span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      value={emailVal}
                      readOnly
                      disabled
                      style={{
                        width: '100%',
                        background: '#040711',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '8px',
                        padding: '8px 32px 8px 12px',
                        color: '#64748b',
                        fontSize: '12px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        cursor: 'not-allowed',
                      }}
                    />
                    <span style={{ position: 'absolute', right: '10px', top: '8px', fontSize: '12px', opacity: 0.6 }}>🔒</span>
                  </div>
                  <span style={{ fontSize: '10px', color: '#64748b', marginTop: '2px', display: 'block' }}>
                    Registered email cannot be modified.
                  </span>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Username</span>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>Max 3 edits / 60 days</span>
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setUsernameError(''); }}
                    style={{ width: '100%', background: '#070b14', border: usernameError ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                  />
                  {usernameError && (
                    <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block', lineHeight: 1.4 }}>
                      ⚠️ {usernameError}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  style={{
                    marginTop: '8px',
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    padding: '9px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  {savedSuccess ? '✓ Saved Successfully' : 'Save Changes'}
                </button>
              </form>
            </div>

            {/* Card 2: Reading Preferences */}
            <div style={{ background: '#0b1120', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '16px', color: '#38bdf8' }}>📖</span>
                <b style={{ fontSize: '15px' }}>Reading Preferences</b>
              </div>
              <p style={{ color: '#64748b', fontSize: '11px', margin: '0 0 16px' }}>Customize your reading experience.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Default Reading Mode</span>
                  <select style={{ width: '100%', background: '#070b14', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '12px', outline: 'none' }}>
                    <option>Dark Mode</option>
                    <option>Light Mode</option>
                  </select>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Font Size</span>
                  <select style={{ width: '100%', background: '#070b14', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '12px', outline: 'none' }}>
                    <option>Medium</option>
                    <option>Small</option>
                    <option>Large</option>
                  </select>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Line Spacing</span>
                  <select style={{ width: '100%', background: '#070b14', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '12px', outline: 'none' }}>
                    <option>Normal</option>
                    <option>Relaxed</option>
                  </select>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Theme</span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {[
                      { name: 'Dark', bg: '#0b1329' },
                      { name: 'Light', bg: '#f8fafc', text: '#000' },
                      { name: 'Sepia', bg: '#fef3c7', text: '#78350f' },
                      { name: 'Custom', bg: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' },
                    ].map((t) => (
                      <div
                        key={t.name}
                        onClick={() => setSelectedTheme(t.name)}
                        style={{
                          background: t.bg,
                          border: selectedTheme === t.name ? '2px solid #2563eb' : '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          padding: '12px 4px',
                          textAlign: 'center',
                          fontSize: '11px',
                          color: t.text || '#fff',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                        }}
                      >
                        {t.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Notifications */}
            <div style={{ background: '#0b1120', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '16px', color: '#38bdf8' }}>🔔</span>
                <b style={{ fontSize: '15px' }}>Notifications</b>
              </div>
              <p style={{ color: '#64748b', fontSize: '11px', margin: '0 0 16px' }}>Get notified about new books and updates.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>New Book Releases</b>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>Be the first to know about new arrivals</span>
                  </div>
                  <div onClick={() => setNotifReleases(!notifReleases)} style={{ width: '38px', height: '22px', background: notifReleases ? '#2563eb' : '#1e293b', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
                    <div style={{ width: '16px', height: '16px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: notifReleases ? '19px' : '3px', transition: '0.2s' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Reading Reminders</b>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>Daily/weekly reading goals</span>
                  </div>
                  <div onClick={() => setNotifReminders(!notifReminders)} style={{ width: '38px', height: '22px', background: notifReminders ? '#2563eb' : '#1e293b', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
                    <div style={{ width: '16px', height: '16px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: notifReminders ? '19px' : '3px', transition: '0.2s' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Comments & Replies</b>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>Get notified about your activity</span>
                  </div>
                  <div onClick={() => setNotifReplies(!notifReplies)} style={{ width: '38px', height: '22px', background: notifReplies ? '#2563eb' : '#1e293b', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
                    <div style={{ width: '16px', height: '16px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: notifReplies ? '19px' : '3px', transition: '0.2s' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Marketing & Updates</b>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>Product updates, offers and news</span>
                  </div>
                  <div onClick={() => setNotifMarketing(!notifMarketing)} style={{ width: '38px', height: '22px', background: notifMarketing ? '#2563eb' : '#1e293b', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
                    <div style={{ width: '16px', height: '16px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: notifMarketing ? '19px' : '3px', transition: '0.2s' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: Privacy & Security */}
            <div style={{ background: '#0b1120', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '16px', color: '#38bdf8' }}>🛡️</span>
                <b style={{ fontSize: '15px' }}>Privacy & Security</b>
              </div>
              <p style={{ color: '#64748b', fontSize: '11px', margin: '0 0 16px' }}>Keep your account safe and secure.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Change Password</b>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>Update your password regularly</span>
                  </div>
                  <span style={{ color: '#64748b' }}>›</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Two-Factor Authentication (2FA)</b>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>Add an extra layer of security</span>
                  </div>
                  <span style={{ color: '#64748b' }}>›</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Login Activity</b>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>View recent login sessions</span>
                  </div>
                  <span style={{ color: '#64748b' }}>›</span>
                </div>

                <div onClick={handleLogout} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block', color: '#ef4444' }}>Logout Account</b>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>Sign out from this device</span>
                  </div>
                  <span style={{ color: '#ef4444' }}>🚪</span>
                </div>
              </div>
            </div>

            {/* Card 5: Library Settings */}
            <div style={{ background: '#0b1120', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '16px', color: '#38bdf8' }}>📚</span>
                <b style={{ fontSize: '15px' }}>Library Settings</b>
              </div>
              <p style={{ color: '#64748b', fontSize: '11px', margin: '0 0 16px' }}>Manage your library and reading data.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Download History</b>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>View your downloaded books</span>
                  </div>
                  <span style={{ color: '#64748b' }}>›</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Reading Progress</b>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>Sync across devices</span>
                  </div>
                  <div onClick={() => setSyncProgress(!syncProgress)} style={{ width: '38px', height: '22px', background: syncProgress ? '#2563eb' : '#1e293b', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
                    <div style={{ width: '16px', height: '16px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: syncProgress ? '19px' : '3px', transition: '0.2s' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Auto Save</b>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>Save your reading position</span>
                  </div>
                  <div onClick={() => setAutoSavePos(!autoSavePos)} style={{ width: '38px', height: '22px', background: autoSavePos ? '#2563eb' : '#1e293b', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
                    <div style={{ width: '16px', height: '16px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: autoSavePos ? '19px' : '3px', transition: '0.2s' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Clear Cache</b>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>Free up storage space</span>
                  </div>
                  <button onClick={() => alert('Cache cleared!')} style={{ background: '#111c33', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>Clear</button>
                </div>
              </div>
            </div>

            {/* Card 6: Support & Help */}
            <div style={{ background: '#0b1120', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '16px', color: '#38bdf8' }}>🎧</span>
                <b style={{ fontSize: '15px' }}>Support & Help</b>
              </div>
              <p style={{ color: '#64748b', fontSize: '11px', margin: '0 0 16px' }}>Get help and contact our team.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Help Center</b>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>Find answers to common questions</span>
                  </div>
                  <span style={{ color: '#64748b' }}>›</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Contact Us</b>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>Reach out to our support team</span>
                  </div>
                  <span style={{ color: '#64748b' }}>›</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Terms & Conditions</b>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>Read our terms of service</span>
                  </div>
                  <span style={{ color: '#64748b' }}>›</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Privacy Policy</b>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>How we handle your data</span>
                  </div>
                  <span style={{ color: '#64748b' }}>›</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  )
                           }
