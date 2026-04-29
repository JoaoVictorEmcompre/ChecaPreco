import {defineConfig, loadEnv} from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({mode}) => {
    const env = loadEnv(mode, process.cwd(), '')

    const baseEnv = env.BASE_URL || '/'
    const base = baseEnv.endsWith('/') ? baseEnv : `${baseEnv}/`

    return {
        base,
        plugins: [react()],
        server: {
            host: true,
            allowedHosts: ['bfchecapreco.vps-kinghost.net'],
            proxy: {
                '/api': {
                    target: 'http://localhost:5000',
                    changeOrigin: true,
                },
            },
        },
    }
})