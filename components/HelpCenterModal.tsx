'use client'

import { useState } from 'react'

interface HelpCenterModalProps {
  isOpen: boolean
  onClose: () => void
  userEmail?: string
}

interface Article {
  id: string
  title: string
  category: 'account' | 'reading' | 'security' | 'technical'
  icon: string
  content: string[]
}

const HELP_ARTICLES: Article[] = [
  {
    id: 'change-password',
    title: 'How do I change my password?',
    category: 'security',
    icon: '🔒',
    content: [
      'Open Settings from the left sidebar navigation.',
      'Scroll down to the Privacy & Security section.',
      'Tap on Change Password.',
      'Enter your current password and your new secure password.',
      'Confirm the new password and tap Update Password.'
    ]
  },
  {
    id: 'reset-password',
    title: 'How do I reset my password?',
    category: 'security',
    icon: '🔄',
    content: [
      'Open the Change Password modal from Settings.',
      'Click on Forgot password? Use email verification.',
      'Check your registered email inbox for the reset link.',
      'Click the link in the email to open the reset screen.',
      'Enter your new password directly and save.'
    ]
  },
  {
    id: 'read-book',
    title: 'How do I read a book?',
    category: 'reading',
    icon: '📖',
    content: [
      'Go to the Home or Library page.',
      'Browse or search for any book you want to read.',
      'Tap the blue Read Book button on the card.',
      'The in-app clean reader will launch instantly.',
      'Tap Close on the top right when you are finished.'
    ]
  },
  {
    id: 'report-problem',
    title: 'How do I report a problem?',
    category: 'technical',
    icon: '⚠️',
    content: [
      'Open Help Center and tap the blue Contact Support button.',
      'Enter the subject and describe the issue you are facing.',
      'Optionally attach a screenshot of the error.',
      'Tap Submit Request to reach our 24/7 team.'
    ]
  },
  {
    id: 'create-account',
    title: 'How to create or sign into an account?',
    category: 'account',
    icon: '👤',
    content: [
      'Tap Sign In or Get Started on the top navigation bar.',
      'Choose your preferred method: Google, Facebook, or Email.',
      'Verify your credentials to instantly sync your saved books.'
    ]
  },
  {
    id: 'customize-theme',
    title: 'How to change reading mode and theme colors?',
    category: 'account',
    icon: '🎨',
    content: [
      'Go to Settings and find the Reading Preferences card.',
      'Select Dark, Light, or Sepia theme pills.',
      'Tap Custom to pick any background color from the spectrum wheel.'
    ]
  }
]

