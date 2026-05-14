import React from 'react';
import { useTrackBannerClick } from '../hooks/useSports';
import { ExternalLink } from 'lucide-react';

interface BannerAdProps {
  id: string;
  image: string;
  title: string;
  link_url?: string;
  description?: string;
  variant?: 'horizontal' | 'square' | 'compact';
  className?: string;
}

const BannerAd: React.FC<BannerAdProps> = ({
  id,
  image,
  title,
  link_url,
  description,
  variant = 'horizontal',
  className = '',
}) => {
  const trackClick = useTrackBannerClick();

  const handleClick = () => {
    trackClick.mutate(id);
  };

  const variantStyles = {
    horizontal: 'w-full h-48 md:h-56',
    square: 'w-full aspect-square max-w-xs',
    compact: 'w-full h-32',
  };

  const content = (
    <div
      className={`
        relative overflow-hidden rounded-2xl border border-gray-200/60
        bg-white shadow-sm hover:shadow-lg transition-all duration-300
        group cursor-pointer
        ${variantStyles[variant]}
        ${className}
      `}
    >
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />

      {/* Overlay gradiente */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Badge publicitario */}
      <div className="absolute top-3 right-3">
        <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-gray-600 rounded-full shadow-sm">
          Publicidad
        </span>
      </div>

      {/* Contenido */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-white font-bold text-sm md:text-base line-clamp-1 drop-shadow-md">
          {title}
        </h3>
        {description && (
          <p className="text-white/80 text-xs mt-1 line-clamp-1">
            {description}
          </p>
        )}
        {link_url && (
          <div className="flex items-center gap-1 mt-2 text-white/70 text-xs group-hover:text-white transition-colors">
            <ExternalLink className="w-3 h-3" />
            <span>Ver más</span>
          </div>
        )}
      </div>
    </div>
  );

  if (link_url) {
    return (
      <a
        href={link_url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="block"
      >
        {content}
      </a>
    );
  }

  return content;
};

export default BannerAd;
