import Link from 'next/link';
import { Badge } from '../../ui/badge';
import { MapPin, Leaf, Calendar } from 'lucide-react';
import { ImageWithFallback } from '../../ui/image-with-fallback';

type EntityCardProps = {
  href: string;
  title: string;
  subtitle?: string;
  image?: string | null;
  tags?: string[];
  status?: string;
  variant?: 'vertical' | 'horizontal';
  // Taman-specific props
  region?: string;
  area?: number;
  created_at?: string;
};

export function EntityCard({ href, title, subtitle, image, tags = [], status, variant = 'vertical', region, area, created_at }: EntityCardProps) {
  if (variant === 'horizontal') {
    return (
      <article className="flex overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-lg hover:border-emerald-200 focus-within:outline focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-emerald-500">
        {/* Image Section */}
        <Link href={href} className="relative block h-40 w-56 flex-shrink-0 overflow-hidden">
          <ImageWithFallback
            src={image}
            alt={title || 'Gambar entitas'}
            title={title}
            fill
            className="object-cover transition duration-500 hover:scale-105"
            sizes="224px"
            loading="lazy"
          />
        </Link>

        {/* Content Section */}
        <div className="flex flex-1 flex-col p-5 space-y-3">
          {/* Title & Subtitle */}
          <div className="space-y-1.5">
            {status && (
              <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-xs">
                {status}
              </Badge>
            )}
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              <Link href={href} className="hover:text-emerald-600 transition-colors focus:outline-none">
                {title}
              </Link>
            </h3>
            {subtitle && <p className="text-sm text-gray-600 line-clamp-2">{subtitle}</p>}
          </div>

          {/* Taman-specific information */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {region && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{region}</span>
              </div>
            )}
            
            {area && (
              <div className="flex items-center gap-1.5">
                <Leaf className="h-4 w-4 text-gray-400" />
                <span>{area.toLocaleString('id-ID')} ha</span>
              </div>
            )}
            
            {created_at && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{new Date(created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Action Link */}
          <Link
            href={href}
            className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 transition hover:text-emerald-700 hover:gap-2"
          >
            Lihat detail
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-lg hover:border-emerald-200 focus-within:outline focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-emerald-500">
      {/* Image Section */}
      <Link href={href} className="relative block h-48 w-full overflow-hidden">
        <ImageWithFallback
          src={image}
          alt={title || 'Gambar entitas'}
          title={title}
          fill
          className="object-cover transition duration-500 hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 360px"
          loading="lazy"
        />
      </Link>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-5 space-y-3">
        {/* Title & Subtitle */}
        <div className="space-y-1.5">
          {status && (
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-xs">
              {status}
            </Badge>
          )}
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            <Link href={href} className="hover:text-emerald-600 transition-colors focus:outline-none">
              {title}
            </Link>
          </h3>
          {subtitle && <p className="text-sm text-gray-600 line-clamp-2">{subtitle}</p>}
        </div>

        {/* Taman-specific information */}
        <div className="space-y-2 flex-1">
          {region && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{region}</span>
            </div>
          )}
          
          {area && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Leaf className="h-4 w-4 text-gray-400" />
              <span>{area.toLocaleString('id-ID')} hektar</span>
            </div>
          )}
          
          {created_at && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>{new Date(created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action Link */}
        <Link
          href={href}
          className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 transition hover:text-emerald-700 hover:gap-2"
        >
          Lihat detail
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
