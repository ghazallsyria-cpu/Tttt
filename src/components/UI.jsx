// src/components/UI.jsx  — مكونات مشتركة
import { useState } from 'react'
import { GRADES, LEVELS } from '../lib/constants'

// ── Shared Styles ──────────────────────────────────────────────
export const S = {
  inp: {
    border: '1.5px solid #c9a227', borderRadius: '6px', padding: '7px 10px',
    fontSize: '13px', background: '#fffdf5', color: '#222', outline: 'none',
    fontFamily: 'inherit', direction: 'rtl', width: '100%', boxSizing: 'border-box',
  },
  sel: {
    border: '1.5px solid #c9a227', borderRadius: '6px', padding: '7px 10px',
    fontSize: '13px', background: '#fffdf5', color: '#222', outline: 'none',
    fontFamily: 'inherit', direction: 'rtl', width: '100%', boxSizing: 'border-box', cursor: 'pointer',
  },
  btn: (bg, fg, x = {}) => ({
    background: bg, color: fg, border: 'none', borderRadius: '8px',
    padding: '9px 20px', fontSize: '13px', fontWeight: '700',
    cursor: 'pointer', fontFamily: 'inherit', ...x,
  }),
}

// ── Toast ──────────────────────────────────────────────────────
export function Toast({ msg, type, onClose }) {
  const bg = type === 'success' ? '#1a5c38' : type === 'error' ? '#8b2500' : '#1a4a7a'
  return (
    <div style={{
      position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)',
      background: bg, color: '#fff', padding: '12px 22px', borderRadius: '12px',
      fontSize: '14px', fontWeight: '700', zIndex: 9999,
      boxShadow: '0 8px 28px rgba(0,0,0,0.35)',
      display: 'flex', alignItems: 'center', gap: '10px',
      direction: 'rtl', fontFamily: "'Cairo',sans-serif", whiteSpace: 'nowrap',
    }}>
      {type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'} {msg}
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '18px' }}>×</button>
    </div>
  )
}

// ── Field wrapper ─────────────────────────────────────────────
export function Fld({ label, err, children, span = 1 }) {
  return (
    <div style={{ gridColumn: `span ${span}`, display: 'flex', flexDirection: 'column', gap: '3px' }}>
      <label style={{ fontSize: '11px', color: err ? '#c0392b' : '#6b5209', fontWeight: '700' }}>
        {label}{err ? ' *' : ''}
      </label>
      {children}
    </div>
  )
}

// ── Spinner ────────────────────────────────────────────────────
export function Spinner({ text = 'جارٍ التحميل...' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '40px', color: '#8a6d0b', fontWeight: '700', fontSize: '14px' }}>
      <div style={{
        width: '24px', height: '24px', border: '3px solid #e8d58a',
        borderTopColor: '#c9a227', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      {text}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ── Class Section Selector ─────────────────────────────────────
export function ClassSectionSelect({ value, onChange, err }) {
  const [grade, setGrade] = useState(() => {
    if (!value) return ''
    const g = GRADES.find(g => g.sections.some(s => s.value === value))
    return g ? g.id : ''
  })

  const gradeObj = GRADES.find(g => g.id === grade)

  const handleGrade = (gid) => { setGrade(gid); onChange('') }
  const handleSection = (sv) => { onChange(sv) }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Grade buttons */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {GRADES.map(g => {
          const active = grade === g.id
          const clr = g.id.startsWith('10') ? '#1a5c38' : g.id.startsWith('11') ? '#1a4a7a' : '#8b2500'
          const bg  = g.id.startsWith('10') ? '#d4f5e2' : g.id.startsWith('11') ? '#d0e8ff' : '#ffd9cc'
          return (
            <button key={g.id} onClick={() => handleGrade(g.id)} style={{
              background: active ? clr : bg, color: active ? '#fff' : clr,
              border: `2px solid ${clr}`, borderRadius: '20px',
              padding: '4px 12px', fontSize: '11px', fontWeight: '700',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
            }}>
              {g.name}
            </button>
          )
        })}
      </div>
      {/* Section buttons */}
      {gradeObj && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {gradeObj.sections.map(s => {
            const active = value === s.value
            return (
              <button key={s.value} onClick={() => handleSection(s.value)} style={{
                background: active ? '#c9a227' : '#fffde7',
                color: active ? '#2c1e00' : '#8a6d0b',
                border: `1.5px solid ${active ? '#8a6d0b' : '#e8d58a'}`,
                borderRadius: '6px', padding: '4px 14px',
                fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.15s',
              }}>
                {s.label.split('–')[1]?.trim() || s.label}
              </button>
            )
          })}
        </div>
      )}
      {err && !value && (
        <div style={{ fontSize: '11px', color: '#c0392b', fontWeight: '600' }}>⚠ يرجى اختيار الصف والشعبة</div>
      )}
      {value && (
        <div style={{ fontSize: '11px', color: '#1a5c38', fontWeight: '600', background: '#d4f5e2', border: '1px solid #2d6a4f', borderRadius: '6px', padding: '3px 10px', display: 'inline-block' }}>
          ✓ {value}
        </div>
      )}
    </div>
  )
}

