// ------------------------------------------------------------------
// Format de la sauvegarde (localStorage et cloud) et migration V1 → V2.
//
// Deux numéros, qu'il ne faut pas confondre :
//   - VERSION_SCHEMA : la FORME de la sauvegarde (clés, types). Elle change
//     quand le code doit relire autrement ce qui est stocké.
//   - ID_COMPOSITION : le CATALOGUE auquel les identifiants se réfèrent
//     (quelle équipe, quels objets). Il change à chaque changement d'équipe,
//     sans que la forme de la sauvegarde bouge.
//
// Principes de la migration :
//   1. par IDENTIFIANT, jamais par position : un statut d'item suit son ID ;
//      un identifiant que le catalogue actif ne connaît plus n'est pas
//      supprimé mais rangé dans `archive`, récupérable et exportable ;
//   2. aucune affectation d'un ancien personnage à un nouveau rôle : les
//      anciens IDs de builds n'apparaissent jamais dans l'état courant ;
//   3. idempotente : migrer un état déjà migré le renvoie à l'identique ;
//   4. tolérante : JSON invalide, statut inconnu ou donnée partielle ne
//      cassent rien, et ce qui est ignoré est compté dans le rapport ;
//   5. jamais d'écriture sur une sauvegarde plus récente ou illisible.
// ------------------------------------------------------------------
import { CHECKLISTS } from '../data/checklists.js'
import { itemDe } from '../data/items.js'
import { etatInitial, normaliserEtat, STATUT_DEFAUT, statutValide } from './progression.js'
import { CLE_AVANT_MIGRATION, ID_COMPOSITION, VERSION_SCHEMA } from './schema.js'

export { CLE_AVANT_MIGRATION, ID_COMPOSITION, VERSION_SCHEMA }

const IDS_CHECKLIST = new Set(CHECKLISTS.flatMap((liste) => liste.entrees.map((entree) => entree.id)))

function estObjet(valeur) {
  return valeur !== null && typeof valeur === 'object' && !Array.isArray(valeur)
}

/**
 * Qu'est-ce qui est stocké ?
 * - 'neuf' : rien (ou null) ;
 * - 'ancien' : forme d'avant la V2 (pas de numéro de schéma) ;
 * - 'courant' : le schéma que ce code sait lire et écrire ;
 * - 'plus-recent' : écrit par une version plus récente de l'application ;
 * - 'illisible' : pas un objet, ou un numéro de schéma absurde.
 */
export function analyserBrut(brut) {
  if (brut === null || brut === undefined) return { type: 'neuf' }
  if (!estObjet(brut)) return { type: 'illisible' }
  if (!('schema' in brut)) return { type: 'ancien' }
  if (!Number.isInteger(brut.schema) || brut.schema < 1) return { type: 'illisible' }
  if (brut.schema === 1) return { type: 'ancien' }
  if (brut.schema === VERSION_SCHEMA) return { type: 'courant' }
  return { type: 'plus-recent', schema: brut.schema }
}

/** Y a-t-il quelque chose à perdre ? Sert à ne pas alarmer pour une sauvegarde vide. */
export function aDeLaProgression(etat) {
  return (
    Object.keys(etat?.items ?? {}).length > 0 ||
    Object.keys(etat?.checklist ?? {}).length > 0 ||
    Object.keys(etat?.copies ?? {}).length > 0
  )
}

function rapportVide() {
  return {
    conserves: 0,
    archives: 0,
    checklistConservee: 0,
    checklistArchivee: 0,
    ignores: [],
    itemsArchives: [],
  }
}

/**
 * Migre une sauvegarde d'avant la V2 vers l'état courant. N'écrit nulle part :
 * c'est l'appelant qui décide, après confirmation, de persister `etat`.
 */
