import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Le site est publié sur un domaine personnalisé, assets à la racine.
export default defineConfig({
  base: '/',
  plugins: [react()],
  // Les tests de rendu montent des composants sans passer par le plugin
  // React : sans runtime JSX automatique, ils chercheraient un `React` global.
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
})
