// ------------------------------------------------------------------
// Persistance locale. Aucun backend : la progression vit dans le
// localStorage du navigateur. En navigation privée ou stockage refusé,
// l'app reste utilisable — elle le signale simplement à l'utilisateur.
// ------------------------------------------------------------------

export const CLE_PROGRESSION = 'bg3-progression'

/** Test d'écriture réel : `localStorage` peut exister et lever à l'usage. */
export function stockageDisponible() {
  try {
    const sonde = '__bg3_sonde__'
    window.localStorage.setItem(sonde, '1')
    window.localStorage.removeItem(sonde)
    return true
  } catch {
    return false
  }
}

export function lire(cle) {
  try {
    const brut = window.localStorage.getItem(cle)
    return brut ? JSON.parse(brut) : null
  } catch {
    // Stockage indisponible ou JSON corrompu : on repart d'un état neuf.
    return null
  }
}

export function ecrire(cle, valeur) {
  try {
    window.localStorage.setItem(cle, JSON.stringify(valeur))
    return true
  } catch {
    return false
  }
}

export function effacer(cle) {
  try {
    window.localStorage.removeItem(cle)
    return true
  } catch {
    return false
  }
}
