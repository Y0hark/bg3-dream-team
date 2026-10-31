// Numéros de version de la sauvegarde — module sans dépendance, pour que le
// format (progression.js) et la migration (sauvegarde.js) s'y réfèrent sans
// import circulaire.
//
// VERSION_SCHEMA : la FORME de ce qui est stocké. ID_COMPOSITION : le
// CATALOGUE auquel les identifiants renvoient. Ne pas les confondre : changer
// d'équipe change la composition, pas forcément le schéma.
export const VERSION_SCHEMA = 2
export const ID_COMPOSITION = 'honneur-v2'

/** Clé où l'état précédent est mis à l'abri avant la première écriture migrée. */
export const CLE_AVANT_MIGRATION = 'bg3-progression-avant-v2'
