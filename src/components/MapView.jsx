import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import { buildOriginIcon, buildUnivIcon } from '../utils/icons'
import { useRoutes } from '../hooks/useRoutes'

const TILE_LAYERS = {
  normal: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri'
  }
}

function MapController({ center, zoomSignal, focusSignal }) {
  const map = useMap()

  useEffect(() => {
    if (center) map.setView([center.lat, center.lng], map.getZoom())
  }, [center, map])

  useEffect(() => {
    if (!zoomSignal) return
    if (zoomSignal.type === 'in') map.zoomIn()
    if (zoomSignal.type === 'out') map.zoomOut()
    if (zoomSignal.type === 'locate' && center) {
      map.setView([center.lat, center.lng], 13)
    }
  }, [zoomSignal]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!focusSignal) return
    const { origin: o, destination: d } = focusSignal
    if (!o || !d) return
    map.fitBounds(
      [
        [o.lat, o.lng],
        [d.lat, d.lng]
      ],
      { padding: [80, 80], maxZoom: 15 }
    )
  }, [focusSignal]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}

const MODE_LINE_STYLE = {
  car: { color: '#2a4bd6', estimateColor: '#2a4bd6' },
  transit: { color: '#15803d', estimateColor: '#15803d' },
  walk: { color: '#c2410c', estimateColor: '#c2410c' }
}

// 선택된 이동수단(activeMode) 기준 경로선. 자차/대중교통에 실제 경로(path)가 있으면
// 그대로 그리고(실선), 없으면(추정치) 출발지-목적지를 잇는 직선을 점선으로 표시한다.
function ActiveRoutePolyline({ origin, destination, mode }) {
  const { routes } = useRoutes(origin, destination)
  const route = routes[mode]
  const style = MODE_LINE_STYLE[mode] ?? MODE_LINE_STYLE.car
  const hasRealPath = route?.path && route.path.length > 1

  if (hasRealPath) {
    return <Polyline positions={route.path} pathOptions={{ color: style.color, weight: 5, opacity: 0.85 }} />
  }

  return (
    <Polyline
      positions={[
        [origin.lat, origin.lng],
        [destination.lat, destination.lng]
      ]}
      pathOptions={{ color: style.estimateColor, weight: 4, dashArray: '6 6', opacity: 0.75 }}
    />
  )
}

export default function MapView({
  origin,
  universities,
  selectedIds,
  activeUnivId,
  activeMode = 'car',
  onSelectActive,
  onOpenDetail,
  iconTheme,
  viewMode,
  zoomSignal,
  focusSignal
}) {
  const mapRef = useRef(null)
  const tile = TILE_LAYERS[viewMode] || TILE_LAYERS.normal

  const activeUniv = universities.find((u) => u.id === activeUnivId)

  return (
    <MapContainer
      center={[origin.lat, origin.lng]}
      zoom={11}
      className="w-full h-full"
      ref={mapRef}
    >
      <TileLayer url={tile.url} attribution={tile.attribution} />
      <MapController center={origin} zoomSignal={zoomSignal} focusSignal={focusSignal} />

      <Marker position={[origin.lat, origin.lng]} icon={buildOriginIcon()}>
        <Popup>
          <strong>출발지</strong>
          <br />
          {origin.label}
        </Popup>
      </Marker>

      {universities
        .filter((u) => selectedIds.includes(u.id))
        .map((u) => (
          <Marker
            key={u.id}
            position={[u.lat, u.lng]}
            icon={buildUnivIcon(u.tier, iconTheme, u.id === activeUnivId, u.shortName)}
            eventHandlers={{
              click: () => onSelectActive(u.id)
            }}
          >
            <Popup>
              <div className="text-sm">
                <strong>{u.name}</strong>
                <br />
                <span className="text-xs text-slate-500">{u.department}</span>
                <br />
                <button
                  onClick={() => onOpenDetail(u.id)}
                  className="mt-1 text-brand-600 underline text-xs"
                >
                  상세 정보 보기
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

      {activeUniv && (
        <ActiveRoutePolyline origin={origin} destination={activeUniv} mode={activeMode} />
      )}
    </MapContainer>
  )
}
