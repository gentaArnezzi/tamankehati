#!/usr/bin/env python3
"""
Demo Data Seeding Script for Railway Database
Creates sample flora, fauna, and activities for testing
"""
import asyncio
import sys
from datetime import datetime, date
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

# Add parent directory to path
sys.path.insert(0, '/Users/irgyaarnezzi/Desktop/tamankehati_23/tamankehati_21/apps/backend')

from core.database.engine import SessionLocal
from domains.flora.models import Flora
from domains.fauna.models import Fauna
from domains.activities.models import Activity
from domains.parks.models import Park
from users.models import User


async def seed_demo_data():
    """Seed demo data to Railway database"""
    
    print("=" * 60)
    print("  SEEDING DEMO DATA TO RAILWAY DATABASE")
    print("=" * 60)
    print()
    
    # Create session
    async with SessionLocal() as db:
        try:
            # Get regional admin user (KALTIM)
            result = await db.execute(
                select(User).where(User.email == 'kaltim.admin@kehati.org')
            )
            regional_admin = result.scalar_one_or_none()
            
            if not regional_admin:
                print("❌ Regional admin not found!")
                return
            
            print(f"✅ Found regional admin: {regional_admin.email} (ID: {regional_admin.id})")
            
            # Get a park from KALTIM region
            result = await db.execute(
                select(Park).where(Park.region_id == 23).limit(1)
            )
            park = result.scalar_one_or_none()
            
            if not park:
                print("❌ No park found for KALTIM region!")
                print("Creating a demo park first...")
                
                # Create demo park
                park = Park(
                    name="Taman Kehati Mahakam",
                    slug=f"taman-kehati-mahakam-{int(datetime.now().timestamp())}",
                    region_id=23,  # KALTIM
                    area_ha=500.0,
                    description="Taman kehati di sepanjang sungai Mahakam, Kalimantan Timur",
                    status="draft",
                    created_by=regional_admin.id,
                    sk_penetapan="SK/KALTIM/2025/001",
                    pengelola="Dinas Lingkungan Hidup Kalimantan Timur",
                    kondisi_fisik="Baik, vegetasi primer masih terjaga",
                    nilai_penting="Habitat orangutan dan bekantan",
                    tipe_ekoregion="Hutan Hujan Tropis Dataran Rendah"
                )
                db.add(park)
                await db.commit()
                await db.refresh(park)
                print(f"✅ Created park: {park.name} (ID: {park.id})")
            else:
                print(f"✅ Found park: {park.name} (ID: {park.id})")
            
            print()
            print("-" * 60)
            print("  SEEDING FLORA DATA")
            print("-" * 60)
            
            # Flora data
            flora_data = [
                {
                    "local_name": "Anggrek Hitam",
                    "scientific_name": "Coelogyne pandurata",
                    "family": "Orchidaceae",
                    "genus": "Coelogyne",
                    "description": "Anggrek endemik Kalimantan dengan bunga berwarna hijau kekuningan dan lidah berwarna hitam",
                    "morphology": "Herba epifit dengan pseudobulb berbentuk lonjong, daun lanset, dan bunga harum",
                    "benefits": "Tanaman hias dengan nilai ekonomi tinggi, konservasi spesies langka",
                    "habitat": "Hutan primer dataran rendah hingga pegunungan",
                    "is_endemic": True,
                    "iucn_status": "EN",
                    "status": "approved",
                },
                {
                    "local_name": "Ulin",
                    "scientific_name": "Eusideroxylon zwageri",
                    "family": "Lauraceae",
                    "genus": "Eusideroxylon",
                    "description": "Kayu besi Kalimantan, pohon berukuran besar dengan kayu sangat keras dan tahan lama",
                    "morphology": "Pohon besar hingga 50m, batang lurus, kulit kayu tebal berwarna coklat gelap",
                    "benefits": "Konstruksi bangunan, perahu, furniture premium. Kayu tahan rayap dan air",
                    "habitat": "Hutan dataran rendah Borneo",
                    "is_endemic": True,
                    "iucn_status": "VU",
                    "status": "approved",
                },
                {
                    "local_name": "Kantong Semar",
                    "scientific_name": "Nepenthes tentaculata",
                    "family": "Nepenthaceae",
                    "genus": "Nepenthes",
                    "description": "Tumbuhan karnivora endemik Kalimantan dengan kantong perangkap serangga",
                    "morphology": "Liana dengan kantong berbentuk silinder, tutup kantong berwarna merah keunguan",
                    "benefits": "Indikator ekosistem sehat, pengendali populasi serangga, tanaman hias unik",
                    "habitat": "Hutan kerangas dan rawa gambut",
                    "is_endemic": True,
                    "iucn_status": "LC",
                    "status": "approved",
                },
                {
                    "local_name": "Meranti Merah",
                    "scientific_name": "Shorea leprosula",
                    "family": "Dipterocarpaceae",
                    "genus": "Shorea",
                    "description": "Pohon meranti merah yang umum di hutan Kalimantan, kayu komersial penting",
                    "morphology": "Pohon besar hingga 60m, mahkota lebar, daun elips dengan tulang daun jelas",
                    "benefits": "Kayu konstruksi, plywood, furniture. Resin untuk damar",
                    "habitat": "Hutan dipterocarp dataran rendah",
                    "is_endemic": False,
                    "iucn_status": "EN",
                    "status": "approved",
                },
                {
                    "local_name": "Rotan Sega",
                    "scientific_name": "Calamus caesius",
                    "family": "Arecaceae",
                    "genus": "Calamus",
                    "description": "Rotan berkualitas tinggi untuk kerajinan dan furniture",
                    "morphology": "Palem memanjat dengan duri pada pelepah, batang lentur hingga 30m",
                    "benefits": "Bahan furniture dan kerajinan, ekonomi masyarakat lokal",
                    "habitat": "Hutan sekunder dan tepi sungai",
                    "is_endemic": False,
                    "iucn_status": "LC",
                    "status": "in_review",
                },
            ]
            
            flora_count = 0
            for flora_info in flora_data:
                flora = Flora(
                    park_id=park.id,
                    **flora_info,
                    submitted_by=regional_admin.id,
                    submitted_at=datetime.now() if flora_info["status"] != "draft" else None,
                    approved_at=datetime.now() if flora_info["status"] == "approved" else None,
                    approved_by=1 if flora_info["status"] == "approved" else None,
                )
                db.add(flora)
                flora_count += 1
                print(f"  ✅ Added flora: {flora_info['local_name']} ({flora_info['scientific_name']})")
            
            print()
            print("-" * 60)
            print("  SEEDING FAUNA DATA")
            print("-" * 60)
            
            # Fauna data
            fauna_data = [
                {
                    "local_name": "Orangutan Kalimantan",
                    "scientific_name": "Pongo pygmaeus",
                    "family": "Hominidae",
                    "genus": "Pongo",
                    "ordo": "Primates",
                    "description": "Kera besar endemik Borneo, terancam punah akibat hilangnya habitat",
                    "morphology": "Kera besar dengan lengan panjang, bulu coklat kemerahan, jantan dewasa memiliki pipi besar",
                    "habitat_sumber_makanan": "Hutan hujan tropis, memakan buah-buahan terutama durian dan ficus",
                    "is_endemic": True,
                    "iucn_status": "CR",
                    "status_hama": "tidak",
                    "status": "approved",
                },
                {
                    "local_name": "Bekantan",
                    "scientific_name": "Nasalis larvatus",
                    "family": "Cercopithecidae",
                    "genus": "Nasalis",
                    "ordo": "Primates",
                    "description": "Monyet endemik Borneo dengan hidung besar khas pada jantan dewasa",
                    "morphology": "Monyet berukuran sedang, bulu coklat kemerahan, hidung panjang pada jantan",
                    "habitat_sumber_makanan": "Hutan bakau dan tepi sungai, memakan daun muda dan buah",
                    "is_endemic": True,
                    "iucn_status": "EN",
                    "status_hama": "tidak",
                    "status": "approved",
                },
                {
                    "local_name": "Enggang Gading",
                    "scientific_name": "Rhinoplax vigil",
                    "family": "Bucerotidae",
                    "genus": "Rhinoplax",
                    "ordo": "Bucerotiformes",
                    "description": "Burung rangkong dengan tanduk kepala dari gading solid, sangat langka",
                    "morphology": "Burung besar dengan tanduk gading padat berwarna kuning kemerahan, bulu hitam mengkilap",
                    "habitat_sumber_makanan": "Hutan dataran rendah primer, memakan buah-buahan terutama ara",
                    "is_endemic": False,
                    "iucn_status": "CR",
                    "status_hama": "tidak",
                    "status": "approved",
                },
                {
                    "local_name": "Kucing Merah Borneo",
                    "scientific_name": "Catopuma badia",
                    "family": "Felidae",
                    "genus": "Catopuma",
                    "ordo": "Carnivora",
                    "description": "Kucing liar endemik Borneo, sangat jarang terlihat",
                    "morphology": "Kucing berukuran sedang, bulu coklat kemerahan, ekor panjang",
                    "habitat_sumber_makanan": "Hutan primer, berburu mamalia kecil dan burung",
                    "is_endemic": True,
                    "iucn_status": "EN",
                    "status_hama": "tidak",
                    "status": "in_review",
                },
                {
                    "local_name": "Babi Berjanggut",
                    "scientific_name": "Sus barbatus",
                    "family": "Suidae",
                    "genus": "Sus",
                    "ordo": "Artiodactyla",
                    "description": "Babi liar khas Borneo dengan jenggot putih di pipi",
                    "morphology": "Babi berukuran sedang, bulu abu-abu kecoklatan, jenggot putih khas",
                    "habitat_sumber_makanan": "Hutan dan semak belukar, omnivora memakan buah, akar, dan invertebrata",
                    "is_endemic": False,
                    "iucn_status": "VU",
                    "status_hama": "ya",
                    "tingkat_hama": "sedang",
                    "status": "approved",
                },
            ]
            
            fauna_count = 0
            for fauna_info in fauna_data:
                fauna = Fauna(
                    park_id=park.id,
                    **fauna_info,
                    submitted_by=regional_admin.id,
                    submitted_at=datetime.now() if fauna_info["status"] != "draft" else None,
                    approved_at=datetime.now() if fauna_info["status"] == "approved" else None,
                    approved_by=1 if fauna_info["status"] == "approved" else None,
                )
                db.add(fauna)
                fauna_count += 1
                print(f"  ✅ Added fauna: {fauna_info['local_name']} ({fauna_info['scientific_name']})")
            
            print()
            print("-" * 60)
            print("  SEEDING ACTIVITIES DATA")
            print("-" * 60)
            
            # Activities data
            activities_data = [
                {
                    "title": "Penanaman 1000 Pohon Ulin",
                    "description": "Kegiatan penanaman pohon ulin untuk rehabilitasi hutan yang telah rusak. Melibatkan masyarakat sekitar dan pelajar.",
                    "activity_date": date(2025, 10, 15),
                    "location": "Zona Rehabilitasi, Taman Kehati Mahakam",
                    "status": "approved",
                },
                {
                    "title": "Monitoring Populasi Orangutan",
                    "description": "Survey dan monitoring populasi orangutan di area konservasi menggunakan kamera trap dan observasi langsung.",
                    "activity_date": date(2025, 10, 20),
                    "location": "Zona Inti, Taman Kehati Mahakam",
                    "status": "approved",
                },
                {
                    "title": "Edukasi Konservasi untuk Pelajar",
                    "description": "Program edukasi lingkungan untuk pelajar SMP dan SMA tentang pentingnya konservasi biodiversitas Borneo.",
                    "activity_date": date(2025, 11, 5),
                    "location": "Pusat Informasi Taman",
                    "status": "in_review",
                },
                {
                    "title": "Patroli Anti-Perburuan Liar",
                    "description": "Patroli rutin bersama ranger untuk mencegah perburuan liar dan penebangan ilegal di area konservasi.",
                    "activity_date": date(2025, 11, 10),
                    "location": "Zona Penyangga",
                    "status": "draft",
                },
            ]
            
            activity_count = 0
            for activity_info in activities_data:
                activity = Activity(
                    park_id=park.id,
                    **activity_info,
                    created_by=regional_admin.id,
                    submitted_at=datetime.now() if activity_info["status"] != "draft" else None,
                    approved_at=datetime.now() if activity_info["status"] == "approved" else None,
                    approved_by=1 if activity_info["status"] == "approved" else None,
                )
                db.add(activity)
                activity_count += 1
                print(f"  ✅ Added activity: {activity_info['title']}")
            
            # Commit all changes
            await db.commit()
            
            print()
            print("=" * 60)
            print("  SEEDING COMPLETED!")
            print("=" * 60)
            print()
            print(f"✅ Created/Updated 1 Park")
            print(f"✅ Created {flora_count} Flora entries")
            print(f"✅ Created {fauna_count} Fauna entries")
            print(f"✅ Created {activity_count} Activities")
            print()
            print("Summary:")
            print(f"  Park: {park.name} (ID: {park.id})")
            print(f"  Region: KALTIM (ID: 23)")
            print(f"  Submitted by: {regional_admin.email} (ID: {regional_admin.id})")
            print()
            print("Status Distribution:")
            print("  Flora:")
            print("    - Approved: 4")
            print("    - In Review: 1")
            print("  Fauna:")
            print("    - Approved: 4")
            print("    - In Review: 1")
            print("  Activities:")
            print("    - Approved: 2")
            print("    - In Review: 1")
            print("    - Draft: 1")
            print()
            
        except Exception as e:
            print(f"❌ Error seeding data: {e}")
            import traceback
            traceback.print_exc()
            await db.rollback()


if __name__ == "__main__":
    print()
    asyncio.run(seed_demo_data())
    print("=" * 60)
    print("  Done! You can now test with real data.")
    print("=" * 60)
    print()

