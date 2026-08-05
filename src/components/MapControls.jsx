export default function MapControls({ onZoomIn, onZoomOut, onLocate, viewMode, onChangeViewMode }) {
  return (
    <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
      <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
        <button
          onClick={onZoomIn}
          className="w-10 h-10 flex items-center justify-center text-lg font-bold hover:bg-slate-100 border-b border-slate-100"
          title="확대"
        >
          +
        </button>
        <button
          onClick={onZoomOut}
          className="w-10 h-10 flex items-center justify-center text-lg font-bold hover:bg-slate-100"
          title="축소"
        >
          −
        </button>
      </div>

      <button
        onClick={onLocate}
        className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-slate-100"
        title="출발지로 이동"
      >
        📍
      </button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col text-xs">
        <button
          onClick={() => onChangeViewMode('normal')}
          className={`px-2 py-2 hover:bg-slate-100 border-b border-slate-100 ${
            viewMode === 'normal' ? 'bg-brand-50 text-brand-700 font-semibold' : ''
          }`}
          title="일반 지도"
        >
          일반
        </button>
        <button
          onClick={() => onChangeViewMode('satellite')}
          className={`px-2 py-2 hover:bg-slate-100 ${
            viewMode === 'satellite' ? 'bg-brand-50 text-brand-700 font-semibold' : ''
          }`}
          title="위성 지도"
        >
          위성
        </button>
      </div>
    </div>
  )
}
