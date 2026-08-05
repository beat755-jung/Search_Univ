// 지오코딩 유틸리티.
// VITE_KAKAO_REST_KEY가 설정되어 있으면 Kakao Local API로 실제 검색을 수행하고,
// 키가 없거나 API 호출이 실패하면 자주 쓰이는 수도권 지명 프리셋으로 대체(fallback)한다.

import { fetchKakaoKeywordPlace, hasKakaoKey } from './kakao'

export const PLACE_PRESETS = {
  '용인시 죽전역': { lat: 37.3243, lng: 127.1103, label: '용인시 죽전역' },
  '죽전역': { lat: 37.3243, lng: 127.1103, label: '용인시 죽전역' },
  '강남역': { lat: 37.4979, lng: 127.0276, label: '강남역' },
  '서울역': { lat: 37.5547, lng: 126.9707, label: '서울역' },
  '수원역': { lat: 37.2660, lng: 127.0001, label: '수원역' },
  '분당역': { lat: 37.3823, lng: 127.1194, label: '분당(서현역)' },
  '인천공항': { lat: 37.4602, lng: 126.4407, label: '인천국제공항' },
  '판교역': { lat: 37.3947, lng: 127.1114, label: '판교역' }
}

export const DEFAULT_ORIGIN = PLACE_PRESETS['용인시 죽전역']

/**
 * 지명 문자열을 좌표로 변환한다.
 * 1) Kakao REST 키가 있으면 Kakao Local API 키워드 검색을 우선 시도
 * 2) 실패하거나 키가 없으면 프리셋 테이블에서 정확/부분 일치 검색
 */
export async function geocodePlace(query) {
  const trimmed = query.trim()
  if (!trimmed) return null

  if (hasKakaoKey()) {
    try {
      const result = await fetchKakaoKeywordPlace(trimmed)
      if (result) return result
    } catch (err) {
      console.warn('[geocode] Kakao Local API 호출 실패, 프리셋으로 대체합니다:', err.message)
    }
  }

  const exact = PLACE_PRESETS[trimmed]
  if (exact) return exact

  const partialKey = Object.keys(PLACE_PRESETS).find(
    (key) => key.includes(trimmed) || trimmed.includes(key)
  )
  if (partialKey) return PLACE_PRESETS[partialKey]

  return null
}
