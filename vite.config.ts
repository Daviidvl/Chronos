import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/Chronos/' : '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      manifest: {
        name: 'Chronos',
        short_name: 'Chronos',
        description: 'Organize o seu dia com clareza',
        theme_color: '#6E5CF6',
        background_color: '#F7F8FC',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/Chronos/',
        scope: '/Chronos/',
        icons: [
          { src: '/Chronos/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/Chronos/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
}))
