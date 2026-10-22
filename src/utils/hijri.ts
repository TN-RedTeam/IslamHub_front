// Affichage de la date hégirienne en français (translittéré). La CONVERSION
// grégorien → hégirien est faite par moment-hijri ; ici on ne fait que le
// FORMATAGE (nom de mois FR + assemblage), seule logique qui nous appartient.

/** Noms français (translittérés) des 12 mois hégiriens, dans l'ordre (index 0 = Mouharram). */
export const HIJRI_MONTHS_FR = [
  'Mouharram', 'Safar', 'Rabîʿ al-awwal', 'Rabîʿ ath-thânî',
  'Joumâdâ al-oûlâ', 'Joumâdâ ath-thâniya', 'Rajab', 'Chaʿbân',
  'Ramadân', 'Chawwâl', 'Dhou al-qiʿda', 'Dhou al-hijja',
] as const;

/** Interface minimale d'un moment-hijri (on dépend des méthodes, pas du type du paquet). */
export interface HijriMoment {
  iDate(): number;
  iMonth(): number;
  iYear(): number;
}

/** « 10 Ramadân 1447 » — jour, mois translittéré, année hégirienne. */
export const formatHijriFr = (d: HijriMoment): string =>
  `${d.iDate()} ${HIJRI_MONTHS_FR[d.iMonth()]} ${d.iYear()}`;
