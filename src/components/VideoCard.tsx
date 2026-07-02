import React, { useState } from 'react';
import { m } from 'framer-motion';
import { Play } from 'lucide-react';
import type { Multimedia } from '../types';

interface VideoCardProps {
  video: Multimedia;
  index?: number;
}

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
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-emerald-100 dark:border-emerald-900"
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
            className="group absolute inset-0 w-full h-full focus:outline-none focus:ring-4 focus:ring-emerald-500"
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
              <span className="w-16 h-16 rounded-full bg-emerald-600 group-hover:bg-emerald-500 flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110">
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

      <div className="p-5">
        <div className="flex justify-between items-start gap-3 mb-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
            {video.titre}
          </h3>
          {video.categorie && (
            <span className="shrink-0 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 text-xs font-medium">
              {video.categorie}
            </span>
          )}
        </div>

        {video.savant && (
          <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium mb-2">
            {video.savant}
          </p>
        )}

        {video.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
            {video.description}
          </p>
        )}
      </div>
    </m.article>
  );
};

export default VideoCard;
