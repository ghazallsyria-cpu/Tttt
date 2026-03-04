// src/pages/Login.jsx
import { useState } from 'react'
import { authAPI } from '../lib/supabase'
import { ACADEMIC_YEAR, SEMESTER, LOGO_URL } from '../lib/constants'

export default function Login({ onLogin }) {
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const go = async () => {
    if (!u.trim() || !p.trim()) { setErr('يرجى إدخال اسم المستخدم وكلمة المرور'); return }
    setLoading(true)
    setErr('')
    try {
      const user = await authAPI.login(u, p)
      if (user) {
        onLogin(user)
      } else {
        setErr('اسم المستخدم أو كلمة المرور غير صحيحة')
      }
    } catch (e) {
      setErr('خطأ في الاتصال بقاعدة البيانات — تحقق من إعدادات Supabase')
    }
    setLoading(false)
  }

  const inputStyle = {
    border: '1.5px solid #c9a227', borderRadius: '6px', padding: '10px 12px',
    fontSize: '14px', background: '#fffdf5', color: '#222', outline: 'none',
    fontFamily: 'inherit', direction: 'rtl', width: '100%', boxSizing: 'border-box',
    marginBottom: '12px'
  }

  return (
    <div style={{
      direction: 'rtl', fontFamily: "'Cairo',sans-serif", minHeight: '100vh',
      background: 'linear-gradient(135deg,#1a0e00 0%,#3a2400 50%,#c9a227 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      {/* Logo above the card */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <div style={{
          padding: '12px', background: 'rgba(201,162,39,0.1)',
          borderRadius: '50%', border: '2px solid #c9a227',
          boxShadow: '0 0 30px rgba(201,162,39,0.4)',
          display: 'inline-block'
        }}>
          <img 
            src={LOGO_URL} 
            alt="Logo" 
            style={{ 
              width: '120px', height: '120px', 
              borderRadius: '50%', objectFit: 'cover', 
              display: 'block',
              filter: 'sepia(1) saturate(5) hue-rotate(10deg) brightness(1.1) contrast(1.2) drop-shadow(0 0 8px #c9a227)'
            }} 
            referrerPolicy="no-referrer" 
          />
        </div>
      </div>

      <div style={{
        background: '#fff', borderRadius: '18px', padding: '44px 38px',
        width: '100%', maxWidth: '360px',
        boxShadow: '0 24px 70px rgba(0,0,0,0.4)', border: '3px solid #c9a227', textAlign: 'center',
      }}>
        <h2 style={{ margin: '0 0 4px', color: '#8a6d0b', fontSize: '20px', fontWeight: '900' }}>نظام تقييم المعلمين</h2>
        <p style={{ color: '#aaa', fontSize: '12px', marginBottom: '8px' }}>وزارة التربية – دولة الكويت</p>
        <div style={{
          background: '#fffde7', border: '1px solid #c9a227', borderRadius: '8px',
          padding: '6px 12px', marginBottom: '20px', fontSize: '12px', color: '#8a6d0b', fontWeight: '700',
        }}>
          {ACADEMIC_YEAR} | {SEMESTER}
        </div>

        <input
          placeholder="اسم المستخدم"
          style={inputStyle}
          value={u} onChange={e => setU(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && go()}
          disabled={loading}
        />
        <input
          type="password" placeholder="كلمة المرور"
          style={{ ...inputStyle, marginBottom: '20px' }}
          value={p} onChange={e => setP(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && go()}
          disabled={loading}
        />
        {err && (
          <div style={{ color: '#c0392b', fontSize: '13px', marginBottom: '12px', fontWeight: '600' }}>{err}</div>
        )}
        <button onClick={go} disabled={loading} style={{
          background: 'linear-gradient(135deg,#c9a227,#e8c84a)', color: '#2c1e00',
          border: 'none', borderRadius: '8px',
          padding: '13px', fontSize: '15px', fontWeight: '800',
          cursor: 'pointer', fontFamily: 'inherit',
          width: '100%',
          opacity: loading ? 0.7 : 1,
        }}>
          {loading ? '⏳ جارٍ التحقق...' : 'دخول →'}
        </button>
      </div>
    </div>
  )
}
