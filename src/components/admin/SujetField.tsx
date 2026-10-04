import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/AdminService';

/**
 * Champ « sujet » avec autocomplétion (datalist) depuis le vocabulaire
 * existant — pour réutiliser un sujet déjà saisi au lieu de le retaper,
 * et éviter les doublons/typos. Valeur mono-chaîne (modèle inchangé).
 * Le vocabulaire est mis en cache au niveau module (chargé une fois).
 */
let cache: string[] | null = null;

export const SujetField: React.FC<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, placeholder, className }) => {
  const [vocab, setVocab] = useState<string[]>(cache ?? []);
  useEffect(() => {
    if (cache) return;
    adminService.sujetsVocabulary().then((v) => { cache = v; setVocab(v); }).catch(() => {});
  }, []);
  return (
    <>
      <input className={className} list="admin-sujets-vocab" value={value} onChange={onChange} placeholder={placeholder} />
      <datalist id="admin-sujets-vocab">{vocab.map((s) => <option key={s} value={s} />)}</datalist>
    </>
  );
};

export default SujetField;
