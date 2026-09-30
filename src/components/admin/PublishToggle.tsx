import React from 'react';

/**
 * Case « Publié / Brouillon » réutilisable dans les formulaires admin.
 * Coché = visible sur le site public ; décoché = brouillon (masqué du site,
 * conservé en base pour être terminé et publié plus tard).
 */
export const PublishToggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void }> = ({ checked, onChange }) => (
  <section className="rounded-card border border-line bg-surface p-5 mb-4">
    <label className="flex items-center gap-2.5 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 accent-green" />
      <span className="text-[15px] text-ink font-medium">
        Publié <span className="text-muted font-normal">— visible sur le site public. Décoche pour garder en brouillon (invisible du site, à finir plus tard).</span>
      </span>
    </label>
  </section>
);

export default PublishToggle;
