-- Demo Data Seeding Script for Railway Database
-- Seeds flora, fauna, and activities for testing

BEGIN;

-- Insert demo flora (for park ID 6 - Taman Kehati Borneo Test, submitted by user ID 2 - kaltim admin)
INSERT INTO flora (
    park_id, local_name, scientific_name, family, genus, description, morphology, benefits,
    habitat, is_endemic, iucn_status, status, submitted_by, submitted_at, approved_by, approved_at
) VALUES
(
    6, 'Anggrek Hitam', 'Coelogyne pandurata', 'Orchidaceae', 'Coelogyne',
    'Anggrek endemik Kalimantan dengan bunga berwarna hijau kekuningan dan lidah berwarna hitam',
    'Herba epifit dengan pseudobulb berbentuk lonjong, daun lanset, dan bunga harum',
    'Tanaman hias dengan nilai ekonomi tinggi, konservasi spesies langka',
    'Hutan primer dataran rendah hingga pegunungan',
    true, 'EN', 'approved', 2, NOW(), 1, NOW()
),
(
    6, 'Ulin', 'Eusideroxylon zwageri', 'Lauraceae', 'Eusideroxylon',
    'Kayu besi Kalimantan, pohon berukuran besar dengan kayu sangat keras dan tahan lama',
    'Pohon besar hingga 50m, batang lurus, kulit kayu tebal berwarna coklat gelap',
    'Konstruksi bangunan, perahu, furniture premium. Kayu tahan rayap dan air',
    'Hutan dataran rendah Borneo',
    true, 'VU', 'approved', 2, NOW(), 1, NOW()
),
(
    6, 'Kantong Semar', 'Nepenthes tentaculata', 'Nepenthaceae', 'Nepenthes',
    'Tumbuhan karnivora endemik Kalimantan dengan kantong perangkap serangga',
    'Liana dengan kantong berbentuk silinder, tutup kantong berwarna merah keunguan',
    'Indikator ekosistem sehat, pengendali populasi serangga, tanaman hias unik',
    'Hutan kerangas dan rawa gambut',
    true, 'LC', 'approved', 2, NOW(), 1, NOW()
),
(
    6, 'Meranti Merah', 'Shorea leprosula', 'Dipterocarpaceae', 'Shorea',
    'Pohon meranti merah yang umum di hutan Kalimantan, kayu komersial penting',
    'Pohon besar hingga 60m, mahkota lebar, daun elips dengan tulang daun jelas',
    'Kayu konstruksi, plywood, furniture. Resin untuk damar',
    'Hutan dipterocarp dataran rendah',
    false, 'EN', 'approved', 2, NOW(), 1, NOW()
),
(
    6, 'Rotan Sega', 'Calamus caesius', 'Arecaceae', 'Calamus',
    'Rotan berkualitas tinggi untuk kerajinan dan furniture',
    'Palem memanjat dengan duri pada pelepah, batang lentur hingga 30m',
    'Bahan furniture dan kerajinan, ekonomi masyarakat lokal',
    'Hutan sekunder dan tepi sungai',
    false, 'LC', 'in_review', 2, NOW(), NULL, NULL
);

