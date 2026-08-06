import L from 'leaflet'

// tier 0(1차 필수)~5, tier 6(1차 필수 전문대) 대학 마커 아이콘을 생성한다.
// 각 테마는 7개 tier에 서로 뚜렷이 구분되는 색상(호그림이 아닌 서로 다른 계열)을
// 배정한다 - 같은 계열의 명암 단계로는 지도에서 구분이 잘 안 되기 때문이다.
// 인덱스: [tier0(학사모), tier1(서울 4년제), tier2(서울·경기 전문대), tier3(경기남부), tier4(경기동부), tier5(인천), tier6(전문대 학사모)]
export const ICON_THEMES = {
  vivid: ['#f59e0b', '#2563eb', '#e11d48', '#059669', '#ea580c', '#7c3aed', '#3b82f6'],
  pastel: ['#fbbf24', '#60a5fa', '#fb7185', '#34d399', '#fb923c', '#a78bfa', '#93c5fd'],
  dark: ['#b45309', '#1e40af', '#9f1239', '#065f46', '#9a3412', '#5b21b6', '#1e3a8a'],
  bright: ['#eab308', '#0ea5e9', '#f43f5e', '#22c55e', '#f97316', '#d946ef', '#38bdf8']
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// tier === 0/6 (1차 필수, 1차 필수 전문대) 대학은 숫자 대신 학사모(🎓) 아이콘으로 표시하고,
// 마커 위에 이름 라벨을 항상 함께 표시한다.
export function buildUnivIcon(tier, theme = 'vivid', selected = false, name = '') {
  const palette = ICON_THEMES[theme] || ICON_THEMES.vivid
  const bg = palette[Math.min(Math.max(tier, 0), palette.length - 1)]
  const size = selected ? 34 : 28
  const ring = selected ? '0 0 0 4px rgba(58,102,245,0.25)' : '0 1px 4px rgba(0,0,0,0.35)'
  const isCore = tier === 0 || tier === 6
  const showLabel = isCore && name
  const labelHeight = showLabel ? 20 : 0
  const content = isCore ? '🎓' : String(tier)

  const label = showLabel
    ? `<div style="
        position:absolute;
        top:0;
        left:50%;
        transform:translateX(-50%);
        white-space:nowrap;
        background:rgba(255,255,255,0.92);
        color:#1f2937;
        font-size:11px;
        font-weight:600;
        padding:1px 6px;
        border-radius:6px;
        box-shadow:0 1px 3px rgba(0,0,0,0.25);
      ">${escapeHtml(name)}</div>`
    : ''

  return L.divIcon({
    className: 'univ-marker',
    html: `
      <div style="position:relative; width:100%; height:100%;">
        ${label}
        <div style="
          position:absolute;
          bottom:0;
          left:50%;
          transform:translateX(-50%);
          width:${size}px;
          height:${size}px;
          border-radius:9999px;
          background:${bg};
          color:white;
          display:flex;
          align-items:center;
          justify-content:center;
          font-weight:700;
          font-size:${isCore ? (selected ? 17 : 15) : selected ? 15 : 13}px;
          box-shadow:${ring};
          border:2px solid white;
        ">${content}</div>
      </div>
    `,
    iconSize: [Math.max(size, 90), size + labelHeight],
    iconAnchor: [Math.max(size, 90) / 2, labelHeight + size / 2]
  })
}

export function buildOriginIcon() {
  return L.divIcon({
    className: 'origin-marker',
    html: `
      <div style="
        width:20px;height:20px;border-radius:9999px;
        background:#0ea5e9;border:3px solid white;
        box-shadow:0 0 0 4px rgba(14,165,233,0.3);
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  })
}
