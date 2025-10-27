#!/usr/bin/env python3
"""
Script untuk memigrasikan data region dari kolom wilayah lama ke relasi region baru.
"""
import asyncio
import os
import sys
from pathlib import Path
from sqlalchemy import select, update, Table, Column, String, Integer, MetaData
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def migrate_regions():
    print("Starting region migration...")
    
    # Get database URL from environment
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("Error: DATABASE_URL environment variable is not set")
        return
    
    # Ensure asyncpg is used
    if not database_url.startswith("postgresql+asyncpg"):
        database_url = database_url.replace("postgresql://", "postgresql+asyncpg://")
    
    print(f"Connecting to database...")
    engine = create_async_engine(database_url, echo=True)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    # Define table metadata
    metadata = MetaData()
    
    # Define tables without ORM
    regions = Table(
        'regions', metadata,
        Column('id', Integer, primary_key=True),
        Column('name', String)
    )
    
    parks = Table(
        'parks', metadata,
        Column('id', Integer, primary_key=True),
        Column('name', String),
        Column('slug', String),
        Column('region_id', Integer)
    )
    
    try:
        async with async_session() as session:
            # Example mapping - update this with your actual data
            regions_mapping = {
                # Format: 'park_slug': 'region_name'
                'taman-nasional-bromo': 'Jawa Timur',
                'taman-nasional-gunung-gede': 'Jawa Barat',
                # Add more mappings as needed
            }
            
            if not regions_mapping:
                print("No region mapping provided. Listing all parks...")
                result = await session.execute(select(parks.c.slug))
                parks_list = result.scalars().all()
                
                if not parks_list:
                    print("No parks found in the database.")
                    return
                    
                print(f"Found {len(parks_list)} parks. Please update the regions_mapping dictionary.")
                for park_slug in parks_list:
                    print(f"'{park_slug}': 'Region Name',")
                return
            
            updated_count = 0
            for park_slug, region_name in regions_mapping.items():
                # Find region
                region_result = await session.execute(
                    select(regions).where(regions.c.name == region_name)
                )
                region = region_result.first()
                
                if not region:
                    print(f"Warning: Region '{region_name}' not found. Skipping...")
                    continue
                
                # Update park
                result = await session.execute(
                    update(parks)
                    .where(parks.c.slug == park_slug)
                    .values(region_id=region.id)
                )
                
                if result.rowcount > 0:
                    updated_count += result.rowcount
                    print(f"Updated {park_slug} to region {region_name} (ID: {region.id})")
                else:
                    print(f"Warning: Park with slug '{park_slug}' not found")
            
            await session.commit()
            print(f"\nMigration completed. Updated {updated_count} parks.")
            
    except Exception as e:
        print(f"Error during migration: {str(e)}")
        if 'session' in locals():
            await session.rollback()
        raise
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(migrate_regions())