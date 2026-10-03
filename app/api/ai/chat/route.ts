import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(req: Request) {
  try {
    const supabase = await supabaseServer()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, conversationId } = await req.json()
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const userId = session.user.id
    let convId = conversationId

    // 1. New conversation
    if (!convId) {
      const title = message.slice(0, 36) + (message.length > 36 ? '...' : '')
      const { data: newConv } = await supabase
        .from('ai_conversations')
        .insert({ user_id: userId, title })
        .select()
        .single()

      if (newConv) {
        convId = newConv.id
      }
    }

    // 2. User message save
    if (convId) {
      await supabase.from('ai_messages').insert({
        conversation_id: convId,
        user_id: userId,
        role: 'user',
        content: message,
      })
    }

    const apiKey = process.env.GEMINI_API_KEY
    let assistantReply = ''

    if (!apiKey) {
      assistantReply = 'Vercel सेटिंग्स में GEMINI_API_KEY नहीं मिली।'
    } else {
      // अलग-अलग मान्य वर्ज़न ट्राय करने की लिस्ट
      const candidateUrls = [
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=${apiKey}`
      ]

      let lastErrorMsg = ''
      for (const url of candidateUrls) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `You are Readora AI, a friendly, intelligent assistant for the Readora eBook platform. Provide helpful, well-formatted answers.\n\nUser Question: ${message}` }]
                }
              ]
            })
          })

          const data = await res.json()
          if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            assistantReply = data.candidates[0].content.parts[0].text
            break // उत्तर मिलते ही लूप बंद
          } else if (data.error) {
            lastErrorMsg = data.error.message || 'API error'
          }
        } catch (e: any) {
          lastErrorMsg = e.message || 'Network error'
        }
      }

      if (!assistantReply) {
        assistantReply = `Gemini Error: ${lastErrorMsg || 'मॉडल कनेक्ट नहीं हो सका'}`
      }
    }

    // 3. AI response save
    if (convId) {
      await supabase.from('ai_messages').insert({
        conversation_id: convId,
        user_id: userId,
        role: 'assistant',
        content: assistantReply,
        sources: [],
      })

      await supabase
        .from('ai_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', convId)
    }

    return NextResponse.json({
      success: true,
      conversationId: convId,
      reply: assistantReply,
      sources: [],
    })
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      reply: `Server issue: ${err.message || 'Please retry'}`,
      sources: [],
    })
  }
                 }
      
