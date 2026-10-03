import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

// 1. POST: New Book Upload
export async function POST(req: Request) {
  try {
    const supabase = await supabaseServer()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const title = formData.get('title') as string
    const author = formData.get('author') as string
    const category = formData.get('category') as string
    const description = formData.get('description') as string
    const priceRaw = formData.get('price') as string
    const coverFile = formData.get('cover') as File | null
    const ebookFile = formData.get('ebook') as File | null

    const price = priceRaw ? parseFloat(priceRaw) : 0
    const is_paid = price > 0

    if (!title || !author || !category || !ebookFile) {
      return NextResponse.json({ error: 'Missing required book details' }, { status: 400 })
    }

    let cover_url = ''
    let cover_path = ''
    if (coverFile && coverFile.size > 0) {
      const ext = coverFile.name.split('.').pop()
      const cPath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
      const { error: coverErr } = await supabase.storage.from('covers').upload(cPath, coverFile)
      if (!coverErr) {
        const { data } = supabase.storage.from('covers').getPublicUrl(cPath)
        cover_url = data.publicUrl
        cover_path = cPath
      }
    }

    const ebookExt = ebookFile.name.split('.').pop()?.toLowerCase() || 'html'
    const ebookPath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ebookExt}`
    const isHtml = ebookExt === 'html' || ebookExt === 'htm'

    const { error: ebookErr } = await supabase.storage.from('ebooks').upload(ebookPath, ebookFile, {
      contentType: isHtml ? 'text/html' : ebookFile.type,
      upsert: true,
    })

    if (ebookErr) {
      return NextResponse.json({ error: ebookErr.message }, { status: 500 })
    }

    const { data: ebookData } = supabase.storage.from('ebooks').getPublicUrl(ebookPath)

    const { error: dbErr } = await supabase.from('books').insert({
      title,
      author,
      category,
      description,
      price,
      is_paid,
      cover_url,
      cover_path: cover_url,
      file_path: ebookPath,
      file_url: ebookData.publicUrl,
      file_type: ebookExt,
      published: true,
      status: 'Published',
      created_at: new Date().toISOString(),
    })

    if (dbErr) {
      return NextResponse.json({ error: dbErr.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 })
  }
}

// 2. PUT: Edit & Update Book Details
export async function PUT(req: Request) {
  try {
    const supabase = await supabaseServer()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, title, author, category, price, description } = await req.json()

    if (!id || !title || !author) {
      return NextResponse.json({ error: 'Missing book fields' }, { status: 400 })
    }

    const numPrice = Number(price) || 0

    const { error: updateErr } = await supabase
      .from('books')
      .update({
        title,
        author,
        category,
        price: numPrice,
        is_paid: numPrice > 0,
        description,
      })
      .eq('id', id)

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Update failed' }, { status: 500 })
  }
}

// 3. DELETE: Remove Book and related storage
export async function DELETE(req: Request) {
  try {
    const supabase = await supabaseServer()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const bookId = searchParams.get('id')

    if (!bookId) {
      return NextResponse.json({ error: 'Book ID required' }, { status: 400 })
    }

    const { data: book } = await supabase.from('books').select('*').eq('id', bookId).single()

    if (book) {
      if (book.file_path) {
        await supabase.storage.from('ebooks').remove([book.file_path])
      }
      await supabase.from('books').delete().eq('id', bookId)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Delete failed' }, { status: 500 })
  }
                                     }
      
