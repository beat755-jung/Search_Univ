import { useState } from 'react'

// 두 번째 가이드 아이콘(🗓)의 본문: 수시접수 및 실기 스케줄 전략.
// 사용자가 정리한 6개 대학 2027학년도 수시 일정 초안을 우선 그대로 표시하고,
// 정확한 날짜는 추후 사용자와 함께 모집요강 원문 대조로 재검증하기로 한 상태다.
// (단국대·인천대는 아직 "요강 확인 필요" 상태.)

const SCHOOLS = [
  {
    name: '가천대',
    dept: '연기예술학과',
    apply: '9/7(월)~9/11(금)\n18:00 마감',
    exam: '9/17(목)~9/22(화)\n6일간 · 약 320명/일',
    target: '9/17(목)',
    firstAnnounce: '9/30(수)',
    secondExam: '10/9(금)~10/10(토)',
    finalAnnounce: '11/14(토)',
    note: '목표일은 1일차(1~320번) — 9/7 오픈 즉시 접수해야 확보 가능. 번호를 놓치면 더 늦은 날짜로 자동 배정되어 용인대(9/19)·동국대(9/22)와 겹칠 위험 발생'
  },
  {
    name: '용인대',
    dept: '연극학과(연기)',
    apply: '9/7~9/11 내\n요강 확인',
    exam: '9/18(금)~9/19(토)',
    target: '9/19(토)',
    firstAnnounce: '9/23(수)',
    secondExam: '단일 전형(예년 기준)',
    finalAnnounce: '10/16(금)',
    note: '목표일은 실기 마지막(2일차) — 가천대(9/17)·동국대(9/22)와 겹치지 않아 무충돌 확정. 1차발표(9/23)는 6개교 중 가장 빠른 편'
  },
  {
    name: '동국대',
    dept: '연극학부(실기형)',
    apply: '9/9(수) 10:00~\n9/11(금) 17:00',
    exam: '9/18(금)~9/22(화)',
    target: '9/22(화)',
    firstAnnounce: '확인 필요',
    secondExam: '10/21(수)~10/25(일)',
    finalAnnounce: '10/6(화)',
    note: '목표일은 실기 기간 마지막 날 — 9/15(화) 응시시간 신청 오픈 즉시 9/22 슬롯 선점 필요(마지막 날은 잔여 좌석이 적을 수 있음). 가천대(9/17)·용인대(9/19)와는 겹치지 않음'
  },
  {
    name: '세종대',
    dept: '영화예술 연기예술',
    apply: '9/8(화) 10:00~\n9/11(금) 18:00',
    exam: '9/29(화)~10/8(목)',
    target: '10/3(토)',
    firstAnnounce: '10/21(화)',
    secondExam: '10/30(금)~10/31(토)',
    finalAnnounce: '11/6(금)',
    note: '⚠️ 목표일이 개천절(공휴일)과 겹침 — 실기 시행 여부·고사장 운영·휴일 대중교통 배차 감소 여부 사전 확인 필수. 다른 5개교와는 무충돌'
  },
  {
    name: '인천대',
    dept: '공연예술학과',
    apply: '9/7~9/11 내\n요강 확인',
    exam: '10/20(화)~10/24(토)',
    target: '10/23(금)',
    firstAnnounce: '확인 필요',
    secondExam: '예년 11월\n수능(11/19) 전후 주의',
    finalAnnounce: '12/18(금)',
    note: '목표일은 실기 기간 마지막 전날 — 다른 5개교와 무충돌. 다만 최종발표가 6개교 중 가장 늦어(12/18) 정시 준비 일정과 함께 고려'
  },
  {
    name: '단국대',
    dept: '공연영화학부 연기/뮤지컬',
    apply: '9/8(화)~9/11(금)\n요강 확인',
    exam: '11/7(토)~11/15(일)',
    target: '11/7(토)',
    firstAnnounce: '확인 필요',
    secondExam: '뮤지컬: 올해부터 1·2차 분리',
    finalAnnounce: '11/27(금)',
    note: '목표일은 실기 기간 첫날 — 다른 5개교와 무충돌. 초안 기준 날짜이므로 요강 확정되면 11/7이 실제 첫날 맞는지 재확인 필요. 최종발표(11/27)가 6개교 중 가장 늦어 정시 원서 일정과 겹치지 않는지 확인 필요'
  }
]

