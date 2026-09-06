// 필터 바의 가이드 아이콘(📋 원서접수 전략 / 🗓 스케줄 전략)을 눌렀을 때 뜨는
// 범용 텍스트 가이드 모달. UniversityDetailModal과 동일한 레이아웃 톤을 쓰되
// 대학 데이터가 아닌 자유 형식의 children(가이드 본문)을 그대로 렌더링한다.
export default function GuideModal({ title, subtitle, onClose, children, widthClass = 'max-w-2xl' }) {
  return (
    <div
      className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl ${widthClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{title}</h2>
            {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 text-sm text-slate-700 leading-relaxed">{children}</div>
      </div>
    </div>
  )
}
