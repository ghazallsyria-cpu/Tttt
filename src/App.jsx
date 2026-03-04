import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import EvalForm from './pages/EvalForm'
import TeacherManager from './pages/TeacherManager'
import { Toast, S } from './components/UI'
import { teachersAPI } from './lib/supabase'
import { LOGO_URL } from './lib/constants'

export default function App() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('dashboard') // dashboard | eval | teachers
  const [teachers, setTeachers] = useState([])
  const [toast, setToast] = useState(null) // { msg, type }

  // Load teachers on mount (or after login)
  useEffect(() => {
    if (user) {
      teachersAPI.getAll().then(setTeachers).catch(console.error)
    }
  }, [user])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  if (!user) {
    return (
      <>
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        <Login onLogin={setUser} />
        <div style={{ textAlign: 'center', padding: '10px', color: '#8a6d0b', fontWeight: '700', fontSize: '14px' }}>
          برمجة الاستاذ : ايهاب جمال غزال
        </div>
      </>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0e8cc', fontFamily: "'Cairo', sans-serif" }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Navbar */}
      <nav style={{
        background: '#2c1e00', padding: '0 16px', minHeight: '48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        color: '#e8d58a', borderBottom: '3px solid #c9a227', flexWrap: 'wrap',
        paddingTop: '8px', paddingBottom: '8px', gap: '10px'
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <img src={LOGO_URL} alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #c9a227' }} referrerPolicy="no-referrer" />
          <div style={{ fontWeight: '900', fontSize: '14px', whiteSpace: 'nowrap' }}>🇰🇼 نظام التقييم</div>
          <div style={{ width: '1px', height: '20px', background: '#555', display: 'none' }}></div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {user.role === 'admin' && (
              <>
                <button onClick={() => setPage('dashboard')} style={{ background: 'none', border: 'none', color: page === 'dashboard' ? '#fff' : '#aaa', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>📊 السجل</button>
                <button onClick={() => setPage('teachers')} style={{ background: 'none', border: 'none', color: page === 'teachers' ? '#fff' : '#aaa', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>👨‍🏫 المعلمين</button>
              </>
            )}
            <button onClick={() => setPage('eval')} style={{ background: 'none', border: 'none', color: page === 'eval' ? '#fff' : '#aaa', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>📝 تقييم</button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginLeft: 'auto' }}>
          <span style={{ fontSize: '11px', color: '#aaa', display: 'none' }}>مرحباً، {user.full_name}</span>
          <button onClick={() => setUser(null)} style={{ background: '#8b2500', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer' }}>خروج</button>
        </div>
      </nav>

      {/* Page Content */}
      <main>
        {page === 'dashboard' && <Dashboard teachers={teachers} showToast={showToast} />}
        {page === 'teachers' && <TeacherManager teachers={teachers} setTeachers={setTeachers} showToast={showToast} />}
        {page === 'eval' && <EvalForm teachers={teachers} onSaved={() => setPage('dashboard')} showToast={showToast} currentUser={user} />}
      </main>
      <footer style={{
        textAlign: 'center', padding: '16px', color: '#8a6d0b', fontWeight: '700',
        fontSize: '14px', borderTop: '1px solid #e8d58a', background: '#fffdf5'
      }}>
        برمجة الاستاذ : ايهاب جمال غزال
      </footer>
    </div>
  )
}
