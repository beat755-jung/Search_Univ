import { useState } from 'react'
import { TIER_BADGE_CLASS, TIER_LABELS, tierBadgeContent } from '../utils/tiers'

export default function Header({
  originLabel,
  onOriginSearch,
  universities,
  selectedIds,
  onToggleUniversity,
  iconTheme,
  onChangeIconTheme,
  onOpenFavorites,
  onGoHome
}) {
  const [originInput, setOriginInput] = useState('')
  const [univQuery, setUnivQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const filtered = universities.filter(
    (u) =>
      univQuery.trim().length > 0 &&
      (u.name.includes(univQuery) || u.shortName.includes(univQuery))
  )

  const selectedUnivs = universities.filter((u) => selectedIds.includes(u.id))

  function submitOrigin(e) {
    e.preventDefault()
    if (originInput.trim()) {
      onOriginSearch(originInput.trim())
      setOriginInput('')
    }
  }

  function handleSelect(id) {
    if (!selectedIds.includes(id) && selectedIds.length >= 15) {
      alert('검색으로 직접 추가할 수 있는 대학은 최대 15개입니다. 지도 상단의 1~5 지역 필터는 이 제한과 무관하게 표시됩니다.')
      return
    }
    onToggleUniversity(id)
  }

  return (
    <header className="w-full bg-white border-b border-slate-200 shadow-sm z-20 relative">
      <div className="flex items-center gap-3 px-4 py-2 flex-wrap">
        <button
          onClick={onGoHome}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-brand-700 font-bold hover:bg-brand-50 shrink-0"
          title="홈"
        >
          🎭 <span className="hidden sm:inline">연영과 길찾기</span>
        </button>

        {/* 출발지 검색 */}
        <form onSubmit={submitOrigin} className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-slate-100 rounded-lg px-3 py-2 gap-2 min-w-[220px]">
            <span className="text-slate-400 text-sm">출발</span>
            <input
              value={originInput}
              onChange={(e) => setOriginInput(e.target.value)}
              placeholder={originLabel}
              className="bg-transparent outline-none text-sm w-40 sm:w-52"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"
          >
            이동
          </button>
        </form>

        {/* 대학 검색 및 선택 */}
        <div className="relative flex-1 min-w-[220px]">
          <input
            value={univQuery}
            onChange={(e) => {
              setUnivQuery(e.target.value)
              setShowDropdown(true)
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            placeholder="대학 검색으로 직접 추가 (개별 최대 15개)"
            className="w-full bg-slate-100 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-300"
          />
          {showDropdown && filtered.length > 0 && (
            <ul className="absolute mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-y-auto z-30">
              {filtered.map((u) => (
                <li
                  key={u.id}
                  onMouseDown={() => handleSelect(u.id)}
                  className="px-3 py-2 text-sm hover:bg-brand-50 cursor-pointer flex items-center justify-between"
                >
                  <span>
                    {u.name}
                    <span className="text-xs text-slate-400 ml-1">
                      ({TIER_LABELS[u.tier]})
                    </span>
                  </span>
                  {selectedIds.includes(u.id) && <span className="text-brand-600 text-xs">✓ 선택됨</span>}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 아이콘 테마 변경 */}
        <select
          value={iconTheme}
          onChange={(e) => onChangeIconTheme(e.target.value)}
          className="bg-slate-100 rounded-lg px-2 py-2 text-sm outline-none shrink-0"
          title="마커 아이콘 색상 테마 변경 (tier별로 서로 다른 색상)"
        >
          <option value="vivid">아이콘: 비비드</option>
          <option value="pastel">아이콘: 파스텔</option>
          <option value="dark">아이콘: 다크</option>
          <option value="bright">아이콘: 브라이트</option>
        </select>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onOpenFavorites}
            className="px-3 py-2 rounded-lg text-sm hover:bg-slate-100"
            title="즐겨찾기"
          >
            ⭐ 즐겨찾기
          </button>
          <button className="px-3 py-2 rounded-lg text-sm hover:bg-slate-100" title="메뉴">
            ☰ 메뉴
          </button>
        </div>
      </div>

      {/* 선택된 대학 칩 */}
      {selectedUnivs.length > 0 && (
        <div className="flex items-center gap-2 px-4 pb-2 flex-wrap">
          <span className="text-xs text-slate-400">선택된 대학 ({selectedUnivs.length}개)</span>
          {selectedUnivs.map((u) => (
            <span
              key={u.id}
              className="flex items-center gap-1 bg-brand-50 text-brand-700 text-xs px-2 py-1 rounded-full border border-brand-200"
            >
              <span
                className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] text-white ${TIER_BADGE_CLASS[u.tier]}`}
              >
                {tierBadgeContent(u.tier)}
              </span>
              {u.shortName}
              <button
                onClick={() => onToggleUniversity(u.id)}
                className="ml-1 text-brand-400 hover:text-brand-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </header>
  )
}