const PREP_STEPS = [
  {
    title: 'STEP 0 · 접수 전 준비 (지금~9/6)',
    items: [
      '6개 대학 2027 수시 모집요강 원본 PDF 확보 — 가천대는 확인 완료(요강 원문 대조 완료), 단국대·인천대는 아직 초안 상태이니 확정 요강으로 재확인',
      '진학어플라이·유웨이어플라이 통합회원 가입 + 공통원서 미리 작성',
      '대학별 접수 대행처 확인 (진학사/유웨이 중 어디인지 — 접수 오픈런 시 헷갈리면 치명적)',
      '증명사진 파일(JPG) 규격 확인 후 준비 — 3개월 이내, 배경 있는 사진 불가인 대학 있음',
      '가천대 원서접수 마감은 9/11(금) 18:00, 서류제출(해당자) 마감은 9/12(토) 13:00로 별도 — 날짜 혼동 주의(요강 원문 확인)',
      '결제수단 준비 — 카드 한도·계좌 잔액 확인, 전형료 총액 계산',
      '학교 중간고사 일정 확인 → 세종대·10월 실기와 겹침 여부 체크',
      '작년 지원자 수 × 실기 일수로 대학별 하루 인원·목표 번호대 계산 완료'
    ]
  },
  {
    title: 'STEP 1 · 접수 당일 (9/7~9/11)',
    items: [
      '9/7(월) 가천대 접수 — 요강 원문에 오픈 시작 시각이 공지되어 있지 않음. 자정 오픈 가능성에 대비해 이른 아침부터 대기, 당일 입학처 공지 재확인',
      '접수 첫 1~2시간 번호 상승 속도 기록 (시간당 몇 명 증가하는지) — 목표일 9/17(1~320번대) 확보 위해 필수',
      '단톡방 실시간 접수번호 공유 모니터링 — 내 목표 구간 접근 시 즉시 접수',
      '9/8~: 세종대 접수 (오픈 10:00) · 9/9~: 동국대 접수 (마감 9/11 17:00 — 18시 아님 주의)',
      '9/8(화)~9/11(금): 단국대·용인대 접수',
      '인천대: 요강 확인 결과에 맞춰 접수 타이밍 결정',
      '결제까지 완료해야 접수 확정 — 장바구니 저장만으로는 번호 없음'
    ]
  },
  {
    title: 'STEP 2 · 접수 직후 (9/12~9/16)',
    items: [
      '접수번호·수험번호 캡처 + 수험표 출력',
      '단톡방 인증: [이름(성별) / 대학 / 접수일시 / 접수번호 / 접수처]',
      '가천대 서류제출 해당자는 9/12(토) 13:00까지 온라인 제출 완료 (원서접수 마감과 다른 날짜)',
      '9/15(화) 동국대 응시시간 신청 알람 설정 → 목표일 9/22(화) 슬롯 선점 D-day',
      '가천대 연기예술학과 1단계 고사장 확인일 9/14(월) 캘린더 등록 (요강 원문 확인), 동국대는 9/16 전후 예정 추정',
      '제출 서류(학교장 확인 서류 등) 있는 대학은 마감일 내 발송'
    ]
  },
  {
    title: 'STEP 3 · 1단계 실기 이후 (9/17~9/30)',
    items: [
      '가천대 1단계 실기(9/17~22) 응시 후 1단계 발표 9/30(수) 확인',
      '1단계 합격 시 2단계 실기(10/9~10) 일정 확보 — 회화·조소·산업디자인 10/9(금), 시각디자인 10/10(토)와 겹치지 않는지 확인',
      '용인대(9/19)·동국대(9/22) 실기 응시 결과에 따른 이동 동선 최종 점검'
    ]
  },
  {
    title: 'STEP 4 · 시험 전 최종 점검',
    items: [
      '대학별 실기 항목·지정작품 재확인 — 가천대 연기예술학과 1단계: 자유연기·특기 중 택1(2분 이내), 2단계: 즉흥상황연기 + 지정연기(리어왕·갈매기·동승·맹진사댁 경사 중 택1)',
      '규정 의상·소품 허용 범위 확인 — 대학마다 다름, 위반 시 감점/제지',
      '신분증(원본) + 수험표 지참 준비',
      '세종대 목표일(10/3)이 개천절 공휴일 — 고사장 운영·교통편 별도 공지 확인',
      '고사장 위치·도착 시간·대기 방식 사전 확인, 겹치는 주간은 이동 동선 점검'
    ]
  }
]

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

  return (
    <>
      <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 text-rose-700 text-xs leading-relaxed">
        ⚠️ 아래 내용은 사용자가 정리한 초안입니다. 날짜·정원·경쟁률 등은 이후 각 대학 2027 수시
        모집요강 원문과 대조해서 함께 재검증해야 합니다.
      </div>

      <section>
        <h3 className="text-sm font-semibold text-brand-700 mb-1.5">대학별 2027 수시 실기 일정</h3>
        <div className="overflow-x-auto rounded-lg border border-slate-100">
          <table className="w-full text-xs text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="px-2.5 py-2 font-medium">대학 · 학과</th>
                <th className="px-2.5 py-2 font-medium">원서접수</th>
                <th className="px-2.5 py-2 font-medium">실기</th>
                <th className="px-2.5 py-2 font-medium">1차발표</th>
                <th className="px-2.5 py-2 font-medium">2차시험</th>
                <th className="px-2.5 py-2 font-medium">최종발표일</th>
                <th className="px-2.5 py-2 font-medium">특이사항</th>
              </tr>
            </thead>
            <tbody>
              {SCHOOLS.map((s) => (
                <tr key={s.name} className="border-t border-slate-100 align-top">
                  <td className="px-2.5 py-2 font-semibold text-slate-700 whitespace-nowrap">
                    {s.name}
                    <div className="text-[11px] font-normal text-slate-400">{s.dept}</div>
                  </td>
                  <td className="px-2.5 py-2 text-slate-600 whitespace-nowrap">
                    <MultiLine text={s.apply} />
                  </td>
                  <td className="px-2.5 py-2 text-slate-600 whitespace-nowrap">
                    <MultiLine text={s.exam} />
                    {s.target && <div className="font-bold text-brand-600 mt-1">목표: {s.target}</div>}
                  </td>
                  <td className="px-2.5 py-2 whitespace-nowrap">
                    <span className={s.firstAnnounce === '확인 필요' ? 'text-amber-600' : 'text-slate-600'}>
                      {s.firstAnnounce}
                    </span>
                  </td>
                  <td className="px-2.5 py-2 text-slate-600 whitespace-nowrap">
                    <MultiLine text={s.secondExam} />
                  </td>
                  <td className="px-2.5 py-2 font-semibold text-brand-700 whitespace-nowrap">
                    {s.finalAnnounce}
                  </td>
                  <td className="px-2.5 py-2 text-slate-600 min-w-[220px]">{s.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
          붉은 배지 = 상호 겹침 확정 구간(9/18~22) · 노란 배지 = 2027 요강으로 날짜 확정 필요 · 모든
          일정은 입학처 최종 공지 기준
        </p>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-brand-700 mb-1.5">목표 실기일 확정 & 접수 순서 전략</h3>
        <ol className="space-y-1.5">
          <li className="bg-slate-50 rounded-lg p-2.5">
            <span className="font-semibold text-slate-700">① 9/7(월) 오픈 직후 — 가천대 접수.</span>{' '}
            <span className="text-slate-600">
              6개교 중 유일하게 접수 타이밍이 곧 실기일을 결정하므로 최우선. 목표일 9/17(목, 1일차) 확보를
              위해 1~320번대 접수번호가 필요.
            </span>
          </li>
          <li className="bg-slate-50 rounded-lg p-2.5">
            <span className="font-semibold text-slate-700">② 9/8(화)~9/11(금) 마감 내 — 세종대·단국대·용인대·인천대 접수.</span>{' '}
            <span className="text-slate-600">
              네 학교 모두 목표 실기일이 서로 겹치지 않으므로 접수 순서 자체의 긴박함은 낮음. 각 대학
              접수 오픈 시각·마감 시각만 놓치지 않으면 됨.
            </span>
          </li>
          <li className="bg-slate-50 rounded-lg p-2.5">
            <span className="font-semibold text-slate-700">③ 9/15(화) 오픈 즉시 — 동국대 응시시간 신청.</span>{' '}
            <span className="text-slate-600">
              목표일 9/22(화, 실기 마지막 날) 슬롯을 신청. 마지막 날은 잔여 좌석이 적을 수 있어 신청
              오픈과 동시에 접속해야 함.
            </span>
          </li>
          <li className="bg-amber-50 rounded-lg p-2.5 text-amber-800">
            <span className="font-semibold">확정 — 목표 실기일 응시 동선:</span> 9/17(목) 가천대 →
            9/19(토) 용인대 → 9/22(화) 동국대 → 10/3(토) 세종대 → 10/23(금) 인천대 → 11/7(토) 단국대.
            6개 목표일이 서로 겹치지 않는 것을 확인함.
          </li>
        </ol>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-brand-700 mb-1.5">목표일 기준 주의사항</h3>
        <ul className="space-y-1.5">
          <li className="bg-rose-50 rounded-lg p-2.5 text-rose-700">
            <strong>가천대 9/17(목):</strong> 접수번호 1~320번대를 확보해야만 이 날짜로 배정됨. 9/7 오픈
            직후 접수하지 못하면 자동으로 늦은 날짜로 밀려 용인대(9/19)·동국대(9/22)와 겹칠 수 있음 —
            6개교 중 가장 리스크가 큰 목표일
          </li>
          <li className="bg-rose-50 rounded-lg p-2.5 text-rose-700">
            <strong>세종대 10/3(토):</strong> 개천절(공휴일)과 겹침. 실기가 공휴일에 실제로 진행되는지,
            고사장 운영·대중교통 배차가 평소와 다른지 요강·공지사항으로 반드시 재확인
          </li>
          <li className="bg-amber-50 rounded-lg p-2.5 text-amber-800">
            <strong>동국대 9/22(화):</strong> 응시시간 신청제 실기 기간의 마지막 날 — 9/15 신청 오픈
            시점에 잔여 좌석이 이미 줄어 있을 수 있어 원하는 시간대까지는 확보 못 할 가능성 있음
          </li>
          <li className="bg-amber-50 rounded-lg p-2.5 text-amber-800">
            <strong>단국대 11/7(토):</strong> 아직 요강 미확정 상태의 초안 날짜 — 실제 실기 기간 첫날이
            11/7이 맞는지 요강 확정 즉시 재확인 필요
          </li>
          <li className="bg-slate-50 rounded-lg p-2.5 text-slate-600">
            <strong>용인대 9/19(토)·인천대 10/23(금):</strong> 각각 확정/초안 실기 기간의 마지막 날 또는
            마지막 전날. 다른 5개교 목표일과는 겹치지 않아 별도 조치 불필요
          </li>
        </ul>
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
          <li className="bg-amber-50 rounded-lg p-2.5 text-amber-800">
            <strong>첫째,</strong> 확정한 목표 실기일(가천대 9/17 · 동국대 9/22 · 세종대 10/3 · 단국대
            11/7 · 용인대 9/19 · 인천대 10/23) 6개는 서로 겹치지 않는 조합
          </li>
          <li className="bg-amber-50 rounded-lg p-2.5 text-amber-800">
            <strong>둘째,</strong> 가천대는 접수번호가 곧 시험일이므로 9/7 오픈 직후 접수가 사실상
            필수. 동국대는 번호가 아니라 9/15 응시시간 신청 속도 싸움 — 둘 다 목표일을 놓치면 다른
            학교와 겹칠 위험이 있는 두 곳
          </li>
          <li className="bg-amber-50 rounded-lg p-2.5 text-amber-800">
            <strong>셋째,</strong> 세종대 목표일(10/3)이 개천절 공휴일과 겹치므로 실기 시행·교통편을
            사전에 반드시 확인. 접수 마감(9/8~9/11)은 6개교 동일하니 놓치지 않게 주의
          </li>
          <li className="bg-amber-50 rounded-lg p-2.5 text-amber-800">
            <strong>넷째,</strong> 최종발표는 동국대(10/6)가 가장 빠르고 인천대(12/18)가 가장 늦음 —
            각 대학 발표 시점에 맞춰 이후 지원 전략(정시 포함)을 재점검할 것
          </li>
          <li className="bg-rose-50 rounded-lg p-2.5 text-rose-700">
            <strong>다섯째,</strong> 동국대·인천대·단국대는 1차발표 날짜가 아직 확인되지 않음 — 요강
            확정되는 대로 업데이트 필요
          </li>
        </ol>
      </section>
    </>
  )
}
