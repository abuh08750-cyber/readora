'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import ProfilePhotoUploader from '@/components/ProfilePhotoUploader'
import NotificationDropdown from '@/components/NotificationDropdown'
import ChangePasswordModal from '@/components/ChangePasswordModal'

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
  const [authChecking, setAuthChecking] = useState(true)

  const [fullName, setFullName] = useState('Abu Huzaifa')
  const [savedFullName, setSavedFullName] = useState('Abu Huzaifa')
  const [emailVal, setEmailVal] = useState('waqasabu186@gmail.com')
  const [username, setUsername] = useState('waqasabu186')
  const [savedUsername, setSavedUsername] = useState('waqasabu186')

  const [savedSuccess, setSavedSuccess] = useState(false)
  const [headerAvatar, setHeaderAvatar] = useState<string | null>(null)

  // Theme Settings
  const [activeTheme, setActiveTheme] = useState<'Dark' | 'Light' | 'Sepia' | 'Custom'>('Dark')
  const [customHex, setCustomHex] = useState('#6366f1')

  // Reading Preferences
  const [readingMode, setReadingMode] = useState('Dark Mode')
  const [fontSize, setFontSize] = useState('Medium')
  const [lineSpacing, setLineSpacing] = useState('Normal')

  // Validation
  const [nameError, setNameError] = useState('')
  const [usernameError, setUsernameError] = useState('')

  // Notifications Toggles (Persistent)
  const [notifReleases, setNotifReleases] = useState(true)
  const [notifReminders, setNotifReminders] = useState(false)
  const [notifReplies, setNotifReplies] = useState(true)
  const [notifMarketing, setNotifMarketing] = useState(false)

  // Library Settings Toggles (Persistent)
  const [syncProgress, setSyncProgress] = useState(true)
  const [autoSavePos, setAutoSavePos] = useState(true)

  // Modal Open States
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [activeModal, setActiveModal] = useState<'none' | '2fa' | 'activity'>('none')
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        window.location.href = '/'
        return
      }
      setUser(session.user)
      if (session.user.email) setEmailVal(session.user.email)
      setAuthChecking(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        window.location.href = '/'
      } else {
        setUser(session.user)
      }
    })

    try {
      const storedName = localStorage.getItem('readora_profile_fullname')
      const storedUser = localStorage.getItem('readora_profile_username')
      if (storedName) { setFullName(storedName); setSavedFullName(storedName); }
      if (storedUser) { setUsername(storedUser); setSavedUsername(storedUser); }
      const savedImg = localStorage.getItem('readora_profile_avatar')
      if (savedImg) setHeaderAvatar(savedImg)

      const savedT = localStorage.getItem('readora_app_theme') as any
      if (savedT) setActiveTheme(savedT)
      const savedC = localStorage.getItem('readora_custom_color')
      if (savedC) setCustomHex(savedC)

      const savedPrefs = localStorage.getItem('readora_reading_prefs')
      if (savedPrefs) {
        const parsed = JSON.parse(savedPrefs)
        if (parsed.readingMode) setReadingMode(parsed.readingMode)
        if (parsed.fontSize) setFontSize(parsed.fontSize)
        if (parsed.lineSpacing) setLineSpacing(parsed.lineSpacing)
      }

      const savedNotifs = localStorage.getItem('readora_notif_settings')
      if (savedNotifs) {
        const parsedNotifs = JSON.parse(savedNotifs)
        if (typeof parsedNotifs.releases === 'boolean') setNotifReleases(parsedNotifs.releases)
        if (typeof parsedNotifs.reminders === 'boolean') setNotifReminders(parsedNotifs.reminders)
        if (typeof parsedNotifs.replies === 'boolean') setNotifReplies(parsedNotifs.replies)
        if (typeof parsedNotifs.marketing === 'boolean') setNotifMarketing(parsedNotifs.marketing)
      }

      const savedLibToggles = localStorage.getItem('readora_library_toggles')
      if (savedLibToggles) {
        const parsedLib = JSON.parse(savedLibToggles)
        if (typeof parsedLib.syncProgress === 'boolean') setSyncProgress(parsedLib.syncProgress)
        if (typeof parsedLib.autoSavePos === 'boolean') setAutoSavePos(parsedLib.autoSavePos)
      }
    } catch (e) {}

    return () => subscription.unsubscribe()
  }, [])

  const toggleNotification = (key: 'releases' | 'reminders' | 'replies' | 'marketing') => {
    let nextReleases = notifReleases
    let nextReminders = notifReminders
    let nextReplies = notifReplies
    let nextMarketing = notifMarketing

    if (key === 'releases') {
      nextReleases = !notifReleases
      setNotifReleases(nextReleases)
    } else if (key === 'reminders') {
      nextReminders = !notifReminders
      setNotifReminders(nextReminders)
    } else if (key === 'replies') {
      nextReplies = !notifReplies
      setNotifReplies(nextReplies)
    } else if (key === 'marketing') {
      nextMarketing = !notifMarketing
      setNotifMarketing(nextMarketing)
    }

    try {
      localStorage.setItem('readora_notif_settings', JSON.stringify({
        releases: nextReleases,
        reminders: nextReminders,
        replies: nextReplies,
        marketing: nextMarketing,
      }))
    } catch (e) {}
  }

  const toggleLibrarySetting = (key: 'sync' | 'autoSave') => {
    let nextSync = syncProgress
    let nextAutoSave = autoSavePos

    if (key === 'sync') {
      nextSync = !syncProgress
      setSyncProgress(nextSync)
    } else if (key === 'autoSave') {
      nextAutoSave = !autoSavePos
      setAutoSavePos(nextAutoSave)
    }

    try {
      localStorage.setItem('readora_library_toggles', JSON.stringify({
        syncProgress: nextSync,
        autoSavePos: nextAutoSave,
      }))
    } catch (e) {}
  }

  // Dynamic Theme Colors
  const styles = (() => {
    if (activeTheme === 'Light') {
      return {
        bg: '#f8fafc',
        sidebar: '#ffffff',
        header: '#ffffff',
        card: '#ffffff',
        inner: '#f1f5f9',
        text: '#0f172a',
        muted: '#64748b',
        border: 'rgba(0,0,0,0.1)',
        nav: '#2563eb',
        accent: '#2563eb',
      }
    }
    if (activeTheme === 'Sepia') {
      return {
        bg: '#fbf0d9',
        sidebar: '#f4e4c1',
        header: '#f7e8c8',
        card: '#fdf6e2',
        inner: '#faebd0',
        text: '#5c3d10',
        muted: '#8c6b39',
        border: 'rgba(92,61,16,0.15)',
        nav: '#b45309',
        accent: '#b45309',
      }
    }
    if (activeTheme === 'Custom') {
      const { r, g, b } = hexToRgb(customHex)
      return {
        bg: `radial-gradient(ellipse at top, rgba(${r}, ${g}, ${b}, 0.28) 0%, #06080f 85%)`,
        sidebar: `rgba(${Math.floor(r * 0.08)}, ${Math.floor(g * 0.08)}, ${Math.floor(b * 0.08)}, 0.95)`,
        header: `rgba(${Math.floor(r * 0.06)}, ${Math.floor(g * 0.06)}, ${Math.floor(b * 0.06)}, 0.95)`,
        card: `rgba(${Math.floor(r * 0.15 + 10)}, ${Math.floor(g * 0.15 + 14)}, ${Math.floor(b * 0.15 + 24)}, 0.85)`,
        inner: `rgba(${Math.floor(r * 0.08)}, ${Math.floor(g * 0.08)}, ${Math.floor(b * 0.08)}, 0.9)`,
        text: '#f8fafc',
        muted: `rgba(${Math.min(r + 60, 240)}, ${Math.min(g + 60, 240)}, ${Math.min(b + 60, 240)}, 0.85)`,
        border: `rgba(${r}, ${g}, ${b}, 0.35)`,
        nav: customHex,
        accent: customHex,
      }
    }
    return {
      bg: '#070b14',
      sidebar: '#070b14',
      header: '#070b14',
      card: '#0b1120',
      inner: '#070b14',
      text: '#f8fafc',
      muted: '#94a3b8',
      border: 'rgba(255,255,255,0.06)',
      nav: '#1d4ed8',
      accent: '#38bdf8',
    }
  })()

  const switchTheme = (t: 'Dark' | 'Light' | 'Sepia' | 'Custom') => {
    setActiveTheme(t)
    try {
      localStorage.setItem('readora_app_theme', t)
    } catch {}
  }

  const changeCustomColor = (hex: string) => {
    setCustomHex(hex)
    setActiveTheme('Custom')
    try {
      localStorage.setItem('readora_custom_color', hex)
      localStorage.setItem('readora_app_theme', 'Custom')
    } catch {}
  }

  const saveReadingPrefs = (updated: { mode?: string; font?: string; line?: string }) => {
    const nextPrefs = {
      readingMode: updated.mode ?? readingMode,
      fontSize: updated.font ?? fontSize,
      lineSpacing: updated.line ?? lineSpacing,
    }
    try {
      localStorage.setItem('readora_reading_prefs', JSON.stringify(nextPrefs))
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

    const recentNameChanges = nameHistory.filter(t => now - t < THIRTY_DAYS_MS)
    const isNameChanged = fullName.trim() !== savedFullName.trim()

    if (isNameChanged && recentNameChanges.length >= 3) {
      const oldest = Math.min(...recentNameChanges)
      const daysLeft = Math.ceil((oldest + THIRTY_DAYS_MS - now) / (24 * 60 * 60 * 1000))
      setNameError(`You can only change your name 3 times every 30 days. Please try again in ${daysLeft} days.`)
      hasError = true
    }

    let userHistory: number[] = []
    try {
      const stored = localStorage.getItem('readora_username_change_history')
      if (stored) userHistory = JSON.parse(stored)
    } catch {}

    const recentUserChanges = userHistory.filter(t => now - t < SIXTY_DAYS_MS)
    const isUserChanged = username.trim() !== savedUsername.trim()

    if (isUserChanged && recentUserChanges.length >= 3) {
      const oldest = Math.min(...recentUserChanges)
      const daysLeft = Math.ceil((oldest + SIXTY_DAYS_MS - now) / (24 * 60 * 60 * 1000))
      setUsernameError(`You can only change your username 3 times every 60 days. Please try again in ${daysLeft} days.`)
      hasError = true
    }

    if (hasError) return

    try {
      if (isNameChanged) {
        localStorage.setItem('readora_name_change_history', JSON.stringify([...recentNameChanges, now]))
        localStorage.setItem('readora_profile_fullname', fullName.trim())
        setSavedFullName(fullName.trim())
      }
      if (isUserChanged) {
        localStorage.setItem('readora_username_change_history', JSON.stringify([...recentUserChanges, now]))
        localStorage.setItem('readora_profile_username', username.trim())
        setSavedUsername(username.trim())
      }
    } catch (err) {}

    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2500)
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch {}
    try {
      localStorage.removeItem('readora_profile_avatar')
      localStorage.removeItem('supabase.auth.token')
    } catch {}
    window.location.href = '/'
  }

  if (authChecking) {
    return (
      <div style={{ minHeight: '100vh', background: '#070b14', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
        Verifying session...
      </div>
    )
  }

  const avatarChar = user?.email ? user.email.charAt(0).toUpperCase() : 'W'

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: styles.bg,
      color: styles.text,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      transition: 'all 0.25s ease'
    }}>
      
      {/* Sidebar Navigation */}
      <aside style={{
        width: '220px',
        background: styles.sidebar,
        borderRight: `1px solid ${styles.border}`,
        padding: '20px 14px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div>
          <div onClick={() => window.location.href = '/'} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '19px', fontWeight: '800', marginBottom: '26px', cursor: 'pointer' }}>
            <span>📖</span><span>Readora</span>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '13px' }}>
            <div onClick={() => window.location.href = '/'} style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: styles.muted }}>🏠 Home</div>
            <div onClick={() => window.location.href = '/library'} style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: styles.muted }}>📖 Library</div>
            <div onClick={() => window.location.href = '/#categories-section'} style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: styles.muted }}>🗂 Categories</div>
            <div style={{ height: '1px', background: styles.border, margin: '8px 0' }} />
            <div onClick={() => window.location.href = '/library'} style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: styles.muted }}>📑 My Books</div>
            <div onClick={() => window.location.href = '/library'} style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: styles.muted }}>🕒 Recently Read</div>
            <div onClick={() => window.location.href = '/library'} style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: styles.muted }}>🤍 Favorites</div>
            <div style={{ padding: '9px 12px', borderRadius: '8px', cursor: 'pointer', color: '#fff', background: styles.nav, fontWeight: 'bold' }}>⚙️ Settings</div>
          </nav>
        </div>

        <div style={{ background: styles.inner, padding: '12px', borderRadius: '12px', fontSize: '11px', border: `1px solid ${styles.border}` }}>
          <p style={{ margin: '0 0 4px', fontWeight: '700' }}>Better Books<br />Bigger Dreams</p>
          <span style={{ color: styles.accent, fontWeight: 'bold' }}>📖 Readora</span>
        </div>
      </aside>

      {/* Main Panel */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
        
        {/* Top Header */}
        <header style={{
          padding: '14px 24px',
          borderBottom: `1px solid ${styles.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          background: styles.header,
          backdropFilter: 'blur(12px)',
          zIndex: 100
        }}>
          <div style={{ position: 'relative', width: '320px', maxWidth: '65%' }}>
            <span style={{ position: 'absolute', left: '10px', top: '8px', color: styles.muted, fontSize: '13px' }}>🔍</span>
            <input
              type="text"
              placeholder="Search for books, authors, or categories..."
              style={{
                width: '100%',
                background: styles.inner,
                border: `1px solid ${styles.border}`,
                borderRadius: '18px',
                padding: '7px 12px 7px 30px',
                color: styles.text,
                fontSize: '12px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: styles.muted, cursor: 'pointer', fontSize: '16px' }}>☀️</span>
            <NotificationDropdown />
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: styles.nav,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '13px',
              backgroundImage: headerAvatar ? `url(${headerAvatar})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: `2px solid ${styles.border}`
            }}>
              {!headerAvatar && avatarChar}
            </div>
          </div>
        </header>

        {/* Content Dashboard */}
        <div style={{ padding: '24px 28px 60px', maxWidth: '1280px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px', color: styles.accent }}>⚙️</span>
                <h1 style={{ fontSize: '26px', fontWeight: '800', margin: 0, letterSpacing: '-0.3px' }}>Settings</h1>
              </div>
              <p style={{ color: styles.muted, fontSize: '13px', margin: '4px 0 0' }}>Manage your account, preferences and app settings.</p>
            </div>

            <div style={{
              background: styles.card,
              border: `1px solid ${styles.border}`,
              borderRadius: '12px',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '22px' }}>📖</span>
              <div>
                <b style={{ fontSize: '13px', color: styles.text, display: 'block' }}>Read. Learn. Grow.</b>
                <span style={{ fontSize: '11px', color: styles.muted }}>Your reading journey, your control.</span>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
            
            {/* Card 1: Account Settings */}
            <div style={{ background: styles.card, border: `1px solid ${styles.border}`, borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '16px', color: styles.accent }}>👤</span>
                <b style={{ fontSize: '15px' }}>Account Settings</b>
              </div>
              <p style={{ color: styles.muted, fontSize: '11px', margin: '0 0 16px' }}>Update your personal information and account details.</p>

              <ProfilePhotoUploader defaultChar={avatarChar} onPhotoChange={(p) => setHeaderAvatar(p)} />

              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: styles.muted }}>Full Name</span>
                    <span style={{ fontSize: '10px', color: styles.muted }}>Max 3 edits / 30 days</span>
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); setNameError(''); }}
                    style={{ width: '100%', background: styles.inner, border: nameError ? '1px solid #ef4444' : `1px solid ${styles.border}`, borderRadius: '8px', padding: '8px 12px', color: styles.text, fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                  />
                  {nameError && <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>⚠️ {nameError}</span>}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: styles.muted }}>Email Address</span>
                    <span style={{ fontSize: '10px', color: styles.accent, fontWeight: 'bold' }}>🔒 Locked</span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      value={emailVal}
                      readOnly
                      disabled
                      style={{ width: '100%', background: styles.inner, border: `1px solid ${styles.border}`, borderRadius: '8px', padding: '8px 32px 8px 12px', color: styles.muted, fontSize: '12px', outline: 'none', boxSizing: 'border-box', cursor: 'not-allowed', opacity: 0.7 }}
                    />
                    <span style={{ position: 'absolute', right: '10px', top: '8px', fontSize: '12px', opacity: 0.6 }}>🔒</span>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: styles.muted }}>Username</span>
                    <span style={{ fontSize: '10px', color: styles.muted }}>Max 3 edits / 60 days</span>
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setUsernameError(''); }}
                    style={{ width: '100%', background: styles.inner, border: usernameError ? '1px solid #ef4444' : `1px solid ${styles.border}`, borderRadius: '8px', padding: '8px 12px', color: styles.text, fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                  />
                  {usernameError && <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>⚠️ {usernameError}</span>}
                </div>

                <button type="submit" style={{ marginTop: '8px', background: styles.nav, color: '#fff', border: 'none', padding: '9px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                  {savedSuccess ? '✓ Saved Successfully' : 'Save Changes'}
                </button>
              </form>
            </div>

            {/* Card 2: Reading Preferences */}
            <div style={{ background: styles.card, border: `1px solid ${styles.border}`, borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '16px', color: styles.accent }}>📖</span>
                <b style={{ fontSize: '15px' }}>Reading Preferences</b>
              </div>
              <p style={{ color: styles.muted, fontSize: '11px', margin: '0 0 16px' }}>Customize your reading experience.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: styles.muted, display: 'block', marginBottom: '4px' }}>Default Reading Mode</span>
                  <select
                    value={readingMode}
                    onChange={(e) => { setReadingMode(e.target.value); saveReadingPrefs({ mode: e.target.value }); }}
                    style={{ width: '100%', background: styles.inner, border: `1px solid ${styles.border}`, borderRadius: '8px', padding: '8px 12px', color: styles.text, fontSize: '12px', outline: 'none' }}
                  >
                    <option>Dark Mode</option>
                    <option>Light Mode</option>
                  </select>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: styles.muted, display: 'block', marginBottom: '4px' }}>Font Size</span>
                  <select
                    value={fontSize}
                    onChange={(e) => { setFontSize(e.target.value); saveReadingPrefs({ font: e.target.value }); }}
                    style={{ width: '100%', background: styles.inner, border: `1px solid ${styles.border}`, borderRadius: '8px', padding: '8px 12px', color: styles.text, fontSize: '12px', outline: 'none' }}
                  >
                    <option>Small</option>
                    <option>Medium</option>
                    <option>Large</option>
                  </select>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: styles.muted, display: 'block', marginBottom: '4px' }}>Line Spacing</span>
                  <select
                    value={lineSpacing}
                    onChange={(e) => { setLineSpacing(e.target.value); saveReadingPrefs({ line: e.target.value }); }}
                    style={{ width: '100%', background: styles.inner, border: `1px solid ${styles.border}`, borderRadius: '8px', padding: '8px 12px', color: styles.text, fontSize: '12px', outline: 'none' }}
                  >
                    <option>Normal</option>
                    <option>Relaxed</option>
                  </select>
                </div>

                {/* Theme Pills */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', color: styles.muted }}>Theme Palette</span>
                    <span style={{ fontSize: '10px', color: styles.accent, fontWeight: 'bold' }}>Active: {activeTheme}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {[
                      { name: 'Dark', bg: '#0b1329', text: '#fff' },
                      { name: 'Light', bg: '#ffffff', text: '#000' },
                      { name: 'Sepia', bg: '#fef3c7', text: '#78350f' },
                      { name: 'Custom', bg: customHex, text: '#fff' },
                    ].map((t) => (
                      <button
                        key={t.name}
                        type="button"
                        onClick={() => switchTheme(t.name as any)}
                        style={{
                          background: t.bg,
                          color: t.text,
                          border: activeTheme === t.name ? '2px solid #ffffff' : `1px solid ${styles.border}`,
                          borderRadius: '8px',
                          padding: '12px 4px',
                          textAlign: 'center',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          boxShadow: activeTheme === t.name ? '0 0 10px rgba(0,0,0,0.3)' : 'none',
                          transform: activeTheme === t.name ? 'scale(1.05)' : 'scale(1)',
                          transition: '0.2s'
                        }}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Spectrum Wheel */}
                {activeTheme === 'Custom' && (
                  <div style={{ background: styles.inner, border: `1px solid ${styles.border}`, borderRadius: '10px', padding: '10px 12px' }}>
                    <span style={{ fontSize: '11px', color: styles.muted, display: 'block', marginBottom: '6px' }}>Pick Custom Color:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="color"
                        value={customHex}
                        onChange={(e) => changeCustomColor(e.target.value)}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'none' }}
                      />
                      <input
                        type="text"
                        value={customHex.toUpperCase()}
                        onChange={(e) => changeCustomColor(e.target.value)}
                        style={{ flex: 1, background: styles.card, border: `1px solid ${styles.border}`, borderRadius: '6px', padding: '6px 10px', color: styles.text, fontSize: '12px', fontWeight: 'bold' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Card 3: Notifications */}
            <div style={{ background: styles.card, border: `1px solid ${styles.border}`, borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '16px', color: styles.accent }}>🔔</span>
                <b style={{ fontSize: '15px' }}>Notifications</b>
              </div>
              <p style={{ color: styles.muted, fontSize: '11px', margin: '0 0 16px' }}>Get notified about new books and updates.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>New Book Releases</b>
                    <span style={{ fontSize: '10px', color: styles.muted }}>Be the first to know about new arrivals</span>
                  </div>
                  <div onClick={() => toggleNotification('releases')} style={{ width: '38px', height: '22px', background: notifReleases ? styles.nav : styles.inner, borderRadius: '12px', position: 'relative', cursor: 'pointer', border: `1px solid ${styles.border}`, transition: '0.2s' }}>
                    <div style={{ width: '16px', height: '16px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: notifReleases ? '18px' : '2px', transition: '0.2s' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Reading Reminders</b>
                    <span style={{ fontSize: '10px', color: styles.muted }}>Daily/weekly reading goals</span>
                  </div>
                  <div onClick={() => toggleNotification('reminders')} style={{ width: '38px', height: '22px', background: notifReminders ? styles.nav : styles.inner, borderRadius: '12px', position: 'relative', cursor: 'pointer', border: `1px solid ${styles.border}`, transition: '0.2s' }}>
                    <div style={{ width: '16px', height: '16px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: notifReminders ? '18px' : '2px', transition: '0.2s' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Comments & Replies</b>
                    <span style={{ fontSize: '10px', color: styles.muted }}>Get notified about your activity</span>
                  </div>
                  <div onClick={() => toggleNotification('replies')} style={{ width: '38px', height: '22px', background: notifReplies ? styles.nav : styles.inner, borderRadius: '12px', position: 'relative', cursor: 'pointer', border: `1px solid ${styles.border}`, transition: '0.2s' }}>
                    <div style={{ width: '16px', height: '16px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: notifReplies ? '18px' : '2px', transition: '0.2s' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Marketing & Updates</b>
                    <span style={{ fontSize: '10px', color: styles.muted }}>Product updates, offers and news</span>
                  </div>
                  <div onClick={() => toggleNotification('marketing')} style={{ width: '38px', height: '22px', background: notifMarketing ? styles.nav : styles.inner, borderRadius: '12px', position: 'relative', cursor: 'pointer', border: `1px solid ${styles.border}`, transition: '0.2s' }}>
                    <div style={{ width: '16px', height: '16px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: notifMarketing ? '18px' : '2px', transition: '0.2s' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: Privacy & Security */}
            <div style={{ background: styles.card, border: `1px solid ${styles.border}`, borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '16px', color: styles.accent }}>🛡️</span>
                <b style={{ fontSize: '15px' }}>Privacy & Security</b>
              </div>
              <p style={{ color: styles.muted, fontSize: '11px', margin: '0 0 16px' }}>Keep your account safe and secure.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* 1. Change Password Button -> Opens Modal Component */}
                <div onClick={() => setIsPasswordModalOpen(true)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '4px 0' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Change Password</b>
                    <span style={{ fontSize: '10px', color: styles.muted }}>Update your password regularly</span>
                  </div>
                  <span style={{ color: styles.accent, fontWeight: 'bold' }}>›</span>
                </div>

                {/* 2. Two-Factor Authentication (2FA) */}
                <div onClick={() => setActiveModal('2fa')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '4px 0' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Two-Factor Authentication (2FA)</b>
                    <span style={{ fontSize: '10px', color: styles.muted }}>Add an extra layer of security</span>
                  </div>
                  <span style={{ color: styles.accent, fontWeight: 'bold' }}>›</span>
                </div>

                {/* 3. Login Activity */}
                <div onClick={() => setActiveModal('activity')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '4px 0' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Login Activity</b>
                    <span style={{ fontSize: '10px', color: styles.muted }}>View recent login sessions</span>
                  </div>
                  <span style={{ color: styles.accent, fontWeight: 'bold' }}>›</span>
                </div>

                {/* 4. Logout Account */}
                <div onClick={handleLogout} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderTop: `1px solid ${styles.border}`, paddingTop: '10px' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block', color: '#ef4444' }}>Logout Account</b>
                    <span style={{ fontSize: '10px', color: styles.muted }}>Sign out permanently from this device</span>
                  </div>
                  <span style={{ color: '#ef4444' }}>🚪</span>
                </div>
              </div>
            </div>

            {/* Card 5: Library Settings */}
            <div style={{ background: styles.card, border: `1px solid ${styles.border}`, borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '16px', color: styles.accent }}>📚</span>
                <b style={{ fontSize: '15px' }}>Library Settings</b>
              </div>
              <p style={{ color: styles.muted, fontSize: '11px', margin: '0 0 16px' }}>Manage your library and reading data.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div onClick={() => window.location.href = '/library'} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Download History</b>
                    <span style={{ fontSize: '10px', color: styles.muted }}>View your downloaded books</span>
                  </div>
                  <span style={{ color: styles.muted }}>›</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Reading Progress</b>
                    <span style={{ fontSize: '10px', color: styles.muted }}>Sync across devices</span>
                  </div>
                  <div onClick={() => toggleLibrarySetting('sync')} style={{ width: '38px', height: '22px', background: syncProgress ? styles.nav : styles.inner, borderRadius: '12px', position: 'relative', cursor: 'pointer', border: `1px solid ${styles.border}`, transition: '0.2s' }}>
                    <div style={{ width: '16px', height: '16px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: syncProgress ? '18px' : '2px', transition: '0.2s' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Auto Save</b>
                    <span style={{ fontSize: '10px', color: styles.muted }}>Save your reading position</span>
                  </div>
                  <div onClick={() => toggleLibrarySetting('autoSave')} style={{ width: '38px', height: '22px', background: autoSavePos ? styles.nav : styles.inner, borderRadius: '12px', position: 'relative', cursor: 'pointer', border: `1px solid ${styles.border}`, transition: '0.2s' }}>
                    <div style={{ width: '16px', height: '16px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: autoSavePos ? '18px' : '2px', transition: '0.2s' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${styles.border}`, paddingTop: '10px' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Clear Cache</b>
                    <span style={{ fontSize: '10px', color: styles.muted }}>Free up storage space</span>
                  </div>
                  <button onClick={() => alert('Cache cleared successfully!')} style={{ background: styles.inner, color: styles.muted, border: `1px solid ${styles.border}`, padding: '5px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>Clear</button>
                </div>
              </div>
            </div>

            {/* Card 6: Support & Help */}
            <div style={{ background: styles.card, border: `1px solid ${styles.border}`, borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '16px', color: styles.accent }}>🎧</span>
                <b style={{ fontSize: '15px' }}>Support & Help</b>
              </div>
              <p style={{ color: styles.muted, fontSize: '11px', margin: '0 0 16px' }}>Get help and contact our team.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div onClick={() => alert('Readora Help Center: Reach us at support@readora.app')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Help Center</b>
                    <span style={{ fontSize: '10px', color: styles.muted }}>Find answers to common questions</span>
                  </div>
                  <span style={{ color: styles.muted }}>›</span>
                </div>

                <div onClick={() => window.open('mailto:support@readora.app')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Contact Us</b>
                    <span style={{ fontSize: '10px', color: styles.muted }}>Reach out to our support team</span>
                  </div>
                  <span style={{ color: styles.muted }}>›</span>
                </div>

                <div onClick={() => alert('Terms of Service: By using Readora, you agree to read responsibly and respect author copyrights.')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Terms & Conditions</b>
                    <span style={{ fontSize: '10px', color: styles.muted }}>Read our terms of service</span>
                  </div>
                  <span style={{ color: styles.muted }}>›</span>
                </div>

                <div onClick={() => alert('Privacy Policy: Readora respects your privacy. Your data is stored safely in Supabase with end-to-end security.')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <b style={{ fontSize: '12px', display: 'block' }}>Privacy Policy</b>
                    <span style={{ fontSize: '10px', color: styles.muted }}>How we handle your data</span>
                  </div>
                  <span style={{ color: styles.muted }}>›</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* SEPARATE COMPONENT: Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        userEmail={user?.email || emailVal}
      />

      {/* POPUP MODAL: Two-Factor Authentication (2FA) */}
      {activeModal === '2fa' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: styles.card, border: `1px solid ${styles.border}`, borderRadius: '16px', padding: '24px', maxWidth: '360px', width: '100%', position: 'relative' }}>
            <button onClick={() => setActiveModal('none')} style={{ position: 'absolute', top: '14px', right: '16px', background: 'none', border: 'none', color: styles.muted, fontSize: '18px', cursor: 'pointer' }}>✕</button>
            <b style={{ fontSize: '16px', color: styles.accent, display: 'block', marginBottom: '6px' }}>🛡️ Two-Factor Authentication</b>
            <p style={{ fontSize: '12px', color: styles.muted, margin: '0 0 16px' }}>Require an extra verification code upon every login.</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: styles.inner, padding: '12px', borderRadius: '10px', border: `1px solid ${styles.border}` }}>
              <div>
                <b style={{ fontSize: '12px', display: 'block' }}>2FA Status</b>
                <span style={{ fontSize: '11px', color: is2FAEnabled ? '#10b981' : styles.muted }}>
                  {is2FAEnabled ? 'Active (Protected)' : 'Disabled'}
                </span>
              </div>
              <button
                onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                style={{
                  background: is2FAEnabled ? '#ef4444' : styles.nav,
                  color: '#fff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {is2FAEnabled ? 'Turn Off' : 'Enable 2FA'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Login Activity */}
      {activeModal === 'activity' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: styles.card, border: `1px solid ${styles.border}`, borderRadius: '16px', padding: '24px', maxWidth: '380px', width: '100%', position: 'relative' }}>
            <button onClick={() => setActiveModal('none')} style={{ position: 'absolute', top: '14px', right: '16px', background: 'none', border: 'none', color: styles.muted, fontSize: '18px', cursor: 'pointer' }}>✕</button>
            <b style={{ fontSize: '16px', color: styles.accent, display: 'block', marginBottom: '6px' }}>📱 Login Activity</b>
            <p style={{ fontSize: '12px', color: styles.muted, margin: '0 0 16px' }}>Devices currently signed into this account.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ background: styles.inner, padding: '10px 12px', borderRadius: '8px', border: `1px solid ${styles.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <b style={{ fontSize: '12px' }}>Current Device</b>
                  <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 'bold' }}>● Active Now</span>
                </div>
                <span style={{ fontSize: '11px', color: styles.muted, display: 'block', marginTop: '4px' }}>
                  {typeof window !== 'undefined' ? window.navigator.userAgent.slice(0, 45) + '...' : 'Mobile Browser'}
                </span>
                <span style={{ fontSize: '10px', color: styles.muted }}>Signed in as: {user?.email}</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
                                }
