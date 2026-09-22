import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ⚠️ 배포 전 필수 확인!
// GitHub Pages는 "https://아이디.github.io/저장소이름/" 형태의 경로를 쓰기 때문에
// base 값을 본인 GitHub 저장소 이름과 반드시 똑같이 맞춰야 합니다.
// 예: 저장소 이름이 "kakao-clone" 이면 base: '/kakao-clone/'
export default defineConfig({
  plugins: [react()],
  base: '/messenger-clone/',
})
