import { besoinsObjet, etatCopies, REGLAGES_COPIES } from '../lib/copies.js'
import { statutDe } from '../lib/progression.js'
import useProgression from '../hooks/useProgression.jsx'

const socle =
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-rune text-[0.62rem] uppercase tracking-[0.14em]'

const ORIGINAL = {
  obtenu: { libelle: 'Original acquis', classes: 'border-emerald-400/45 text-emerald-300' },
  rate: { libelle: 'Original raté', classes: 'border-red-400/45 text-red-300' },
  remplace: { libelle: 'Original remplacé', classes: 'border-sky-400/45 text-sky-300' },
  'a-recuperer': { libelle: 'Original à récupérer', classes: 'border-or-700/40 text-gray-400' },
}

/**
 * Trois choses distinctes, jamais fondues en une case : l'original acquis, les
 * exemplaires disponibles, et l'exemplaire affecté à CE rôle. Acquérir
 * l'original n'équipe personne ; le « besoin restant » dit combien de rôles
 * attendent encore un exemplaire à cet acte.
 */
export default function SuiviCopies({ objet, role, acte }) {
  const { etat, ajouterExemplaire, affecterExemplaire, liberer, validerCopie } = useProgression()
  const statut = statutDe(etat, objet.id)
  const besoins = besoinsObjet(objet.id, acte)
  const vue = etatCopies(objet, statut, etat.copies?.[objet.id], besoins, REGLAGES_COPIES)
  const original = ORIGINAL[statut] ?? ORIGINAL['a-recuperer']
  const affecte = vue.affectes.includes(role)

  return (
    <div className="space-y-2 text-xs text-gray-400" data-copies={objet.id}>
      <div className="flex flex-wrap gap-2">
        <span className={`${socle} ${original.classes}`}>{original.libelle}</span>
        {vue.exemplaires > 0 && (
          <span className={`${socle} border-or-700/40 text-gray-300`}>
            {vue.exemplaires} exemplaire{vue.exemplaires > 1 ? 's' : ''} · {vue.libres} libre{vue.libres > 1 ? 's' : ''}
          </span>
        )}
        {affecte && <span className={`${socle} border-emerald-400/45 text-emerald-300`}>Exemplaire affecté</span>}
        {!affecte && vue.exemplaires > 0 && besoins.includes(role) && (
          <span className={`${socle} border-amber-300/45 text-amber-200`}>Besoin restant</span>
        )}
      </div>

      {!objet.copiable && <p>Exemplaire unique : non copiable, jamais dupliqué par les copies.</p>}

      {vue.exemplaires > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {affecte ? (
            <button type="button" className="bouton" onClick={() => liberer(objet.id, role)}>
              Libérer
            </button>
          ) : (
            <button
              type="button"
              className="bouton"
              disabled={vue.libres < 1}
              onClick={() => affecterExemplaire(objet.id, role)}
            >
              Affecter à ce rôle
            </button>
          )}
          {objet.copiable && vue.copiePossible === 'oui' && (
            <button type="button" className="bouton" onClick={() => ajouterExemplaire(objet.id)}>
              + Copie
            </button>
          )}
        </div>
      )}

      {vue.exemplaires > 1 && (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4 accent-current"
            checked={vue.copieValidee}
            onChange={(evenement) => validerCopie(objet.id, evenement.target.checked)}
          />
          Copie validée en jeu (passifs et persistance)
        </label>
      )}

      {vue.besoinRestant.length > 0 && vue.exemplaires > 0 && (
        <p>
          {vue.besoinRestant.length} rôle{vue.besoinRestant.length > 1 ? 's' : ''} attend
          {vue.besoinRestant.length > 1 ? 'ent' : ''} encore un exemplaire à l’acte {acte}.
        </p>
      )}
      {statut === 'rate' && vue.copiePossible === 'autre-source' && (
        <p>Original raté, mais une autre source est documentée : une copie reste envisageable.</p>
      )}
      {statut === 'rate' && vue.copiePossible === 'non' && objet.copiable && (
        <p>Original raté et aucune autre source documentée : pas de copie possible.</p>
      )}
    </div>
  )
}
