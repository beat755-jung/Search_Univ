import { formatDistance, formatDuration, WALK_MAX_KM } from '../utils/routing'
import { useRoutes } from '../hooks/useRoutes'
import { buildKakaoMapRouteUrl } from '../utils/kakao'
import { TIER_BADGE_CLASS, tierBadgeContent } from '../utils/tiers'

export default function UniversityDetailModal({
  university,
  origin,
  isFavorite = false,
  onToggleFavorite,
  onClose
}) {
  // university가 null이어도 훅 호출 순서를 지키기 위해 origin을 임시 destination으로 사용하고,
  // enabled=false로 두어 모달이 닫힌 동안에는 불필요한 API 호출을 하지 않는다.
  const { routes, loading } = useRoutes(origin, university ?? origin, Boolean(university))

  if (!university) return null

  const showWalk = routes.walk.distanceKm <= WALK_MAX_KM
  const isRealCarRoute = routes.car.source === 'kakao'
  const isRealTransitRoute = routes.transit.source === 'odsay'
  const modeCards = [
    { key: 'car', label: '🚗 자차', real: isRealCarRoute },
    { key: 'transit', label: '🚌 대중교통', real: isRealTransitRoute },
    ...(showWalk ? [{ key: 'walk', label: '🚶 도보', real: false }] : [])
  ]

  return (
    <div
      className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white ${TIER_BADGE_CLASS[university.tier]}`}
              >
                {tierBadgeContent(university.tier)}
              </span>
              <h2 className="text-lg font-bold text-slate-800">{university.name}</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">{university.address}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleFavorite}
              className={`text-xl leading-none ${
                isFavorite ? 'text-amber-400' : 'text-slate-300 hover:text-amber-300'
              }`}
              title="즐겨찾기"
            >
              ★
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 text-xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          <section>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-brand-700">이동 정보</h3>
              <span className="text-[11px] text-slate-400">● = 실시간 경로</span>
            </div>
            <div className={`grid gap-2 ${showWalk ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {modeCards.map(({ key, label, real }) => (
                <div key={key} className="bg-slate-50 rounded-lg p-2 text-center text-xs">
                  <div className="font-medium text-slate-600">
                    {label}
                    {real && <span className="text-brand-500"> ●</span>}
                  </div>
                  <div className="font-bold text-slate-800 mt-0.5">
                    {loading && key !== 'walk' ? '조회 중…' : formatDuration(routes[key].durationMin)}
                  </div>
                  <div className="text-slate-400">{formatDistance(routes[key].distanceKm)}</div>
                </div>
              ))}
            </div>
            <a
              href={buildKakaoMapRouteUrl(origin, { ...university, name: university.name })}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs text-brand-600 underline"
            >
              카카오맵에서 실제 자동차/대중교통/도보 길찾기 열기 →
            </a>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-brand-700 mb-1">대학 기본 정보</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{university.overview}</p>
            <p className="text-xs text-slate-400 mt-1">
              {university.campus} · {university.department}
            </p>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-brand-700 mb-1">연극영화과 세부 특징</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{university.deptDetail}</p>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-brand-700 mb-1">입학(수시/정시) 요약</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{university.admission}</p>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-brand-700 mb-1">입시 상세 통계</h3>
            {university.admissionStats ? (
              <dl className="space-y-2 text-sm">
                <div className="bg-slate-50 rounded-lg p-2.5">
                  <dt className="text-[11px] font-medium text-slate-500">수시:정시 비율</dt>
                  <dd className="text-slate-700 mt-0.5">{university.admissionStats.ratio}</dd>
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5">
                  <dt className="text-[11px] font-medium text-slate-500">전형 요소 반영 비율(실기 중심)</dt>
                  <dd className="text-slate-700 mt-0.5">{university.admissionStats.practical}</dd>
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5">
                  <dt className="text-[11px] font-medium text-slate-500">학생부(내신) 반영</dt>
                  <dd className="text-slate-700 mt-0.5">{university.admissionStats.academic}</dd>
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5">
                  <dt className="text-[11px] font-medium text-slate-500">최근 경쟁률</dt>
                  <dd className="text-slate-700 mt-0.5">{university.admissionStats.competition}</dd>
                </div>
                <div className="bg-amber-50 rounded-lg p-2.5">
                  <dt className="text-[11px] font-medium text-amber-700">비고</dt>
                  <dd className="text-amber-800 mt-0.5">{university.admissionStats.note}</dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-slate-500 bg-slate-50 rounded-lg p-2.5">
                이 학교는 예술계열 실기 중심 전형 특성상 수시 비중과 실기 반영 비율이 높고
                학생부(내신) 비중이 낮은 경우가 일반적이나, 학교·학과·연도별 정확한 수치는
                확인되지 않았습니다. 최신 모집요강에서 직접 확인해 주세요.
              </p>
            )}
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              ※ 위 입시 정보는 조사 시점 기준 참고용 데이터이며, 예술계열 전형은 매년 반영 비율·전형
              방법이 자주 바뀌고 합격자 평균 내신은 대부분 대학이 비공개입니다. "확인 필요"로 표시된
              항목과 모든 수치는 반드시 각 대학 입학처의 최신 공식 모집요강으로 재확인하세요.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
