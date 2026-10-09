import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { adminService, type HadithDuplicatePair } from '../../services/AdminService';

// Palette de seuils proposés (similarité trigramme sur l'arabe normalisé).
const SEUILS = [
  { v: 0.8, l: '0,80 — quasi-identiques' },
  { v: 0.6, l: '0,60 — proches (défaut)' },
  { v: 0.45, l: '0,45 — large (plus de bruit)' },
];

// Colonne d'une fiche d'une paire : textes + lien d'édition.
const Side: React.FC<{
  id: number; sujet: string | null; rubrique: string | null;
  arabe: string | null; trad: string | null; src: number; strong: boolean;
}> = ({ id, sujet, rubrique, arabe, trad, src, strong }) => (
  <div className={`flex-1 min-w-0 rounded-lg border p-3.5 ${strong ? 'border-green-line bg-glass-tint/40' : 'border-line bg-surface'}`}>
    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
      <span className="text-[11px] font-mono text-muted">#{id}</span>
      {rubrique && <span className="text-[11px] px-2 py-0.5 rounded-full bg-glass-tint text-ink border border-green-line">{rubrique}</span>}
      <span className="text-[11px] text-muted">· {src} source{src > 1 ? 's' : ''}</span>
      {strong && <span className="text-[11px] text-green font-semibold">· mieux sourcé</span>}
      <Link to={`/admin/hadiths/${id}`} className="ml-auto inline-flex items-center gap-1 text-[13px] text-accent hover:underline shrink-0">
        Modifier <ExternalLink className="w-3.5 h-3.5" />
      </Link>
    </div>
    <p className="text-ink font-medium text-[14px] mb-1.5">{sujet || `Hadith #${id}`}</p>
    {arabe && <p dir="rtl" lang="ar" className="font-arabic text-xl leading-loose text-right text-ink whitespace-pre-wrap mb-1.5">{arabe}</p>}
    {trad && <p className="text-[13px] text-muted whitespace-pre-wrap [unicode-bidi:plaintext]">{trad}</p>}
  </div>
);

export const AdminDoublonsList: React.FC = () => {
  const [min, setMin] = useState(0.6);
  const [pairs, setPairs] = useState<HadithDuplicatePair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback((m: number) => {
    setLoading(true); setError(null);
    adminService.listHadithDuplicates(m, 200)
      .then(setPairs)
      .catch((e) => setError((e as Error).message || 'Erreur de chargement.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(min); }, [min, load]);

  const copyIds = (p: HadithDuplicatePair) => {
    navigator.clipboard?.writeText(`${p.a_id}, ${p.b_id}`).catch(() => {});
  };

  return (
    <div className="max-w-4xl px-6 py-8">
      <div className="flex items-center gap-3 flex-wrap mb-2">
        <h1 className="font-display font-semibold text-ink text-3xl">Doublons potentiels</h1>
        {!loading && <span className="text-sm text-muted">{pairs.length} paire{pairs.length > 1 ? 's' : ''}</span>}
        <button onClick={() => load(min)} className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface text-ink px-3 py-2 text-sm hover:bg-glass-tint">
          <RefreshCw className="w-4 h-4" /> Rafraîchir
        </button>
      </div>
      <p className="text-sm text-muted mb-5">
        Hadiths au texte arabe proche (similarité trigramme, harakat ignorées). À réviser&nbsp;:
        supprimer une fiche, ou transformer l'une en <b>variante</b> de l'autre. Ne détecte pas les reformulations
        très différentes (consonnes distinctes).
      </p>

      <div className="flex items-center gap-2 mb-5">
        <label className="text-[13px] text-muted">Seuil</label>
        <select value={min} onChange={(e) => setMin(Number(e.target.value))}
          className="rounded-lg border border-line bg-surface text-ink px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green">
          {SEUILS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-green animate-spin" /></div>
      ) : error ? (
        <p className="text-red-600 py-8">{error}</p>
      ) : pairs.length === 0 ? (
        <p className="text-muted italic py-8">Aucune paire au-dessus de ce seuil. 👍</p>
      ) : (
        <ul className="space-y-4">
          {pairs.map((p) => (
            <li key={`${p.a_id}-${p.b_id}`} className="rounded-card border border-line bg-surface p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[12px] font-semibold text-accent">Similarité {p.sim.toFixed(2)}</span>
                <button onClick={() => copyIds(p)} className="inline-flex items-center gap-1 text-[12px] text-muted hover:text-ink">
                  <Copy className="w-3.5 h-3.5" /> {p.a_id}, {p.b_id}
                </button>
              </div>
              <div className="flex flex-col md:flex-row gap-3">
                <Side id={p.a_id} sujet={p.a_sujet} rubrique={p.a_rubrique} arabe={p.a_arabe} trad={p.a_trad} src={p.a_src} strong={p.a_src >= p.b_src} />
                <Side id={p.b_id} sujet={p.b_sujet} rubrique={p.b_rubrique} arabe={p.b_arabe} trad={p.b_trad} src={p.b_src} strong={p.b_src > p.a_src} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminDoublonsList;
