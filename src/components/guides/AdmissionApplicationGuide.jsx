// 첫 번째 가이드 아이콘(📋)의 본문: 수시 실기 원서접수 & 일정 전략 가이드.
// 4단계(STEP 1~4) 절차를 안내한다. 순수 정적 텍스트라 별도 데이터 파일 없이
// 이 컴포넌트에 직접 구조화해 두었다.
function Step({ n, title, children }) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-brand-700 mb-1.5">
        STEP {n}. {title}
      </h3>
      <div className="space-y-2.5">{children}</div>
    </section>
  )
}

function SubItem({ label, children }) {
  return (
    <div className="bg-slate-50 rounded-lg p-2.5">
      <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
      <div className="text-slate-700">{children}</div>
    </div>
  )
}

export default function AdmissionApplicationGuide() {
  return (
    <>
      <div className="bg-amber-50 rounded-lg p-3 text-amber-800">
        <p className="font-semibold mb-1">핵심 요약</p>
        <p className="leading-relaxed">
          실기 시험은 일정 중복 방지와 <strong>원하는 날짜 배정(접수 타이밍 전략)</strong>이 핵심입니다.
          아래 4단계 가이드에 맞춰 차근차근 준비해 주세요.
        </p>
      </div>

      <Step n={1} title="지원 대학 일정 및 중복 체크 (사전 조사)">
        <SubItem label="1. 원서접수 및 실기 일정 취합">
          지원하는 모든 대학의 원서접수 기간과 실기 시험 기간을 정리합니다.
        </SubItem>
        <SubItem label="2. 일정 중복(충돌) 확인">
          <ul className="list-disc list-inside space-y-0.5">
            <li>1차 시험 간 중복, 1·2차 시험 간 중복, 2차 시험 간 중복 여부 확인</li>
            <li>재학 중인 고등학교의 중간·기말고사 기간과 겹치는지 반드시 확인</li>
          </ul>
        </SubItem>
        <SubItem label="3. 희망 실기 날짜 선정">
          타 대학 실기일 또는 학교 시험을 피해 <strong>시험을 치르고 싶은 목표 날짜(N일차)</strong>를
          대학별로 결정합니다.
        </SubItem>
      </Step>

      <Step n={2} title="목표 접수번호(타이밍) 계산">
        <p className="text-slate-600 text-xs">
          실기 시험은 접수번호 순으로 배정되므로, 전년도 데이터를 바탕으로 목표 번호대를 계산합니다.
        </p>
        <SubItem label="1. 작년 지원자 수 파악">
          각 대학 입학처 &lsquo;입시결과&rsquo; 확인: 모집인원 × 경쟁률 = 총 지원자 수
        </SubItem>
        <SubItem label="2. 1일 실기 평가 인원 계산">하루 실기 인원 = 작년 지원자 수 ÷ 총 실기 일수</SubItem>
        <div className="bg-amber-50 rounded-lg p-2.5">
          <p className="text-[11px] font-medium text-amber-700 mb-1">
            3. 목표 접수번호 설정 예시 (가천대 기준)
          </p>
          <ul className="text-amber-800 space-y-0.5">
            <li>조건: 작년 지원자 1,922명 / 실기 6일간 진행 → 하루 약 321명 시험</li>
            <li>목표: 3일차에 시험을 보고 싶은 경우</li>
            <li>계산: 2일차 마감(642번) 이후 ~ 3일차 마감(963번) 이전인 643번 ~ 963번대 안착 필요</li>
          </ul>
        </div>
      </Step>

      <Step n={3} title="실시간 접수 추이 확인 & 접수 실행">
        <SubItem label="1. 접수 속도 파악">
          한예종 접수 때처럼 접수 첫날 번호 상승 추이를 확인하여 속도(예: 1시간당 30명 증가 등)를
          예측합니다.
        </SubItem>
        <SubItem label="2. 단톡방 공유 현황 모니터링">
          동기들이 공유하는 실시간 접수번호를 확인하며 본인의 목표 번호대에 맞춰 원서를 접수합니다.
        </SubItem>
      </Step>

      <Step n={4} title="최종 점검 & 접수 완료 인증">
        <SubItem label="1. 모집요강 최종 확인 (필수 메모)">
          <ul className="list-disc list-inside space-y-0.5">
            <li>시험 과목 및 항목</li>
            <li>유의사항 확인: 규정 의상, 소품 허용 여부, 제한 사항 등</li>
          </ul>
        </SubItem>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">2. 접수 직후 단톡방 인증 양식</p>
          <p className="text-slate-600 text-xs mb-1.5">
            원서 접수를 완료한 즉시 아래 양식대로 단톡방에 남겨주세요.
          </p>
          <div className="bg-slate-800 text-slate-100 rounded-lg p-2.5 text-xs font-mono leading-relaxed overflow-x-auto">
            <div>[이름(성별) / 지원대학 / 접수일시 / 접수번호 / 접수처]</div>
            <div className="text-slate-400 mt-1">
              예시) 홍길동(남) / 서울대학교 / 8일 10:01 접수 / 0001번 / 진학사(또는 유웨이)
            </div>
          </div>
        </div>
      </Step>
    </>
  )
}
