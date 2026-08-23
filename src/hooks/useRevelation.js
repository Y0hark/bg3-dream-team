import { useEffect, useRef, useState } from 'react'

/**
 * Révélation au scroll — l'unique Intersection Observer du site.
 *
 * Renvoie une ref à poser sur l'élément et un booléen qui passe à `true`
 * la première fois que l'élément entre dans le viewport, puis n'en bouge
 * plus (l'observateur se débranche aussitôt).
 *
 * Si l'utilisateur demande moins d'animations — ou si le navigateur n'a
 * pas d'IntersectionObserver — le contenu est révélé immédiatement.
 */
export default function useRevelation({ marge = '0px 0px -12% 0px', seuil = 0.1 } = {}) {
  const cible = useRef(null)
  const [revele, setRevele] = useState(false)

  useEffect(() => {
    const element = cible.current
    if (revele || !element) return

    const sansAnimation =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (sansAnimation || typeof IntersectionObserver === 'undefined') {
      setRevele(true)
      return
    }

    const observateur = new IntersectionObserver(
      ([entree]) => {
        if (!entree.isIntersecting) return
        setRevele(true)
        observateur.disconnect()
      },
      { rootMargin: marge, threshold: seuil },
    )

    observateur.observe(element)
    return () => observateur.disconnect()
  }, [revele, marge, seuil])

  return [cible, revele]
}
