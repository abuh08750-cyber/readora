'use client'

import { useState } from 'react'

interface PrivacyPolicyViewProps {
  onBack: () => void
  onOpenSupport: () => void
  onOpenTerms: () => void
  styles: any
}

interface PolicySection {
  id: number
  title: string
  points: string[]
}

const PRIVACY_SECTIONS: PolicySection[] = [
  {
    id: 1,
    title: '1. Introduction',
    points: [
      'Welcome to Readora. We value your personal privacy and are committed to protecting the integrity of your personal information.',
      'This Privacy Policy outlines the types of information we collect, how it is utilized, and the measures we employ to keep your data secure while you use the platform.'
    ]
  },
  {
    id: 2,
    title: '2. Information We Collect',
    points: [
      'Account Data: Email address, full name, username, and profile image provided directly by you or via third-party login providers (Google and Facebook).',
      'Reading & Library Data: Your saved bookmarks, personal shelf collections, reading preferences (theme, font size, line spacing), and book reviews.',
      'Technical Data: Basic browser data, session tokens, and operational timestamps necessary to keep your account signed in and authenticated.'
    ]
  },
  {
    id: 3,
    title: '3. How We Use Your Information',
    points: [
      'To provide, maintain, and personalize your digital reading and eBook management experience.',
      'To sync your reading progress, theme choices, and saved library shelf across visits.',
      'To communicate with you regarding customer support tickets submitted through our Help Center.',
      'To verify authentication sessions and maintain account safety against unauthorized access.'
    ]
  },
  {
    id: 4,
    title: '4. Cookies and Local Storage',
    points: [
      'Readora uses browser localStorage and session storage to retain your preferences (such as Dark/Sepia theme palettes, font scaling, and cached profile data).',
      'Supabase client libraries utilize secure tokens to preserve your login session without tracking your browsing activity across other third-party websites.'
    ]
  },
  {
    id: 5,
    title: '5. Books and User-Provided Content',
    points: [
      'When you submit ratings, comments, or reviews for books on Readora, this content is associated with your display username and visible to other readers.',
      'Support tickets containing your subject and descriptive messages are delivered directly to our support system to facilitate issue resolution.'
    ]
  },
  {
    id: 6,
    title: '6. Third-Party Services',
    points: [
      'Supabase: Provides secure database hosting, user authentication, and storage bucket services.',
      'Google & Facebook OAuth: Used solely for authenticating your account upon sign-in if you choose social login.',
      'We do not sell, rent, or trade your personal details to third-party advertisers or data brokers.'
    ]
  },
  {
    id: 7,
    title: '7. Data Storage and Security',
    points: [
      'Your profile records and support submissions are hosted within encrypted Supabase cloud databases with role-based access security.',
      'While we implement industry-standard transmission encryption (HTTPS/TLS), no electronic storage method is 100% immune from risks. We encourage you to use secure passwords.'
    ]
  },
  {
    id: 8,
    title: '8. Data Retention',
    points: [
      'We retain your account details and reading history for as long as your account remains active on Readora.',
      'If you clear your local cache via Settings, local reading states are reset on that specific browser.'
    ]
  },
  {
    id: 9,
    title: '9. Your Privacy Rights',
    points: [
      'You have the right to access and edit your profile name and username directly within the Account Settings tab.',
      'You may request disclosure or complete removal of your stored support tickets and account records at any time by contacting support.'
    ]
  },
  {
    id: 10,
    title: '10. Account Deletion',
    points: [
      'If you wish to permanently delete your account, saved collections, and associated metadata, you can submit a deletion request through the Help Center or by emailing readora.support@gmail.com.',
      'Upon confirmation, all database entries linked to your user ID will be purged.'
    ]
  },
  {
    id: 11,
    title: "11. Children's Privacy",
    points: [
      'Readora does not knowingly collect or solicit personal data from children under the age of 13.',
      'If we become aware that personal information from a minor has been collected without parental consent, we will promptly delete that data.'
    ]
  },
  {
    id: 12,
    title: '12. Changes to This Privacy Policy',
    points: [
      'We may update this policy periodically to align with website modifications, security improvements, or regulatory updates.',
      'The "Last updated" date at the top and bottom of this page indicates the effective revision date.'
    ]
  },
  {
    id: 13,
    title: '13. Contact Us',
    points: [
      'If you have questions, feedback, or concerns regarding your privacy or data handling, reach out to our team at readora.support@gmail.com or via the Help Center.'
    ]
  }
]

