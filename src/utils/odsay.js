// ODsay 대중교통 길찾기 API 연동 래퍼 (선택 사항).
//
// Kakao Mobility는 자동차 길찾기만 제공하며 지하철/버스 등 대중교통 경로는
// 제공하지 않는다. 실제 대중교통(지하철·버스 환승 포함) 경로가 필요하면
// ODsay(https://lab.odsay.com)에서 별도로 API 키를 발급받아 아래 환경변수에
// 설정하면 자동으로 활성화된다.
//
//   VITE_ODSAY_API_KEY=발급받은_ODsay_API_키
//
// ODsay REST API 역시 브라우저 직접 호출 시 CORS로 차단될 수 있어, 개발 중에는
// vite.config.js의 `/odsay` 프록시를 통해 우회한다(운영 배포 시 서버 프록시 필요).
// 키가 없거나 호출이 실패하면 routing.js에서 mock 추정치로 자동 대체된다.

const ODSAY_API_KEY = import.meta.env.VITE_ODSAY_API_KEY
const ODSAY_BASE = import.meta.env.DEV ? '/odsay' : 'https://api.odsay.com'

export function hasOdsayKey() {
  return Boolean(ODSAY_API_KEY)
}

/**
 * ODsay 대중교통 경로 탐색.
 * https://lab.odsay.com/guide/releaseReference#searchPubTransPathT
 * 반환: { distanceKm, durationMin, path: [[lat, lng], ...], summary: string } | null
 */
export async function fetchOdsayTransitRoute(origin, destination) {
  if (!ODSAY_API_KEY) return null

  const params = new URLSearchParams({
    SX: String(origin.lng),
    SY: String(origin.lat),
    EX: String(destination.lng),
    EY: String(destination.lat),
    apiKey: ODSAY_API_KEY
  })

  const res = await fetch(`${ODSAY_BASE}/v1/api/searchPubTransPathT?${params.toString()}`)

  if (!res.ok) {
    throw new Error(`ODsay API 오류 (HTTP ${res.status})`)
  }

  const data = await res.json()
  if (data.error) {
    throw new Error(data.error[0]?.message || '대중교통 경로를 찾을 수 없습니다.')
  }

  const best = data.result?.path?.[0]
  if (!best) return null

  const path = [[origin.lat, origin.lng]]
  const legs = []
  for (const sub of best.subPath ?? []) {
    // subPath trafficType: 1=지하철, 2=버스, 3=도보
    if (sub.trafficType === 3) {
      legs.push('도보')
    } else if (sub.trafficType === 1) {
      legs.push(`지하철 ${sub.lane?.[0]?.name ?? ''}`.trim())
    } else if (sub.trafficType === 2) {
      legs.push(`버스 ${sub.lane?.[0]?.busNo ?? ''}`.trim())
    }

    for (const stop of sub.passStopList?.stations ?? []) {
      const lat = Number(stop.y)
      const lng = Number(stop.x)
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) path.push([lat, lng])
    }
  }
  path.push([destination.lat, destination.lng])

  return {
    distanceKm: (best.info.totalDistance ?? 0) / 1000,
    durationMin: best.info.totalTime ?? 0,
    path,
    summary: legs.filter(Boolean).join(' → ')
  }
}
