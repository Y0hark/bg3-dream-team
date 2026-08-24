import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Le site est publié sur https://Y0hark.github.io/bg3-dream-team/ :
// les assets doivent être préfixés par le nom du dépôt.
export default defineConfig({
  base: '/bg3-dream-team/',
  plugins: [react()],
  // Les tests de rendu montent des composants sans passer par le plugin
  // React : sans runtime JSX automatique, ils chercheraient un `React` global.
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
})
