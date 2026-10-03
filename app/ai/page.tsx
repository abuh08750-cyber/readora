'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://stuabcdisgmmxprapfai.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0dWFiY2Rpc2dtbXhwcmFwZmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1Njc1NjksImV4cCI6MjEwNjE0MzU2OX0.pGvaQQBWGcbDKgDb_9F1jkUURVXH3bhJ-trQt-GXBZ8'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})

export default function ReadoraAIChatPage() {
  const [user, setUser] = useState<any>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [currentConvId, setCurrentConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [inputVal, setInputVal] = useState('')
  const [searchChats, setSearchChats] = useState('')
  const [loadingReply, setLoadingReply] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        window.location.href = '/?auth=required&redirect=/ai'
        return
      }
      setUser(session.user)
      loadConversations(session.user.id)

      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search)
        const initQ = params.get('q')
        if (initQ) {
          sendMessage(initQ, null)
          window.history.replaceState({}, '', '/ai')
        }
      }
    })
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loadingReply])

  async function loadConversations(userId: string) {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (data && !error) {
        setConversations(data)
      }
    } catch (e) {
      console.error('Failed to load conversations:', e)
    }
  }

  async function loadMessages(convId: string) {
    setCurrentConvId(convId)
    const { data } = await supabase
      .from('ai_messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })

    if (data) setMessages(data)
  }

  async function handleNewChat() {
    setCurrentConvId(null)
    setMessages([])
    setInputVal('')
    setSelectedFile(null)
    if (user?.id) {
      loadConversations(user.id)
    }
  }

  // Voice Recognition Support (Web Speech API)
  function handleVoiceInput() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert('Aapke browser me Voice Recognition support nahi hai. Chrome ya Edge use karein.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'hi-IN' // Hindi + English
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInputVal(prev => (prev ? `${prev} ${transcript}` : transcript))
      setIsListening(false)
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  async function sendMessage(textToSend?: string, targetConvId?: string | null) {
    const query = textToSend || inputVal
    if (!query.trim() || loadingReply) return

    const activeConvId = targetConvId !== undefined ? targetConvId : currentConvId

    const userMsg = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: query,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])
    setInputVal('')
    setSelectedFile(null)
    setLoadingReply(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, conversationId: activeConvId }),
      })
      const data = await res.json()

      if (data.success) {
        setMessages(prev => [
          ...prev,
          {
            id: `reply-${Date.now()}`,
            role: 'assistant',
            content: data.reply,
            sources: data.sources || [],
            created_at: new Date().toISOString(),
          },
        ])
        if (data.conversationId) {
          setCurrentConvId(data.conversationId)
        }
        if (user?.id) {
          loadConversations(user.id)
        }
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: data.reply || 'Ek samasya aayi hai. Kripya punha prayas karein.',
            created_at: new Date().toISOString(),
          },
        ])
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Network connection issue. Kripya check karein.',
          created_at: new Date().toISOString(),
        },
      ])
    } finally {
      setLoadingReply(false)
    }
  }

  const filteredConversations = conversations.filter(c =>
    (c.title || '').toLowerCase().includes(searchChats.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: '#050a15', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', overflow: 'hidden' }}>
      
      {/* 1. Left Sidebar */}
      <aside style={{ width: '270px', background: '#070d1d', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px 14px', flexShrink: 0 }}>
        <div>
          {/* Logo */}
          <div onClick={() => window.location.href = '/'} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px', paddingLeft: '6px', cursor: 'pointer' }}>
            <span style={{ fontSize: '26px' }}>📖</span>
            <div>
              <b style={{ fontSize: '18px', display: 'block', color: '#fff', letterSpacing: '-0.3px' }}>Readora</b>
              <span style={{ fontSize: '10px', color: '#64748b' }}>Read • Learn • Grow</span>
            </div>
          </div>

          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            style={{
              width: '100%',
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '11px',
              fontSize: '13px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              marginBottom: '16px',
              boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
            }}
          >
            <span>➕</span> New Chat
          </button>

          {/* Search Chats Input */}
          <div style={{ background: '#0a1329', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <span style={{ color: '#64748b', fontSize: '12px' }}>🔍</span>
            <input
              type="text"
              placeholder="Search chats..."
              value={searchChats}
              onChange={e => setSearchChats(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '12px', width: '100%' }}
            />
          </div>

          {/* Recent Conversations */}
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', marginBottom: '10px', paddingLeft: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🕒</span> Recent Conversations
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', maxHeight: 'calc(100vh - 350px)' }}>
            {filteredConversations.length === 0 ? (
              <span style={{ fontSize: '11px', color: '#475569', padding: '8px 6px' }}>No previous chats</span>
            ) : (
              filteredConversations.map(c => (
                <div
                  key={c.id}
                  onClick={() => loadMessages(c.id)}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '10px',
                    background: currentConvId === c.id ? '#0d1935' : 'transparent',
                    border: currentConvId === c.id ? '1px solid rgba(56,189,248,0.2)' : '1px solid transparent',
                    color: currentConvId === c.id ? '#fff' : '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  <span>💬</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom Profile & Settings */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div onClick={() => window.location.href = '/settings'} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', color: '#94a3b8' }}>
            <span>⚙️</span> Settings
          </div>
          
          {/* Help & Support Button Fix */}
          <div
            onClick={() => {
              window.open('mailto:support@readora.com?subject=Readora%20AI%20Help%20and%20Support', '_blank')
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', color: '#94a3b8' }}
          >
            <span>❓</span> Help & Support
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#0a1329', padding: '10px', borderRadius: '12px', marginTop: '6px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>
              {user?.email?.charAt(0).toUpperCase() || 'R'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <b style={{ fontSize: '12px', color: '#fff', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Reader'}
              </b>
              <span style={{ fontSize: '10px', color: '#38bdf8' }}>Free Plan</span>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Main Chat Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        
        {/* Top Header */}
        <header style={{ padding: '16px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#070d1d', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', boxShadow: '0 0 16px rgba(139,92,246,0.35)' }}>
              ✨
            </div>
            <div>
              <b style={{ fontSize: '15px', color: '#fff', display: 'block' }}>Readora AI</b>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 'bold' }}>Online</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={handleNewChat}
              style={{ background: '#0d162c', border: '1px solid rgba(255,255,255,0.08)', color: '#cbd5e1', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>➕</span> New Chat
            </button>
            <span style={{ color: '#64748b', cursor: 'pointer', fontSize: '18px' }}>⋮</span>
          </div>
        </header>

        {/* Message Container / Empty State */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px 130px', display: 'flex', flexDirection: 'column' }}>
          
          {messages.length === 0 ? (
            /* Empty State */
            <div style={{ margin: 'auto', textAlign: 'center', maxWidth: '780px', width: '100%', padding: '20px 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 16px', boxShadow: '0 0 30px rgba(139,92,246,0.4)' }}>
                ✨
              </div>
              <h2 style={{ fontSize: '32px', fontWeight: '900', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
                Ask Readora <span style={{ color: '#38bdf8' }}>AI</span>
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 32px' }}>
                Ask questions, explore ideas, understand topics, and discover information from around the world.
              </p>

              {/* 4 Suggestion Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
                {[
                  { icon: '💡', title: 'Explain something', sub: 'to me', q: 'Explain how machine learning works in simple terms.' },
                  { icon: '🌐', title: 'Find the latest', sub: 'information', q: 'What are the latest breakthroughs in science today?' },
                  { icon: '📖', title: 'Help me choose', sub: 'a book', q: 'Recommend top 3 life-changing books on productivity.' },
                  { icon: '📄', title: 'Summarize a topic', sub: '', q: 'Give me a brief summary of how modern internet works.' },
                ].map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => sendMessage(s.q)}
                    style={{
                      background: '#070e20',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '16px',
                      padding: '18px 14px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#2563eb'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                  >
                    <div>
                      <span style={{ fontSize: '20px', display: 'block', marginBottom: '8px' }}>{s.icon}</span>
                      <b style={{ fontSize: '13px', display: 'block', color: '#fff' }}>{s.title}</b>
                      {s.sub && <span style={{ fontSize: '12px', color: '#94a3b8' }}>{s.sub}</span>}
                    </div>
                    <span style={{ color: '#38bdf8', fontSize: '13px', marginTop: '12px', alignSelf: 'flex-end' }}>➔</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Active Chat Stream */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '850px', width: '100%', margin: '0 auto' }}>
              {messages.map((m: any) => (
                <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  
                  {m.role === 'user' ? (
                    /* User Bubble */
                    <div style={{ maxWidth: '75%', background: '#1d4ed8', color: '#fff', padding: '12px 18px', borderRadius: '18px 18px 4px 18px', fontSize: '14px', lineHeight: 1.5, boxShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                      {m.content}
                      <span style={{ display: 'block', fontSize: '10px', color: 'rgba(255,255,255,0.7)', marginTop: '4px', textAlign: 'right' }}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓
                      </span>
                    </div>
                  ) : (
                    /* AI Answer Card */
                    <div style={{ display: 'flex', gap: '12px', maxWidth: '88%' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>
                        ✨
                      </div>
                      <div style={{ background: '#091024', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', padding: '16px 20px', color: '#e2e8f0', fontSize: '14px', lineHeight: 1.6 }}>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>

                        {/* Clickable Sources */}
                        {m.sources && m.sources.length > 0 && (
                          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', marginBottom: '8px' }}>
                              🔗 Sources
                            </div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                              {m.sources.map((src: any, sIdx: number) => (
                                <a
                                  key={sIdx}
                                  href={src.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ background: '#050a15', border: '1px solid rgba(255,255,255,0.08)', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', color: '#38bdf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                                >
                                  <span>🌐</span> {src.title || src.url}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              ))}

              {loadingReply && (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#94a3b8', fontSize: '13px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                    ✨
                  </div>
                  <span>Readora AI is thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

        </div>

        {/* 3. Bottom Fixed Input Bar */}
        <div style={{ position: 'absolute', bottom: '0', left: 0, right: 0, background: 'linear-gradient(to top, #050a15 70%, transparent)', padding: '16px 32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {/* File Selected Badge */}
          {selectedFile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0f172a', border: '1px solid rgba(56,189,248,0.3)', padding: '4px 12px', borderRadius: '20px', marginBottom: '8px', fontSize: '12px', color: '#38bdf8' }}>
              <span>🖼️ {selectedFile.name}</span>
              <span onClick={() => setSelectedFile(null)} style={{ cursor: 'pointer', fontWeight: 'bold' }}>✕</span>
            </div>
          )}

          {/* Hidden File Picker Input */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={e => {
              if (e.target.files && e.target.files[0]) {
                setSelectedFile(e.target.files[0])
              }
            }}
          />

          <form
            onSubmit={e => { e.preventDefault(); sendMessage(); }}
            style={{
              maxWidth: '820px',
              width: '100%',
              background: '#0a1329',
              border: isListening ? '1px solid #ef4444' : '1px solid rgba(56,189,248,0.2)',
              borderRadius: '35px',
              padding: '6px 10px 6px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            }}
          >
            {/* Gallery Attachment Icon */}
            <span
              onClick={() => fileInputRef.current?.click()}
              style={{ color: '#64748b', cursor: 'pointer', fontSize: '18px' }}
              title="Upload Image from Gallery"
            >
              📎
            </span>

            <input
              type="text"
              placeholder={isListening ? 'Bolna shuru karein (Listening...)...' : 'Ask anything...'}
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '14px' }}
            />

            {/* Voice Input Microphone Icon */}
            <span
              onClick={handleVoiceInput}
              style={{
                color: isListening ? '#ef4444' : '#64748b',
                cursor: 'pointer',
                fontSize: '18px',
                transition: 'transform 0.2s',
                transform: isListening ? 'scale(1.2)' : 'scale(1)',
              }}
              title="Voice Input"
            >
              🎙️️
            </span>

            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: '#c084fc' }}>
              ✨
            </div>
            <button
              type="submit"
              disabled={loadingReply}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '15px',
                boxShadow: '0 2px 10px rgba(37,99,235,0.4)',
              }}
            >
              ➤
            </button>
          </form>
          <span style={{ fontSize: '11px', color: '#475569', marginTop: '8px' }}>
            Readora AI can make mistakes. Check important information.
          </span>
        </div>

      </main>
    </div>
  )
                   }
