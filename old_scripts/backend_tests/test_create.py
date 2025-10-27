import os
os.environ['DATABASE_URL'] = 'postgresql+asyncpg://kehati_user:kehati_pass@localhost:5432/kehati'

# Import domains to ensure all models are registered
import domains

import asyncio
from core.database.session import get_session
from domains.announcements.models import Announcement, AnnouncementStatus, AnnouncementType

async def test_create():
    try:
        async for db in get_session():
            announcement = Announcement(
                title="Test",
                content="Test content",
                type=AnnouncementType.announcement,
                priority=0,
                is_featured=False,
                is_pinned=False,
                author_id=1,
                status=AnnouncementStatus.draft
            )
            db.add(announcement)
            await db.commit()
            await db.refresh(announcement)
            print(f"Success! Created announcement with ID: {announcement.id}")
            break
    except Exception as e:
        print(f"Error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()

asyncio.run(test_create())
