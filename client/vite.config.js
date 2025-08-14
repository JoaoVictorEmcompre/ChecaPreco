import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = env.BASE_URL.endsWith('/') ? env.BASE_URL : `${env.BASE_URL}/`

  return {
    base,
    plugins: [react()],
    server: {
      host: true,
      allowedHosts: ['bfchecapreco.vps-kinghost.net'],
    },
  }
})