export function migrerVersCourant(brut) {
  const analyse = analyserBrut(brut)
  const rapport = rapportVide()

  if (analyse.type === 'courant') {
    const etat = normaliserEtat(brut)
    rapport.conserves = Object.keys(etat.items).length
    rapport.checklistConservee = Object.keys(etat.checklist).length
    return { etat, rapport }
  }
  if (analyse.type !== 'ancien') {
    return { etat: etatInitial(), rapport }
  }

  const etat = etatInitial()

  if (estObjet(brut.items)) {
    for (const [id, statut] of Object.entries(brut.items)) {
      if (typeof statut !== 'string' || statutValide(statut) === STATUT_DEFAUT) {
        // « À récupérer » est le défaut et n'est pas stocké ; autre chose est un statut inconnu.
        if (statut !== STATUT_DEFAUT) rapport.ignores.push(`items.${id}`)
        continue
      }
      if (itemDe(id)) {
        etat.items[id] = statut
        rapport.conserves += 1
      } else {
        etat.archive.items[id] = statut
        rapport.archives += 1
        rapport.itemsArchives.push(id)
      }
    }
  }

  if (estObjet(brut.checklist)) {
    for (const [id, coche] of Object.entries(brut.checklist)) {
      if (coche !== true) continue
      if (IDS_CHECKLIST.has(id)) {
        etat.checklist[id] = true
        rapport.checklistConservee += 1
      } else {
        etat.archive.checklist[id] = true
        rapport.checklistArchivee += 1
      }
    }
  }

  return { etat, rapport }
}

/**
 * Met l'état précédent à l'abri AVANT la première écriture migrée.
 * - une copie de secours déjà présente n'est jamais écrasée (la plus ancienne
 *   est la plus précieuse) ;
 * - si la copie ne peut pas être écrite, on le dit et l'appelant n'écrit rien.
 */
export function sauvegarderAvantMigration(brut, stockage) {
  if (stockage.lire(CLE_AVANT_MIGRATION) !== null) return { ok: true, creee: false }
  if (!stockage.ecrire(CLE_AVANT_MIGRATION, brut)) return { ok: false, raison: 'copie-impossible' }
  return { ok: true, creee: true }
}

/** Texte JSON de l'état précédent, tel quel, pour un téléchargement de secours. */
export function exporterSauvegarde(brut, etat) {
  return JSON.stringify(
    {
      exporteLe: new Date().toISOString(),
      schemaCourant: VERSION_SCHEMA,
      composition: ID_COMPOSITION,
      sauvegardeAvantMigration: brut ?? null,
      etatCourant: etat ?? null,
    },
    null,
    2,
  )
}

/**
 * Que faire d'un état distant lors de la prise de contact avec le cloud ?
 * Jamais « le plus récent gagne » : un horodatage ne résout pas les éditions
 * concurrentes, et un format plus récent ne s'écrase pas.
 *
 * - `statutLocal` : 'ok' | 'migration-proposee' (voir le hook) ;
 * - `localVide` : l'état local ne porte aucune progression.
 */
export function decisionDistante({ statutLocal, localVide, distantBrut, majLe, vuPrecedemment }) {
  if (distantBrut === null || distantBrut === undefined) {
    return { action: 'envoyer-local', envoiAuto: true }
  }

  const analyse = analyserBrut(distantBrut)

  if (analyse.type === 'plus-recent') {
    return {
      action: 'bloquer',
      raison: 'format-plus-recent',
      envoiAuto: false,
      message:
        'La sauvegarde en ligne a été écrite par une version plus récente de l’application. Pour ne pas l’abîmer, rien n’est envoyé : actualisez la page ou mettez l’application à jour.',
    }
  }
  if (analyse.type === 'illisible') {
    return {
      action: 'bloquer',
      raison: 'illisible',
      envoiAuto: false,
      message:
        'La sauvegarde en ligne a un format que cette version ne sait pas lire. Elle n’a pas été modifiée ; votre progression locale est intacte.',
    }
  }

  if (majLe !== null && majLe === vuPrecedemment) {
    // Rien de neuf côté serveur : c'est notre version qui partira.
    return { action: 'envoyer-local', envoiAuto: statutLocal === 'ok' }
  }

  if (statutLocal === 'migration-proposee') {
    return {
      action: 'attendre-migration',
      envoiAuto: false,
      message:
        'Confirmez d’abord le passage à la nouvelle composition : la synchronisation reprendra ensuite, sans écraser l’ancienne sauvegarde.',
    }
  }

  if (analyse.type === 'ancien') {
    // Une copie plus ancienne de l'application a écrit sur ce code de run.
    if (localVide) return { action: 'appliquer-distant-migre', envoiAuto: true }
    return {
      action: 'bloquer',
      raison: 'ancien-client',
      envoiAuto: false,
      message:
        'Une version plus ancienne de l’application a écrit sur ce code de run. Votre sauvegarde migrée n’a pas été remplacée et rien n’est envoyé automatiquement : vous choisissez d’écraser la sauvegarde en ligne ou de la laisser telle quelle.',
    }
  }

  return { action: 'appliquer-distant', envoiAuto: true }
}
