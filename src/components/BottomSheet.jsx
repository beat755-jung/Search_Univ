import { formatDistance, formatDuration, WALK_MAX_KM } from '../utils/routing'
import { useRoutes } from '../hooks/useRoutes'
import { TIER_BADGE_CLASS, tierBadgeContent } from '../utils/tiers'

const MODE_META = {
  car: { label: '자차', icon: '🚗' },
  transit: { label: '대중교통', icon: '🚌' },
  walk: { label: '도보', icon: '🚶' }
}

function UniversityCard({
  university: u,
  origin,
  isActive,
  activeMode,
  isFavorite,
  onToggleFavorite,
  onSelectActive,
  onOpenDetail,
  onStartNavigation
}) {
  const { routes, loading } = useRoutes(origin, u)
  const showWalk = routes.walk.distanceKm <= WALK_MAX_KM
  const nearWalk = showWalk && routes.walk.distanceKm <= 2
  const modes = showWalk ? ['car', 'transit', 'walk'] : ['car', 'transit']
  const isRealCarRoute = routes.car.source === 'kakao'
  const isRealTransitRoute = routes.transit.source === 'odsay'

  return (
    <div
      onClick={() => onSelectActive(u.id)}
      className={`shrink-0 w-72 rounded-xl border p-3 cursor-pointer transition-colors ${
        isActive ? 'border-brand-500 bg-brand-50 shadow-md' : 'border-slate-200 hover:border-brand-300'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white ${TIER_BADGE_CLASS[u.tier]}`}
            >
              {tierBadgeContent(u.tier)}
            </span>
            <h3 className="font-semibold text-sm text-slate-800">{u.name}</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{u.campus}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite?.(u.id)
          }}
          className={`text-lg leading-none ${
            isFavorite ? 'text-amber-400' : 'text-slate-300 hover:text-amber-300'
          }`}
          title="즐겨찾기"
        >
          ★
        </button>
      </div>

      <div className={`grid gap-1.5 mt-2.5 ${showWalk ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {modes.map((mode) => {
          const isModeActive = isActive && activeMode === mode
          const isRealMode = mode === 'car' ? isRealCarRoute : mode === 'transit' ? isRealTransitRoute : false
          return (
            <button
              key={mode}
              onClick={(e) => {
                e.stopPropagation()
                onSelectActive(u.id, mode)
              }}
              className={`rounded-lg px-1.5 py-1.5 text-center text-[11px] border transition-colors ${
                isModeActive
                  ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                  : mode === 'walk' && nearWalk
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100 font-semibold hover:border-emerald-300'
                    : 'bg-slate-50 text-slate-600 border-transparent hover:border-brand-200'
              }`}
              title={`${MODE_META[mode].label} 경로를 지도에서 보기`}
            >
              <div>
                {MODE_META[mode].icon} {MODE_META[mode].label}
                {isRealMode && <span className={isModeActive ? 'text-white' : 'text-brand-500'}> ●</span>}
              </div>
              <div className="font-semibold">
                {loading && mode !== 'walk' ? '조회 중…' : formatDuration(routes[mode].durationMin)}
              </div>
              <div className={isModeActive ? 'text-brand-100' : 'text-slate-400'}>
                {formatDistance(routes[mode].distanceKm)}
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-between mt-1">
        {nearWalk && <p className="text-[11px] text-emerald-600">🚶 도보 이동 추천 거리입니다</p>}
        <p className="text-[10px] text-slate-300 ml-auto">
          ● = 실시간 경로 · 탭하여 지도에 표시
        </p>
      </div>

      <div className="flex gap-1.5 mt-2.5">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onOpenDetail(u.id)
          }}
          className="flex-1 text-xs py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100"
        >
          상세 정보/입학 정보
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onStartNavigation(u)
          }}
          className="flex-1 text-xs py-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700"
        >
          길찾기 시작
        </button>
      </div>
    </div>
  )
}

export default function BottomSheet({
  origin,
  universities,
  selectedIds,
  activeUnivId,
  activeMode = 'car',
  favorites = [],
  onToggleFavorite,
  onSelectActive,
  onOpenDetail,
  onStartNavigation
}) {
  const selected = universities.filter((u) => selectedIds.includes(u.id))

  if (selected.length === 0) {
    return (
      <div className="w-full bg-white border-t border-slate-200 px-4 py-4 text-sm text-slate-400 text-center">
        상단 검색창에서 대학을 선택하거나, 지도 상단의 1~5 지역 필터를 눌러 대학을 표시해 주세요.
      </div>
    )
  }

  return (
    <div className="w-full bg-white border-t border-slate-200 px-3 py-3">
      <div className="flex gap-3 overflow-x-auto pb-1">
        {selected.map((u) => (
          <UniversityCard
            key={u.id}
            university={u}
            origin={origin}
            isActive={u.id === activeUnivId}
            activeMode={activeMode}
            isFavorite={favorites.includes(u.id)}
            onToggleFavorite={onToggleFavorite}
            onSelectActive={onSelectActive}
            onOpenDetail={onOpenDetail}
            onStartNavigation={onStartNavigation}
          />
        ))}
      </div>
    </div>
  )
}
