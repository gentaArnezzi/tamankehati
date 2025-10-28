import { Metadata } from 'next';
import { ActivitiesPage } from '../../../components/public/activities/ActivitiesPage';

export const metadata: Metadata = {
  title: 'Kegiatan Taman | Taman Kehati',
  description: 'Temukan berbagai kegiatan yang dilakukan di taman-taman konservasi Indonesia',
  keywords: 'kegiatan taman, konservasi, lingkungan, Indonesia',
  openGraph: {
    title: 'Kegiatan Taman | Taman Kehati',
    description: 'Temukan berbagai kegiatan yang dilakukan di taman-taman konservasi Indonesia',
    type: 'website',
  },
};

export default function ActivitiesPageRoute() {
  return <ActivitiesPage />;
}

