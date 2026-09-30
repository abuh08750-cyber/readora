import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = createClient(
      'https://stuabcdisgmmxprapfai.supabase.co',
      'Sb_publishable_AHK5jGqipB4wYQCAtkaYSQ_hwuTecjR'
    )
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(`${origin}/auth`)
}
