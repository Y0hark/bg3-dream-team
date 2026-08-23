import useRevelation from '../hooks/useRevelation.js'

const VARIANTES = {
  bas: 'revele', // fondu + montée
  gauche: 'revele-gauche', // fondu + glissement depuis la gauche
}

/**
 * Enveloppe un bloc qui se révèle une seule fois, à son entrée dans le viewport.
 * `delai` échelonne les éléments d'une même série (frise, grille de cartes).
 */
export default function Revelation({
  as: Balise = 'div',
  variante = 'bas',
  delai = 0,
  className = '',
  style,
  children,
  ...reste
}) {
  const [cible, revele] = useRevelation()

  return (
    <Balise
      ref={cible}
      className={`${VARIANTES[variante] ?? VARIANTES.bas} ${revele ? 'revele-visible' : ''} ${className}`}
      style={delai ? { ...style, transitionDelay: `${delai}ms` } : style}
      {...reste}
    >
      {children}
    </Balise>
  )
}
