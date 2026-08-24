import { useEffect, useRef } from 'react'

// ------------------------------------------------------------------
// Décor animé posé derrière toute l'application : des braises qui
// montent lentement, comme au-dessus d'un feu de camp de campement.
// Le canvas lit ses teintes dans les variables du thème actif, donc le
// décor change de couleur en même temps que la palette.
// ------------------------------------------------------------------

/** Densité : une braise par tranche de surface, plafonnée sur grand écran. */
const SURFACE_PAR_BRAISE = 16000
const BRAISES_MAX = 90

/** Lit une variable de thème (« R G B ») et la rend utilisable en rgba(). */
function canaux(styles, nom, repli) {
  const brut = styles.getPropertyValue(nom).trim()
  return brut || repli
}

function creerBraise(largeur, hauteur, depuisLeBas) {
  return {
    x: Math.random() * largeur,
    // Au premier remplissage les braises sont réparties sur toute la hauteur ;
    // ensuite elles repartent du bas, sinon on verrait apparaître des points.
    y: depuisLeBas ? hauteur + Math.random() * 60 : Math.random() * hauteur,
    rayon: 0.6 + Math.random() * 1.9,
    vitesse: 0.12 + Math.random() * 0.38,
    // Chaque braise ondule sur sa propre sinusoïde.
    amplitude: 8 + Math.random() * 26,
    pulsation: 0.0004 + Math.random() * 0.0009,
    phase: Math.random() * Math.PI * 2,
    opacite: 0.18 + Math.random() * 0.5,
    // Une braise sur quatre prend la teinte secondaire du thème.
    froide: Math.random() < 0.25,
  }
}

export default function FondAnime() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reduit = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (reduit?.matches) return

    const contexte = canvas.getContext('2d')
    if (!contexte) return

    let braises = []
    let largeur = 0
    let hauteur = 0
    let image = 0
    let chaude = '201 162 39'
    let froide = '139 58 31'

    /** Les teintes viennent du thème : on les relit à chaque changement. */
    function relireLesTeintes() {
      const styles = getComputedStyle(document.documentElement)
      chaude = canaux(styles, '--halo-a', chaude)
      froide = canaux(styles, '--halo-c', froide)
    }

    function redimensionner() {
      const densite = Math.min(window.devicePixelRatio || 1, 2)
      largeur = window.innerWidth
      hauteur = window.innerHeight
      canvas.width = Math.floor(largeur * densite)
      canvas.height = Math.floor(hauteur * densite)
      canvas.style.width = `${largeur}px`
      canvas.style.height = `${hauteur}px`
      contexte.setTransform(densite, 0, 0, densite, 0, 0)

      const voulu = Math.min(BRAISES_MAX, Math.round((largeur * hauteur) / SURFACE_PAR_BRAISE))
      braises = Array.from({ length: voulu }, () => creerBraise(largeur, hauteur, false))
    }

    function dessiner(horodatage) {
      image = requestAnimationFrame(dessiner)
      contexte.clearRect(0, 0, largeur, hauteur)

      for (const braise of braises) {
        braise.y -= braise.vitesse
        if (braise.y < -20) Object.assign(braise, creerBraise(largeur, hauteur, true))

        // Dérive latérale + scintillement : deux sinusoïdes déphasées.
        const derive = Math.sin(horodatage * braise.pulsation + braise.phase) * braise.amplitude
        const scintille = 0.55 + 0.45 * Math.sin(horodatage * 0.0018 + braise.phase)
        // Les braises s'éteignent en approchant du haut de l'écran.
        const fondu = Math.min(1, braise.y / (hauteur * 0.55))
        const alpha = braise.opacite * scintille * fondu
        if (alpha <= 0.01) continue

        const x = braise.x + derive
        const teinte = braise.froide ? froide : chaude
        const halo = contexte.createRadialGradient(x, braise.y, 0, x, braise.y, braise.rayon * 4)
        halo.addColorStop(0, `rgb(${teinte} / ${alpha})`)
        halo.addColorStop(1, `rgb(${teinte} / 0)`)

        contexte.fillStyle = halo
        contexte.beginPath()
        contexte.arc(x, braise.y, braise.rayon * 4, 0, Math.PI * 2)
        contexte.fill()
      }
    }

    function suspendre() {
      // Onglet caché : inutile de brûler du CPU (et de la batterie).
      cancelAnimationFrame(image)
      if (!document.hidden) image = requestAnimationFrame(dessiner)
    }

    relireLesTeintes()
    redimensionner()
    image = requestAnimationFrame(dessiner)

    // Le thème vit sur <html data-theme> : on suit ses changements.
    const observateur = new MutationObserver(relireLesTeintes)
    observateur.observe(document.documentElement, { attributeFilter: ['data-theme'] })
    window.addEventListener('resize', redimensionner)
    document.addEventListener('visibilitychange', suspendre)

    return () => {
      cancelAnimationFrame(image)
      observateur.disconnect()
      window.removeEventListener('resize', redimensionner)
      document.removeEventListener('visibilitychange', suspendre)
    }
  }, [])

  return (
    <div className="fond-anime" aria-hidden="true">
      {/* Trois nappes de lumière qui dérivent l'une par rapport à l'autre */}
      <span className="nappe nappe-a" />
      <span className="nappe nappe-b" />
      <span className="nappe nappe-c" />
      {/* Cercle d'invocation qui tourne très lentement, à peine visible */}
      <span className="cercle-runique" />
      <canvas ref={canvasRef} className="braises" />
    </div>
  )
}
