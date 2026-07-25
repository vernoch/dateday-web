import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // GitHub Pages: https://vernoch.github.io/dateday-web/
  base: '/dateday-web/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Keep SW strictly under /dateday-web/ so BX Pages on same host are untouched.
      scope: '/dateday-web/',
      includeAssets: ['dateday-icon.svg'],
      manifest: {
        name: 'DateDay',
        short_name: 'DateDay',
        description: 'Rande a nápady pro vás dva',
        theme_color: '#9B4DCA',
        background_color: '#1a0a24',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/dateday-web/',
        scope: '/dateday-web/',
        id: '/dateday-web/',
        icons: [
          {
            src: 'dateday-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
})
