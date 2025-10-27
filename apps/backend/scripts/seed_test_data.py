import asyncio
import sys
import os
from datetime import datetime, timezone
from sqlalchemy import select, text

# Add the parent directory to Python path to import modules properly
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from core.database.engine import engine, SessionLocal
from users.models import User, UserRole
# Zone disabled - from domains.zones.models import Zone
from domains.flora.models import Flora, WorkflowStatus as FloraWorkflowStatus
from domains.fauna.models import Fauna, WorkflowStatus as FaunaWorkflowStatus
from users.auth import get_password_hash

async def seed_test_data():
    print("🌱 Starting test data seeding...")
    
    async with SessionLocal() as session:
        # Create test user if not exists
        test_email = "test@example.com"
        user = (await session.execute(
            select(User).where(User.email == test_email)
        )).scalar_one_or_none()
        
        if not user:
            print("👤 Creating test user...")
            user = User(
                email=test_email,
                password_hash=get_password_hash("test123"),
                role=UserRole.user,
                name="Test User",
                is_active=True,
                region_code="TEST"
            )
            session.add(user)
            await session.commit()
            await session.refresh(user)
            print(f"✅ Created test user with ID: {user.id}")
        else:
            print(f"ℹ️ Test user already exists with ID: {user.id}")
        
        # Create test zone if not exists
        zone = (await session.execute(
            select(Zone).where(Zone.name == "Test Zone")
        )).scalar_one_or_none()
        
        if not zone:
            print("🗺️ Creating test zone...")
            zone = Zone(
                name="Test Zone",
                region_code="TEST",
                geometry=text("ST_GeomFromText('POLYGON((0 0, 1 0, 1 1, 0 1, 0 0))', 4326)")
            )
            session.add(zone)
            await session.commit()
            await session.refresh(zone)
            print(f"✅ Created test zone with ID: {zone.id}")
        else:
            print(f"ℹ️ Test zone already exists with ID: {zone.id}")
        
        # Add test flora
        flora_data = [
            {
                "local_name": "Test Flora 1",
                "scientific_name": "Testus plantus",
                "family": "Testaceae",
                "genus": "Testus",
                "description": "Test flora entry 1",
                "is_endemic": True,
                "iucn_status": "EN",
                "status": FloraWorkflowStatus.approved,
                "zone_id": zone.id,
                "submitted_by": user.id,
                "approved_by": user.id,
                "submitted_at": datetime.now(timezone.utc),
                "approved_at": datetime.now(timezone.utc)
            },
            {
                "local_name": "Test Flora 2",
                "scientific_name": "Testus plantus minor",
                "family": "Testaceae",
                "genus": "Testus",
                "description": "Test flora entry 2 in review",
                "is_endemic": False,
                "iucn_status": "VU",
                "status": FloraWorkflowStatus.in_review,
                "zone_id": zone.id,
                "submitted_by": user.id
            }
        ]
        
        for flora_item in flora_data:
            flora = Flora(**flora_item)
            session.add(flora)
        
        # Add test fauna
        fauna_data = [
            {
                "local_name": "Test Fauna 1",
                "scientific_name": "Testus animalis",
                "family": "Testanidae",
                "genus": "Testus",
                "description": "Test fauna entry 1",
                "is_endemic": True,
                "iucn_status": "CR",
                "status": FaunaWorkflowStatus.approved,
                "zone_id": zone.id,
                "submitted_by": user.id,
                "approved_by": user.id,
                "submitted_at": datetime.now(timezone.utc),
                "approved_at": datetime.now(timezone.utc)
            },
            {
                "local_name": "Test Fauna 2",
                "scientific_name": "Testus animalis minor",
                "family": "Testanidae",
                "genus": "Testus",
                "description": "Test fauna entry 2 in review",
                "is_endemic": False,
                "iucn_status": "EN",
                "status": FaunaWorkflowStatus.in_review,
                "zone_id": zone.id,
                "submitted_by": user.id
            }
        ]
        
        for fauna_item in fauna_data:
            fauna = Fauna(**fauna_item)
            session.add(fauna)
        
        await session.commit()
        print("✅ Added test flora and fauna entries")
        
        # Verify counts
        flora_count = (await session.execute(select(Flora))).scalars().count()
        fauna_count = (await session.execute(select(Fauna))).scalars().count()
        
        print(f"\n📊 Database now contains:")
        print(f"- {flora_count} flora entries")
        print(f"- {fauna_count} fauna entries")
        
        return {"status": "success", "flora_count": flora_count, "fauna_count": fauna_count}

if __name__ == "__main__":
    asyncio.run(seed_test_data())
