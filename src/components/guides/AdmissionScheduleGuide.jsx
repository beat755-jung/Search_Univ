import { useState } from 'react'
import {
  APPLY_ORDER,
  CONCLUSIONS,
  CONFLICTS,
  DAY_ORDER_GENERAL,
  EXAM_YEAR,
  PREP_STEPS,
  SCHOOL_EXAM_NOTES,
  SCHOOLS,
  SOURCE_LABEL,
  SUNEUNG
} from '../../data/scheduleStrategy'

// 두 번째 가이드 아이콘(🗓)의 본문: 수시접수 및 실기 스케줄 전략.
// 표시할 내용은 전부 data/scheduleStrategy.js에서 읽는다. 같은 데이터를
// scripts/build-schedule-pdf.mjs가 PDF로도 렌더링하므로, 내용 수정은
// 반드시 데이터 파일 쪽에서 해야 화면과 PDF가 어긋나지 않는다.

const PDF_URL = '/admission-schedule-2027.pdf'

const SOURCE_CLASS = {
  official: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  secondary: 'bg-amber-50 text-amber-700 border-amber-200',
  previous: 'bg-rose-50 text-rose-700 border-rose-200'
}

const CONFLICT_CLASS = {
  high: 'bg-rose-50 border-rose-200 text-rose-800',
  medium: 'bg-amber-50 border-amber-200 text-amber-800'
}

const CONCLUSION_CLASS = {
  danger: 'bg-rose-50 text-rose-700',
  warn: 'bg-amber-50 text-amber-800',
  info: 'bg-slate-50 text-slate-600'
}

