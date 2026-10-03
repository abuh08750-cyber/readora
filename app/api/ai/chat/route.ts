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
      assistantReply = 'Vercel madhe GEMINI_API_KEY set keli nahiye. Krupiya environment variable check kara.'
    } else {
      try {
        // v1 endpoint cha upyog
        const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`
        
        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `You are Readora AI, a friendly, helpful, and knowledgeable library assistant for the Readora eBook platform. Provide clear, well-structured answers using markdown formatting.\n\nUser Question: ${message}`
                  }
                ]
              }
            ]
          })
        })

        const geminiData = await response.json()

        if (geminiData.candidates && geminiData.candidates[0]?.content?.parts?.[0]?.text) {
          assistantReply = geminiData.candidates[0].content.parts[0].text
        } else if (geminiData.error) {
          assistantReply = `Gemini Error: ${geminiData.error.message || 'API request failed'}`
        } else {
          assistantReply = 'Kshama kara, uttar tayar hou shakle nahi. Krupaya punha prayatna kara.'
        }
      } catch (err: any) {
        assistantReply = `AI service connect zali nahi: ${err.message || 'Network error'}`
      }
    }

    // 3. AI assistant response save
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
          
