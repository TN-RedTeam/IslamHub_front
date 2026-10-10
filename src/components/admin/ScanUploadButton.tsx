import React, { useRef, useState } from 'react';
import { Upload, Loader2, AlertTriangle } from 'lucide-react';
import { adminService } from '../../services/AdminService';

/**
 * Bouton de téléversement d'un scan vers le bucket Storage `references`.
 * Renvoie l'URL publique via `onUploaded`. Réservé à l'admin (policy storage).
 */
export const ScanUploadButton: React.FC<{
  onUploaded: (url: string) => void;
  label?: string;
  className?: string;
}> = ({ onUploaded, label = 'Téléverser', className = '' }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = () => { setError(null); inputRef.current?.click(); };

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // permet de re-sélectionner le même fichier
    if (!file) return;
    setBusy(true); setError(null);
    try {
      const url = await adminService.uploadScan(file);
      onUploaded(url);
    } catch (err) {
      setError((err as Error).message || 'Échec du téléversement.');
    } finally { setBusy(false); }
  };

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <input ref={inputRef} type="file" accept="image/webp,image/jpeg,image/png" className="hidden" onChange={onChange} />
      <button type="button" onClick={pick} disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-lg border border-green-line bg-glass-tint text-ink font-semibold px-3 py-2 text-sm hover:border-green disabled:opacity-50">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {busy ? 'Envoi…' : label}
      </button>
      {error && <span className="inline-flex items-center gap-1 text-[12px] text-red-600"><AlertTriangle className="w-3.5 h-3.5" /> {error}</span>}
    </span>
  );
};

export default ScanUploadButton;
