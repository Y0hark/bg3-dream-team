import useProgression from '../hooks/useProgression.jsx'

/**
 * localStorage indisponible (navigation privée, stockage refusé) : l'app
 * reste pleinement utilisable, seule la mémorisation est perdue. Le message
 * est discret, comme demandé au cadrage.
 */
export default function BanniereStockage() {
  const { disponible } = useProgression()
  if (disponible) return null

  return (
    <p className="border-b border-or-700/25 bg-encre/70 px-5 py-2 text-center font-rune text-[0.65rem] uppercase tracking-[0.14em] text-gray-400">
      Stockage local indisponible — la progression ne sera pas conservée après fermeture.
    </p>
  )
}
