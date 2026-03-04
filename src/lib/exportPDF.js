// src/lib/exportPDF.js
import { LEVELS, CRITERIA, ACADEMIC_YEAR, SEMESTER } from './constants'

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
  body{font-family:'Cairo',Arial,sans-serif;direction:rtl;background:#fff;color:#222;font-size:11px}
  #hdr{position:fixed;top:0;left:0;right:0;z-index:10;
    background:linear-gradient(135deg,#c9a227,#e8c84a,#b8960c);
    border-bottom:3px solid #8a6d0b;padding:5px 14px 4px;
    print-color-adjust:exact;-webkit-print-color-adjust:exact}
  .hi{display:flex;align-items:center;justify-content:space-between}
  .hr{text-align:right;font-size:9px;color:#2c1e00;font-weight:700;line-height:1.7}
  .hc{text-align:center;font-size:9px;color:#2c1e00;font-weight:900}
  .hl{text-align:left;font-size:9px;color:#2c1e00;font-weight:700;line-height:1.7}
  .ht{text-align:center;font-size:13px;font-weight:900;color:#2c1e00;padding:3px 0 2px;border-top:1px solid rgba(0,0,0,0.15)}
  #ftr{position:fixed;bottom:0;left:0;right:0;
    background:linear-gradient(135deg,#c9a227,#e8c84a,#b8960c);
    border-top:3px solid #8a6d0b;padding:4px 14px;
    text-align:center;font-size:8px;color:#2c1e00;font-weight:700;
    print-color-adjust:exact;-webkit-print-color-adjust:exact}
  #body{margin-top:88px;margin-bottom:32px;padding:0 14px}
  .meta{width:100%;border-collapse:collapse;margin-bottom:8px;border:1.5px solid #c9a227}
  .meta td{padding:4px 8px;border:1px solid #e8d58a;font-size:10px;vertical-align:middle}
  .lbl{font-weight:700;color:#8a6d0b;background:#fffde7;white-space:nowrap}
  .val{color:#222;background:#fffdf5}
  .sbar{background:linear-gradient(135deg,#c9a227,#e8c84a,#b8960c);color:#2c1e00;
    font-weight:900;font-size:11px;padding:5px 10px;border:1.5px solid #a07b10;
    print-color-adjust:exact;-webkit-print-color-adjust:exact}
  .etbl{width:100%;border-collapse:collapse;margin-bottom:8px;font-size:10px}
  .etbl th{background:#c9a227;color:#2c1e00;padding:5px 6px;border:1px solid #a07b10;
    font-weight:900;text-align:center;print-color-adjust:exact;-webkit-print-color-adjust:exact}
  .etbl th.cr{text-align:right}
  .sumbar{display:flex;border:1.5px solid #c9a227;margin-bottom:8px}
  .sc{flex:1;text-align:center;padding:5px 4px;font-weight:700;font-size:10px;border-left:1px solid #e8d58a}
  .sc:last-child{border-left:none}
  .nbox{border:1.5px solid #c9a227;padding:8px;min-height:32px;background:#fffdf5;margin-bottom:8px;font-size:10px}
  .sigrow{display:flex;gap:10px;margin-bottom:6px}
  .sigb{flex:1;border:1.5px solid #c9a227;padding:8px 10px;background:#fffdf5}
  .siglbl{font-size:9px;font-weight:700;color:#8a6d0b;margin-bottom:10px}
  .sigline{border-bottom:1px solid #999;margin-bottom:3px;min-height:18px;font-size:10px;text-align:center;padding-bottom:2px}
  .signame{font-size:9px;color:#999;text-align:center}
  @page{size:A4 portrait;margin:0}
  @media print{
    body{print-color-adjust:exact;-webkit-print-color-adjust:exact}
    #pbtn{display:none!important}
  }
</style>
</head>
<body>
<div id="hdr">
  <div class="hi">
    <div class="hr">وزارة التربية — الإدارة العامة للتعليم الخاص<br/>مدرسة الرفعة النموذجية (م-ث) بنين</div>
    <div class="hc">🇰🇼<br/><span style="font-size:8px">دولة الكويت</span></div>
    <div class="hl">
      العام الدراسي: <strong>${ACADEMIC_YEAR}</strong><br/>
      ${SEMESTER}<br/>
      رقم التقييم: <strong>#${record.id}</strong>
    </div>
  </div>
  <div class="ht">نموذج تقييم أداء المعلم في الفصل الافتراضي</div>
</div>
<div id="ftr">
  وزارة التربية | الإدارة العامة للتعليم الخاص | مدرسة الرفعة النموذجية &nbsp;|&nbsp;
  مدير المدرسة: صالح مخلد المطيري &nbsp;|&nbsp;
  تاريخ الطباعة: ${new Date().toLocaleDateString('ar-KW')}
</div>
<div id="body">
  <table class="meta">
    <tr>
      <td class="lbl">اسم المعلم</td><td class="val">${teacher.name || record.teacher_name || '—'}</td>
      <td class="lbl">اليوم</td><td class="val">${record.day || '—'}</td>
      <td class="lbl">التاريخ</td><td class="val">${record.date || '—'}</td>
    </tr>
    <tr>
      <td class="lbl">المجال الدراسي</td><td class="val">${record.subject || '—'}</td>
      <td class="lbl">الصف والشعبة</td><td class="val">${record.class_section || '—'}</td>
      <td class="lbl">الفصل الافتراضي</td><td class="val">${record.virtual_class || '—'}</td>
    </tr>
    <tr>
      <td class="lbl">عنوان الدرس</td><td class="val" colspan="5">${record.lesson_title || '—'}</td>
    </tr>
    <tr>
      <td class="lbl">عدد الحضور</td>
      <td class="val" style="color:#1a5c38;font-weight:700">${record.present || 0}</td>
      <td class="lbl">عدد الغياب</td>
      <td class="val" style="color:#8b2500;font-weight:700">${record.absent || 0}</td>
      <td class="lbl">العدد الإجمالي</td>
      <td class="val" style="color:#1a4a7a;font-weight:700">${record.total_students || 0}</td>
    </tr>
  </table>

  <table class="etbl">
    <thead>
      <tr>
        <th style="width:26px">م</th>
        <th class="cr">بند التقييم</th>
        ${LEVELS.map(l => `<th style="width:50px">${l.label}</th>`).join('')}
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="sbar">ملخص نتائج التقييم</div>
  <div class="sumbar">
    ${LEVELS.map(l => `
      <div class="sc" style="background:${l.bg};color:${l.color}">
        ${l.label}<br/>
        <span style="font-size:16px;font-weight:900">${counts[l.key]}</span>
      </div>`).join('')}
    <div class="sc" style="background:#f0e8cc;color:#8a6d0b">
      المكتمل<br/>
      <span style="font-size:16px;font-weight:900">
        ${Object.values(record.ratings).filter(v => v).length}/${CRITERIA.length}
      </span>
    </div>
  </div>

  <div class="sbar">رأي الزائر بالزيارة</div>
  <div class="nbox">${record.visitor_note || ''}</div>

  <div class="sigrow">
    <div class="sigb">
      <div class="siglbl">توقيع المعلم</div>
      <div class="sigline">${record.teacher_signature || ''}</div>
      <div class="signame">${teacher.name || record.teacher_name || ''}</div>
    </div>
    <div class="sigb">
      <div class="siglbl">توقيع الزائر / مدير المدرسة</div>
      <div class="sigline">${record.visitor_signature || ''}</div>
      <div class="signame">صالح مخلد المطيري</div>
    </div>
  </div>
</div>
<div id="pbtn" style="position:fixed;bottom:50px;left:20px;z-index:999;display:flex;flex-direction:column;gap:8px">
  <button onclick="window.print()"
    style="background:linear-gradient(135deg,#c9a227,#e8c84a);color:#2c1e00;border:none;
           border-radius:10px;padding:12px 20px;font-size:14px;font-weight:900;cursor:pointer;
           box-shadow:0 4px 16px rgba(0,0,0,0.3);font-family:inherit">
    🖨️ طباعة / PDF
  </button>
  <button onclick="window.close()"
    style="background:#f0e8cc;color:#8a6d0b;border:2px solid #c9a227;border-radius:10px;
           padding:7px 14px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">
    ✕ إغلاق
  </button>
</div>
<script>window.addEventListener('load', () => setTimeout(() => window.print(), 700))<\/script>
</body>
</html>`

  const w = window.open('', '_blank', 'width=920,height=720')
  if (!w) { alert('يرجى السماح بالنوافذ المنبثقة في المتصفح'); return }
  w.document.write(html)
  w.document.close()
}
