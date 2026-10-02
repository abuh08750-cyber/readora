'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://stuabcdisgmmxprapfai.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0dWFiY2Rpc2dtbXhwcmFwZmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1Njc1NjksImV4cCI6MjEwNjE0MzU2OX0.pGvaQQBWGcbDKgDb_9F1jkUURVXH3bhJ-trQt-GXBZ8'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export default function AdminDashboard() {
  const [books, setBooks] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [ebookFile, setEbookFile] = useState<File | null>(null)
  
  const [isPaid, setIsPaid] = useState(false)
  const [price, setPrice] = useState('0')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadBooks()
  }, [])

  async function loadBooks() {
    const { data } = await supabase.from('books').select('*').order('created_at', { ascending: false })
    if (data) setBooks(data)
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !author || !category || !ebookFile) {
      alert('Kripya zaroori fields aur ebook file fill karein!')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('title', title)
    formData.append('author', author)
    formData.append('category', category)
    formData.append('description', description)
    formData.append('is_paid', String(isPaid))
    formData.append('price', isPaid ? price : '0')

    if (coverFile) formData.append('cover', coverFile)
    if (ebookFile) formData.append('ebook', ebookFile)

    try {
      const res = await fetch('/api/admin/books', {
        method: 'POST',
        body: formData,
      })

      const result = await res.json()
      if (res.ok && result.success) {
        alert('Book successfully publish ho gayi hai!')
        setTitle('')
        setAuthor('')
        setCategory('')
        setDescription('')
        setCoverFile(null)
        setEbookFile(null)
        setIsPaid(false)
        setPrice('0')
        loadBooks()
      } else {
        alert(result.error || 'Upload fail ho gaya')
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5efe6', padding: '40px 20px', fontFamily: 'serif', color: '#1a1a1a' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <span style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: '#666' }}>READORA</span>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', margin: '6px 0 24px', letterSpacing: '-0.5px' }}>Admin dashboard</h1>

        <div style={{ background: '#fff', padding: '28px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '32px' }}>
          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <input
              type="text"
              placeholder="Book title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e0e0e0', outline: 'none', boxSizing: 'border-box', fontFamily: 'sans-serif', fontSize: '14px' }}
            />
            <input
              type="text"
              placeholder="Author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e0e0e0', outline: 'none', boxSizing: 'border-box', fontFamily: 'sans-serif', fontSize: '14px' }}
            />
            <input
              type="text"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e0e0e0', outline: 'none', boxSizing: 'border-box', fontFamily: 'sans-serif', fontSize: '14px' }}
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e0e0e0', outline: 'none', boxSizing: 'border-box', fontFamily: 'sans-serif', fontSize: '14px' }}
            />

            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => setIsPaid(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: !isPaid ? '2px solid #10b981' : '1px solid #e0e0e0',
                  background: !isPaid ? '#ecfdf5' : '#fff',
                  color: !isPaid ? '#065f46' : '#666',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontFamily: 'sans-serif'
                }}
              >
                ✓ eBook Read Free
              </button>
              <button
                type="button"
                onClick={() => setIsPaid(true)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: isPaid ? '2px solid #ef4444' : '1px solid #e0e0e0',
                  background: isPaid ? '#fef2f2' : '#fff',
                  color: isPaid ? '#991b1b' : '#666',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontFamily: 'sans-serif'
                }}
              >
                🔒 Paid eBook ($)
              </button>
            </div>

            {isPaid && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontFamily: 'sans-serif', fontSize: '14px', fontWeight: 'bold' }}>Price ($ USD):</span>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  placeholder="e.g. 2.99"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #e0e0e0', outline: 'none', fontFamily: 'sans-serif', fontSize: '14px' }}
                />
              </div>
            )}

            <div style={{ fontFamily: 'sans-serif', fontSize: '13px', color: '#555', marginTop: '6px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Cover image</label>
              <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
            </div>

            <div style={{ fontFamily: 'sans-serif', fontSize: '13px', color: '#555' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>eBook file (.html, .pdf)</label>
              <input type="file" onChange={(e) => setEbookFile(e.target.files?.[0] || null)} required />
            </div>

            <button
              type="submit"
              disabled={uploading}
              style={{
                marginTop: '10px',
                background: '#111827',
                color: '#fff',
                padding: '12px',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: 'sans-serif'
              }}
            >
              {uploading ? 'Uploading eBook...' : 'Upload eBook'}
            </button>
          </form>
        </div>

        <div style={{ background: '#fff', padding: '28px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 16px' }}>Books</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'sans-serif', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #eee', color: '#888' }}>
                  <th style={{ padding: '10px 8px' }}>Title</th>
                  <th style={{ padding: '10px 8px' }}>Author</th>
                  <th style={{ padding: '10px 8px' }}>Category</th>
                  <th style={{ padding: '10px 8px' }}>Type</th>
                  <th style={{ padding: '10px 8px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {books.map((b) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>{b.title}</td>
                    <td style={{ padding: '12px 8px', color: '#555' }}>{b.author}</td>
                    <td style={{ padding: '12px 8px', color: '#555' }}>{b.category}</td>
                    <td style={{ padding: '12px 8px' }}>
                      {b.is_paid ? (
                        <span style={{ color: '#dc2626', fontWeight: 'bold' }}>${b.price}</span>
                      ) : (
                        <span style={{ color: '#059669', fontWeight: 'bold' }}>Free</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 8px', color: '#16a34a' }}>Published</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
      }
      
