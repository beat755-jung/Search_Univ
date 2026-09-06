import { useMemo, useState } from 'react'
import Header from './components/Header'
import MapView from './components/MapView'
import MapControls from './components/MapControls'
import TierFilterBar from './components/TierFilterBar'
import BottomSheet from './components/BottomSheet'
import UniversityDetailModal from './components/UniversityDetailModal'
import GuideModal from './components/GuideModal'
import AdmissionApplicationGuide from './components/guides/AdmissionApplicationGuide'
import AdmissionScheduleGuide from './components/guides/AdmissionScheduleGuide'
import universitiesData from './data/universities.json'
import { DEFAULT_ORIGIN, geocodePlace } from './utils/geocode'
import { buildKakaoMapRouteUrl } from './utils/kakao'

const DEFAULT_SELECTED_IDS = universitiesData.filter((u) => u.tier === 0).map((u) => u.id)

export default function App() {
  const [origin, setOrigin] = useState(DEFAULT_ORIGIN)
  const [selectedIds, setSelectedIds] = useState(DEFAULT_SELECTED_IDS)
  const [activeUnivId, setActiveUnivId] = useState(DEFAULT_SELECTED_IDS[0] ?? null)
  const [activeMode, setActiveMode] = useState('car')
  const [detailUnivId, setDetailUnivId] = useState(null)
  const [iconTheme, setIconTheme] = useState('vivid')
  const [viewMode, setViewMode] = useState('normal')
  const [favorites, setFavorites] = useState([])
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [zoomSignal, setZoomSignal] = useState(null)
  const [focusSignal, setFocusSignal] = useState(null)
  const [activeGuide, setActiveGuide] = useState(null) // null | 'application' | 'schedule'

  const universities = universitiesData

  const visibleSelectedIds = useMemo(
    () => (showFavoritesOnly ? selectedIds.filter((id) => favorites.includes(id)) : selectedIds),
    [showFavoritesOnly, selectedIds, favorites]
  )

  async function handleOriginSearch(query) {
    const place = await geocodePlace(query)
    if (place) {
      setOrigin(place)
    } else {
      alert(`"${query}"에 대한 위치를 찾을 수 없습니다. 프리셋 지명(예: 죽전역, 강남역, 서울역 등)을 이용해 보세요.`)
    }
  }

  function toggleUniversity(id) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((x) => x !== id)
        if (activeUnivId === id) {
          setActiveUnivId(next[0] ?? null)
        }
        return next
      }
      if (prev.length >= 15) return prev
      setActiveUnivId(id)
      return [...prev, id]
    })
  }

  function focusUniversity(id, mode) {
    setActiveUnivId(id)
    if (mode) setActiveMode(mode)
    const target = universities.find((u) => u.id === id)
    if (target) {
      setFocusSignal({ origin, destination: target, ts: Date.now() })
    }
  }

  function toggleTier(tier) {
    const tierIds = universities.filter((u) => u.tier === tier).map((u) => u.id)
    if (tierIds.length === 0) return

    setSelectedIds((prev) => {
      const allIn = tierIds.every((id) => prev.includes(id))
      const next = allIn ? prev.filter((id) => !tierIds.includes(id)) : Array.from(new Set([...prev, ...tierIds]))

      if (activeUnivId && !next.includes(activeUnivId)) {
        setActiveUnivId(next[0] ?? null)
      } else if (!activeUnivId && next.length > 0) {
        setActiveUnivId(next[0])
      }
      return next
    })
  }

  function toggleFavorite(id) {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function handleStartNavigation(university) {
    // 구글맵은 한국 내 자동차 턴바이턴 길찾기를 제공하지 않아 실제 경로 안내가
    // 진행되지 않는다. 카카오맵으로 열어 자동차/대중교통/도보 탭에서 실제
    // 길찾기를 이용할 수 있도록 한다.
    const url = buildKakaoMapRouteUrl(origin, { ...university, name: university.name })
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const detailUniv = universities.find((u) => u.id === detailUnivId) || null

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50">
      <Header
        originLabel={origin.label}
        onOriginSearch={handleOriginSearch}
        universities={universities}
        selectedIds={selectedIds}
        onToggleUniversity={toggleUniversity}
        iconTheme={iconTheme}
        onChangeIconTheme={setIconTheme}
        onOpenFavorites={() => setShowFavoritesOnly((v) => !v)}
        onGoHome={() => {
          setOrigin(DEFAULT_ORIGIN)
          setSelectedIds(DEFAULT_SELECTED_IDS)
          setActiveUnivId(DEFAULT_SELECTED_IDS[0] ?? null)
          setActiveMode('car')
          setShowFavoritesOnly(false)
        }}
      />

      <div className="relative flex-1 min-h-0">
        <MapView
          origin={origin}
          universities={universities}
          selectedIds={visibleSelectedIds}
          activeUnivId={activeUnivId}
          activeMode={activeMode}
          onSelectActive={setActiveUnivId}
          onOpenDetail={setDetailUnivId}
          iconTheme={iconTheme}
          viewMode={viewMode}
          zoomSignal={zoomSignal}
          focusSignal={focusSignal}
        />
        <TierFilterBar
          universities={universities}
          selectedIds={selectedIds}
          onToggleTier={toggleTier}
          onOpenApplicationGuide={() => setActiveGuide('application')}
          onOpenScheduleGuide={() => setActiveGuide('schedule')}
        />
        <MapControls
          onZoomIn={() => setZoomSignal({ type: 'in', ts: Date.now() })}
          onZoomOut={() => setZoomSignal({ type: 'out', ts: Date.now() })}
          onLocate={() => setZoomSignal({ type: 'locate', ts: Date.now() })}
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
        />

        {showFavoritesOnly && (
          <div className="absolute left-3 top-3 z-10 bg-amber-50 border border-amber-200 text-amber-700 text-xs px-3 py-1.5 rounded-lg shadow-sm">
            ⭐ 즐겨찾기만 표시 중
            <button
              onClick={() => setShowFavoritesOnly(false)}
              className="ml-2 underline"
            >
              해제
            </button>
          </div>
        )}
      </div>

      <BottomSheet
        origin={origin}
        universities={universities}
        selectedIds={visibleSelectedIds}
        activeUnivId={activeUnivId}
        activeMode={activeMode}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onSelectActive={focusUniversity}
        onOpenDetail={setDetailUnivId}
        onStartNavigation={handleStartNavigation}
      />

      <UniversityDetailModal
        university={detailUniv}
        origin={origin}
        isFavorite={detailUniv ? favorites.includes(detailUniv.id) : false}
        onToggleFavorite={() => detailUniv && toggleFavorite(detailUniv.id)}
        onClose={() => setDetailUnivId(null)}
      />

      {activeGuide === 'application' && (
        <GuideModal
          title="수시 실기 원서접수 & 일정 전략 가이드"
          onClose={() => setActiveGuide(null)}
        >
          <AdmissionApplicationGuide />
        </GuideModal>
      )}

      {activeGuide === 'schedule' && (
        <GuideModal
          title="수시접수 및 실기 스케줄 전략"
          onClose={() => setActiveGuide(null)}
          widthClass="max-w-[96vw] xl:max-w-6xl"
        >
          <AdmissionScheduleGuide />
        </GuideModal>
      )}
    </div>
  )
}