function MultiLine({ text }) {
  return (
    <>
      {text.split('\n').map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </>
  )
}

export default function AdmissionScheduleGuide() {
  const [checked, setChecked] = useState({})

  function toggleItem(key) {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const pending = SCHOOLS.filter((s) => s.source !== 'official')

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs text-slate-500">
          {EXAM_YEAR} 지원예상 6개교 기준 · 수능 {SUNEUNG}
        </div>
        <a
          href={PDF_URL}
          download
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 transition-colors"
        >
          ⬇ PDF로 저장
        </a>
      </div>

      <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-emerald-800 text-xs leading-relaxed">
        가천대 · 용인대 · 인하대 · 단국대 4개교는 공식 2027학년도 수시 모집요강 원문과 대조를
        마쳤습니다. 세종대는 2차 자료만 확보했고, 인천대는 2027학년도 요강이 아직 공개되지 않아
        2026학년도 날짜를 그대로 두었습니다 — 표에서 배지로 구분됩니다.
      </div>

      {pending.length > 0 && (
        <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 text-rose-700 text-xs leading-relaxed">
          <strong>남은 확인 항목 {pending.length}건:</strong>{' '}
          {pending.map((s) => `${s.name}(${SOURCE_LABEL[s.source]})`).join(' · ')} — 특히 세종대
          1단계 종료일은 10/2~10/5 충돌 판정에 직접 영향을 주므로 가장 먼저 확인해야 합니다.
        </div>
      )}

      <section>
        <h3 className="text-sm font-semibold text-brand-700 mb-1.5">
          대학별 {EXAM_YEAR} 수시 실기 일정
        </h3>
        <div className="overflow-x-auto rounded-lg border border-slate-100">
          <table className="w-full text-xs text-left border-collapse min-w-[980px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="px-2.5 py-2 font-medium">대학 · 학과</th>
                <th className="px-2.5 py-2 font-medium">모집인원</th>
                <th className="px-2.5 py-2 font-medium">원서접수</th>
                <th className="px-2.5 py-2 font-medium">실기</th>
                <th className="px-2.5 py-2 font-medium">1차발표</th>
                <th className="px-2.5 py-2 font-medium">2차시험</th>
                <th className="px-2.5 py-2 font-medium">최종발표</th>
                <th className="px-2.5 py-2 font-medium">특이사항</th>
              </tr>
            </thead>
            <tbody>
              {SCHOOLS.map((s) => (
                <tr key={s.name} className="border-t border-slate-100 align-top">
                  <td className="px-2.5 py-2 font-semibold text-slate-700 whitespace-nowrap">
                    {s.name}
                    <div className="text-[11px] font-normal text-slate-400">{s.dept}</div>
                    <span
                      className={`inline-block mt-1 rounded border px-1 py-0.5 text-[10px] font-medium ${SOURCE_CLASS[s.source]}`}
                    >
                      {SOURCE_LABEL[s.source]}
                    </span>
                  </td>
                  <td className="px-2.5 py-2 font-bold text-brand-800 whitespace-nowrap">
                    {s.quota}
                  </td>
                  <td className="px-2.5 py-2 text-slate-600 whitespace-nowrap">
                    <MultiLine text={s.apply} />
                  </td>
                  <td className="px-2.5 py-2 text-slate-600 whitespace-nowrap">
                    <MultiLine text={s.exam} />
                    {s.target && (
                      <div className="font-bold text-brand-600 mt-1">목표: {s.target}</div>
                    )}
                  </td>
                  <td className="px-2.5 py-2 text-slate-600 whitespace-nowrap">
                    {s.firstAnnounce}
                  </td>
                  <td className="px-2.5 py-2 text-slate-600 whitespace-nowrap">
                    <MultiLine text={s.secondExam} />
                  </td>
                  <td className="px-2.5 py-2 font-semibold text-brand-700 whitespace-nowrap">
                    {s.finalAnnounce}
                  </td>
                  <td className="px-2.5 py-2 text-slate-600 min-w-[260px]">{s.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
          초록 배지 = 공식 요강 대조 완료 · 노랑 = 2차 자료만 확보 · 빨강 = 2026학년도 날짜로 대체.
          모든 일정은 각 대학 입학처 최종 공지가 우선합니다.
        </p>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-brand-700 mb-1.5">
          실기 응시일 · 학교별 특징 (인터넷 후기 조사)
        </h3>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-600 leading-relaxed mb-2">
          <p className="font-semibold text-slate-700">{DAY_ORDER_GENERAL.title}</p>
          <p className="mt-1">{DAY_ORDER_GENERAL.body}</p>
          <p className="mt-1.5">
            <strong>정리:</strong> {DAY_ORDER_GENERAL.takeaway}
          </p>
        </div>
        <ul className="space-y-1.5">
          {SCHOOL_EXAM_NOTES.map((s) => (
            <li key={s.name} className="rounded-lg border border-slate-100 p-2.5 text-xs">
              <p className="font-semibold text-slate-700">
                {s.name}{' '}
                <span
                  className={`ml-1 inline-block rounded border px-1 py-0.5 text-[10px] font-medium align-middle ${SOURCE_CLASS[s.source]}`}
                >
                  {SOURCE_LABEL[s.source]}
                </span>
              </p>
              <p className="mt-1 text-slate-600 leading-relaxed">
                <strong>실기 구성:</strong> {s.format}
              </p>
              <p className="mt-1 text-slate-600 leading-relaxed">
                <strong>응시일 의견:</strong> {s.dayOpinion}
              </p>
              <p className="mt-1 text-slate-600 leading-relaxed">
                <strong>특이점:</strong> {s.quirk}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-brand-700 mb-1.5">일정 충돌 지도</h3>
        <ul className="space-y-1.5">
          {CONFLICTS.map((c) => (
            <li key={c.window} className={`rounded-lg border p-2.5 ${CONFLICT_CLASS[c.level]}`}>
              <p className="font-semibold">
                {c.level === 'high' ? '🔴' : '🟡'} {c.window} — {c.title}
              </p>
              <p className="mt-1 leading-relaxed">{c.body}</p>
              <p className="mt-1.5 leading-relaxed">
                <strong>대응:</strong> {c.action}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-brand-700 mb-1.5">접수 순서 전략</h3>
        <ol className="space-y-1.5">
          {APPLY_ORDER.map((a) => (
            <li key={a.when} className="bg-slate-50 rounded-lg p-2.5">
              <span className="font-semibold text-slate-700">
                {a.when} — {a.what}
              </span>
              <p className="text-slate-600 mt-0.5 leading-relaxed">{a.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-brand-700">준비 체크리스트</h3>
        {PREP_STEPS.map((step) => (
          <div key={step.title} className="bg-slate-50 rounded-lg p-2.5">
            <p className="text-xs font-semibold text-slate-600 mb-1.5">{step.title}</p>
            <ul className="space-y-1">
              {step.items.map((item, i) => {
                const key = `${step.title}-${i}`
                const isChecked = Boolean(checked[key])
                return (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => toggleItem(key)}
                      className="w-full flex items-start justify-between gap-2 text-left rounded px-1 py-0.5 -mx-1 hover:bg-slate-100"
                    >
                      <span className="flex items-start gap-1.5">
                        <span className={isChecked ? 'text-brand-600 mt-0.5' : 'text-slate-300 mt-0.5'}>
                          {isChecked ? '☑' : '☐'}
                        </span>
                        <span className={isChecked ? 'text-slate-400 line-through' : 'text-slate-600'}>
                          {item}
                        </span>
                      </span>
                      {isChecked && (
                        <span className="text-[11px] font-semibold text-brand-600 whitespace-nowrap shrink-0">
                          완료함
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </section>

      <section>
        <h3 className="text-sm font-semibold text-brand-700 mb-1.5">핵심 결론</h3>
        <ol className="space-y-1.5">
          {CONCLUSIONS.map((c) => (
            <li key={c.label} className={`rounded-lg p-2.5 ${CONCLUSION_CLASS[c.tone]}`}>
              <strong>{c.label},</strong> {c.text}
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}
