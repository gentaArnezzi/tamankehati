import asyncio
import sys
import os
from sqlalchemy import select, text

# Add the parent directory to Python path to import modules properly
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from core.database.engine import engine, SessionLocal
from core.database.base import Base
from domains.articles.models import Article, ArticleStatus
from domains.galleries.models import Gallery
# Zone disabled - from domains.zones.models import Zone
from domains.flora.models import Flora
from domains.fauna.models import Fauna
from users.models import User, UserRole
from geoalchemy2 import functions as ST

ZONES = [
    {"name": "Taman Kehati Kaltim A", "region_code": "KALTIM",
     "wkt": "SRID=4326;POLYGON((116.0 -0.5,116.5 -0.5,116.5 -0.2,116.0 -0.2,116.0 -0.5))"},
    {"name": "Taman Kehati Sumut A", "region_code": "SUMUT",
     "wkt": "SRID=4326;POLYGON((98.5 3.2,99.1 3.2,99.1 3.7,98.5 3.7,98.5 3.2))"},
]

FLORA = [
    # KALTIM
    {"local_name":"Ulin","scientific_name":"Eusideroxylon zwageri","family":"Lauraceae","genus":"Eusideroxylon",
     "description":"Kayu besi Kalimantan, endemik regional","zone_code":"KALTIM","is_endemic": True,"iucn_status":"VU"},
    {"local_name":"Meranti","scientific_name":"Shorea spp.","family":"Dipterocarpaceae","genus":"Shorea",
     "description":"Pohon keras tropis, sebaran luas","zone_code":"KALTIM","is_endemic": False,"iucn_status":"EN"},
    # SUMUT
    {"local_name":"Rafflesia","scientific_name":"Rafflesia arnoldii","family":"Rafflesiaceae","genus":"Rafflesia",
     "description":"Bunga terbesar di dunia","zone_code":"SUMUT","is_endemic": True,"iucn_status":"EN"},
]

FAUNA = [
    # KALTIM
    {"local_name":"Orangutan Kalimantan","scientific_name":"Pongo pygmaeus","family":"Hominidae","genus":"Pongo",
     "description":"Primata besar Kalimantan","zone_code":"KALTIM","is_endemic": True,"iucn_status":"CR"},
    {"local_name":"Rangkong gading","scientific_name":"Rhinoplax vigil","family":"Bucerotidae","genus":"Rhinoplax",
     "description":"Burung ikonik dengan balung padat","zone_code":"KALTIM","is_endemic": False,"iucn_status":"CR"},
    # SUMUT
    {"local_name":"Harimau Sumatra","scientific_name":"Panthera tigris sumatrae","family":"Felidae","genus":"Panthera",
     "description":"Subspesies harimau endemik Sumatra","zone_code":"SUMUT","is_endemic": True,"iucn_status":"CR"},
]

