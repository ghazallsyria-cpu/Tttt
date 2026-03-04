// src/pages/EvalForm.jsx
import { useState, useCallback } from 'react'
import { evaluationsAPI } from '../lib/supabase'
import { exportPDF } from '../lib/exportPDF'
import {
  ACADEMIC_YEAR, SEMESTER, DAYS, SUBJECTS, VCLASS,
  CRITERIA, LEVELS, todayStr, initRatings,
} from '../lib/constants'
import { S, Fld, AttendanceFields, ClassSectionSelect, PageHeader } from '../components/UI'

const ERR = '#c0392b'

export default function EvalForm({ teachers, onSaved, showToast, currentUser }) {
  const blank = useCallback(() => ({
    teacher_id: '', day: '', date: todayStr(), subject: '', virtual_class: '',
    class_section: '', lesson_title: '',
    present: '', absent: '', total_students: '',
    ratings: initRatings(),
    visitor_note: '', visitor_signature: '', teacher_signature: '',
  }), [])

  const [form, setForm]         = useState(blank)
  const [errors, setErrors]     = useState({})
  const [saving, setSaving]     = useState(false)
  const [lastSaved, setLastSaved] = useState(null)

  const set  = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setR = (i, v) => {
    setForm(f => ({ ...f, ratings: { ...f.ratings, [i]: v } }))
    setErrors(e => { const n = { ...e }; delete n[`r${i}`]; return n })
  }

  const validate = () => {
    const e = {}
    if (!form.teacher_id)       e.teacher_id    = true
    if (!form.day)              e.day           = true
    if (!form.subject)          e.subject       = true
    if (!form.virtual_class)    e.virtual_class = true
    if (!form.class_section)    e.class_section = true
    if (!form.lesson_title.trim()) e.lesson_title = true
    CRITERIA.forEach((_, i) => { if (!form.ratings[i]) e[`r${i}`] = true })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) { showToast('يرجى استكمال الحقول المحددة باللون الأحمر', 'error'); return }
    setSaving(true)
    const teacher = teachers.find(t => t.id === +form.teacher_id) || {}
    try {
      const payload = {
        ...form,
        teacher_id:     +form.teacher_id,
        teacher_name:   teacher.name || '',
        academic_year:  ACADEMIC_YEAR,
        semester:       SEMESTER,
        present:        parseInt(form.present)       || 0,
        absent:         parseInt(form.absent)        || 0,
        total_students: parseInt(form.total_students)|| 0,
        created_by:     currentUser?.username || '',
      }
      const saved = await evaluationsAPI.create(payload)
      onSaved(saved)
      setLastSaved({ ...saved, teacher_name: teacher.name })
      showToast(`✅ تم الحفظ في قاعدة البيانات | رقم التقييم: #${saved.id}`)
    } catch (e) {
      showToast('خطأ أثناء الحفظ: ' + e.message, 'error')
    }
    setSaving(false)
  }

  const done = Object.values(form.ratings).filter(v => v).length
  const errR = Object.keys(errors).filter(k => k.startsWith('r')).length
  const pct  = Math.round((done / CRITERIA.length) * 100)
  const teacher = teachers.find(t => t.id === +form.teacher_id)

  return (
    <div style={{ direction: 'rtl', fontFamily: "'Cairo',sans-serif", background: '#f0e8cc', minHeight: 'calc(100vh - 48px)', paddingBottom: '40px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '14px' }}>
        <div style={{ background: '#fff', boxShadow: '0 8px 40px rgba(0,0,0,0.15)', borderRadius: '4px', overflow: 'hidden', border: '3px solid #c9a227' }}>

          <PageHeader academicYear={ACADEMIC_YEAR} semester={SEMESTER} />

          {/* Meta fields */}
          <div style={{ padding: '18px 22px', background: '#fffdf5', borderBottom: '2px solid #e8d58a' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px 16px' }}>

              <Fld label="اسم المعلم" err={errors.teacher_id}>
                <select style={{ ...S.sel, borderColor: errors.teacher_id ? ERR : '#c9a227' }}
                  value={form.teacher_id}
                  onChange={e => {
                    set('teacher_id', e.target.value)
                    const t = teachers.find(x => x.id === +e.target.value)
                    if (t) set('subject', t.subject)
                  }}>
                  <option value="">-- اختر المعلم --</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </Fld>

              <Fld label="اليوم" err={errors.day}>
                <select style={{ ...S.sel, borderColor: errors.day ? ERR : '#c9a227' }}
                  value={form.day} onChange={e => set('day', e.target.value)}>
                  <option value="">-- اليوم --</option>
                  {DAYS.map(d => <option key={d}>{d}</option>)}
                </select>
              </Fld>

              <Fld label="التاريخ">
                <input type="date" style={S.inp} value={form.date} onChange={e => set('date', e.target.value)} />
              </Fld>

              <Fld label="المجال الدراسي" err={errors.subject}>
                <select style={{ ...S.sel, borderColor: errors.subject ? ERR : '#c9a227' }}
                  value={form.subject} onChange={e => set('subject', e.target.value)}>
                  <option value="">-- المجال --</option>
                  {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </Fld>

              <Fld label="الفصل الافتراضي" err={errors.virtual_class}>
                <select style={{ ...S.sel, borderColor: errors.virtual_class ? ERR : '#c9a227' }}
                  value={form.virtual_class} onChange={e => set('virtual_class', e.target.value)}>
                  <option value="">-- الفصل --</option>
                  {VCLASS.map(c => <option key={c}>{c}</option>)}
                </select>
              </Fld>

              <Fld label="عنوان الدرس" err={errors.lesson_title}>
                <input style={{ ...S.inp, borderColor: errors.lesson_title ? ERR : '#c9a227' }}
                  placeholder="أدخل عنوان الدرس..."
                  value={form.lesson_title} onChange={e => set('lesson_title', e.target.value)} />
              </Fld>

              <Fld label="الصف والشعبة" err={errors.class_section} span={3}>
                <ClassSectionSelect
                  value={form.class_section}
                  err={errors.class_section}
                  onChange={v => { set('class_section', v); setErrors(e => { const n = { ...e }; delete n.class_section; return n }) }}
                />
              </Fld>

              <AttendanceFields
                present={form.present} absent={form.absent} total={form.total_students}
                onChange={({ present, absent, total_students }) =>
                  setForm(f => ({ ...f, present, absent, total_students }))}
              />
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ padding: '8px 22px', background: '#f9f3e1', borderBottom: '1px solid #e8d58a', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '11px', color: '#6b5209', fontWeight: '700', whiteSpace: 'nowrap' }}>تقدم التقييم</span>
            <div style={{ flex: 1, height: '7px', background: '#e8d58a', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? 'linear-gradient(90deg,#1a5c38,#2d6a4f)' : 'linear-gradient(90deg,#c9a227,#e8c84a)', borderRadius: '6px', transition: 'width 0.3s' }} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: pct === 100 ? '#1a5c38' : '#8a6d0b', whiteSpace: 'nowrap' }}>{done}/{CRITERIA.length}</span>
            {errR > 0 && <span style={{ fontSize: '11px', color: '#c0392b', fontWeight: '600' }}>⚠ {errR} غير مكتمل</span>}
          </div>

          {/* Criteria table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg,#c9a227,#e8c84a,#b8960c)', color: '#2c1e00' }}>
                  <th style={{ padding: '9px 8px', border: '1px solid #a07b10', width: '34px', textAlign: 'center', fontWeight: '800' }}>م</th>
                  <th style={{ padding: '9px 14px', border: '1px solid #a07b10', textAlign: 'right', fontWeight: '800' }}>بند التقييم</th>
                  {LEVELS.map(l => (
                    <th key={l.key} style={{ padding: '9px 6px', border: '1px solid #a07b10', textAlign: 'center', fontWeight: '800', minWidth: '64px', fontSize: '12px' }}>{l.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CRITERIA.map((c, i) => {
                  const hasErr = errors[`r${i}`]
                  const rated  = form.ratings[i]
                  return (
                    <tr key={i} style={{ background: hasErr ? '#fff0ee' : rated ? '#f4fff8' : (i % 2 === 0 ? '#fffdf5' : '#f9f3e1'), borderBottom: '1px solid #e8d58a', transition: 'background 0.2s' }}>
                      <td style={{ padding: '8px', border: '1px solid #e0d09a', textAlign: 'center', fontWeight: '700', color: hasErr ? '#c0392b' : '#8a6d0b', fontSize: '12px' }}>{i + 1}</td>
                      <td style={{ padding: '8px 14px', border: '1px solid #e0d09a', color: hasErr ? '#c0392b' : '#222', lineHeight: 1.5 }}>{c}</td>
                      {LEVELS.map(l => (
                        <td key={l.key} style={{ padding: '8px 6px', border: '1px solid #e0d09a', textAlign: 'center', background: rated === l.key ? l.bg : '', transition: 'background 0.2s' }}>
                          <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <input type="radio" name={`r${i}`} value={l.key} checked={rated === l.key} onChange={() => setR(i, l.key)}
                              style={{ accentColor: l.color, width: '17px', height: '17px', cursor: 'pointer' }} />
                          </label>
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Level chips */}
          <div style={{ padding: '10px 22px', background: '#f9f3e1', borderTop: '2px solid #e8d58a', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {LEVELS.map(l => {
              const cnt = Object.values(form.ratings).filter(v => v === l.key).length
              return (
                <div key={l.key} style={{ background: l.bg, color: l.color, border: `2px solid ${l.color}`, borderRadius: '8px', padding: '4px 14px', fontWeight: '700', fontSize: '12px' }}>
                  {l.label}: {cnt}
                </div>
              )
            })}
          </div>

          {/* Visitor note */}
          <div style={{ padding: '14px 22px', background: '#fffdf5' }}>
            <div style={{ background: 'linear-gradient(135deg,#c9a227,#e8c84a,#b8960c)', padding: '6px 14px', borderRadius: '6px 6px 0 0', textAlign: 'center' }}>
              <span style={{ fontWeight: '800', color: '#2c1e00', fontSize: '13px' }}>رأي الزائر بالزيارة</span>
            </div>
            <textarea value={form.visitor_note} onChange={e => set('visitor_note', e.target.value)}
              placeholder="أدخل ملاحظاتك حول الزيارة..."
              style={{ ...S.inp, minHeight: '68px', resize: 'vertical', borderRadius: '0 0 6px 6px', borderTop: 'none' }} />
          </div>

          {/* Signatures */}
          <div style={{ padding: '14px 22px', background: '#f9f3e1', borderTop: '2px solid #e8d58a', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '11px', color: '#6b5209', fontWeight: '700', display: 'block', marginBottom: '3px' }}>توقيع المعلم</label>
              <input style={S.inp} placeholder="اسم المعلم وتوقيعه" value={form.teacher_signature} onChange={e => set('teacher_signature', e.target.value)} />
              <div style={{ fontSize: '10px', color: '#aaa', marginTop: '2px' }}>{teacher?.name || ''}</div>
            </div>
            <div>
              <label style={{ fontSize: '11px', color: '#6b5209', fontWeight: '700', display: 'block', marginBottom: '3px' }}>توقيع الزائر</label>
              <input style={S.inp} placeholder="اسم الزائر وتوقيعه" value={form.visitor_signature} onChange={e => set('visitor_signature', e.target.value)} />
              <div style={{ fontSize: '10px', color: '#aaa', marginTop: '2px' }}>مدير المدرسة: صالح مخلد المطيري</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ padding: '16px 22px', background: '#fff', borderTop: '3px solid #c9a227', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={handleSave} disabled={saving} style={{
              ...S.btn(saving ? '#aaa' : 'linear-gradient(135deg,#1a5c38,#2d6a4f)', '#fff'),
              padding: '12px 32px', fontSize: '14px', opacity: saving ? 0.7 : 1,
              boxShadow: saving ? 'none' : '0 4px 14px rgba(26,92,56,0.35)',
            }}>
              {saving ? '⏳ جارٍ الحفظ في Supabase...' : '💾 حفظ في قاعدة البيانات'}
            </button>
            <button onClick={() => { if (!lastSaved) { showToast('احفظ النموذج أولاً', 'error'); return } exportPDF(lastSaved, teachers) }}
              style={{
                ...S.btn(!lastSaved ? '#d0c090' : 'linear-gradient(135deg,#c9a227,#e8c84a)', !lastSaved ? '#999' : '#2c1e00'),
                padding: '12px 32px', fontSize: '14px',
                cursor: !lastSaved ? 'not-allowed' : 'pointer',
                boxShadow: lastSaved ? '0 4px 14px rgba(200,162,39,0.4)' : 'none',
              }}>
              📄 تصدير PDF
            </button>
            <button onClick={() => { if (confirm('مسح النموذج والبدء من جديد؟')) { setForm(blank()); setErrors({}); setLastSaved(null) } }}
              style={{ ...S.btn('#f0e8cc', '#8a6d0b'), padding: '12px 20px', fontSize: '14px', border: '2px solid #c9a227' }}>
              🔄 نموذج جديد
            </button>
          </div>

          {lastSaved && (
            <div style={{ padding: '9px 22px', background: '#f0fff4', borderTop: '1px solid #86efac', textAlign: 'center', fontSize: '12px', color: '#1a5c38', fontWeight: '700' }}>
              ✅ محفوظ في Supabase — رقم التقييم: <strong>#{lastSaved.id}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
