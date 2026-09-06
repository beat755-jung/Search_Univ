// 수시접수 및 실기 스케줄 전략을 PDF로 렌더링한다.
//   node scripts/build-schedule-pdf.mjs
// 출력: public/admission-schedule-2027.pdf (vite dev/build가 그대로 서빙)
//
// 내용은 src/data/scheduleStrategy.js 하나만 읽는다. 화면 가이드와 같은
// 소스이므로 데이터 파일만 고치면 양쪽이 함께 갱신된다.

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

import {
  APPLY_ORDER,
  CONCLUSIONS,
  CONFLICTS,
  EXAM_YEAR,
  PREP_STEPS,
  SCHOOLS,
  SOURCE_LABEL,
  SUNEUNG
} from '../src/data/scheduleStrategy.js'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = resolve(ROOT, 'public')
const OUT_PDF = resolve(OUT_DIR, 'admission-schedule-2027.pdf')

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const lines = (s) => esc(s).replace(/\n/g, '<br>')

const today = new Date().toLocaleDateString('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})

const pending = SCHOOLS.filter((s) => s.source !== 'official')

const html = `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><title>${EXAM_YEAR} 수시접수 및 실기 스케줄 전략</title>
<style>
  @page { size: A4 landscape; margin: 12mm 10mm; }
  * { box-sizing: border-box; }
  body {
    font-family: "Malgun Gothic", "맑은 고딕", "Noto Sans KR", sans-serif;
    color: #1e293b; font-size: 9.5pt; line-height: 1.5; margin: 0;
  }
  h1 { font-size: 17pt; margin: 0 0 2mm; color: #2239ab; }
  h2 {
    font-size: 11.5pt; margin: 7mm 0 2.5mm; color: #2239ab;
    border-bottom: 1.5px solid #b9d1ff; padding-bottom: 1.2mm;
  }
  .sub { color: #64748b; font-size: 9pt; margin-bottom: 4mm; }
  .banner { border-radius: 2mm; padding: 2.5mm 3mm; margin-bottom: 2.5mm; font-size: 9pt; }
  .ok   { background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; }
  .warn { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; }
  .bad  { background: #fff1f2; border: 1px solid #fecdd3; color: #9f1239; }
  .info { background: #f8fafc; border: 1px solid #e2e8f0; color: #475569; }
  table { width: 100%; border-collapse: collapse; font-size: 8pt; }
  th {
    background: #eef4ff; color: #2239ab; text-align: left; font-weight: 600;
    padding: 2mm 1.8mm; border: 1px solid #d9e6ff;
  }
  td { padding: 2mm 1.8mm; border: 1px solid #e2e8f0; vertical-align: top; }
  .nm { font-weight: 700; white-space: nowrap; }
  .dept { font-weight: 400; color: #94a3b8; font-size: 7.2pt; }
  .quota { font-weight: 700; color: #1f3187; white-space: nowrap; }
  .target { font-weight: 700; color: #2a4bd6; }
  .final { font-weight: 600; color: #2239ab; white-space: nowrap; }
  .badge {
    display: inline-block; margin-top: 1mm; padding: 0.4mm 1.4mm;
    border-radius: 1mm; font-size: 6.8pt; font-weight: 600; border: 1px solid;
  }
  .b-official { background: #ecfdf5; color: #065f46; border-color: #a7f3d0; }
  .b-secondary { background: #fffbeb; color: #92400e; border-color: #fde68a; }
  .b-previous { background: #fff1f2; color: #9f1239; border-color: #fecdd3; }
  .card { border-radius: 2mm; padding: 2.5mm 3mm; margin-bottom: 2mm; page-break-inside: avoid; }
  .card p { margin: 0 0 1.2mm; }
  .card p:last-child { margin-bottom: 0; }
  .step { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 2mm;
          padding: 2.5mm 3mm; margin-bottom: 2mm; page-break-inside: avoid; }
  .step h3 { font-size: 9.5pt; margin: 0 0 1.5mm; color: #334155; }
  ul, ol { margin: 0; padding-left: 5mm; }
  li { margin-bottom: 1mm; }
  .chk { list-style: none; padding-left: 0; }
  .chk li { padding-left: 4.5mm; text-indent: -4.5mm; }
  .chk li::before { content: "☐ "; color: #94a3b8; }
  .foot { margin-top: 6mm; padding-top: 2mm; border-top: 1px solid #e2e8f0;
          color: #94a3b8; font-size: 7.5pt; }
  .pagebreak { page-break-before: always; }
</style></head><body>

<h1>${EXAM_YEAR} 수시접수 및 실기 스케줄 전략</h1>
<div class="sub">지원예상 6개교 기준 · 수능 ${SUNEUNG} · 작성일 ${today}</div>

<div class="banner ok">
  가천대 · 용인대 · 인하대 · 단국대 4개교는 공식 ${EXAM_YEAR} 수시 모집요강 원문과 대조를 마쳤습니다.
  세종대는 2차 자료만 확보했고, 인천대는 ${EXAM_YEAR} 요강이 아직 공개되지 않아 2026학년도 날짜를 그대로 두었습니다.
</div>
${
  pending.length
    ? `<div class="banner bad"><strong>남은 확인 항목 ${pending.length}건:</strong> ${pending
        .map((s) => `${esc(s.name)}(${SOURCE_LABEL[s.source]})`)
        .join(' · ')} — 특히 세종대 1단계 종료일은 10/2~10/5 충돌 판정에 직접 영향을 주므로 가장 먼저 확인해야 합니다.</div>`
    : ''
}

<h2>대학별 ${EXAM_YEAR} 수시 실기 일정</h2>
<table>
  <thead><tr>
    <th style="width:13%">대학 · 학과</th><th style="width:9%">모집인원</th>
    <th style="width:12%">원서접수</th><th style="width:13%">실기</th>
    <th style="width:9%">1차발표</th><th style="width:12%">2차시험</th>
    <th style="width:8%">최종발표</th><th>특이사항</th>
  </tr></thead>
  <tbody>
  ${SCHOOLS.map(
    (s) => `<tr>
      <td class="nm">${esc(s.name)}<div class="dept">${esc(s.dept)}</div>
        <span class="badge b-${s.source}">${SOURCE_LABEL[s.source]}</span></td>
      <td class="quota">${esc(s.quota)}</td>
      <td>${lines(s.apply)}</td>
      <td>${lines(s.exam)}${s.target ? `<div class="target">목표: ${esc(s.target)}</div>` : ''}</td>
      <td>${esc(s.firstAnnounce)}</td>
      <td>${lines(s.secondExam)}</td>
      <td class="final">${esc(s.finalAnnounce)}</td>
      <td>${esc(s.note)}</td>
    </tr>`
  ).join('')}
  </tbody>
</table>
<p class="sub" style="margin-top:2mm">초록 배지 = 공식 요강 대조 완료 · 노랑 = 2차 자료만 확보 · 빨강 = 2026학년도 날짜로 대체. 모든 일정은 각 대학 입학처 최종 공지가 우선합니다.</p>

<h2>일정 충돌 지도</h2>
${CONFLICTS.map(
  (c) => `<div class="card ${c.level === 'high' ? 'bad' : 'warn'}">
    <p><strong>${c.level === 'high' ? '● 최우선' : '● 주의'} · ${esc(c.window)} — ${esc(c.title)}</strong></p>
    <p>${esc(c.body)}</p>
    <p><strong>대응:</strong> ${esc(c.action)}</p>
  </div>`
).join('')}

<h2>접수 순서 전략</h2>
${APPLY_ORDER.map(
  (a) => `<div class="card info">
    <p><strong>${esc(a.when)} — ${esc(a.what)}</strong></p>
    <p>${esc(a.detail)}</p>
  </div>`
).join('')}

<div class="pagebreak"></div>
<h2>준비 체크리스트</h2>
${PREP_STEPS.map(
  (s) => `<div class="step">
    <h3>${esc(s.title)}</h3>
    <ul class="chk">${s.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
  </div>`
).join('')}

<h2>핵심 결론</h2>
${CONCLUSIONS.map(
  (c) => `<div class="card ${c.tone === 'danger' ? 'bad' : c.tone === 'warn' ? 'warn' : 'info'}">
    <p><strong>${esc(c.label)},</strong> ${esc(c.text)}</p>
  </div>`
).join('')}

<div class="foot">
  본 문서는 각 대학 공식 모집요강과 공개 자료를 정리한 참고용이며, 확정 일정은 반드시 해당 대학 입학처 공지로 재확인하시기 바랍니다.
  · 연극영화과 지원 지도 앱에서 생성 · ${today}
</div>
</body></html>`

await mkdir(OUT_DIR, { recursive: true })

const browser = await chromium.launch()
try {
  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: 'load' })
  await page.pdf({
    path: OUT_PDF,
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: { top: '12mm', right: '10mm', bottom: '12mm', left: '10mm' },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate:
      '<div style="width:100%;font-size:7pt;color:#94a3b8;padding:0 10mm;text-align:right;">' +
      '<span class="pageNumber"></span> / <span class="totalPages"></span></div>'
  })
} finally {
  await browser.close()
}

// 참고용 HTML도 함께 남긴다(브라우저에서 바로 열어 확인/인쇄 가능).
await writeFile(resolve(OUT_DIR, 'admission-schedule-2027.html'), html, 'utf8')

console.log('PDF  →', OUT_PDF)
console.log('HTML →', resolve(OUT_DIR, 'admission-schedule-2027.html'))
