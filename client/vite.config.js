import {defineConfig, loadEnv} from 'vite'
import react from '@vitejs/plugin-react'
import {VitePWA} from 'vite-plugin-pwa'

export default defineConfig(({mode}) => {
    const env = loadEnv(mode, process.cwd(), '')

    const baseEnv = env.BASE_URL || '/'
    const base = baseEnv.endsWith('/') ? baseEnv : `${baseEnv}/`

    return {
        base,
        plugins: [
            react(),
            VitePWA({
                registerType: 'autoUpdate',
                includeAssets: ['logo.ico', 'apple-touch-icon.png'],
                manifest: {
                    name: 'Checa Preço',
                    short_name: 'Checa Preço',
                    description: 'Consulta de preço e estoque Bandfashion',
                    lang: 'pt-BR',
                    theme_color: '#CB3B31',
                    background_color: '#ffffff',
                    display: 'standalone',
                    orientation: 'portrait',
                    icons: [
                        {src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png'},
                        {src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png'},
                        {src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable'},
                    ],
                },
                workbox: {
                    // Só o "casco" do app (HTML/JS/CSS/imagens) vai para o cache.
                    // Preço e estoque (/api) sempre vêm do servidor: sem runtimeCaching e fora do fallback de navegação.
                    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                    navigateFallbackDenylist: [/\/api\//],
                    maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
                },
            }),
        ],
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