// Kakao REST API(지오코딩 + 자동차 길찾기) 연동 래퍼.
//
// 사용 전 준비사항:
// 1) https://developers.kakao.com 에서 애플리케이션 생성 후 "REST API 키" 발급
// 2) 내 애플리케이션 > 제품 설정 > 카카오맵/카카오모빌리티 사용 설정
// 3) 내 애플리케이션 > 앱 설정 > 플랫폼 > Web 에 현재 접속 도메인 등록
//    (예: http://localhost:5173, 배포 시 실제 도메인)
// 4) 프로젝트 루트에 .env(.env.local) 파일을 만들고 아래처럼 키를 설정
//      VITE_KAKAO_REST_KEY=발급받은_REST_API_키
//
// ⚠️ CORS 주의: Kakao Mobility 길찾기 API(apis-navi.kakaomobility.com)는 서버 전용
// API로 브라우저에서 직접 호출하면 도메인을 등록해도 CORS로 차단된다. 개발 중에는
// vite.config.js의 `/kakao-navi` 프록시를 통해 우회하고, 운영 배포 시에는 이 요청을
// 대신 전달해줄 백엔드 프록시가 필요하다(README 참고).
//
// 키가 설정되지 않았거나 API 호출이 실패하면, 호출부(routing.js/geocode.js)에서
// mock 추정치로 자동 대체(fallback)됩니다.

const KAKAO_REST_KEY = import.meta.env.VITE_KAKAO_REST_KEY

// 개발 서버(dev)에서는 vite proxy 경로를, 그 외(prod 빌드)에서는 실제 Kakao 도메인을 사용한다.
// prod 빌드는 별도의 서버사이드 프록시가 없으면 CORS로 실패할 수 있다(README의 배포 안내 참고).
const NAVI_BASE = import.meta.env.DEV ? '/kakao-navi' : 'https://apis-navi.kakaomobility.com'
const LOCAL_BASE = import.meta.env.DEV ? '/kakao-local' : 'https://dapi.kakao.com'

export function hasKakaoKey() {
  return Boolean(KAKAO_REST_KEY)
}

function authHeaders() {
  return { Authorization: `KakaoAK ${KAKAO_REST_KEY}` }
}

/**
 * Kakao Mobility 자동차 길찾기 API.
 * https://apis-navi.kakaomobility.com/v1/directions
 * 반환: { distanceKm, durationMin, path: [[lat, lng], ...] }
 */
export async function fetchKakaoCarRoute(origin, destination) {
  if (!KAKAO_REST_KEY) return null

  const params = new URLSearchParams({
    origin: `${origin.lng},${origin.lat}`,
    destination: `${destination.lng},${destination.lat}`,
    priority: 'RECOMMEND'
  })

  const res = await fetch(`${NAVI_BASE}/v1/directions?${params.toString()}`, {
    headers: authHeaders()
  })

  if (!res.ok) {
    throw new Error(`Kakao Mobility API 오류 (HTTP ${res.status})`)
  }

  const data = await res.json()
  const route = data.routes?.[0]
  if (!route || route.result_code !== 0) {
    throw new Error(route?.result_msg || '자동차 경로를 찾을 수 없습니다.')
  }

  const path = []
  for (const section of route.sections ?? []) {
    for (const road of section.roads ?? []) {
      const verts = road.vertexes ?? []
      for (let i = 0; i < verts.length; i += 2) {
        path.push([verts[i + 1], verts[i]]) // vertexes: [x(lng), y(lat), ...] -> [lat, lng]
      }
    }
  }

  return {
    distanceKm: route.summary.distance / 1000,
    durationMin: Math.round(route.summary.duration / 60),
    path
  }
}

/**
 * Kakao Local 키워드 검색 API (지오코딩용).
 * https://dapi.kakao.com/v2/local/search/keyword.json
 * 반환: { lat, lng, label } | null
 */
export async function fetchKakaoKeywordPlace(query) {
  if (!KAKAO_REST_KEY) return null

  const params = new URLSearchParams({ query })
  const res = await fetch(`${LOCAL_BASE}/v2/local/search/keyword.json?${params.toString()}`, {
    headers: authHeaders()
  })

  if (!res.ok) {
    throw new Error(`Kakao Local API 오류 (HTTP ${res.status})`)
  }

  const data = await res.json()
  const doc = data.documents?.[0]
  if (!doc) return null

  return { lat: Number(doc.y), lng: Number(doc.x), label: doc.place_name }
}

/**
 * 카카오맵 길찾기 웹 링크를 생성한다(별도 API 키 불필요).
 * 구글맵은 한국 내 자동차 턴바이턴 길찾기를 제공하지 않으므로, 실제로 동작하는
 * 자동차/대중교통/도보 길찾기(카카오맵 자체 UI에서 탭으로 전환)를 위해 사용한다.
 * https://map.kakao.com/link/from/이름,위도,경도/to/이름,위도,경도
 */
export function buildKakaoMapRouteUrl(origin, destination) {
  const from = `${encodeURIComponent(origin.label ?? '출발지')},${origin.lat},${origin.lng}`
  const to = `${encodeURIComponent(destination.name ?? destination.label ?? '도착지')},${destination.lat},${destination.lng}`
  return `https://map.kakao.com/link/from/${from}/to/${to}`
}
