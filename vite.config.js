import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      // Kakao Mobility 길찾기 API는 서버 전용(CORS 미지원) API라 브라우저에서 직접
      // 호출하면 차단된다. 개발 서버가 대신 요청해주는 프록시를 통해 우회한다.
      '/kakao-navi': {
        target: 'https://apis-navi.kakaomobility.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/kakao-navi/, '')
      },
      // Kakao Local(키워드 검색)은 보통 CORS를 지원하지만, 동일한 프록시 경로로
      // 일관되게 처리해 도메인 등록 여부와 무관하게 동작하도록 한다.
      '/kakao-local': {
        target: 'https://dapi.kakao.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/kakao-local/, '')
      },
      // ODsay 대중교통 길찾기 API(선택, VITE_ODSAY_API_KEY 설정 시 사용).
      '/odsay': {
        target: 'https://api.odsay.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/odsay/, '')
      }
    }
  }
})
