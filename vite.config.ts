import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // GitHub Pages: https://vernoch.github.io/dateday-web/
  base: '/dateday-web/',
  plugins: [react(), tailwindcss()],
})
