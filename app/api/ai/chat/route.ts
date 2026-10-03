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

      if (newConv) convId = newConv.id
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
      assistantReply = 'Vercel settings में GEMINI_API_KEY मौजूद नहीं है।'
    } else {
      try {
        // Step A: Account ke valid models fetch karein
        const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
        const listData = await listRes.json()

        let modelTarget = 'models/gemini-1.5-flash'
        if (listData.models && Array.isArray(listData.models)) {
          const supported = listData.models.filter((m: any) =>
            m.supportedGenerationMethods?.includes('generateContent')
          )
          const matched = supported.find((m: any) => m.name.includes('flash') || m.name.includes('gemini-2') || m.name.includes('pro'))
          if (matched) {
            modelTarget = matched.name
          } else if (supported.length > 0) {
            modelTarget = supported[0].name
          }
        }

        // Clean model name
        const cleanName = modelTarget.startsWith('models/') ? modelTarget : `models/${modelTarget}`
        const generateUrl = `https://generativelanguage.googleapis.com/v1beta/${cleanName}:generateContent?key=${apiKey}`

        const genRes = await fetch(generateUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `You are Readora AI, a friendly, intelligent assistant for the Readora eBook platform. Provide clear, direct, and helpful answers using markdown.\n\nUser Question: ${message}`,
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
          assistantReply = `Gemini Error: ${genData.error.message}`
        } else {
          assistantReply = 'माफ़ कीजिए, उत्तर तैयार नहीं हो सका।'
        }
      } catch (err: any) {
        assistantReply = `नेटवर्क समस्या: ${err.message || 'Error'}`
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
        
