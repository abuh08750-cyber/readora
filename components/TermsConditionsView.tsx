'use client'

import { useState } from 'react'

interface TermsConditionsViewProps {
  onBack: () => void
  onOpenSupport: () => void
  onOpenPrivacy?: () => void
  styles: any
}

interface TermSection {
  id: number
  title: string
  points: string[]
}

const TERMS_DATA: TermSection[] = [
  {
    id: 1,
    title: '1. Acceptance of Terms',
    points: [
      'By accessing or using Readora, creating an account, or reading available content, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.',
      'If you do not agree with any part of these terms, you must refrain from using the platform and its related services.'
    ]
  },
  {
    id: 2,
    title: '2. About Readora',
    points: [
      'Readora is a modern web-based eBook reading and personal library platform created to assist readers in discovering, reading, and organizing digital books efficiently.',
      'Readora provides curated access to public-domain, open-licensed, and authorized reading materials with dynamic customizable readers.'
    ]
  },
  {
    id: 3,
    title: '3. User Account & Security',
    points: [
      'You agree to provide true, accurate, and current information when signing up or managing your profile.',
      'You are solely responsible for maintaining the confidentiality and security of your account credentials.',
      'Any activity or request occurring under your authenticated profile remains your legal responsibility.',
      'Account sharing, impersonation, or unauthorized access attempts will be handled in accordance with platform security protocols.'
    ]
  },
  {
    id: 4,
    title: '4. Books & Content Ownership',
    points: [
      'All rights, copyrights, and intellectual property in the books or documents displayed on Readora belong to their respective authors, publishers, or rightful rights holders.',
      'Users are granted a personal, non-commercial, non-transferable license to read materials within the platform.',
      'You may not copy, scrape, distribute, reproduce, sell, or commercially republish any copyrighted books without prior written authorization from the owner.'
    ]
  },
  {
    id: 5,
    title: '5. User Conduct & Acceptable Use',
    points: [
      'You agree never to misuse, attack, or disrupt Readora servers, API endpoints, or database structures.',
      'Strictly prohibited activities include: probing system vulnerabilities, deploying automated bots/scrapers, posting abusive or spam reviews, and accessing another person’s profile without explicit permission.',
      'Uploading or sharing any defamatory, illegal, or copyright-infringing content is completely barred.'
    ]
  },
  {
    id: 6,
    title: '6. eBook Uploads & Community Guidelines',
    points: [
      'If publishing or eBook upload functionality is enabled for your account, you warrant that you possess all necessary rights, licenses, or ownership to distribute such material.',
      'Readora adheres strictly to applicable intellectual property regulations and maintains a clear protocol to promptly review and remove infringing content upon receipt of a valid notice.'
    ]
  },
  {
    id: 7,
    title: '7. Intellectual Property of Readora',
    points: [
      'The Readora name, logo, custom theme code, website user interface, and original assets are the exclusive property of Readora.',
      'Nothing in these terms grants any user a license to reproduce Readora brand assets or proprietary source files.'
    ]
  },
  {
    id: 8,
    title: '8. Privacy & Data Handling',
    points: [
      'Your privacy and stored information (including email, library preferences, and reading progress) are protected and processed in line with our official guidelines.',
      'Please inspect our Privacy Policy to understand how data is securely managed across Supabase servers.'
    ]
  },
  {
    id: 9,
    title: '9. Platform Availability & Updates',
    points: [
      'Readora continuously improves reader engines and server infrastructure. The site or specific features may be temporarily updated, modified, or placed into maintenance without liability.',
      'We do not guarantee uninterrupted or error-free continuous service under every browser condition.'
    ]
  },
  {
    id: 10,
    title: '10. Account Suspension & Termination',
    points: [
      'Readora reserves the unilateral right to restrict access, suspend accounts, or revoke authentication privileges immediately in cases of severe terms violation, fraud, or copyright breach.',
      'Terminated accounts will forfeit access to synced personal shelves and saved progress.'
    ]
  },
  {
    id: 11,
    title: '11. Legal Disclaimer',
    points: [
      'All content on Readora is made available on an "AS IS" and "AS AVAILABLE" basis. Users bear sole responsibility for ensuring their reading and distribution habits respect applicable regional laws.',
      'These terms do not constitute formal legal counsel and are presented for standard terms of service compliance.'
    ]
  },
  {
    id: 12,
    title: '12. Changes to these Terms',
    points: [
      'We may revise or update these Terms and Conditions periodically to reflect new features or regulatory requirements.',
      'Significant adjustments will be designated by updating the "Last Updated" timestamp at the top and bottom of this document.'
    ]
  },
  {
    id: 13,
    title: '13. Contact & Inquiries',
    points: [
      'If you have questions, feedback, or copyright concerns regarding these Terms and Conditions, our dedicated support team is available 24/7.',
      'Direct formal inquiries can also be routed directly to readora.support@gmail.com.'
    ]
  }
]

