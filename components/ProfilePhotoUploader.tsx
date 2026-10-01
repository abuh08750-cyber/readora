'use client'

import { useState, useEffect, useRef } from 'react'

interface PhotoUploaderProps {
  defaultChar?: string
  onPhotoChange?: (base64: string) => void
}

export default function ProfilePhotoUploader({ defaultChar = 'W', onPhotoChange }: PhotoUploaderProps) {
  const [avatarImage, setAvatarImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    try {
      const savedImg = localStorage.getItem('readora_profile_avatar')
      if (savedImg) setAvatarImage(savedImg)
    } catch {}
  }, [])

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setAvatarImage(base64String)
        try {
          localStorage.setItem('readora_profile_avatar', base64String)
        } catch {}
        if (onPhotoChange) onPhotoChange(base64String)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: '#1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          backgroundImage: avatarImage ? `url(${avatarImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: '2px solid #2563eb',
        }}
      >
        {!avatarImage && defaultChar}
      </div>
      <div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: '#111c33',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '6px 14px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Change Photo
        </button>
        <span style={{ display: 'block', fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
          JPG, PNG (max 2MB)
        </span>
      </div>
    </div>
  )
          }
          
