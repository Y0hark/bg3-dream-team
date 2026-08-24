// ------------------------------------------------------------------
// Persistance locale. Le localStorage reste la source immédiate : l'app
// fonctionne hors ligne et sans aucun serveur. La sauvegarde distante
// (cf. src/lib/nuage.js) vient par-dessus, jamais à la place. En
// navigation privée ou stockage refusé, l'app reste utilisable — elle le
// signale simplement à l'utilisateur.
// ------------------------------------------------------------------

export const CLE_PROGRESSION = 'bg3-progression'

/** Code de la run synchronisée, vide tant que la synchro n'est pas activée. */
export const CLE_CODE_RUN = 'bg3-code-run'

/** Dernier horodatage serveur connu — sert à détecter l'écriture d'un autre appareil. */
export const CLE_MAJ_DISTANTE = 'bg3-maj-distante'

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
