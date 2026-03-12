import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'icon-256.png', 'icon-512.png'],
      manifest: {
        name: 'Focus Pomodoro',
        short_name: 'Focus',
        description: 'A simple Pomodoro focus timer',
        theme_color: '#e53e3e',
        background_color: '#1a202c',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'icon-256.png',
            sizes: '256x256',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '310x310',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
})
