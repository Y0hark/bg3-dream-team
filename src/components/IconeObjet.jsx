import { useState } from 'react'
import { iconeDe } from '../lib/icones.js'

/**
 * Icône d'objet à dimensions fixes : l'image vérifiée si elle existe, sinon
 * (ou si elle échoue à charger) le glyphe du type d'équipement. Le cadre garde
 * sa taille pendant le chargement et en cas d'erreur : aucun déplacement.
 */
export default function IconeObjet({ objet, taille = 40 }) {
  const { src, repli } = iconeDe(objet, import.meta.env.BASE_URL)
  const [echec, setEchec] = useState(false)
  const image = src !== null && !echec

  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-sm border border-or-700/30 bg-black/20"
      style={{ width: taille, height: taille, fontSize: taille * 0.5 }}
    >
      {image ? (
        <img
          src={src}
          alt=""
          width={taille}
          height={taille}
          loading="lazy"
          decoding="async"
          onError={() => setEchec(true)}
        />
      ) : (
        repli
      )}
    </span>
  )
}