export default function HelpCenterModal({ isOpen, onClose, userEmail }: HelpCenterModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [viewingArticle, setViewingArticle] = useState<Article | null>(null)
  const [viewingSupportForm, setViewingSupportForm] = useState(false)

  const [feedbackGiven, setFeedbackGiven] = useState<'yes' | 'no' | null>(null)
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackSent, setFeedbackSent] = useState(false)

  const [supportSubject, setSupportSubject] = useState('')
  const [supportEmail, setSupportEmail] = useState(userEmail || '')
  const [supportMessage, setSupportMessage] = useState('')
  const [supportSubmitted, setSupportSubmitted] = useState(false)

  if (!isOpen) return null

  const handleModalClose = () => {
    setSearchQuery('')
    setSelectedCategory(null)
    setViewingArticle(null)
    setViewingSupportForm(false)
    setFeedbackGiven(null)
    setFeedbackSent(false)
    setSupportSubmitted(false)
    onClose()
  }

  const filteredArticles = HELP_ARTICLES.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCat = selectedCategory ? item.category === selectedCategory : true
    return matchesSearch && matchesCat
  })

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSupportSubmitted(true)
    setTimeout(() => {
      setViewingSupportForm(false)
      setSupportSubmitted(false)
      setSupportSubject('')
      setSupportMessage('')
    }, 2000)
  }

  return (
    <div
      onClick={handleModalClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(3, 7, 18, 0.82)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
        boxSizing: 'border-box'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#090e1a',
          border: '1px solid rgba(59, 130, 246, 0.28)',
          borderRadius: '24px',
          padding: '24px 22px',
          maxWidth: '520px',
          width: '100%',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 30px rgba(37, 99, 235, 0.15)',
          color: '#f8fafc',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxSizing: 'border-box',
          position: 'relative'
        }}
      >
        <button
          type="button"
          onClick={handleModalClose}
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
            zIndex: 10
          }}
          title="Close"
        >
          ✕
        </button>

        {viewingArticle && (
          <div>
            <button
              type="button"
              onClick={() => { setViewingArticle(null); setFeedbackGiven(null); setFeedbackSent(false); }}
              style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0, marginBottom: '14px', fontWeight: 'bold' }}
            >
              ← Back to Help Center
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ fontSize: '24px' }}>{viewingArticle.icon}</span>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#fff', fontWeight: '800' }}>
                {viewingArticle.title}
              </h3>
            </div>

            <div style={{ background: '#0d1527', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '16px', marginBottom: '18px' }}>
              <ol style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', color: '#cbd5e1', fontSize: '13px', lineHeight: 1.5 }}>
                {viewingArticle.content.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#94a3b8' }}>Was this article helpful?</p>
              
              {!feedbackGiven ? (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                  <button type="button" onClick={() => setFeedbackGiven('yes')} style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
                    👍 Yes
                  </button>
                  <button type="button" onClick={() => setFeedbackGiven('no')} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
                    👎 No
                  </button>
                </div>
              ) : feedbackGiven === 'yes' ? (
                <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 'bold' }}>✓ Thank you for your feedback!</span>
              ) : (
                <div>
                  {!feedbackSent ? (
                    <div style={{ marginTop: '8px' }}>
                      <textarea
                        placeholder="Tell us what went wrong..."
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        style={{ width: '100%', background: '#0d1527', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#fff', fontSize: '12px', outline: 'none', boxSizing: 'border-box', minHeight: '60px', marginBottom: '8px' }}
                      />
                      <button type="button" onClick={() => setFeedbackSent(true)} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Submit Feedback
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#38bdf8' }}>✓ Feedback submitted. We will improve this article!</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {!viewingArticle && viewingSupportForm && (
          <div>
            <button
              type="button"
              onClick={() => setViewingSupportForm(false)}
              style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0, marginBottom: '14px', fontWeight: 'bold' }}
            >
              ← Back to Help Center
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                🎧
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', color: '#fff', fontWeight: '800' }}>Contact Support</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>We typically respond within 24 hours.</p>
              </div>
            </div>

            {supportSubmitted ? (
              <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', padding: '16px', borderRadius: '12px', textAlign: 'center', margin: '20px 0' }}>
                <b style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>✅ Request Submitted</b>
                <span style={{ fontSize: '12px' }}>Your support request has been submitted successfully. Our team will contact you soon.</span>
              </div>
            ) : (
              <form onSubmit={handleSupportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px', fontWeight: '600' }}>Subject</label>
                  <input
                    type="text"
                    placeholder="Briefly summarize your issue"
                    value={supportSubject}
                    onChange={(e) => setSupportSubject(e.target.value)}
                    required
                    style={{ width: '100%', background: '#0d1527', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px', fontWeight: '600' }}>Your Email</label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    required
                    style={{ width: '100%', background: '#0d1527', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px', fontWeight: '600' }}>Describe your problem</label>
                  <textarea
                    rows={4}
                    placeholder="Provide details about what went wrong..."
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    required
                    style={{ width: '100%', background: '#0d1527', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setViewingSupportForm(false)}
                    style={{ flex: 1, background: '#0d1527', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.12)', padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ flex: 1.3, background: '#2563eb', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {!viewingArticle && !viewingSupportForm && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                color: '#fff',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(37,99,235,0.4)'
              }}>
                🎧
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '19px', fontWeight: '800', letterSpacing: '-0.3px', color: '#fff' }}>
                  Help Center
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                  Find answers to your questions or get help with Readora.
                </p>
              </div>
            </div>

            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <span style={{ position: 'absolute', left: '12px', top: '11px', color: '#64748b', fontSize: '14px' }}>🔍</span>
              <input
                type="text"
                placeholder="Search help articles or type your question..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: '#0d1527',
                  border: '1px solid rgba(255, 255, 255, 0.09)',
                  borderRadius: '12px',
                  padding: '11px 14px 11px 36px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '12px', top: '11px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}
                >
                  ✕
                </button>
              )}
            </div>

            <div style={{ marginBottom: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <b style={{ fontSize: '13px', color: '#e2e8f0', letterSpacing: '-0.2px' }}>
                  {searchQuery ? 'Search Results' : selectedCategory ? `Articles in ${selectedCategory}` : 'Popular Help'}
                </b>
                {selectedCategory && (
                  <span onClick={() => setSelectedCategory(null)} style={{ fontSize: '11px', color: '#38bdf8', cursor: 'pointer' }}>Show All</span>
                )}
              </div>

              {filteredArticles.length === 0 ? (
                <div style={{ background: '#0d1527', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#94a3b8' }}>No matching articles found.</p>
                  <button
                    type="button"
                    onClick={() => setViewingSupportForm(true)}
                    style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '7px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Contact Support →
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {filteredArticles.map((article) => (
                    <div
                      key={article.id}
                      onClick={() => setViewingArticle(article)}
                      style={{
                        background: '#0d1527',
                        border: '1px solid rgba(255, 255, 255, 0.07)',
                        borderRadius: '12px',
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: '0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '15px', color: '#60a5fa' }}>{article.icon}</span>
                        <span style={{ fontSize: '13px', color: '#f1f5f9', fontWeight: '500' }}>{article.title}</span>
                      </div>
                      <span style={{ color: '#64748b', fontSize: '15px' }}>›</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '22px' }}>
              <b style={{ fontSize: '13px', color: '#e2e8f0', display: 'block', marginBottom: '10px' }}>
                Quick Help
              </b>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[
                  { id: 'account', name: 'Account & Profile', icon: '👤' },
                  { id: 'reading', name: 'Books & Reading', icon: '📖' },
                  { id: 'security', name: 'Security', icon: '🛡️' },
                  { id: 'technical', name: 'Technical Issues', icon: '⚙️' }
                ].map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => { setSelectedCategory(selectedCategory === cat.id ? null : cat.id); setSearchQuery(''); }}
                    style={{
                      background: selectedCategory === cat.id ? 'rgba(37, 99, 235, 0.25)' : '#0d1527',
                      border: selectedCategory === cat.id ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.07)',
                      borderRadius: '12px',
                      padding: '12px 8px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '74px',
                      cursor: 'pointer',
                      transition: '0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '16px', color: '#60a5fa' }}>{cat.icon}</span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>›</span>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#f1f5f9', lineHeight: 1.2, marginTop: '8px' }}>
                      {cat.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: '#0c1324',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              borderRadius: '16px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(37,99,235,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px'
                }}>
                  🎧
                </div>
                <div>
                  <b style={{ fontSize: '12px', color: '#fff', display: 'block' }}>Still need help?</b>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>Our support team is here for you.</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingSupportForm(true)}
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '9px 14px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.4)'
                }}
              >
                <span>✈️</span>
                <span>Contact Support</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
                  }
