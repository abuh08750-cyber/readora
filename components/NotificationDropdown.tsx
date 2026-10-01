'use client'

import { useState } from 'react'

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const [list, setList] = useState([
    { id: 1, title: 'Welcome to Readora!', desc: 'Explore the collection and start reading.', time: 'Just now', unread: true },
    { id: 2, title: 'New Arrival', desc: 'ZERO SE ARTIST part 1 is now available.', time: '2h ago', unread: true },
    { id: 3, title: 'Profile Updated', desc: 'Your account settings are saved.', time: '1d ago', unread: false }
  ])

  const unreadCount = list.filter(n => n.unread).length

  const markAllAsRead = () => {
    setList(prev => prev.map(n => ({ ...n, unread: false })))
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          background: 'none',
          border: 'none',
          color: '#94a3b8',
          cursor: 'pointer',
          fontSize: '17px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          padding: 0,
          outline: 'none'
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-3px',
            right: '-3px',
            width: '8px',
            height: '8px',
            background: '#ef4444',
            borderRadius: '50%'
          }} />
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div style={{
          position: 'absolute',
          right: '-10px',
          top: '36px',
          width: '290px',
          background: '#0d1322',
          border: '1px solid #1e293b',
          borderRadius: '14px',
          padding: '14px',
          boxShadow: '0 12px 30px rgba(0,0,0,0.85)',
          zIndex: 200
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <b style={{ fontSize: '13px', color: '#fff' }}>Notifications ({unreadCount})</b>
            {unreadCount > 0 && (
              <span
                onClick={markAllAsRead}
                style={{ fontSize: '10px', color: '#38bdf8', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Mark all read
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
            {list.map((n) => (
              <div
                key={n.id}
                style={{
                  background: n.unread ? 'rgba(37,99,235,0.1)' : '#070b14',
                  border: '1px solid rgba(255,255,255,0.04)',
                  borderRadius: '8px',
                  padding: '8px 10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <b style={{ fontSize: '11px', color: n.unread ? '#38bdf8' : '#e2e8f0' }}>{n.title}</b>
                  <span style={{ fontSize: '9px', color: '#64748b' }}>{n.time}</span>
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', lineHeight: 1.3 }}>{n.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
            }
        