async def seed_demo():
    print("🌱 Starting database seeding...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print("✅ Tables created/verified")

    async with SessionLocal() as session:
        print("📋 Seeding users...")
        # Seed initial users
        users_data = [
            # Super admin
            {"email": "admin@kehati.org", "display_name": "Super Admin", "role": UserRole.super_admin, "region_code": None, "password": "password"},
            # Regional admin KALTIM
            {"email": "kaltim.admin@kehati.org", "display_name": "Admin Kaltim", "role": UserRole.regional_admin, "region_code": "KALTIM", "password": "password"},
            # Regional admin SUMUT
            {"email": "sumut.admin@kehati.org", "display_name": "Admin Sumut", "role": UserRole.regional_admin, "region_code": "SUMUT", "password": "password"},
        ]

        for user_data in users_data:
            # Check if user already exists
            existing = (await session.execute(select(User).where(User.email == user_data["email"]))).scalar_one_or_none()
            if not existing:
                user = User(
                    email=user_data["email"],
                    display_name=user_data["display_name"],
                    role=user_data["role"],
                    region_code=user_data["region_code"],
                    is_active=True,
                )
                user.set_password(user_data["password"])
                session.add(user)
                print(f"  ➕ Created user: {user_data['email']} ({user_data['role'].value})")
            else:
                print(f"  ⏭️  User already exists: {user_data['email']}")

        await session.commit()
        print("✅ Users seeded successfully")

        # Upsert zones
        existing = { (z.name, z.region_code): z for z in (await session.execute(select(Zone))).scalars().all() }
        code_to_id = {}
        for z in ZONES:
            key = (z["name"], z["region_code"])
            if key in existing:
                zone = existing[key]
            else:
                # Extract just the geometry part from WKT (remove SRID prefix)
                wkt_geom = z["wkt"].replace("SRID=4326;", "")
                geom = ST.ST_SetSRID(ST.ST_GeomFromText(text(wkt_geom)), 4326)
                zone = Zone(name=z["name"], region_code=z["region_code"], geom=geom)
                session.add(zone)
                await session.flush()
            code_to_id[z["region_code"]] = zone.id
        await session.commit()

        # Helper to upsert flora/fauna by scientific_name within region
        async def upsert_species(Model, rows):
            for r in rows:
                zone_id = code_to_id[r["zone_code"]]
                q = select(Model).where(Model.scientific_name == r["scientific_name"], Model.zone_id == zone_id)
                obj = (await session.execute(q)).scalars().first()
                payload = dict(
                    local_name=r["local_name"], scientific_name=r["scientific_name"],
                    family=r["family"], genus=r["genus"],
                    description=r["description"], zone_id=zone_id,
                    is_endemic=r.get("is_endemic", False), iucn_status=r.get("iucn_status"),
                )
                if obj:
                    for k,v in payload.items():
                        setattr(obj, k, v)
                else:
                    session.add(Model(**payload))
            await session.commit()

        await upsert_species(Flora, FLORA)
        await upsert_species(Fauna, FAUNA)

        print("📋 Seeding articles...")
        # Seed sample articles
        articles_data = [
            # KALTIM articles
            {"title": "Konservasi Ulin di Kalimantan Timur", "content": "Pohon ulin (Eusideroxylon zwageri) merupakan salah satu jenis pohon endemik Kalimantan yang memiliki nilai ekonomi tinggi. Program konservasi telah dilakukan untuk melindungi habitat alami pohon ini dari eksploitasi berlebihan.", "region_code": "KALTIM", "author_email": "kaltim.admin@kehati.org"},
            {"title": "Keanekaragaman Hayati di Taman Kehati Kaltim", "content": "Taman Kehati Kaltim memiliki keanekaragaman hayati yang sangat tinggi dengan berbagai spesies flora dan fauna endemik. Upaya pelestarian terus dilakukan untuk menjaga keseimbangan ekosistem.", "region_code": "KALTIM", "author_email": "kaltim.admin@kehati.org"},
            # SUMUT articles
            {"title": "Rafflesia Arnoldii: Bunga Raksasa Sumatra Utara", "content": "Rafflesia arnoldii adalah bunga terbesar di dunia yang hanya dapat ditemukan di hutan Sumatra. Spesies ini menghadapi ancaman serius akibat perusakan habitat dan perburuan liar.", "region_code": "SUMUT", "author_email": "sumut.admin@kehati.org"},
            {"title": "Pelestarian Harimau Sumatra", "content": "Harimau Sumatra (Panthera tigris sumatrae) adalah subspesies harimau yang hanya tersisa di pulau Sumatra. Populasi mereka terus menurun akibat konflik dengan manusia dan hilangnya habitat.", "region_code": "SUMUT", "author_email": "sumut.admin@kehati.org"},
        ]

        # Get author IDs for articles
        author_emails = [a["author_email"] for a in articles_data]
        authors_query = select(User).where(User.email.in_(author_emails))
        authors = {u.email: u for u in (await session.execute(authors_query)).scalars().all()}

        for article_data in articles_data:
            # Check if article already exists
            existing = (await session.execute(
                select(Article).where(Article.title == article_data["title"])
            )).scalar_one_or_none()

            if not existing:
                author = authors.get(article_data["author_email"])
                if author:
                    article = Article(
                        title=article_data["title"],
                        content=article_data["content"],
                        region_code=article_data["region_code"],
                        author_id=author.id,
                        status=ArticleStatus.approved.value
                    )
                    session.add(article)
                    print(f"  ➕ Created article: {article_data['title']}")

        await session.commit()
        print("✅ Articles seeded successfully")

        print("📋 Seeding galleries...")
        # Seed sample galleries
        galleries_data = [
            # KALTIM galleries
            {"title": "Keanekaragaman Flora Kaltim", "description": "Koleksi foto berbagai jenis tumbuhan endemik Kalimantan Timur", "image_url": "https://picsum.photos/800/600?random=1", "region_code": "KALTIM", "author_email": "kaltim.admin@kehati.org"},
            {"title": "Satwa Liar Kalimantan", "description": "Dokumentasi berbagai jenis fauna yang dilindungi di habitat alami", "image_url": "https://picsum.photos/800/600?random=2", "region_code": "KALTIM", "author_email": "kaltim.admin@kehati.org"},
            # SUMUT galleries
            {"title": "Bunga Rafflesia", "description": "Dokumentasi bunga rafflesia dalam berbagai tahap perkembangan", "image_url": "https://picsum.photos/800/600?random=3", "region_code": "SUMUT", "author_email": "sumut.admin@kehati.org"},
            {"title": "Hutan Sumatra", "description": "Keindahan hutan tropis Sumatra Utara yang menjadi habitat berbagai spesies", "image_url": "https://picsum.photos/800/600?random=4", "region_code": "SUMUT", "author_email": "sumut.admin@kehati.org"},
        ]

        for gallery_data in galleries_data:
            # Check if gallery already exists
            existing = (await session.execute(
                select(Gallery).where(Gallery.title == gallery_data["title"])
            )).scalar_one_or_none()

            if not existing:
                author = authors.get(gallery_data["author_email"])
                if author:
                    gallery = Gallery(
                        title=gallery_data["title"],
                        description=gallery_data["description"],
                        image_url=gallery_data["image_url"],
                        region_code=gallery_data["region_code"],
                        author_id=author.id,
                        status="approved"
                    )
                    session.add(gallery)
                    print(f"  ➕ Created gallery: {gallery_data['title']}")

        await session.commit()
        print("✅ Galleries seeded successfully")

    print("✅ Seed demo data completed. Users, Zones, Flora, Fauna, Articles, and Galleries inserted/updated.")

if __name__ == "__main__":
    asyncio.run(seed_demo())
