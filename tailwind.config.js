/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // ------------------------------------------------------------------
      // Toutes les couleurs passent par des variables CSS (canaux « R G B »)
      // définies thème par thème dans src/index.css. Les composants n'écrivent
      // jamais une teinte en dur : seul le thème actif change.
      // Convention : l'indice 100 est toujours la teinte la plus contrastée
      // avec le fond, le 700 la plus discrète — y compris en thème clair.
      // ------------------------------------------------------------------
      colors: {
        // Encre et pierre : le fond du grimoire
        encre: 'rgb(var(--c-encre) / <alpha-value>)',
        obsidienne: 'rgb(var(--c-obsidienne) / <alpha-value>)',
        // Voile : les aplats translucides (ex. bg-voile/[0.04]) qui doivent
        // éclaircir en thème sombre et assombrir en thème clair.
        voile: 'rgb(var(--c-voile) / <alpha-value>)',
        // Dorures : titres, filets, sceaux
        or: {
          100: 'rgb(var(--c-or-100) / <alpha-value>)',
          300: 'rgb(var(--c-or-300) / <alpha-value>)',
          500: 'rgb(var(--c-or-500) / <alpha-value>)',
          700: 'rgb(var(--c-or-700) / <alpha-value>)',
        },
        braise: 'rgb(var(--c-braise) / <alpha-value>)',
        // Échelle de texte
        gray: {
          100: 'rgb(var(--c-gray-100) / <alpha-value>)',
          200: 'rgb(var(--c-gray-200) / <alpha-value>)',
          300: 'rgb(var(--c-gray-300) / <alpha-value>)',
          400: 'rgb(var(--c-gray-400) / <alpha-value>)',
          500: 'rgb(var(--c-gray-500) / <alpha-value>)',
          600: 'rgb(var(--c-gray-600) / <alpha-value>)',
        },
        // Surfaces de plaques (750 : nuance absente de l'échelle Tailwind)
        slate: {
          300: 'rgb(var(--c-slate-300) / <alpha-value>)',
          700: 'rgb(var(--c-slate-700) / <alpha-value>)',
          750: 'rgb(var(--c-slate-750) / <alpha-value>)',
          800: 'rgb(var(--c-slate-800) / <alpha-value>)',
        },
        // Accents de personnage (cf. src/lib/accents.js) et états d'items :
        // ils doivent rester lisibles sur fond clair comme sur fond sombre.
        red: {
          200: 'rgb(var(--c-red-200) / <alpha-value>)',
          300: 'rgb(var(--c-red-300) / <alpha-value>)',
          400: 'rgb(var(--c-red-400) / <alpha-value>)',
          500: 'rgb(var(--c-red-500) / <alpha-value>)',
        },
        amber: {
          100: 'rgb(var(--c-amber-100) / <alpha-value>)',
          200: 'rgb(var(--c-amber-200) / <alpha-value>)',
          300: 'rgb(var(--c-amber-300) / <alpha-value>)',
          400: 'rgb(var(--c-amber-400) / <alpha-value>)',
        },
        purple: {
          200: 'rgb(var(--c-purple-200) / <alpha-value>)',
          300: 'rgb(var(--c-purple-300) / <alpha-value>)',
          400: 'rgb(var(--c-purple-400) / <alpha-value>)',
          500: 'rgb(var(--c-purple-500) / <alpha-value>)',
        },
        emerald: {
          200: 'rgb(var(--c-emerald-200) / <alpha-value>)',
          300: 'rgb(var(--c-emerald-300) / <alpha-value>)',
          400: 'rgb(var(--c-emerald-400) / <alpha-value>)',
          500: 'rgb(var(--c-emerald-500) / <alpha-value>)',
        },
        sky: {
          200: 'rgb(var(--c-sky-200) / <alpha-value>)',
          300: 'rgb(var(--c-sky-300) / <alpha-value>)',
          400: 'rgb(var(--c-sky-400) / <alpha-value>)',
          500: 'rgb(var(--c-sky-500) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['Cinzel', 'Trajan Pro', 'Georgia', 'serif'],
        grimoire: ['"EB Garamond"', 'Georgia', 'serif'],
        rune: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      boxShadow: {
        sceau: '0 0 0 1px rgb(var(--c-or-500) / 0.25), var(--ombre-portee)',
        halo: '0 0 40px -8px rgb(var(--c-or-300) / 0.35)',
      },
      maxWidth: {
        grimoire: '80rem',
      },
    },
  },
  plugins: [],
}