export default function PrivacyPolicyView({ onBack, onOpenSupport, onOpenTerms, styles }: PrivacyPolicyViewProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredSections = PRIVACY_SECTIONS.filter((sec) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return sec.title.toLowerCase().includes(q) || sec.points.some(p => p.toLowerCase().includes(q))
  })

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: styles.card,
            border: `1px solid ${styles.border}`,
            color: styles.accent,
            padding: '8px 16px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
          }}
        >
          <span>←</span>
          <span>Back to Settings</span>
        </button>

        <div style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
          <span style={{ position: 'absolute', left: '10px', top: '9px', fontSize: '12px', color: styles.muted }}>🔍</span>
          <input
            type="text"
            placeholder="Search privacy topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: styles.card,
              border: `1px solid ${styles.border}`,
              borderRadius: '20px',
              padding: '8px 12px 8px 30px',
              color: styles.text,
              fontSize: '12px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '10px', top: '8px', background: 'none', border: 'none', color: styles.muted, cursor: 'pointer', fontSize: '11px' }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Privacy Card */}
      <div style={{
        background: styles.card,
        border: `1px solid ${styles.border}`,
        borderRadius: '20px',
        padding: '32px 28px',
        boxShadow: '0 20px 45px -15px rgba(0, 0, 0, 0.7)',
        boxSizing: 'border-box'
      }}>
        
        {/* Document Header */}
        <div style={{ borderBottom: `1px solid ${styles.border}`, paddingBottom: '20px', marginBottom: '26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '26px' }}>🛡️</span>
            <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0, letterSpacing: '-0.3px', color: styles.text }}>
              Privacy Policy
            </h1>
          </div>
          <p style={{ margin: '4px 0 10px', fontSize: '13px', color: styles.muted }}>
            Learn how Readora collects, uses, stores, and protects your information.
          </p>
          <div style={{ display: 'inline-block', background: styles.inner, border: `1px solid ${styles.border}`, padding: '4px 10px', borderRadius: '6px', fontSize: '11px', color: styles.muted }}>
            Last updated: <b>October 2, 2026</b>
          </div>
        </div>

        {/* 13 Policy Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredSections.length === 0 ? (
            <div style={{ padding: '30px 10px', textAlign: 'center', color: styles.muted, background: styles.inner, borderRadius: '12px' }}>
              <p style={{ margin: 0, fontSize: '13px' }}>No policy sections matching &quot;{searchQuery}&quot;</p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ marginTop: '10px', background: styles.nav, color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Clear Search
              </button>
            </div>
          ) : (
            filteredSections.map((sec) => (
              <div
                key={sec.id}
                style={{
                  background: styles.inner,
                  border: `1px solid ${styles.border}`,
                  borderRadius: '14px',
                  padding: '18px 20px'
                }}
              >
                <h3 style={{ margin: '0 0 10px', fontSize: '15px', fontWeight: '700', color: styles.accent, letterSpacing: '-0.2px' }}>
                  {sec.title}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {sec.points.map((p, idx) => (
                    <p key={idx} style={{ margin: 0, fontSize: '12.5px', lineHeight: 1.6, color: styles.text, opacity: 0.9 }}>
                      • {p}
                    </p>
                  ))}
                </div>

                {sec.id === 13 && (
                  <div style={{ marginTop: '14px' }}>
                    <button
                      type="button"
                      onClick={onOpenSupport}
                      style={{
                        background: styles.nav,
                        color: '#fff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 3px 10px rgba(37,99,235,0.3)'
                      }}
                    >
                      <span>✈️</span>
                      <span>Contact Support →</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Bottom Footer Section */}
        <div style={{
          marginTop: '32px',
          paddingTop: '20px',
          borderTop: `1px solid ${styles.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div>
            <span style={{ fontSize: '11px', color: styles.muted, display: 'block' }}>
              Last updated: October 2, 2026
            </span>
            <span style={{ fontSize: '12px', color: styles.text, fontWeight: '600' }}>
              Privacy questions or concerns?
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={onOpenSupport}
              style={{
                background: styles.nav,
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '7px 14px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Contact Support →
            </button>
            <button
              type="button"
              onClick={onOpenTerms}
              style={{
                background: 'transparent',
                color: styles.accent,
                border: `1px solid ${styles.border}`,
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Terms &amp; Conditions
            </button>
            <button
              type="button"
              onClick={onBack}
              style={{
                background: 'transparent',
                color: styles.muted,
                border: `1px solid ${styles.border}`,
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Back to Settings
            </button>
          </div>
        </div>

      </div>
    </div>
  )
                }