export default function TermsConditionsView({ onBack, onOpenSupport, onOpenPrivacy, styles }: TermsConditionsViewProps) {
  const [termQuery, setTermQuery] = useState('')

  const filteredTerms = TERMS_DATA.filter((item) => {
    const q = termQuery.toLowerCase().trim()
    if (!q) return true
    return item.title.toLowerCase().includes(q) || item.points.some(p => p.toLowerCase().includes(q))
  })

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Top Navigation Row */}
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

        <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
          <span style={{ position: 'absolute', left: '10px', top: '9px', fontSize: '12px', color: styles.muted }}>🔍</span>
          <input
            type="text"
            placeholder="Search terms (e.g. copyright, account)..."
            value={termQuery}
            onChange={(e) => setTermQuery(e.target.value)}
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
          {termQuery && (
            <button
              type="button"
              onClick={() => setTermQuery('')}
              style={{ position: 'absolute', right: '10px', top: '8px', background: 'none', border: 'none', color: styles.muted, cursor: 'pointer', fontSize: '11px' }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Document Card */}
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
            <span style={{ fontSize: '26px' }}>📜</span>
            <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0, letterSpacing: '-0.3px', color: styles.text }}>
              Terms & Conditions
            </h1>
          </div>
          <p style={{ margin: '4px 0 10px', fontSize: '13px', color: styles.muted }}>
            Please read these terms carefully before using Readora.
          </p>
          <div style={{ display: 'inline-block', background: styles.inner, border: `1px solid ${styles.border}`, padding: '4px 10px', borderRadius: '6px', fontSize: '11px', color: styles.muted }}>
            Last updated: <b>October 2, 2026</b>
          </div>
        </div>

        {/* Sections Content List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {filteredTerms.length === 0 ? (
            <div style={{ padding: '30px 10px', textAlign: 'center', color: styles.muted, background: styles.inner, borderRadius: '12px' }}>
              <p style={{ margin: 0, fontSize: '13px' }}>No terms matching &quot;{termQuery}&quot;</p>
              <button
                type="button"
                onClick={() => setTermQuery('')}
                style={{ marginTop: '10px', background: styles.nav, color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Clear Search
              </button>
            </div>
          ) : (
            filteredTerms.map((sec) => (
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
                  {sec.points.map((p, pIndex) => (
                    <p key={pIndex} style={{ margin: 0, fontSize: '12.5px', lineHeight: 1.6, color: styles.text, opacity: 0.9 }}>
                      • {p}
                    </p>
                  ))}
                </div>

                {sec.id === 8 && (
                  <div style={{ marginTop: '12px' }}>
                    <span
                      onClick={onOpenPrivacy || (() => alert('Privacy Policy: Readora respects your data privacy.'))}
                      style={{ color: styles.accent, fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Read our Privacy Policy →
                    </span>
                  </div>
                )}

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

        {/* Document Footer */}
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
              Questions about these Terms?
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              Contact Support
            </button>
            <button
              type="button"
              onClick={onOpenPrivacy || (() => alert('Privacy Policy: Readora securely handles your data with Supabase.'))}
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
              Privacy Policy
            </button>
          </div>
        </div>

      </div>
    </div>
  )
                        }
