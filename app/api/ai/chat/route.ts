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
      assistantReply = 'Vercel settings में GEMINI_API_KEY मौजूद नहीं है।'
    } else {
      // Models to try with Interactions API
      const modelsToTry = [
        'gemini-3.0-flash',
        'gemini-3.1-pro-preview',
        'gemini-2.5-flash',
        'gemini-2.0-flash'
      ]

      let lastError = ''
      for (const model of modelsToTry) {
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/interactions?key=${apiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: model,
              input: message,
              system_instruction: 'You are Readora AI, a friendly library assistant for the Readora eBook platform. Provide clear markdown answers.'
            })
          })

          const data = await res.json()

          if (data.output?.text) {
            assistantReply = data.output.text
            break
          } else if (data.outputs && data.outputs[0]?.text) {
            assistantReply = data.outputs[0].text
            break
          } else if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            assistantReply = data.candidates[0].content.parts[0].text
            break
          } else if (data.error) {
            lastError = data.error.message || 'API error'
          }
        } catch (e: any) {
          lastError = e.message || 'Network error'
        }
      }

      if (!assistantReply) {
        assistantReply = `Gemini Error: ${lastError || 'Response generate nahi ho saka.'}`
      }
    }

    // 3. AI assistant response save karein
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
