#!/usr/bin/env python3
"""
Script to approve all draft gallery images
Run this to approve existing gallery images that were created before auto-approve feature
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from core.config import settings
from domains.galleries.models import Gallery, GalleryStatus


async def get_db():
    """Create database session"""
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        yield session
    await engine.dispose()


async def approve_all_draft_galleries():
    """Approve all draft galleries"""
    async for db in get_db():
        # Get all draft galleries
        stmt = select(Gallery).where(Gallery.status == GalleryStatus.draft.value)
        result = await db.execute(stmt)
        galleries = result.scalars().all()
        
        if not galleries:
            print("✅ No draft galleries found. All good!")
            return
        
        print(f"Found {len(galleries)} draft galleries")
        print("=" * 60)
        
        for gallery in galleries:
            print(f"\nGallery ID: {gallery.id}")
            print(f"  Title: {gallery.title}")
            print(f"  Entity: {gallery.entity_type} ID {gallery.entity_id}")
            print(f"  Status: {gallery.status} -> approved")
            
            gallery.status = GalleryStatus.approved.value
        
        await db.commit()
        print("\n" + "=" * 60)
        print(f"✅ Successfully approved {len(galleries)} galleries!")


async def approve_galleries_by_entity(entity_type: str, entity_id: int):
    """Approve galleries for specific entity"""
    async for db in get_db():
        stmt = select(Gallery).where(
            Gallery.entity_type == entity_type,
            Gallery.entity_id == entity_id,
            Gallery.status == GalleryStatus.draft.value
        )
        result = await db.execute(stmt)
        galleries = result.scalars().all()
        
        if not galleries:
            print(f"✅ No draft galleries found for {entity_type} #{entity_id}")
            return
        
        print(f"Found {len(galleries)} draft galleries for {entity_type} #{entity_id}")
        print("=" * 60)
        
        for gallery in galleries:
            print(f"\nGallery ID: {gallery.id}")
            print(f"  Title: {gallery.title}")
            print(f"  Status: {gallery.status} -> approved")
            
            gallery.status = GalleryStatus.approved.value
        
        await db.commit()
        print("\n" + "=" * 60)
        print(f"✅ Successfully approved {len(galleries)} galleries!")


async def list_all_galleries():
    """List all galleries with their status"""
    async for db in get_db():
        stmt = select(Gallery).order_by(Gallery.created_at.desc())
        result = await db.execute(stmt)
        galleries = result.scalars().all()
        
        if not galleries:
            print("No galleries found in database")
            return
        
        print(f"\nTotal galleries: {len(galleries)}")
        print("=" * 80)
        
        status_counts = {}
        for gallery in galleries:
            status_counts[gallery.status] = status_counts.get(gallery.status, 0) + 1
            
            print(f"\nID: {gallery.id:3d} | {gallery.entity_type:6s} #{gallery.entity_id:3d} | {gallery.status:10s}")
            print(f"     Title: {gallery.title[:60]}")
            if gallery.description:
                print(f"     Desc:  {gallery.description[:60]}")
        
        print("\n" + "=" * 80)
        print("Status Summary:")
        for status, count in status_counts.items():
            print(f"  {status}: {count}")


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Manage gallery approvals')
    parser.add_argument('action', choices=['approve-all', 'approve-entity', 'list'],
                      help='Action to perform')
    parser.add_argument('--entity-type', choices=['flora', 'fauna'],
                      help='Entity type (for approve-entity)')
    parser.add_argument('--entity-id', type=int,
                      help='Entity ID (for approve-entity)')
    
    args = parser.parse_args()
    
    if args.action == 'approve-all':
        print("\n🔍 Approving all draft galleries...")
        asyncio.run(approve_all_draft_galleries())
        
    elif args.action == 'approve-entity':
        if not args.entity_type or not args.entity_id:
            print("Error: --entity-type and --entity-id required for approve-entity")
            sys.exit(1)
        
        print(f"\n🔍 Approving galleries for {args.entity_type} #{args.entity_id}...")
        asyncio.run(approve_galleries_by_entity(args.entity_type, args.entity_id))
        
    elif args.action == 'list':
        print("\n📋 Listing all galleries...")
        asyncio.run(list_all_galleries())


if __name__ == "__main__":
    main()

