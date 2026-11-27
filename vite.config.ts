import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // Relative asset paths so the build also works from a GitHub Pages sub-folder.
  base: './',
  test: {
    environment: 'jsdom',
  },
})
