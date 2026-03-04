// src/pages/Login.jsx
import { useState } from 'react'
import { authAPI } from '../lib/supabase'
import { ACADEMIC_YEAR, SEMESTER, LOGO_URL } from '../lib/constants'
import { S } from '../components/UI'

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

  return (
    <div style={{
      direction: 'rtl', fontFamily: "'Cairo',sans-serif", minHeight: '100vh',
      background: 'linear-gradient(135deg,#1a0e00 0%,#3a2400 50%,#c9a227 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{
        background: '#fff', borderRadius: '18px', padding: '44px 38px',
        width: '100%', maxWidth: '360px',
        boxShadow: '0 24px 70px rgba(0,0,0,0.4)', border: '3px solid #c9a227', textAlign: 'center',
      }}>
        <img src={LOGO_URL} alt="Logo" style={{ width: '100px', height: '100px', marginBottom: '16px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #c9a227' }} referrerPolicy="no-referrer" />
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
          style={{ ...S.inp, marginBottom: '12px' }}
          value={u} onChange={e => setU(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && go()}
          disabled={loading}
        />
        <input
          type="password" placeholder="كلمة المرور"
          style={{ ...S.inp, marginBottom: '16px' }}
          value={p} onChange={e => setP(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && go()}
          disabled={loading}
        />
        {err && (
          <div style={{ color: '#c0392b', fontSize: '13px', marginBottom: '12px', fontWeight: '600' }}>{err}</div>
        )}
        <button onClick={go} disabled={loading} style={{
          ...S.btn('linear-gradient(135deg,#c9a227,#e8c84a)', '#2c1e00'),
          width: '100%', padding: '13px', fontSize: '15px', fontWeight: '800',
          opacity: loading ? 0.7 : 1,
        }}>
          {loading ? '⏳ جارٍ التحقق...' : 'دخول →'}
        </button>
      </div>
    </div>
  )
}
