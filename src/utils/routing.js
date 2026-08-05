// 자차 / 대중교통 / 도보 거리 및 소요시간 계산 유틸리티.
//
// - 자차: VITE_KAKAO_REST_KEY가 설정되어 있으면 Kakao Mobility 길찾기 API로 실제 도로
//   거리·소요시간·경로선(path)을 조회한다. 키가 없거나 호출 실패 시 추정치로 대체된다.
// - 대중교통: VITE_ODSAY_API_KEY가 설정되어 있으면 ODsay 대중교통 길찾기 API로 실제
//   지하철/버스 환승 경로·소요시간을 조회한다(Kakao Mobility는 대중교통을 지원하지 않음).
//   키가 없거나 호출 실패 시 추정치로 대체된다.
// - 도보: Kakao/ODsay 모두 보행자 전용 경로를 제공하지 않아 현재는 추정치로 표시된다.
import { fetchKakaoCarRoute, hasKakaoKey } from './kakao'
import { fetchOdsayTransitRoute, hasOdsayKey } from './odsay'

const EARTH_RADIUS_KM = 6371

function toRad(deg) {
  return (deg * Math.PI) / 180
}

// 두 좌표 간 직선거리(km) - Haversine 공식
export function haversineDistanceKm(a, b) {
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

// 실제 도로/대중교통 경로는 직선거리보다 대체로 길다. mock 보정계수를 적용.
const ROAD_FACTOR = 1.35 // 자차 도로 굴곡 보정
const TRANSIT_FACTOR = 1.5 // 대중교통 환승/우회 보정
const WALK_FACTOR = 1.2 // 도보 우회 보정

const AVG_SPEED_KMH = {
  car: 38, // 수도권 평균 주행속도(신호/정체 반영 근사치)
  transit: 26, // 버스+지하철 평균 이동속도(대기/환승시간 포함 근사치)
  walk: 4.5 // 평균 도보 속도
}

// 도보로 이동하기 현실적인 최대 거리(km). 이를 초과하면 도보 항목을 표시하지 않는다.
export const WALK_MAX_KM = 5

const FIXED_OVERHEAD_MIN = {
  car: 3, // 출차/주차 등 여유시간
  transit: 8, // 대기 및 환승 여유시간
  walk: 0
}

/**
 * 직선거리 기반 mock 추정치. 실제 API 호출 전 낙관적 표시(optimistic UI) 및
 * API 실패 시 fallback 용도로 사용한다.
 */
function estimateRoute(origin, destination, mode) {
  const straightKm = haversineDistanceKm(origin, destination)
  const factor =
    mode === 'car' ? ROAD_FACTOR : mode === 'transit' ? TRANSIT_FACTOR : WALK_FACTOR
  const distanceKm = straightKm * factor
  const durationMin =
    (distanceKm / AVG_SPEED_KMH[mode]) * 60 + FIXED_OVERHEAD_MIN[mode]

  return {
    distanceKm: Math.round(distanceKm * 10) / 10,
    durationMin: Math.round(durationMin),
    path: null,
    source: 'estimate'
  }
}

/** 세 모드 모두에 대한 즉시 사용 가능한 추정치를 동기적으로 반환한다. */
export function estimateAllRoutesSync(origin, destination) {
  return {
    car: estimateRoute(origin, destination, 'car'),
    transit: estimateRoute(origin, destination, 'transit'),
    walk: estimateRoute(origin, destination, 'walk')
  }
}

const routeCache = new Map()

function cacheKey(origin, destination) {
  return `${origin.lat.toFixed(5)},${origin.lng.toFixed(5)}->${destination.lat.toFixed(5)},${destination.lng.toFixed(5)}`
}

/**
 * 실제 이동 거리/시간을 비동기로 계산한다.
 * - 자차: Kakao Mobility 실제 도로 경로(성공 시 source: 'kakao', 경로선 포함)
 * - 대중교통: ODsay 실제 지하철/버스 경로(성공 시 source: 'odsay', 경로선 포함)
 * - 도보: 현재는 추정치(source: 'estimate')
 * 동일한 출발지-대학 조합은 캐시하여 중복 호출을 방지한다.
 */
export async function computeAllRoutes(origin, destination) {
  const key = cacheKey(origin, destination)
  if (routeCache.has(key)) return routeCache.get(key)

  const fallback = estimateAllRoutesSync(origin, destination)
  let car = fallback.car
  let transit = fallback.transit

  if (hasKakaoKey()) {
    try {
      const real = await fetchKakaoCarRoute(origin, destination)
      if (real) {
        car = {
          distanceKm: Math.round(real.distanceKm * 10) / 10,
          durationMin: real.durationMin,
          path: real.path,
          source: 'kakao'
        }
      }
    } catch (err) {
      console.warn('[routing] Kakao 자동차 경로 조회 실패, 추정치로 대체합니다:', err.message)
    }
  }

  if (hasOdsayKey()) {
    try {
      const real = await fetchOdsayTransitRoute(origin, destination)
      if (real) {
        transit = {
          distanceKm: Math.round(real.distanceKm * 10) / 10,
          durationMin: real.durationMin,
          path: real.path,
          summary: real.summary,
          source: 'odsay'
        }
      }
    } catch (err) {
      console.warn('[routing] ODsay 대중교통 경로 조회 실패, 추정치로 대체합니다:', err.message)
    }
  }

  const result = { car, transit, walk: fallback.walk }
  routeCache.set(key, result)
  return result
}

export function formatDuration(min) {
  if (min < 60) return `${min}분`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`
}

export function formatDistance(km) {
  return `${km.toFixed(1)}km`
}
