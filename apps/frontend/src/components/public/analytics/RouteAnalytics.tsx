'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackEvent } from '@/lib/analytics';

export function RouteAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    trackEvent({
      event: 'page_view',
      payload: {
        pathname: pathname ?? '/',
        search: searchParams?.toString() ?? '',
      },
    });
  }, [pathname, searchParams]);

  return null;
}
