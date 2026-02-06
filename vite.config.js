import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['src/**/*.test.js'],
    environment: 'node',
    globals: true,
  },
  server: {
    port: 3000,
    open: true
  }
})
