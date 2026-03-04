// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react'
import { evaluationsAPI } from '../lib/supabase'
import { exportPDF } from '../lib/exportPDF'
import { SUBJECTS, GRADES, CRITERIA, LEVELS, ACADEMIC_YEAR, SEMESTER } from '../lib/constants'
import { S, Spinner } from '../components/UI'

export default function Dashboard({ teachers, showToast }) {
  const [records,  setRecords]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [filter,   setFilter]   = useState({ name: '', date: '', subject: '', section: '' })

  const load = async () => {
    setLoading(true)
    try {
      const data = await evaluationsAPI.getAll(filter)
      setRecords(data)
    } catch (e) {
      showToast('خطأ في تحميل البيانات: ' + e.message, 'error')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleFilter = async () => { await load() }
  const clearFilter  = () => {
    setFilter({ name: '', date: '', subject: '', section: '' })
    setTimeout(load, 100)
  }

  const handleDelete = async (id) => {
    if (!confirm('هل تريد حذف هذا التقييم نهائياً؟')) return
    try {
      await evaluationsAPI.delete(id)
      setRecords(p => p.filter(r => r.id !== id))
      showToast('تم حذف التقييم', 'error')
    } catch (e) {
      showToast('خطأ أثناء الحذف: ' + e.message, 'error')
    }
  }

  return (
    <div style={{ direction: 'rtl', fontFamily: "'Cairo',sans-serif", background: '#f0e8cc', minHeight: 'calc(100vh - 48px)', padding: '16px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#c9a227,#e8c84a,#b8960c)', borderRadius: '12px', padding: '16px 22px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ margin: 0, color: '#2c1e00', fontSize: '18px', fontWeight: '900' }}>📊 سجل التقييمات</h2>
            <div style={{ color: '#5c3d00', fontSize: '12px', marginTop: '2px' }}>{ACADEMIC_YEAR} | {SEMESTER} | إجمالي: {records.length}</div>
          </div>
          <button onClick={load} style={S.btn('rgba(0,0,0,0.15)', '#2c1e00', { padding: '7px 16px', fontSize: '12px', border: '1px solid rgba(0,0,0,0.2)', borderRadius: '8px' })}>
            🔄 تحديث
          </button>
        </div>

        {/* Filters */}
        <div style={{ background: '#fff', borderRadius: '10px', padding: '12px 16px', marginBottom: '12px', border: '2px solid #e8d58a', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input placeholder="🔍 اسم المعلم" style={{ ...S.inp, maxWidth: '170px' }}
            value={filter.name} onChange={e => setFilter(f => ({ ...f, name: e.target.value }))} />
          <input type="date" style={{ ...S.inp, maxWidth: '150px' }}
            value={filter.date} onChange={e => setFilter(f => ({ ...f, date: e.target.value }))} />
          <select style={{ ...S.sel, maxWidth: '160px' }}
            value={filter.subject} onChange={e => setFilter(f => ({ ...f, subject: e.target.value }))}>
            <option value="">-- المجال --</option>
            {SUBJECTS.map(s => <option key={s}>{s}</option>)}
          </select>
          <select style={{ ...S.sel, maxWidth: '200px' }}
            value={filter.section} onChange={e => setFilter(f => ({ ...f, section: e.target.value }))}>
            <option value="">-- الصف والشعبة --</option>
            {GRADES.map(g => (
              <optgroup key={g.id} label={g.name}>
                {g.sections.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </optgroup>
            ))}
          </select>
          <button onClick={handleFilter} style={S.btn('linear-gradient(135deg,#1a4a7a,#2563a8)', '#fff', { padding: '7px 14px', fontSize: '12px' })}>
            🔍 بحث
          </button>
          {(filter.name || filter.date || filter.subject || filter.section) && (
            <button onClick={clearFilter} style={S.btn('#fee2e2', '#c0392b', { padding: '7px 12px', fontSize: '12px', border: '1px solid #fca5a5', borderRadius: '6px' })}>
              ✕ مسح
            </button>
          )}
          <span style={{ fontSize: '12px', color: '#aaa', marginRight: 'auto' }}>النتائج: {records.length}</span>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ background: '#fff', borderRadius: '10px', border: '2px solid #e8d58a' }}>
            <Spinner text="جارٍ تحميل التقييمات من Supabase..." />
          </div>
        ) : records.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '10px', padding: '60px', textAlign: 'center', color: '#bbb', border: '2px dashed #e8d58a' }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>📋</div>
            <div style={{ fontSize: '15px', fontWeight: '700' }}>لا توجد تقييمات بعد</div>
          </div>
        ) : (
          records.map(r => {
            const high = Object.values(r.ratings).filter(v => v === 'high').length
            const pct  = Math.round((high / CRITERIA.length) * 100)
            const isOpen = expanded === r.id
            const attendPct = +r.total_students > 0
              ? Math.round((+r.present / +r.total_students) * 100) : null

            return (
              <div key={r.id} style={{ background: '#fff', borderRadius: '10px', border: '2px solid #e8d58a', marginBottom: '10px', overflow: 'hidden' }}>
                {/* Row header */}
                <div style={{ padding: '13px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', background: isOpen ? '#fffde7' : '#fff' }}>
                  <div style={{ flex: 1, minWidth: '150px' }}>
                    <div style={{ fontWeight: '800', fontSize: '14px', color: '#2c1e00' }}>{r.teacher_name}</div>
                    <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                      {r.subject} · {r.class_section} · {r.day} {r.date}
                    </div>
                    <div style={{ fontSize: '11px', color: '#aaa', marginTop: '1px' }}>{r.lesson_title}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '7px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {attendPct !== null && (
                      <span style={{
                        background: attendPct >= 80 ? '#d4f5e2' : attendPct >= 60 ? '#fffde7' : '#ffd9cc',
                        color: attendPct >= 80 ? '#1a5c38' : attendPct >= 60 ? '#8a6d0b' : '#8b2500',
                        border: `1px solid ${attendPct >= 80 ? '#2d6a4f' : attendPct >= 60 ? '#c9a227' : '#c0392b'}`,
                        borderRadius: '6px', padding: '3px 8px', fontSize: '10px', fontWeight: '700',
                      }}>
                        حضور: {attendPct}%
                      </span>
                    )}
                    <span style={{ background: pct >= 70 ? '#d4f5e2' : pct >= 40 ? '#fffde7' : '#ffd9cc', color: pct >= 70 ? '#1a5c38' : pct >= 40 ? '#8a6d0b' : '#8b2500', border: `1px solid ${pct >= 70 ? '#2d6a4f' : pct >= 40 ? '#c9a227' : '#c0392b'}`, borderRadius: '6px', padding: '3px 10px', fontSize: '11px', fontWeight: '700' }}>
                      عالي: {pct}%
                    </span>
                    <span style={{ background: '#f0fdf4', color: '#1a5c38', border: '1px solid #86efac', borderRadius: '6px', padding: '3px 10px', fontSize: '11px', fontWeight: '700' }}>
                      #{r.id}
                    </span>
                    <button onClick={() => setExpanded(isOpen ? null : r.id)}
                      style={S.btn(isOpen ? '#e8d58a' : '#f0e8cc', '#8a6d0b', { padding: '5px 12px', fontSize: '11px', border: '1px solid #c9a227', borderRadius: '6px' })}>
                      {isOpen ? 'إخفاء ▲' : 'تفاصيل ▼'}
                    </button>
                    <button onClick={() => exportPDF(r, teachers)}
                      style={S.btn('linear-gradient(135deg,#c9a227,#e8c84a)', '#2c1e00', { padding: '5px 14px', fontSize: '11px' })}>
                      📄 PDF
                    </button>
                    <button onClick={() => handleDelete(r.id)}
                      style={S.btn('linear-gradient(135deg,#8b2500,#c0392b)', '#fff', { padding: '5px 10px', fontSize: '11px' })}>
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div style={{ padding: '12px 18px', background: '#fffdf5', borderTop: '2px solid #e8d58a' }}>
                    {/* Attendance */}
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      {[
                        { lbl: 'عدد الحضور',    val: r.present,        c: '#1a5c38', bg: '#d4f5e2' },
                        { lbl: 'عدد الغياب',    val: r.absent,         c: '#8b2500', bg: '#ffd9cc' },
                        { lbl: 'العدد الإجمالي', val: r.total_students, c: '#1a4a7a', bg: '#d0e8ff' },
                      ].map(x => (
                        <div key={x.lbl} style={{ background: x.bg, color: x.c, border: `1.5px solid ${x.c}`, borderRadius: '8px', padding: '6px 16px', textAlign: 'center', fontWeight: '700' }}>
                          <div style={{ fontSize: '10px', marginBottom: '2px' }}>{x.lbl}</div>
                          <div style={{ fontSize: '20px', fontWeight: '900' }}>{x.val || 0}</div>
                        </div>
                      ))}
                    </div>

                    {/* Criteria */}
                    <div style={{ overflowX: 'auto', border: '1px solid #e0d09a', borderRadius: '8px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '600px' }}>
                        <thead>
                        <tr style={{ background: 'linear-gradient(135deg,#c9a227,#e8c84a)', color: '#2c1e00' }}>
                          <th style={{ padding: '6px 8px', border: '1px solid #a07b10', textAlign: 'center', width: '32px' }}>م</th>
                          <th style={{ padding: '6px 10px', border: '1px solid #a07b10', textAlign: 'right' }}>بند التقييم</th>
                          {LEVELS.map(l => <th key={l.key} style={{ padding: '6px 8px', border: '1px solid #a07b10', textAlign: 'center', minWidth: '56px' }}>{l.label}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {CRITERIA.map((c, i) => {
                          const rk = r.ratings[i]
                          return (
                            <tr key={i} style={{ background: i % 2 === 0 ? '#fffdf5' : '#f9f3e1' }}>
                              <td style={{ padding: '5px 8px', border: '1px solid #e0d09a', textAlign: 'center', color: '#8a6d0b', fontWeight: '700' }}>{i + 1}</td>
                              <td style={{ padding: '5px 10px', border: '1px solid #e0d09a' }}>{c}</td>
                              {LEVELS.map(l => (
                                <td key={l.key} style={{ padding: '5px 8px', border: '1px solid #e0d09a', textAlign: 'center', background: rk === l.key ? l.bg : '', color: rk === l.key ? l.color : '#ccc', fontWeight: rk === l.key ? 700 : 400, fontSize: '14px' }}>
                                  {rk === l.key ? '✓' : '○'}
                                </td>
                              ))}
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                    </div>

                    {r.visitor_note && (
                      <div style={{ marginTop: '8px', padding: '8px 12px', background: '#f0e8cc', borderRadius: '6px', fontSize: '12px' }}>
                        <strong>رأي الزائر:</strong> {r.visitor_note}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '11px', color: '#888', flexWrap: 'wrap' }}>
                      <span><strong>توقيع المعلم:</strong> {r.teacher_signature || '—'}</span>
                      <span><strong>توقيع الزائر:</strong> {r.visitor_signature || '—'}</span>
                      <span style={{ marginRight: 'auto', color: '#ccc' }}>{new Date(r.created_at).toLocaleString('ar-KW')}</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
