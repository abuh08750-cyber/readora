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
      try {
        // Step A: Google se direct supported models list fetch karein
        const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
        const listData = await listRes.json()

        if (listData.error) {
          assistantReply = `Google Setup Error: ${listData.error.message}`
        } else if (!listData.models || listData.models.length === 0) {
          assistantReply = 'Aapke account me koi models activate nahi dikh rahe hain.'
        } else {
          // Content generate karne wale models filter karein
          const usableModels = listData.models.filter((m: any) =>
            m.supportedGenerationMethods?.includes('generateContent')
          )

          // Model pick karein (priority: flash -> pro -> pehla available)
          const target =
            usableModels.find((m: any) => m.name.includes('flash')) ||
            usableModels.find((m: any) => m.name.includes('pro')) ||
            usableModels[0]

          if (!target) {
            const names = listData.models.map((m: any) => m.name.replace('models/', '')).join(', ')
            assistantReply = `generateContent wala model nahi mila. Available models: ${names}`
          } else {
            const generateUrl = `https://generativelanguage.googleapis.com/v1beta/${target.name}:generateContent?key=${apiKey}`

            const genRes = await fetch(generateUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    role: 'user',
                    parts: [
                      {
                        text: `You are Readora AI, an intelligent, helpful assistant for the Readora eBook platform. Answer clearly using markdown.\n\nUser Question: ${message}`,
                      },
                    ],
                  },
                ],
              }),
            })

            const genData = await genRes.json()
            if (genData.candidates && genData.candidates[0]?.content?.parts?.[0]?.text) {
              assistantReply = genData.candidates[0].content.parts[0].text
            } else if (genData.error) {
              assistantReply = `Gemini (${target.name}) Error: ${genData.error.message}`
            } else {
              assistantReply = 'Uttar generate nahi ho saka. Kripya punha prayatna karein.'
            }
          }
        }
      } catch (err: any) {
        assistantReply = `Network/Server issue: ${err.message || 'Failed to connect'}`
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
                
