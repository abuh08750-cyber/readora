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

    // 1. Agar nayi conversation hai to pehle title ke sath create karo
    if (!convId) {
      const title = message.slice(0, 36) + (message.length > 36 ? '...' : '')
      const { data: newConv, error: convErr } = await supabase
        .from('ai_conversations')
        .insert({ user_id: userId, title })
        .select()
        .single()

      if (convErr || !newConv) {
        return NextResponse.json({ error: 'Could not create conversation' }, { status: 500 })
      }
      convId = newConv.id
    }

    // 2. User message save karo
    await supabase.from('ai_messages').insert({
      conversation_id: convId,
      user_id: userId,
      role: 'user',
      content: message,
    })

    // 3. Past context load karo
    const { data: pastMsgs } = await supabase
      .from('ai_messages')
      .select('role, content')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })
      .limit(6)

    const formattedMessages = (pastMsgs || []).map((m: any) => ({
      role: m.role,
      content: m.content,
    }))

    // 4. OpenAI Responses API with Web Search Support
    const apiKey = process.env.OPENAI_API_KEY
    let assistantReply = ''
    let sources: any[] = []

    if (!apiKey) {
      assistantReply = `Main aapka question samajh gaya: "${message}". Live intelligence aur Web Search enable karne ke liye Vercel environment variables me OPENAI_API_KEY add karein.`
    } else {
      // Modern Responses API call with web_search tool
      const openAiRes = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          tools: [{ type: 'web_search' }],
          input: [
            {
              role: 'system',
              content:
                'You are Readora AI, an intelligent eBook & knowledge assistant. Use clear markdown with bold text, bullet points, and numbered lists. Provide accurate, current answers.',
            },
            ...formattedMessages,
          ],
        }),
      })

      const aiData = await openAiRes.json()

      if (aiData.output_text) {
        assistantReply = aiData.output_text
      } else if (aiData.choices && aiData.choices[0]?.message?.content) {
        assistantReply = aiData.choices[0].message.content
      } else {
        assistantReply = "Main abhi iska jawab generate nahi kar pa raha hoon. Kripya thodi der baad dobara koshish karein."
      }

      // Collect sources agar web search use hua ho
      if (aiData.output && Array.isArray(aiData.output)) {
        for (const item of aiData.output) {
          if (item.type === 'message' && item.content?.[0]?.annotations) {
            for (const ann of item.content[0].annotations) {
              if (ann.url) {
                sources.push({
                  title: ann.title || new URL(ann.url).hostname,
                  url: ann.url,
                })
              }
            }
          }
        }
      }
    }

    // 5. Assistant ka answer save karo
    await supabase.from('ai_messages').insert({
      conversation_id: convId,
      user_id: userId,
      role: 'assistant',
      content: assistantReply,
      sources,
    })

    // Conversation update timestamp
    await supabase
      .from('ai_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', convId)

    return NextResponse.json({
      success: true,
      conversationId: convId,
      reply: assistantReply,
      sources,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
        }
    