-- Insert demo fauna
INSERT INTO fauna (
    park_id, local_name, scientific_name, family, genus, ordo, description, morphology,
    habitat_sumber_makanan, is_endemic, iucn_status, status_hama, tingkat_hama,
    status, submitted_by, submitted_at, approved_by, approved_at
) VALUES
(
    6, 'Orangutan Kalimantan', 'Pongo pygmaeus', 'Hominidae', 'Pongo', 'Primates',
    'Kera besar endemik Borneo, terancam punah akibat hilangnya habitat',
    'Kera besar dengan lengan panjang, bulu coklat kemerahan, jantan dewasa memiliki pipi besar',
    'Hutan hujan tropis, memakan buah-buahan terutama durian dan ficus',
    true, 'CR', 'tidak', NULL, 'approved', 2, NOW(), 1, NOW()
),
(
    6, 'Bekantan', 'Nasalis larvatus', 'Cercopithecidae', 'Nasalis', 'Primates',
    'Monyet endemik Borneo dengan hidung besar khas pada jantan dewasa',
    'Monyet berukuran sedang, bulu coklat kemerahan, hidung panjang pada jantan',
    'Hutan bakau dan tepi sungai, memakan daun muda dan buah',
    true, 'EN', 'tidak', NULL, 'approved', 2, NOW(), 1, NOW()
),
(
    6, 'Enggang Gading', 'Rhinoplax vigil', 'Bucerotidae', 'Rhinoplax', 'Bucerotiformes',
    'Burung rangkong dengan tanduk kepala dari gading solid, sangat langka',
    'Burung besar dengan tanduk gading padat berwarna kuning kemerahan, bulu hitam mengkilap',
    'Hutan dataran rendah primer, memakan buah-buahan terutama ara',
    false, 'CR', 'tidak', NULL, 'approved', 2, NOW(), 1, NOW()
),
(
    6, 'Kucing Merah Borneo', 'Catopuma badia', 'Felidae', 'Catopuma', 'Carnivora',
    'Kucing liar endemik Borneo, sangat jarang terlihat',
    'Kucing berukuran sedang, bulu coklat kemerahan, ekor panjang',
    'Hutan primer, berburu mamalia kecil dan burung',
    true, 'EN', 'tidak', NULL, 'in_review', 2, NOW(), NULL, NULL
),
(
    6, 'Babi Berjanggut', 'Sus barbatus', 'Suidae', 'Sus', 'Artiodactyla',
    'Babi liar khas Borneo dengan jenggut putih di pipi',
    'Babi berukuran sedang, bulu abu-abu kecoklatan, jenggot putih khas',
    'Hutan dan semak belukar, omnivora memakan buah, akar, dan invertebrata',
    false, 'VU', 'ya', 'sedang', 'approved', 2, NOW(), 1, NOW()
);

-- Insert demo activities
INSERT INTO activities (
    park_id, title, description, activity_date, location, status,
    created_by, submitted_at, approved_by, approved_at
) VALUES
(
    6, 'Penanaman 1000 Pohon Ulin',
    'Kegiatan penanaman pohon ulin untuk rehabilitasi hutan yang telah rusak. Melibatkan masyarakat sekitar dan pelajar.',
    '2025-10-15', 'Zona Rehabilitasi, Taman Kehati Mahakam',
    'approved', 2, NOW(), 1, NOW()
),
(
    6, 'Monitoring Populasi Orangutan',
    'Survey dan monitoring populasi orangutan di area konservasi menggunakan kamera trap dan observasi langsung.',
    '2025-10-20', 'Zona Inti, Taman Kehati Mahakam',
    'approved', 2, NOW(), 1, NOW()
),
(
    6, 'Edukasi Konservasi untuk Pelajar',
    'Program edukasi lingkungan untuk pelajar SMP dan SMA tentang pentingnya konservasi biodiversitas Borneo.',
    '2025-11-05', 'Pusat Informasi Taman',
    'in_review', 2, NOW(), NULL, NULL
),
(
    6, 'Patroli Anti-Perburuan Liar',
    'Patroli rutin bersama ranger untuk mencegah perburuan liar dan penebangan ilegal di area konservasi.',
    '2025-11-10', 'Zona Penyangga',
    'draft', 2, NULL, NULL, NULL
);

COMMIT;

-- Verify the seeded data
SELECT 'Flora seeded:' as info, COUNT(*) as count FROM flora WHERE park_id = 6;
SELECT 'Fauna seeded:' as info, COUNT(*) as count FROM fauna WHERE park_id = 6;
SELECT 'Activities seeded:' as info, COUNT(*) as count FROM activities WHERE park_id = 6;

