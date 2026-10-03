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

    // 1. Conversation create karein
    if (!convId) {
      const title = message.slice(0, 36) + (message.length > 36 ? '...' : '')
      const { data: newConv } = await supabase
        .from('ai_conversations')
        .insert({ user_id: userId, title })
        .select()
        .single()

      if (newConv) convId = newConv.id
    }

    // 2. User message save karein
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
      assistantReply = 'Vercel settings me GEMINI_API_KEY missing hai.'
    } else {
      // 2026 ke active models ki list
      const modelsToTry = [
        'gemini-3.8-flash',
        'gemini-3.0-flash',
        'gemini-2.5-flash',
        'gemini-2.0-flash'
      ]

      let lastError = ''
      for (const model of modelsToTry) {
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey,
            },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `You are Readora AI, a helpful library assistant for the Readora eBook platform. Provide clear markdown answers.\n\nUser Question: ${message}`,
                    },
                  ],
                },
              ],
            }),
          })

          const data = await res.json()
          if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            assistantReply = data.candidates[0].content.parts[0].text
            break
          } else if (data.error?.message) {
            lastError = data.error.message
          }
        } catch (e: any) {
          lastError = e.message || 'Network error'
        }
      }

      if (!assistantReply) {
        assistantReply = `Gemini Error: ${lastError || 'Response generate nahi ho saka.'}`
      }
    }

    // 3. AI response save karein
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
        
