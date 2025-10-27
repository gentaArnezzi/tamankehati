'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Share2, Copy, Twitter, MessageCircle } from 'lucide-react';
import { Button } from '../../ui/button';

type ShareButtonsProps = {
  title: string;
  baseUrl: string;
};

const buildShareUrl = (base: string, path: string) => {
  const normalizedBase = base.replace(/\/$/, '');
  return `${normalizedBase}${path}`;
};

export function ShareButtons({ title, baseUrl }: ShareButtonsProps) {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const shareUrl = buildShareUrl(baseUrl, pathname ?? '/');

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
      } catch (error) {
        console.error('Gagal membagikan tautan', error);
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Gagal menyalin tautan', error);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        className="gap-2"
        onClick={handleShare}
      >
        <Share2 className="h-4 w-4" />
        {copied ? 'Tautan disalin' : 'Bagikan'}
      </Button>
      <a
        href={`https://twitter.com/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-emerald-200 hover:text-emerald-600"
      >
        <Twitter className="h-4 w-4" />
        X (Twitter)
      </a>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${title} %0A${shareUrl}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-emerald-200 hover:text-emerald-600"
      >
        <MessageCircle className="h-4 w-4" />
        WhatsApp
      </a>
      <Button
        type="button"
        variant="ghost"
        className="gap-2 text-slate-600 hover:text-emerald-600"
        onClick={async () => {
          if (typeof navigator === 'undefined' || !navigator.clipboard) return;
          try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch (error) {
            console.error('Gagal menyalin tautan', error);
          }
        }}
      >
        <Copy className="h-4 w-4" />
        {copied ? 'Disalin!' : 'Salin tautan'}
      </Button>
    </div>
  );
}
