'use client'

import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

const SUPABASE_URL = 'https://stuabcdisgmmxprapfai.supabase.co'
const SUPABASE_KEY = 'Sb_publishable_AHK5jGqipB4wYQCAtkaYSQ_hwuTecjR'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export default function AuthPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUserEmail(session.user.email ?? 'Logged In User')
      }
    }
    getUser()
  }, [])

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://readora-a4-be07.vercel.app/auth'
      }
    })
  }

  const handleFacebookLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: 'https://readora-a4-be07.vercel.app/auth'
      }
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUserEmail(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: '20px', fontFamily: 'sans-serif' }}>
      <h2>Readora User Login</h2>

      {userEmail ? (
        <div style={{ textAlign: 'center' }}>
          <p>Logged in as: <b>{userEmail}</b></p>
          <button onClick={handleLogout} style={{ padding: '10px 20px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            Log Out
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '260px' }}>
          <button onClick={handleGoogleLogin} style={{ padding: '12px', background: '#ffffff', color: '#000', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}>
            Continue with Google
          </button>
          <button onClick={handleFacebookLogin} style={{ padding: '12px', background: '#1877f2', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}>
            Continue with Facebook
          </button>
        </div>
      )}
    </div>
  )
          }
                     
