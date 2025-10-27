import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '../../ui/badge';
import { MapPin, Leaf, Calendar } from 'lucide-react';

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
      <article className="flex overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-sm transition hover:shadow-md focus-within:outline focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-emerald-500">
        <Link href={href} className="relative block h-32 w-48 flex-shrink-0 overflow-hidden">
        <Image
          src={
            image ||
            'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&auto=format&fit=crop&q=80'
          }
          alt={title || 'Gambar taman konservasi'}
          fill
          className="object-cover transition duration-700 hover:scale-105"
          sizes="192px"
          loading="lazy"
        />
        </Link>

        <div className="flex flex-1 flex-col justify-between p-6">
          <div className="space-y-2">
            {status && (
              <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                {status}
              </Badge>
            )}
            <h3 className="text-lg font-semibold text-gray-900">
              <Link href={href} className="focus:outline-none">
                {title}
              </Link>
            </h3>
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {tags.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    );
  }

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-2xl shadow-sm transition hover:shadow-md focus-within:outline focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-emerald-500">
      <Link href={href} className="relative block h-48 w-full overflow-hidden">
        <Image
          src={
            image ||
            'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&auto=format&fit=crop&q=80'
          }
          alt={title || 'Gambar taman konservasi'}
          fill
          className="object-cover transition duration-700 hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 360px"
          loading="lazy"
        />
        {/* Overlay gradient untuk readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </Link>

      <div className="absolute bottom-0 left-0 right-0 flex flex-1 flex-col space-y-3 p-6 text-white">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white">
            <Link href={href} className="focus:outline-none">
              {title}
            </Link>
          </h3>
          {subtitle && <p className="text-sm text-white/90">{subtitle}</p>}
        </div>

        {/* Taman-specific information */}
        <div className="space-y-2">
          {region && (
            <div className="flex items-center gap-2 text-sm text-white/80">
              <MapPin className="h-4 w-4" />
              <span>{region}</span>
            </div>
          )}
          
          {area && (
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Leaf className="h-4 w-4" />
              <span>{area} hektar</span>
            </div>
          )}
          
          {created_at && (
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Calendar className="h-4 w-4" />
              <span>{new Date(created_at).toLocaleDateString('id-ID')}</span>
            </div>
          )}
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 4).map((tag) => (
              <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                {tag}
              </span>
            ))}
          </div>
        )}

        <Link
          href={href}
          className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-emerald-300"
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
