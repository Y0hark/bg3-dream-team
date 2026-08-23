/**
 * GitHub Pages ne connaît pas les routes du client : une visite directe sur
 * /items renvoie un 404. En servant index.html comme page 404, React Router
 * reprend la main et affiche la bonne page.
 */
import { copyFileSync } from 'node:fs'

copyFileSync('dist/index.html', 'dist/404.html')
console.log('dist/404.html généré (repli SPA pour GitHub Pages)')
