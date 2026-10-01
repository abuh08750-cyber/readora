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

function hexToRgb(hex: string) {
  let c = (hex || '#6366f1').replace('#', '')
  if (c.length === 3) c = c.split('').map(x => x + x).join('')
  const num = parseInt(c, 16) || 0
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [fullName, setFullName] = useState('Abu Huzaifa')
  const [savedFullName, setSavedFullName] = useState('Abu Huzaifa')
  const [emailVal, setEmailVal] = useState('waqasabu186@gmail.com')
  const [username, setUsername] = useState('waqasabu186')
  const [savedUsername, setSavedUsername] = useState('waqasabu186')

  const [savedSuccess, setSavedSuccess] = useState(false)
  const [headerAvatar, setHeaderAvatar] = useState<string | null>(null)

  // Theme & Dynamic Colors
  const [selectedTheme, setSelectedTheme] = useState<'Dark' | 'Light' | 'Sepia' | 'Custom'>('Dark')
  const [customColor, setCustomColor] = useState<string>('#6366f1')
  const [readingMode, setReadingMode] = useState('Dark Mode')
  const [fontSize, setFontSize] = useState('Medium')
  const [lineSpacing, setLineSpacing] = useState('Normal')
  const [themeSavedToast, setThemeSavedToast] = useState(false)

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

      const savedGlobalTheme = localStorage.getItem('readora_app_theme') as any
      if (savedGlobalTheme) setSelectedTheme(savedGlobalTheme)

      const savedCustom = localStorage.getItem('readora_custom_color')
      if (savedCustom) setCustomColor(savedCustom)

      const savedPrefs = localStorage.getItem('readora_reading_prefs')
      if (savedPrefs) {
        const parsed = JSON.parse(savedPrefs)
        if (parsed.readingMode) setReadingMode(parsed.readingMode)
        if (parsed.fontSize) setFontSize(parsed.fontSize)
        if (parsed.lineSpacing) setLineSpacing(parsed.lineSpacing)
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  // Dynamic Theme Colors Calculation
  const getThemePalette = () => {
    if (selectedTheme === 'Light') {
      return {
        pageBg: '#f8fafc',
        sidebarBg: '#ffffff',
        headerBg: '#ffffff',
        cardBg: '#ffffff',
        innerBg: '#f1f5f9',
        textMain: '#0f172a',
        textMuted: '#64748b',
        border: 'rgba(0,0,0,0.1)',
        activeNav: '#2563eb',
        activeNavText: '#ffffff',
        accent: '#2563eb',
      }
    }

    if (selectedTheme === 'Sepia') {
      return {
        pageBg: '#fbf0d9',
        sidebarBg: '#f4e4c1',
        headerBg: '#f7e8c8',
        cardBg: '#fdf6e2',
        innerBg: '#faebd0',
        textMain: '#5c3d10',
        textMuted: '#8c6b39',
        border: 'rgba(92,61,16,0.15)',
        activeNav: '#b45309',
        activeNavText: '#ffffff',
        accent: '#b45309',
      }
   }

    if (selectedTheme === 'Custom') {
      const { r, g, b } = hexToRgb(customColor)
      return {
        pageBg: `radial-gradient(ellipse at top, rgba(${r}, ${g}, ${b}, 0.28) 0%, #06080f 85%)`,
        sidebarBg: `rgba(${Math.floor(r * 0.08)}, ${Math.floor(g * 0.08)}, ${Math.floor(b * 0.08)}, 0.95)`,
        headerBg: `rgba(${Math.floor(r * 0.06)}, ${Math.floor(g * 0.06)}, ${Math.floor(b * 0.06)}, 0.95)`,
        cardBg: `rgba(${Math.floor(r * 0.15 + 10)}, ${Math.floor(g * 0.15 + 14)}, ${Math.floor(b * 0.15 + 24)}, 0.85)`,
        innerBg: `rgba(${Math.floor(r * 0.08)}, ${Math.floor(g * 0.08)}, ${Math.floor(b * 0.08)}, 0.9)`,
        textMain: '#f8fafc',
        textMuted: `rgba(${Math.min(r + 60, 240)}, ${Math.min(g + 60, 240)}, ${Math.min(b + 60, 240)}, 0.85)`,
        border: `rgba(${r}, ${g}, ${b}, 0.35)`,
        activeNav: customColor,
        activeNavText: '#ffffff',
        accent: customColor,
      }
    }

    // Default: Dark
    return {
      pageBg: '#070b14',
      sidebarBg: '#070b14',
      headerBg: '#070b14',
      cardBg: '#0b1120',
      innerBg: '#070b14',
      textMain: '#f8fafc',
      textMuted: '#94a3b8',
      border: 'rgba(255,255,255,0.06)',
      activeNav: '#1d4ed8',
      activeNavText: '#ffffff',
      accent: '#38bdf8',
    }
  }

  const currentTheme = getThemePalette()

  const handleThemeChange = (newTheme: 'Dark' | 'Light' | 'Sepia' | 'Custom') => {
    setSelectedTheme(newTheme)
    try {
      localStorage.setItem('readora_app_theme', newTheme)
      setThemeSavedToast(true)
      setTimeout(() => setThemeSavedToast(false), 2000)
    } catch {}
  }

  const handleCustomColorPick = (color: string) => {
    setCustomColor(color)
    setSelectedTheme('Custom')
    try {
      localStorage.setItem('readora_custom_color', color)
      localStorage.setItem('readora_app_theme', 'Custom')
    } catch {}
  }

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
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: currentTheme.pageBg,
      color: currentTheme.textMain,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      transition: 'all 0.3s ease',
    }}>
      
      {/* Sidebar Navigation */}
      <aside style={{
        width: '220px',
        background: currentTheme.sidebarBg,
        borderRight: `1px solid ${currentTheme.border}`,
        padding: '20px 14px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0,
        transition: 'all 0.3s ease',
      }}>
        <div>
          <div onClick={() => window.location.href = '/'} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '19px', fontWeight: '800', marginBottom: '26px', cursor: 'pointer' }}>
            <span>📖</span><span>Readora</span>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '13px' }}>
            <div onClick={() => window.location.href = '/'} style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: currentTheme.textMuted }}>🏠 Home</div>
            <div onClick={() => window.location.href = '/library'} style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: currentTheme.textMuted }}>📖 Library</div>
            <div onClick={() => window.location.href = '/#categories-section'} style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: currentTheme.textMuted }}>🗂 Categories</div>
            
            <div style={{ height: '1px', background: currentTheme.border, margin: '8px 0' }} />

            <div onClick={() => window.location.href = '/library'} style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: currentTheme.textMuted }}>📑 My Books</div>
            <div onClick={() => window.location.href = '/library'} style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: currentTheme.textMuted }}>🕒 Recently Read</div>
            <div onClick={() => window.location.href = '/library'} style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: currentTheme.textMuted }}>🤍 Favorites</div>
            <div style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: currentTheme.activeNavText, background: currentTheme.activeNav, fontWeight: 'bold' }}>⚙️ Settings</div>
          </nav>
        </div>

        <div style={{ background: currentTheme.innerBg, padding: '12px', borderRadius: '12px', fontSize: '11px', border: `1px solid ${currentTheme.border}` }}>
          <p style={{ margin: '0 0 4px', fontWeight: '700' }}>Better Books<br />Bigger Dreams</p>
          <span style={{ color: currentTheme.accent, fontWeight: 'bold' }}>📖 Readora</span>
        </div>
      </aside>

      {/* Main Panel */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
        
        {/* Top Header */}
        <header style={{
          padding: '14px 24px',
          borderBottom: `1px solid ${currentTheme.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          background: currentTheme.headerBg,
          backdropFilter: 'blur(12px)',
          zIndex: 100,
          transition: 'all 0.3s ease',
        }}>
          <div style={{ position: 'relative', width: '320px', maxWidth: '65%' }}>
            <span style={{ position: 'absolute', left: '10px', top: '8px', color: currentTheme.textMuted, fontSize: '13px' }}>🔍</span>
            <input
              type="text"
              placeholder="Search for books, authors, or categories..."
              style={{
                width: '100%',
                background: currentTheme.innerBg,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '18px',
                padding: '7px 12px 7px 30px',
                color: currentTheme.textMain,
                fontSize: '12px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: currentTheme.textMuted, cursor: 'pointer', fontSize: '16px' }}>☀️</span>

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
              border: `2px solid ${currentTheme.border}`,
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
                <span style={{ fontSize: '24px', color: currentTheme.accent }}>⚙️</span>
                <h1 style={{ fontSize: '26px', fontWeight: '800', margin: 0, letterSpacing: '-0.3px' }}>Settings</h1>
              </div>
              <p style={{ color: currentTheme.textMuted, fontSize: '13px', margin: '4px 0 0' }}>Manage your account, preferences and app settings.</p>
            </div>

            <div style={{
              background: currentTheme.cardBg,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '12px',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <span style={{ fontSize: '22px' }}>📖</span>
              <div>
                <b style={{ fontSize: '13px', color: currentTheme.textMain, display: 'block' }}>Read. Learn. Grow.</b>
                <span style={{ fontSize: '11px', color: currentTheme.textMuted }}>Your reading journey, your control.</span>
              </div>
            </div>
          </div>

          {/* 6 Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
            
            {/* Card 1: Account Settings */}
            <div style={{
              background: currentTheme.cardBg,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '16px',
              padding: '20px',
              transition: 'all 0.3s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '16px', color: currentTheme.accent }}>👤</span>
                <b style={{ fontSize: '15px' }}>Account Settings</b>
              </div>
              <p style={{ color: currentTheme.textMuted, fontSize: '11px', margin: '0 0 16px' }}>Update your personal information and account details.</p>

              <ProfilePhotoUploader
                defaultChar={avatarChar}
                onPhotoChange={(newPhoto) => setHeaderAvatar(newPhoto)}
              />

              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: currentTheme.textMuted }}>Full Name</span>
                    <span style={{ fontSize: '10px', color: currentTheme.textMuted }}>Max 3 edits / 30 days</span>
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); setNameError(''); }}
                    style={{
                      width: '100%',
                      background: currentTheme.innerBg,
                      border: nameError ? '1px solid #ef4444' : `1px solid ${currentTheme.border}`,
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: currentTheme.textMain,
                      fontSize: '12px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  {nameError && (
                    <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block', lineHeight: 1.4 }}>
                      ⚠️ {nameError}
                    </span>
                  )}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: currentTheme.textMuted }}>Email Address</span>
                    <span style={{ fontSize: '10px', color: currentTheme.accent, fontWeight: 'bold' }}>🔒 Locked</span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      value={emailVal}
                      readOnly
                      disabled
                      style={{
                        width: '100%',
                        background: currentTheme.innerBg,
                        border: `1px solid ${currentTheme.border}`,
                        borderRadius: '8px',
                        padding: '8px 32px 8px 12px',
                        color: currentTheme.textMuted,
                        fontSize: '12px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        cursor: 'not-allowed',
                        opacity: 0.7,
                      }}
                    />
                    <span style={{ position: 'absolute', right: '10px', top: '8px', fontSize: '12px', opacity: 0.6 }}>🔒</span>
                  </div>
                  <span style={{ fontSize: '10px', color: currentTheme.textMuted, marginTop: '2px', display: 'block' }}>
                    Registered email cannot be modified.
                  </span>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: currentTheme.textMuted }}>Username</span>
                    <span style={{ fontSize: '10px', color: currentTheme.textMuted }}>Max 3 edits / 60 days</span>
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setUsernameError(''); }}
                    style={{
                      width: '100%',
                      background: currentTheme.innerBg,
                      border: usernameError ? '1px solid #ef4444' : `1px solid ${currentTheme.border}`,
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: currentTheme.textMain,
                      fontSize: '12px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  {usernameError && (
                    <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block', lineHeight: 1.4 }}>
                      ⚠️️ {usernameError}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  style={{
                    marginTop: '8px',
                    background: currentTheme.activeNav,
                    color: currentTheme.activeNavText,
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

            {/* Card 2: Reading Preferences & LIVE COLOR THEME SWITCHER */}
            <div style={{
              background: currentTheme.cardBg,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '16px',
              padding: '20px',
              transition: 'all 0.3s ease',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px', color: currentTheme.accent }}>🎨</span>
                  <b style={{ fontSize: '15px' }}>Reading Preferences</b>
                </div>
                {themeSavedToast && (
                  <span style={{ fontSize: '10px', color: currentTheme.accent, fontWeight: 'bold' }}>✓ Theme Changed!</span>
                )}
              </div>
              <p style={{ color: currentTheme.textMuted, fontSize: '11px', margin: '0 0 16px' }}>Customize your reading experience and site colors.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: currentTheme.textMuted, display: 'block', marginBottom: '4px' }}>Default Reading Mode</span>
                  <select
                    value={readingMode}
                    onChange={(e) => setReadingMode(e.target.value)}
                    style={{
                      width: '100%',
                      background: currentTheme.innerBg,
                      border: `1px solid ${currentTheme.border}`,
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: currentTheme.textMain,
                      fontSize: '12px',
                      outline: 'none',
                    }}
                  >
                    <option>Dark Mode</option>
                    <option>Light Mode</option>
                  </select>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: currentTheme.textMuted, display: 'block', marginBottom: '4px' }}>Font Size</span>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    style={{
                      width: '100%',
                      background: currentTheme.innerBg,
                      border: `1px solid ${currentTheme.border}`,
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: currentTheme.textMain,
                      fontSize: '12px',
                      outline: 'none',
                    }}
                  >
                    <option>Small</option>
                    <option>Medium</option>
                    <option>Large</option>
                  </select>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: currentTheme.textMuted, display: 'block', marginBottom: '4px' }}>Line Spacing</span>
                  <select
                    value={lineSpacing}
                    onChange={(e) => setLineSpacing(e.target.value)}
                    style={{
                      width: '100%',
                      background: currentTheme.innerBg,
                      border: `1px solid ${currentTheme.border}`,
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: currentTheme.textMain,
                      fontSize: '12px',
                      outline: 'none',
                    }}
                  >
                    <option>Normal</option>
                    <option>Relaxed</option>
                  </select>
                </div>

                {/* THEME PILLS (Direct Tap Changes Colors) */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', color: currentTheme.textMuted }}>Theme Palette</span>
                    <span style={{ fontSize: '10px', color: currentTheme.accent, fontWeight: 'bold' }}>Active: {selectedTheme}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {[
                      { name: 'Dark', bg: '#0b1329', text: '#fff' },
                      { name: 'Light', bg: '#ffffff', text: '#0f172a' },
                      { name: 'Sepia', bg: '#fef3c7', text: '#78350f' },
                      { name: 'Custom', bg: customColor, text: '#fff' },
                    ].map((t) => (
                      <div
                        key={t.name}
                        onClick={() => handleThemeChange(t.name as any)}
                        style={{
                          background: t.bg,
                          border: selectedTheme === t.name ? `2px solid #ffffff` : `1px solid ${currentTheme.border}`,
                          borderRadius: '8px',
                          padding: '12px 4px',
                          textAlign: 'center',
                          fontSize: '11px',
                          color: t.text,
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          boxShadow: selectedTheme === t.name ? '0 0 10px rgba(255,255,255,0.4)' : 'none',
                          transform: selectedTheme === t.name ? 'scale(1.04)' : 'scale(1)',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {t.name}
                      </div>
                    ))}
                  </div>
                </div>

                {/* REAL COLOR WHEEL (Shown when Custom is selected) */}
                {selectedTheme === 'Custom' && (
                  <div style={{
                    marginTop: '8px',
                    background: currentTheme.innerBg,
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: '12px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <b style={{ fontSize: '12px', color: currentTheme.accent }}>🎨 Choose Any Custom Color</b>
                      <span style={{ fontSize: '10px', color: currentTheme.textMuted }}>Live Sync</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {/* Spectrum Picker Input */}
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => handleCustomColorPick(e.target.value)}
                        style={{
                          width: '44px',
                          height: '44px',
                          border: `2px solid ${currentTheme.border}`,
                          borderRadius: '50%',
                          cursor: 'pointer',
                          background: 'none',
                          padding: 0,
                          outline: 'none',
                        }}
                      />

                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '10px', color: currentTheme.textMuted, display: 'block', marginBottom: '2px' }}>HEX Code</span>
                        <input
                          type="text"
                          value={customColor.toUpperCase()}
                          onChange={(e) => handleCustomColorPick(e.target.value)}
                          style={{
                            width: '100%',
                            background: currentTheme.cardBg,
                            border: `1px solid ${currentTheme.border}`,
                            borderRadius: '6px',
                            padding: '6px 10px',
                            color: currentTheme.textMain,
                            fontSize: '12px',
                            fontWeight: 'bold',
                            fontFamily: 'monospace',
                            outline: 'none',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    </div>

                    {/* Quick Palette Circles */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6', '#ef4444'].map((hex) => (
                        <div
                          key={hex}
                          onClick={() => handleCustomColorPick(hex)}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: hex,
                            cursor: 'pointer',
                            border: customColor.toLowerCase() === hex ? '2px solid #ffffff' : '1px solid rgba(0,0,0,0.2)',
                            transform: customColor.toLowerCase() === hex ? 'scale(1.15)' : 'scale(1)',
                            transition: '0.2s',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Card 3: Notifications */}
            <div style={{
              background: currentTheme.cardBg,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '16px',
              padding: '20px',
              transition: 'all 0.3s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '16px', color: currentTheme.accent }}>🔔</span>
                <b style={{ fontSize: '15px' }}>Notifications</b>
              </div>
              <p style={{ color: currentTheme.textMuted, fontSize: '11px', margin: '0 0 16px' }}>Get notified about new books and updates.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>New Book Releases</b>
                    <span style={{ fontSize: '10px', color: currentTheme.textMuted }}>Be the first to know about new arrivals</span>
                  </div>
                  <div onClick={() => setNotifReleases(!notifReleases)} style={{ width: '38px', height: '22px', background: notifReleases ? currentTheme.activeNav : currentTheme.innerBg, borderRadius: '12px', position: 'relative', cursor: 'pointer', border: `1px solid ${currentTheme.border}` }}>
                    <div style={{ width: '16px', height: '16px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: notifReleases ? '18px' : '2px', transition: '0.2s' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Reading Reminders</b>
                    <span style={{ fontSize: '10px', color: currentTheme.textMuted }}>Daily/weekly reading goals</span>
                  </div>
                  <div onClick={() => setNotifReminders(!notifReminders)} style={{ width: '38px', height: '22px', background: notifReminders ? currentTheme.activeNav : currentTheme.innerBg, borderRadius: '12px', position: 'relative', cursor: 'pointer', border: `1px solid ${currentTheme.border}` }}>
                    <div style={{ width: '16px', height: '16px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: notifReminders ? '18px' : '2px', transition: '0.2s' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Comments & Replies</b>
                    <span style={{ fontSize: '10px', color: currentTheme.textMuted }}>Get notified about your activity</span>
                  </div>
                  <div onClick={() => setNotifReplies(!notifReplies)} style={{ width: '38px', height: '22px', background: notifReplies ? currentTheme.activeNav : currentTheme.innerBg, borderRadius: '12px', position: 'relative', cursor: 'pointer', border: `1px solid ${currentTheme.border}` }}>
                    <div style={{ width: '16px', height: '16px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: notifReplies ? '18px' : '2px', transition: '0.2s' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Marketing & Updates</b>
                    <span style={{ fontSize: '10px', color: currentTheme.textMuted }}>Product updates, offers and news</span>
                  </div>
                  <div onClick={() => setNotifMarketing(!notifMarketing)} style={{ width: '38px', height: '22px', background: notifMarketing ? currentTheme.activeNav : currentTheme.innerBg, borderRadius: '12px', position: 'relative', cursor: 'pointer', border: `1px solid ${currentTheme.border}` }}>
                    <div style={{ width: '16px', height: '16px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: notifMarketing ? '18px' : '2px', transition: '0.2s' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: Privacy & Security */}
            <div style={{
              background: currentTheme.cardBg,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '16px',
              padding: '20px',
              transition: 'all 0.3s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '16px', color: currentTheme.accent }}>🛡️</span>
                <b style={{ fontSize: '15px' }}>Privacy & Security</b>
              </div>
              <p style={{ color: currentTheme.textMuted, fontSize: '11px', margin: '0 0 16px' }}>Keep your account safe and secure.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Change Password</b>
                    <span style={{ fontSize: '10px', color: currentTheme.textMuted }}>Update your password regularly</span>
                  </div>
                  <span style={{ color: currentTheme.textMuted }}>›</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Two-Factor Authentication (2FA)</b>
                    <span style={{ fontSize: '10px', color: currentTheme.textMuted }}>Add an extra layer of security</span>
                  </div>
                  <span style={{ color: currentTheme.textMuted }}>›</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Login Activity</b>
                    <span style={{ fontSize: '10px', color: currentTheme.textMuted }}>View recent login sessions</span>
                  </div>
                  <span style={{ color: currentTheme.textMuted }}>›</span>
                </div>

                <div onClick={handleLogout} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderTop: `1px solid ${currentTheme.border}`, paddingTop: '10px' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block', color: '#ef4444' }}>Logout Account</b>
                    <span style={{ fontSize: '10px', color: currentTheme.textMuted }}>Sign out from this device</span>
                  </div>
                  <span style={{ color: '#ef4444' }}>🚪</span>
                </div>
              </div>
            </div>

            {/* Card 5: Library Settings */}
            <div style={{
              background: currentTheme.cardBg,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '16px',
              padding: '20px',
              transition: 'all 0.3s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '16px', color: currentTheme.accent }}>📚</span>
                <b style={{ fontSize: '15px' }}>Library Settings</b>
              </div>
              <p style={{ color: currentTheme.textMuted, fontSize: '11px', margin: '0 0 16px' }}>Manage your library and reading data.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Download History</b>
                    <span style={{ fontSize: '10px', color: currentTheme.textMuted }}>View your downloaded books</span>
                  </div>
                  <span style={{ color: currentTheme.textMuted }}>›</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Reading Progress</b>
                    <span style={{ fontSize: '10px', color: currentTheme.textMuted }}>Sync across devices</span>
                  </div>
                  <div onClick={() => setSyncProgress(!syncProgress)} style={{ width: '38px', height: '22px', background: syncProgress ? currentTheme.activeNav : currentTheme.innerBg, borderRadius: '12px', position: 'relative', cursor: 'pointer', border: `1px solid ${currentTheme.border}` }}>
                    <div style={{ width: '16px', height: '16px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: syncProgress ? '18px' : '2px', transition: '0.2s' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Auto Save</b>
                    <span style={{ fontSize: '10px', color: currentTheme.textMuted }}>Save your reading position</span>
                  </div>
                  <div onClick={() => setAutoSavePos(!autoSavePos)} style={{ width: '38px', height: '22px', background: autoSavePos ? currentTheme.activeNav : currentTheme.innerBg, borderRadius: '12px', position: 'relative', cursor: 'pointer', border: `1px solid ${currentTheme.border}` }}>
                    <div style={{ width: '16px', height: '16px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: autoSavePos ? '18px' : '2px', transition: '0.2s' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${currentTheme.border}`, paddingTop: '10px' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Clear Cache</b>
                    <span style={{ fontSize: '10px', color: currentTheme.textMuted }}>Free up storage space</span>
                  </div>
                  <button onClick={() => alert('Cache cleared!')} style={{ background: currentTheme.innerBg, color: currentTheme.textMuted, border: `1px solid ${currentTheme.border}`, padding: '5px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>Clear</button>
                </div>
              </div>
            </div>

            {/* Card 6: Support & Help */}
            <div style={{
              background: currentTheme.cardBg,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '16px',
              padding: '20px',
              transition: 'all 0.3s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '16px', color: currentTheme.accent }}>🎧</span>
                <b style={{ fontSize: '15px' }}>Support & Help</b>
              </div>
              <p style={{ color: currentTheme.textMuted, fontSize: '11px', margin: '0 0 16px' }}>Get help and contact our team.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Help Center</b>
                    <span style={{ fontSize: '10px', color: currentTheme.textMuted }}>Find answers to common questions</span>
                  </div>
                  <span style={{ color: currentTheme.textMuted }}>›</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Contact Us</b>
                    <span style={{ fontSize: '10px', color: currentTheme.textMuted }}>Reach out to our support team</span>
                  </div>
                  <span style={{ color: currentTheme.textMuted }}>›</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Terms & Conditions</b>
                    <span style={{ fontSize: '10px', color: currentTheme.textMuted }}>Read our terms of service</span>
                  </div>
                  <span style={{ color: currentTheme.textMuted }}>›</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Privacy Policy</b>
                    <span style={{ fontSize: '10px', color: currentTheme.textMuted }}>How we handle your data</span>
                  </div>
                  <span style={{ color: currentTheme.textMuted }}>›</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  )
                         }
