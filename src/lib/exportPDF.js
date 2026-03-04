// src/lib/exportPDF.js
import { LEVELS, CRITERIA, ACADEMIC_YEAR, SEMESTER, LOGO_URL } from './constants'

export function exportPDF(record, teachers) {
  const teacher = teachers.find(t => t.id === record.teacher_id) || {}
  const counts  = {}
  LEVELS.forEach(l => {
    counts[l.key] = Object.values(record.ratings).filter(v => v === l.key).length
  })

  const rows = CRITERIA.map((c, i) => {
    const rk = record.ratings[i] || ''
    return `<tr>
      <td style="text-align:center;width:26px;color:#8a6d0b;font-weight:700;border:1px solid #e0d09a">${i + 1}</td>
      <td style="text-align:right;padding:4px 8px;border:1px solid #e0d09a;background:${i % 2 === 0 ? '#fffdf5' : '#f9f3e1'}">${c}</td>
      ${LEVELS.map(l => `
        <td style="text-align:center;width:50px;border:1px solid #e0d09a;
          background:${rk === l.key ? l.bg : (i % 2 === 0 ? '#fffdf5' : '#f9f3e1')};
          color:${rk === l.key ? l.color : '#ccc'};
          font-weight:${rk === l.key ? 700 : 400};font-size:14px">
          ${rk === l.key ? '✓' : '○'}
        </td>`).join('')}
    </tr>`
  }).join('')

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8"/>
<title>تقييم ${teacher.name || ''} — #${record.id}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Cairo',Arial,sans-serif;direction:rtl;background:#fff;color:#222;font-size:12px;line-height:1.4}
  
  /* Header */
  #hdr{
    display: flex; justify-content: space-between; align-items: center;
    border-bottom: 3px solid #c9a227; padding-bottom: 10px; margin-bottom: 20px;
  }
  .h-right{ text-align: right; }
  .h-center{ text-align: center; }
  .h-left{ text-align: left; font-size: 11px; }
  
  .logo-img { width: 70px; height: 70px; object-fit: contain; margin-bottom: 5px; }
  
  h1 { font-size: 16px; font-weight: 900; color: #8a6d0b; margin: 0; }
  h2 { font-size: 13px; font-weight: 700; color: #555; margin: 0; }

  /* Meta Table */
  .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 2px solid #e8d58a; }
  .meta-table td { border: 1px solid #e8d58a; padding: 6px 10px; }
  .lbl { background: #fffdf5; font-weight: 700; color: #8a6d0b; width: 120px; }
  .val { background: #fff; font-weight: 600; }

  /* Criteria Table */
  .crit-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; }
  .crit-table th { background: #c9a227; color: #fff; padding: 8px; border: 1px solid #a07b10; font-weight: 800; }
  .crit-table td { border: 1px solid #e0d09a; padding: 6px; vertical-align: middle; }
  .crit-row:nth-child(even) { background: #fffdf5; }
  
  /* Summary */
  .summary-box { display: flex; gap: 10px; margin-bottom: 20px; }
  .sum-item { flex: 1; border: 2px solid #e8d58a; border-radius: 8px; padding: 10px; text-align: center; background: #fffdf5; }
  .sum-lbl { font-size: 11px; color: #8a6d0b; font-weight: 700; margin-bottom: 5px; }
  .sum-val { font-size: 18px; font-weight: 900; color: #2c1e00; }

  /* Signatures */
  .sig-section { display: flex; justify-content: space-between; margin-top: 40px; gap: 40px; }
  .sig-box { flex: 1; text-align: center; }
  .sig-line { border-bottom: 1px solid #000; margin: 40px 20px 10px; }
  .sig-title { font-weight: 700; color: #8a6d0b; margin-bottom: 5px; }

  /* Print specific */
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    #pbtn { display: none; }
    @page { margin: 15mm; size: A4 portrait; }
  }
</style>
</head>
<body>

<div id="hdr">
  <div class="h-right">
    <img src="${LOGO_URL}" class="logo-img" alt="Logo" />
    <h1>دولة الكويت</h1>
    <h2>وزارة التربية</h2>
    <h2>الإدارة العامة للتعليم الخاص</h2>
  </div>
  <div class="h-center">
    <h1 style="font-size: 22px; color: #2c1e00; margin-bottom: 5px;">نموذج تقييم أداء المعلم</h1>
    <h2 style="color: #c9a227;">في الفصل الافتراضي</h2>
  </div>
  <div class="h-left">
    <div>العام الدراسي: <strong>${ACADEMIC_YEAR}</strong></div>
    <div>${SEMESTER}</div>
    <div style="margin-top: 5px; font-size: 12px;">رقم التقييم: <strong>#${record.id}</strong></div>
    <div style="margin-top: 2px;">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-KW')}</div>
  </div>
</div>

<table class="meta-table">
  <tr>
    <td class="lbl">اسم المعلم</td>
    <td class="val">${teacher.name || record.teacher_name || '—'}</td>
    <td class="lbl">المجال الدراسي</td>
    <td class="val">${record.subject || '—'}</td>
  </tr>
  <tr>
    <td class="lbl">الصف والشعبة</td>
    <td class="val">${record.class_section || '—'}</td>
    <td class="lbl">الفصل الافتراضي</td>
    <td class="val">${record.virtual_class || '—'}</td>
  </tr>
  <tr>
    <td class="lbl">اليوم والتاريخ</td>
    <td class="val">${record.day} ${record.date}</td>
    <td class="lbl">رقم الحصة</td>
    <td class="val" style="font-weight: 900; color: #c0392b;">${record.lesson_number ? `الحصة ${record.lesson_number}` : '—'}</td>
  </tr>
  <tr>
    <td class="lbl">عنوان الدرس</td>
    <td class="val" colspan="3">${record.lesson_title || '—'}</td>
  </tr>
  <tr>
    <td class="lbl">الحضور والغياب</td>
    <td class="val" colspan="3">
      <span style="color:#1a5c38; margin-left:15px">✅ حضور: ${record.present || 0}</span>
      <span style="color:#c0392b; margin-left:15px">❌ غياب: ${record.absent || 0}</span>
      <span style="color:#1a4a7a">👥 إجمالي: ${record.total_students || 0}</span>
    </td>
  </tr>
</table>

<table class="crit-table">
  <thead>
    <tr>
      <th style="width: 30px;">م</th>
      <th>بند التقييم</th>
      ${LEVELS.map(l => `<th style="width: 60px;">${l.label}</th>`).join('')}
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>

<div class="summary-box">
  ${LEVELS.map(l => `
    <div class="sum-item" style="border-color:${l.color}40; background:${l.bg}40">
      <div class="sum-lbl" style="color:${l.color}">${l.label}</div>
      <div class="sum-val" style="color:${l.color}">${counts[l.key]}</div>
    </div>
  `).join('')}
  <div class="sum-item">
    <div class="sum-lbl">نسبة الإنجاز</div>
    <div class="sum-val">${Object.values(record.ratings).filter(v => v).length} / ${CRITERIA.length}</div>
  </div>
</div>

${record.visitor_note ? `
<div style="border: 2px solid #e8d58a; background: #fffdf5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
  <div style="font-weight: 700; color: #8a6d0b; margin-bottom: 5px;">📝 رأي الزائر / الملاحظات:</div>
  <div style="white-space: pre-wrap;">${record.visitor_note}</div>
</div>
` : ''}

<div class="sig-section">
  <div class="sig-box">
    <div class="sig-title">توقيع المعلم</div>
    <div class="sig-line"></div>
    <div>${teacher.name || record.teacher_name || ''}</div>
  </div>
  <div class="sig-box">
    <div class="sig-title">مدير المدرسة</div>
    <div class="sig-line"></div>
    <div>صالح مخلد المطيري</div>
  </div>
</div>

<div id="pbtn" style="position:fixed;bottom:30px;left:30px;">
  <button onclick="window.print()" style="padding: 12px 24px; font-size: 16px; font-weight: bold; background: #c9a227; color: #fff; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">🖨️ طباعة التقرير</button>
</div>

<script>
  // Auto print after images load
  window.onload = () => {
    setTimeout(() => {
      window.print();
    }, 1000);
  };
</script>

</body>
</html>`

  const w = window.open('', '_blank', 'width=920,height=720')
  if (!w) { alert('يرجى السماح بالنوافذ المنبثقة في المتصفح'); return }
  w.document.write(html)
  w.document.close()
}
