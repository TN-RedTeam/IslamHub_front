// Vocabulaire ordonné des « moments de la journée » (du réveil au coucher).
// Utilisé par l'admin (sélecteur) et la page « La journée du musulman ».
// La clé est stockée dans invocations.moments (CSV) ; le libellé et l'ordre
// vivent ici (modifiable sans toucher à la base).
export interface MomentDef { key: string; label: string; }

export const MOMENTS: MomentDef[] = [
  { key: 'reveil', label: 'Au réveil' },
  { key: 'ablutions', label: "Les ablutions (woudoû')" },
  { key: 'toilettes', label: 'Aux toilettes' },
  { key: 'habillage', label: "L'habillage" },
  { key: 'mosquee', label: 'Vers / à la mosquée' },
  { key: 'avant_priere', label: 'Avant la prière' },
  { key: 'apres_priere', label: 'Après la prière' },
  { key: 'matin', label: 'Adhkâr du matin' },
  { key: 'sortie', label: 'En sortant de chez soi' },
  { key: 'trajet', label: 'En chemin / transport' },
  { key: 'maison', label: 'En rentrant chez soi' },
  { key: 'repas', label: 'Le repas' },
  { key: 'soir', label: 'Adhkâr du soir' },
  { key: 'coucher', label: 'Avant de dormir' },
];

export const MOMENT_ORDER: Record<string, number> = Object.fromEntries(MOMENTS.map((m, i) => [m.key, i]));
export const MOMENT_LABEL: Record<string, string> = Object.fromEntries(MOMENTS.map((m) => [m.key, m.label]));

/** Découpe le CSV `moments` en clés connues, dédupliquées. */
export const parseMoments = (csv: string | null | undefined): string[] =>
  (csv ?? '').split(',').map((s) => s.trim().toLowerCase()).filter((s) => s && s in MOMENT_LABEL);
