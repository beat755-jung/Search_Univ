// 대학 분류 체계.
// tier 0: 1차 필수 4년제 대학(지원예상) - 지도에는 숫자 대신 학사모(🎓) 아이콘, 주황 배지로 별도 표시
// tier 6: 1차 필수 전문대학(지원예상) - tier 0과 동일하게 학사모 아이콘이나, 파란 배지로 구분 표시
// tier 1~5: 지역별 분류 (서울 4년제 / 서울·경기 전문대 / 경기 남부 / 경기 동부 / 인천)

export const TIER_LABELS = {
  0: '2027년입시 지원예상 대학교',
  1: '서울권 4년제 대학',
  2: '서울,경기권 전문대학',
  3: '경기 남부권 대학',
  4: '경기 동부권 대학',
  5: '인천권 대학',
  6: '2027년입시 지원예상 전문대학교'
}

// 지도 상단 필터 바에는 tier 0(학사모, 기본 선택), tier 6(전문대 학사모)도 포함해 함께 토글할 수 있게 한다.
export const TIER_FILTER_ORDER = [0, 6, 1, 2, 3, 4, 5]

// Tailwind 배지(원형 숫자/아이콘) 배경색. 완전한 클래스 문자열을 그대로 사용해야
// Tailwind JIT 스캐너가 인식한다(동적 문자열 조합 금지). tier끼리 색상 계열이 겹치지
// 않도록 뚜렷이 다른 색상(호그림)으로 지정한다.
export const TIER_BADGE_CLASS = {
  0: 'bg-amber-500',
  1: 'bg-blue-600',
  2: 'bg-rose-600',
  3: 'bg-emerald-600',
  4: 'bg-orange-600',
  5: 'bg-violet-600',
  6: 'bg-blue-500'
}

// 배지에 표시할 내용: tier 0/6(1차 필수)은 학사모 아이콘, 그 외는 숫자.
export function tierBadgeContent(tier) {
  return tier === 0 || tier === 6 ? '🎓' : String(tier)
}

// 필터바에서 활성 그룹 라벨의 글자 색상(tier 1~5). tier 0은 색상 텍스트가 아니라
// 주황 배경+검정 글자 배지로 별도 표시하므로 여기 포함하지 않는다.
export const TIER_TEXT_CLASS = {
  1: 'text-blue-600',
  2: 'text-rose-600',
  3: 'text-emerald-600',
  4: 'text-orange-600',
  5: 'text-violet-600'
}
