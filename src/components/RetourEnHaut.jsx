import { useEffect, useState } from 'react'

/** Bouton de remontée : n'apparaît qu'une fois la page réellement parcourue. */
export default function RetourEnHaut() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function auScroll() {
      setVisible(window.scrollY > 600)
    }
    auScroll()
    window.addEventListener('scroll', auScroll, { passive: true })
    return () => window.removeEventListener('scroll', auScroll)
  }, [])

  return (
    <button
      type="button"
      aria-label="Revenir en haut de la page"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-or-500/50 bg-encre/85 text-or-300 backdrop-blur transition-all duration-300 hover:border-or-300 hover:text-or-100 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      <span aria-hidden="true">↑</span>
    </button>
  )
}
