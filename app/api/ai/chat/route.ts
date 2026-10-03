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

    // 1. Agar nayi conversation hai to create karein
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

    // 2. User message save karein
    if (convId) {
      await supabase.from('ai_messages').insert({
        conversation_id: convId,
        user_id: userId,
        role: 'user',
        content: message,
      })
    }

    // 3. Past messages fetch karein context ke liye
    let formattedMessages: any[] = []
    if (convId) {
      const { data: pastMsgs } = await supabase
        .from('ai_messages')
        .select('role, content')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true })
        .limit(6)

      formattedMessages = (pastMsgs || []).map((m: any) => ({
        role: m.role,
        content: m.content,
      }))
    }

    const apiKey = process.env.OPENAI_API_KEY
    let assistantReply = ''

    if (!apiKey) {
      assistantReply = `Hello! Readora AI is online. However, the OPENAI_API_KEY environment variable is missing on Vercel. Please add it and redeploy.`
    } else {
      try {
        const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content:
                  'You are Readora AI, a helpful, intelligent library assistant for the Readora eBook platform. Format answers clearly using markdown bullets and headings when appropriate.',
              },
              ...formattedMessages,
              { role: 'user', content: message },
            ],
          }),
        })

        const aiData = await openAiRes.json()

        if (aiData.choices && aiData.choices[0]?.message?.content) {
          assistantReply = aiData.choices[0].message.content
        } else if (aiData.error) {
          assistantReply = `OpenAI API Error: ${aiData.error.message || 'Check billing or API key limits.'}`
        } else {
          assistantReply = "I could not generate an answer right now. Please try again."
        }
      } catch (err: any) {
        assistantReply = `AI service temporarily unavailable. Error: ${err.message || 'Fetch error'}`
      }
    }

    // 4. Assistant reply save karein
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
                              
