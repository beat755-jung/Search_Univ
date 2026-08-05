import { useEffect, useState } from 'react'
import { computeAllRoutes, estimateAllRoutesSync } from '../utils/routing'

/**
 * origin -> destination 간 자차/대중교통/도보 경로를 조회한다.
 * 최초 렌더에는 즉시 사용 가능한 추정치를 보여주고(낙관적 UI),
 * 백그라운드에서 실제 API(Kakao Mobility) 결과가 도착하면 갱신한다.
 * enabled=false인 동안에는 API 호출 없이 추정치만 반환한다(예: 닫힌 모달의 불필요한 호출 방지).
 */
export function useRoutes(origin, destination, enabled = true) {
  const [routes, setRoutes] = useState(() => estimateAllRoutesSync(origin, destination))
  const [loading, setLoading] = useState(enabled)

  useEffect(() => {
    if (!enabled) {
      setRoutes(estimateAllRoutesSync(origin, destination))
      setLoading(false)
      return
    }

    let cancelled = false
    setRoutes(estimateAllRoutesSync(origin, destination))
    setLoading(true)

    computeAllRoutes(origin, destination).then((result) => {
      if (!cancelled) {
        setRoutes(result)
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin.lat, origin.lng, destination.lat, destination.lng, enabled])

  return { routes, loading }
}
