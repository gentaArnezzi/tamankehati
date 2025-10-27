import Image from 'next/image';
import Link from 'next/link';
import { type FaunaDetail } from '../../../types/fauna';
import { Badge } from '../../ui/badge';
import { LeafletMap } from '../map/LeafletMap';
import { EntityCard } from '../cards/EntityCard';
import { JsonLd } from '../seo/JsonLd';

type FaunaDetailViewProps = {
  fauna: FaunaDetail;
};

const taxonomyEntries = (fauna: FaunaDetail) =>
  [
    { label: 'Nama ilmiah', value: fauna.nama_ilmiah },
    { label: 'Nama umum', value: fauna.nama_umum },
    { label: 'Famili', value: fauna.famili },
    { label: 'Genus', value: fauna.genus },
    { label: 'Spesies', value: fauna.spesies },
    { label: 'Ordo', value: fauna.ordo },
    { label: 'Status IUCN', value: fauna.status_iucn },
    { label: 'Habitat', value: fauna.habitat },
    { label: 'Sebaran', value: fauna.sebaran?.join(', ') },
  ].filter((entry) => entry.value);

export function FaunaDetailView({ fauna }: FaunaDetailViewProps) {
  const heroImage =
    fauna.gambar_utama && fauna.gambar_utama.trim()
      ? fauna.gambar_utama
      : 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&auto=format&fit=crop';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Taxon',
    name: fauna.nama_ilmiah,
    alternateName: fauna.nama_umum,
    description: fauna.deskripsi,
    conservationStatus: fauna.status_iucn,
    habitat: fauna.habitat,
    image: fauna.gambar_utama,
    geographicDistribution: fauna.sebaran,
  };

  return (
    <div className="space-y-12">
      <JsonLd data={jsonLd} />
      <section className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
        <div className="relative h-[320px] w-full md:h-[420px]">
          <Image
            src={heroImage}
            alt={fauna.nama_ilmiah}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 960px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-emerald-600 text-white hover:bg-emerald-500">{fauna.status_iucn}</Badge>
              <Badge variant="outline" className="border-white/40 bg-white/10 text-white">
                {fauna.wilayah}
              </Badge>
            </div>
            <h1 className="mt-4 text-3xl font-semibold text-white md:text-4xl lg:text-5xl">{fauna.nama_ilmiah}</h1>
            {fauna.nama_umum && (
              <p className="text-lg text-white/80 md:text-xl">
                {fauna.nama_umum}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-8 p-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:p-12">
          <article className="space-y-6">
            {fauna.deskripsi && (
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-slate-900">Deskripsi</h2>
                <p className="whitespace-pre-line text-base leading-relaxed text-slate-700">{fauna.deskripsi}</p>
              </div>
            )}

            {fauna.habitat && (
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-slate-900">Habitat</h3>
                <p className="text-base leading-relaxed text-slate-700">{fauna.habitat}</p>
              </div>
            )}

            {fauna.sebaran?.length ? (
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-slate-900">Sebaran</h3>
                <ul className="flex flex-wrap gap-2 text-sm text-slate-600">
                  {fauna.sebaran.map((wilayah) => (
                    <li key={wilayah} className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                      {wilayah}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {fauna.koordinat && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">Sebaran Spasial</h3>
                <LeafletMap
                  height="320px"
                  markers={[
                    {
                      id: fauna.id,
                      position: [fauna.koordinat.lat, fauna.koordinat.lng],
                      title: fauna.nama_ilmiah,
                      description: fauna.wilayah,
                    },
                  ]}
                  scrollWheelZoom={false}
                  zoom={7}
                  ariaLabel={`Peta sebaran ${fauna.nama_ilmiah}`}
                />
                <p className="text-xs text-slate-500">Koordinat bersifat indikatif untuk visualisasi konservasi.</p>
              </div>
            )}
          </article>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-6">
              <h2 className="text-lg font-semibold text-blue-900">Taksonomi</h2>
              <dl className="mt-4 space-y-3 text-sm text-slate-700">
                {taxonomyEntries(fauna).map((entry) => (
                  <div key={entry.label} className="flex justify-between gap-4">
                    <dt className="font-medium text-slate-600">{entry.label}</dt>
                    <dd className="text-right text-slate-800">{entry.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Status Perlindungan</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Informasi status IUCN dan perlindungan nasional digunakan untuk menyusun prioritas intervensi serta edukasi
                masyarakat.
              </p>
              <Link
                href="https://ksdae.menlhk.go.id/info-bksda/"
                className="mt-4 inline-flex text-sm font-semibold text-emerald-600 hover:text-emerald-500"
              >
                Lihat pedoman perlindungan satwa
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {fauna.konten_terkait?.length ? (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Satwa Terkait</h2>
            <p className="text-sm text-slate-600">
              Kumpulan satwa dengan habitat serupa untuk mendukung pembelajaran lintas spesies.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {fauna.konten_terkait.map((related) => (
              <EntityCard
                key={related.id}
                href={`/fauna/${related.id}`}
                title={related.nama_ilmiah}
                subtitle={related.nama_umum ?? ''}
                image={related.gambar_utama}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
