import React, { useState } from 'react';
import { m } from 'framer-motion';
import { Play } from 'lucide-react';
import type { Multimedia } from '../types';

interface VideoCardProps {
  video: Multimedia;
  index?: number;
}

// Titre en arabe ? (pour choisir la police et le sens d'écriture)
const AR_RE = /[؀-ۿ]/;
const isArabic = (s: string | null | undefined) => !!s && AR_RE.test(s);

/**
 * Carte vidéo YouTube en "click-to-play" :
 * - Avant clic : thumbnail YouTube native (~10 KB) + bouton play (zero JS YouTube chargé)
 * - Après clic : iframe YouTube chargée en autoplay
 *
 * Cette approche évite de charger ~500 KB de JS YouTube par vidéo au mount de la page.
 */
export const VideoCard: React.FC<VideoCardProps> = ({ video, index = 0 }) => {
  const [playing, setPlaying] = useState(false);

  const formatDuration = (seconds: number | null): string | null => {
    if (!seconds) return null;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const duration = formatDuration(video.duree_secondes);

  return (
    <m.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex flex-col h-full bg-surface rounded-card shadow-card overflow-hidden border border-line transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="aspect-video bg-gray-100 dark:bg-gray-700 relative">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.youtube_id}?autoplay=1&rel=0`}
            title={video.titre}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            loading="lazy"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Lire la vidéo : ${video.titre}`}
            className="group absolute inset-0 w-full h-full focus:outline-none focus:ring-4 focus:ring-green"
          >
            <img
              src={`https://i.ytimg.com/vi/${video.youtube_id}/hqdefault.jpg`}
              alt={video.titre}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = `https://i.ytimg.com/vi/${video.youtube_id}/mqdefault.jpg`;
              }}
            />
            <span className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
              <span className="w-16 h-16 rounded-full bg-green group-hover:bg-green-deep flex items-center justify-center shadow-card transition-all group-hover:scale-110 motion-reduce:transition-none">
                <Play className="w-7 h-7 text-white fill-white ml-1" />
              </span>
            </span>
            {duration && (
              <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-2 py-1 rounded">
                {duration}
              </span>
            )}
          </button>
        )}
      </div>

      <div className="flex flex-col flex-1 p-5">
        <div className="flex justify-between items-start gap-3 mb-2">
          <h3
            className={`text-lg font-semibold text-ink line-clamp-2 ${isArabic(video.titre) ? 'font-arabic text-right' : 'font-display'}`}
            {...(isArabic(video.titre) ? { lang: 'ar', dir: 'rtl' as const } : {})}
          >
            {video.titre}
          </h3>
          {video.categorie && (
            <span className="shrink-0 px-2 py-1 rounded-full bg-green-soft text-green-deep text-xs font-medium">
              {video.categorie}
            </span>
          )}
        </div>

        {video.savant && (
          <p className="text-sm text-green font-medium mb-2">
            {video.savant}
          </p>
        )}

        {video.description && (
          <p className="text-sm text-muted line-clamp-3">
            {video.description}
          </p>
        )}
      </div>
    </m.article>
  );
};

export default VideoCard;