// ── Attendance Widget ──────────────────────────────────────────
export function AttendanceFields({ present, absent, total, onChange }) {
  const handleChange = (field, raw) => {
    let p = field === 'present' ? (parseInt(raw) || 0) : (parseInt(present) || 0)
    let a = field === 'absent'  ? (parseInt(raw) || 0) : (parseInt(absent)  || 0)
    let t = field === 'total'   ? (parseInt(raw) || 0) : (parseInt(total)   || 0)
    if (field === 'present' || field === 'absent') t = p + a
    if (field === 'total') { t = parseInt(raw) || 0; if (p > t) p = t; a = t - p }
    onChange({ present: String(p), absent: String(a), total_students: String(t) })
  }
  const pct = (parseInt(total) || 0) > 0
    ? Math.round(((parseInt(present) || 0) / (parseInt(total) || 1)) * 100)
    : null

  return (
    <div style={{ gridColumn: 'span 3', background: '#fffdf5', border: '2px solid #c9a227', borderRadius: '10px', padding: '12px 16px' }}>
      <div style={{ fontSize: '12px', fontWeight: '800', color: '#8a6d0b', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        📊 بيانات الحضور والغياب
        {pct !== null && (
          <span style={{
            background: pct >= 80 ? '#d4f5e2' : pct >= 60 ? '#fff3cd' : '#ffd9cc',
            color: pct >= 80 ? '#1a5c38' : pct >= 60 ? '#8a6d0b' : '#8b2500',
            border: `1px solid ${pct >= 80 ? '#2d6a4f' : pct >= 60 ? '#c9a227' : '#c0392b'}`,
            borderRadius: '20px', padding: '2px 12px', fontSize: '11px', fontWeight: '700',
          }}>
            نسبة الحضور: {pct}%
          </span>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        {[
          { field: 'present', label: '✅ عدد الحضور',    val: present, bc: '#2d6a4f', bg: '#f0fff4', tc: '#1a5c38' },
          { field: 'absent',  label: '❌ عدد الغياب',    val: absent,  bc: '#c0392b', bg: '#fff5f5', tc: '#8b2500' },
          { field: 'total',   label: '👥 العدد الإجمالي', val: total,   bc: '#2563a8', bg: '#f0f7ff', tc: '#1a4a7a' },
        ].map(f => (
          <div key={f.field} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: '700', color: f.tc }}>{f.label}</label>
            <input type="number" min="0"
              style={{ ...S.inp, borderColor: f.bc, background: f.bg, fontWeight: '700', fontSize: '15px', textAlign: 'center' }}
              value={f.val} onChange={e => handleChange(f.field, e.target.value)} placeholder="0" />
          </div>
        ))}
      </div>
      {(parseInt(total) || 0) > 0 && (
        <div style={{ marginTop: '10px' }}>
          <div style={{ height: '8px', background: '#ffd9cc', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#1a5c38,#2d6a4f)', borderRadius: '6px', transition: 'width 0.4s' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px', fontSize: '10px' }}>
            <span style={{ color: '#1a5c38', fontWeight: '600' }}>حضور: {present || 0}</span>
            <span style={{ color: '#8b2500', fontWeight: '600' }}>غياب: {absent || 0}</span>
            <span style={{ color: '#1a4a7a', fontWeight: '600' }}>المجموع: {total || 0}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Page Header (reused in form & dashboard) ───────────────────
export function PageHeader({ academicYear, semester }) {
  return (
    <>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 22px 10px', borderBottom: '3px solid #b8960c',
        background: '#fffdf5', gap: '10px', flexWrap: 'wrap',
      }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#8a6d0b' }}>وزارة التربية</div>
          <div style={{ fontSize: '11px', color: '#6b5209' }}>الإدارة العامة للتعليم الخاص</div>
          <div style={{ fontSize: '11px', color: '#6b5209' }}>مدرسة الرفعة النموذجية (م-ث) بنين</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '46px', lineHeight: 1 }}>🇰🇼</div>
          <div style={{ fontSize: '10px', color: '#8a6d0b', fontWeight: '700', marginTop: '3px' }}>دولة الكويت</div>
        </div>
        <div>
          <div style={{ background: 'linear-gradient(135deg,#c9a227,#e8c84a)', borderRadius: '8px', padding: '6px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: '900', color: '#2c1e00' }}>{academicYear}</div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#3a2400' }}>{semester}</div>
          </div>
        </div>
      </div>
      <div style={{
        background: 'linear-gradient(135deg,#c9a227 0%,#e8c84a 40%,#d4a81f 70%,#b8960c 100%)',
        padding: '12px 20px', textAlign: 'center',
        borderTop: '2px solid #8a6d0b', borderBottom: '2px solid #8a6d0b',
      }}>
        <h2 style={{ margin: 0, color: '#2c1e00', fontSize: '18px', fontWeight: '900' }}>
          نموذج تقييم أداء المعلم في الفصل الافتراضي
        </h2>
      </div>
    </>
  )
}
