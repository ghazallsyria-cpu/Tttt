// src/pages/TeacherManager.jsx
import { useState } from 'react'
import { teachersAPI } from '../lib/supabase'
import { SUBJECTS } from '../lib/constants'
import { S, Spinner } from '../components/UI'

export default function TeacherManager({ teachers, setTeachers, showToast }) {
  const [modal, setModal] = useState(null)   // null | 'add' | number(id)
  const [form, setForm]   = useState({ name: '', subject: '', dept: '' })
  const [saving, setSaving] = useState(false)

  const openAdd  = () => { setForm({ name: '', subject: '', dept: '' }); setModal('add') }
  const openEdit = (t) => { setForm({ name: t.name, subject: t.subject, dept: t.dept }); setModal(t.id) }

  const save = async () => {
    if (!form.name.trim()) { showToast('اسم المعلم مطلوب', 'error'); return }
    setSaving(true)
    try {
      if (modal === 'add') {
        const created = await teachersAPI.create(form)
        setTeachers(p => [...p, created])
        showToast('تم إضافة المعلم بنجاح ✅')
      } else {
        const updated = await teachersAPI.update(modal, form)
        setTeachers(p => p.map(t => t.id === modal ? updated : t))
        showToast('تم تحديث بيانات المعلم ✅')
      }
      setModal(null)
    } catch (e) {
      showToast('حدث خطأ أثناء الحفظ: ' + e.message, 'error')
    }
    setSaving(false)
  }

  const del = async (id) => {
    if (!confirm('هل تريد حذف هذا المعلم نهائياً؟')) return
    try {
      await teachersAPI.delete(id)
      setTeachers(p => p.filter(t => t.id !== id))
      showToast('تم حذف المعلم', 'error')
    } catch (e) {
      showToast('خطأ أثناء الحذف: ' + e.message, 'error')
    }
  }

  return (
    <div style={{ direction: 'rtl', fontFamily: "'Cairo',sans-serif", padding: '16px', background: '#f0e8cc', minHeight: 'calc(100vh - 48px)' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header bar */}
        <div style={{
          background: 'linear-gradient(135deg,#c9a227,#e8c84a,#b8960c)',
          borderRadius: '12px', padding: '16px 22px', marginBottom: '16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <h2 style={{ margin: 0, color: '#2c1e00', fontSize: '18px', fontWeight: '900' }}>👨🏫 إدارة المعلمين</h2>
            <div style={{ color: '#5c3d00', fontSize: '12px', marginTop: '2px' }}>إجمالي: {teachers.length} معلم</div>
          </div>
          <button onClick={openAdd} style={S.btn('linear-gradient(135deg,#1a5c38,#2d6a4f)', '#fff')}>
            ➕ إضافة معلم
          </button>
        </div>

        {/* Table */}
        <div style={{ background: '#fff', borderRadius: '10px', border: '2px solid #e8d58a', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg,#c9a227,#e8c84a)', color: '#2c1e00' }}>
                {['#', 'اسم المعلم', 'المجال', 'القسم', 'إجراءات'].map((h, i) => (
                  <th key={i} style={{ padding: '10px 14px', textAlign: i === 0 || i === 4 ? 'center' : 'right', fontWeight: '800' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teachers.length === 0 && (
                <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#bbb' }}>لا يوجد معلمون. أضف معلماً جديداً.</td></tr>
              )}
              {teachers.map((t, i) => (
                <tr key={t.id} style={{ background: i % 2 === 0 ? '#fffdf5' : '#f9f3e1', borderBottom: '1px solid #e8d58a' }}>
                  <td style={{ padding: '9px 14px', textAlign: 'center', color: '#8a6d0b', fontWeight: '700' }}>{i + 1}</td>
                  <td style={{ padding: '9px 14px', fontWeight: '700', color: '#2c1e00' }}>{t.name}</td>
                  <td style={{ padding: '9px 14px', color: '#444' }}>{t.subject || '—'}</td>
                  <td style={{ padding: '9px 14px', color: '#666' }}>{t.dept || '—'}</td>
                  <td style={{ padding: '9px 14px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button onClick={() => openEdit(t)} style={S.btn('linear-gradient(135deg,#1a4a7a,#2563a8)', '#fff', { padding: '5px 12px', fontSize: '12px' })}>✏️ تعديل</button>
                      <button onClick={() => del(t.id)}   style={S.btn('linear-gradient(135deg,#8b2500,#c0392b)', '#fff', { padding: '5px 12px', fontSize: '12px' })}>🗑️ حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '400px', border: '3px solid #c9a227', direction: 'rtl', fontFamily: "'Cairo',sans-serif", boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
            <h3 style={{ margin: '0 0 18px', color: '#8a6d0b', fontWeight: '900', fontSize: '17px' }}>
              {modal === 'add' ? '➕ إضافة معلم جديد' : '✏️ تعديل بيانات المعلم'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#6b5209', fontWeight: '700', display: 'block', marginBottom: '3px' }}>اسم المعلم *</label>
                <input style={S.inp} placeholder="الاسم الكامل" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#6b5209', fontWeight: '700', display: 'block', marginBottom: '3px' }}>المجال الدراسي</label>
                <select style={S.sel} value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}>
                  <option value="">-- اختر --</option>
                  {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#6b5209', fontWeight: '700', display: 'block', marginBottom: '3px' }}>القسم</label>
                <input style={S.inp} placeholder="القسم أو الإدارة" value={form.dept} onChange={e => setForm(f => ({ ...f, dept: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={save} disabled={saving} style={{ ...S.btn('linear-gradient(135deg,#c9a227,#e8c84a)', '#2c1e00'), opacity: saving ? 0.7 : 1 }}>
                {saving ? '⏳ جارٍ الحفظ...' : '💾 حفظ'}
              </button>
              <button onClick={() => setModal(null)} style={S.btn('#eee', '#555')}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
