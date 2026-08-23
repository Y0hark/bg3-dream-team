import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Le site est publié sur https://Y0hark.github.io/bg3-dream-team/ :
// les assets doivent être préfixés par le nom du dépôt.
export default defineConfig({
  base: '/bg3-dream-team/',
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
})
