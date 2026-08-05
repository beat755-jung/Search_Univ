import { TIER_BADGE_CLASS, TIER_LABELS, TIER_FILTER_ORDER, TIER_TEXT_CLASS, tierBadgeContent } from '../utils/tiers'

// 지도 상단에 표시되는 분류별 빠른 필터 바 (🎓 1차 필수 + 1~5 지역).
// 버튼을 누르면 해당 그룹의 모든 대학이 지도/카드에 추가로 표시(toggle)되고,
// 현재 활성화된 그룹이 무엇인지 라벨로 옆에 표시된다. 라벨 색상은 tier 1~5는
// 해당 버튼과 같은 색 글자로, tier 0(1차 필수)은 주황 배경+검정 글자 배지로 구분한다.
export default function TierFilterBar({ universities, selectedIds, onToggleTier }) {
  const activeTiers = TIER_FILTER_ORDER.filter((tier) => {
    const tierUnivs = universities.filter((u) => u.tier === tier)
    return tierUnivs.length > 0 && tierUnivs.every((u) => selectedIds.includes(u.id))
  })

  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-3 z-10 flex items-center gap-1.5 bg-white/95 backdrop-blur rounded-full shadow-md px-2 py-1.5 max-w-[95vw]">
      {TIER_FILTER_ORDER.map((tier) => {
        const tierUnivs = universities.filter((u) => u.tier === tier)
        const isActive = tierUnivs.length > 0 && tierUnivs.every((u) => selectedIds.includes(u.id))
        return (
          <button
            key={tier}
            onClick={() => onToggleTier(tier)}
            title={`${TIER_LABELS[tier]} 표시/숨기기 (${tierUnivs.length}개교)`}
            className={`w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center shrink-0 transition-colors ${
              isActive
                ? `${TIER_BADGE_CLASS[tier]} text-white shadow-sm`
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {tierBadgeContent(tier)}
          </button>
        )
      })}
      <div className="flex items-center gap-1 pl-1.5 pr-2 overflow-x-auto">
        {activeTiers.length > 0 ? (
          activeTiers.map((tier) =>
            tier === 0 ? (
              <span
                key={tier}
                className="text-[11px] font-semibold text-black bg-amber-400 rounded-full px-2 py-0.5 whitespace-nowrap"
              >
                {TIER_LABELS[tier]}
              </span>
            ) : (
              <span
                key={tier}
                className={`text-[11px] font-semibold whitespace-nowrap ${TIER_TEXT_CLASS[tier]}`}
              >
                {TIER_LABELS[tier]}
              </span>
            )
          )
        ) : (
          <span className="text-[11px] text-slate-500 whitespace-nowrap">버튼을 눌러 대학 그룹 표시</span>
        )}
      </div>
    </div>
  )
}
