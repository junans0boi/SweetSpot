import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.config.dev/
export default defineConfig({
  plugins: [react()],
  
  server: {
    // 프록시는 필요 없지만, allowedHosts는 필요합니다.
    allowedHosts: [
      'admin.sweetspot.kro.kr'
    ]
  }
})