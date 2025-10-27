'use client';

import { PublicNews } from '../../../components/news/PublicNews';

export default function NewsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Berita Keanekaragaman Hayati</h1>
        <p className="text-muted-foreground">
          Informasi terkini dan artikel tentang keanekaragaman hayati Indonesia
        </p>
      </div>
      
      <PublicNews />
    </div>
  );
}
