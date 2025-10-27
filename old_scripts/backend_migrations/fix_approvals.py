#!/usr/bin/env python3
"""
Script to add 'taman' support and remove 'zona' from approvals.py
"""

# Read the file
with open('api/v1/routes/approvals.py', 'r') as f:
    content = f.read()

# 1. Add Park and Region imports
content = content.replace(
    'from domains.zones.models import Zone',
    'from domains.parks.models import Park\nfrom domains.regions.models.region import Region'
)

# 2. Update ApprovalItem entity_type
content = content.replace(
    'entity_type: Literal["flora", "fauna", "zona", "artikel", "galeri"]',
    'entity_type: Literal["flora", "fauna", "artikel", "galeri", "taman"]'
)

# 3. Update function parameter
content = content.replace(
    'entity_type: Optional[Literal["flora", "fauna", "zona", "artikel", "galeri"]] = Query(',
    'entity_type: Optional[Literal["flora", "fauna", "artikel", "galeri", "taman"]] = Query('
)

# 4. Update counts dict
content = content.replace(
    '''    counts: dict[str, int] = {
        "flora": 0,
        "fauna": 0,
        "zona": 0,
        "artikel": 0,
        "galeri": 0,
    }''',
    '''    counts: dict[str, int] = {
        "flora": 0,
        "fauna": 0,
        "artikel": 0,
        "galeri": 0,
        "taman": 0,
    }'''
)

# 5. Update want_ variables
content = content.replace(
    '''    want_flora = entity_type in (None, "flora")
    want_fauna = entity_type in (None, "fauna")
    want_zona = entity_type in (None, "zona")
    want_artikel = entity_type in (None, "artikel")
    want_galeri = entity_type in (None, "galeri")''',
    '''    want_flora = entity_type in (None, "flora")
    want_fauna = entity_type in (None, "fauna")
    want_artikel = entity_type in (None, "artikel")
    want_galeri = entity_type in (None, "galeri")
    want_taman = entity_type in (None, "taman")'''
)

# 6. Remove zona handling
content = content.replace(
    '''    # Zone approval functionality removed since park_zones doesn't have workflow columns
    if want_zona:
        counts["zona"] = 0

    if want_artikel:''',
    '''    # Zone approval functionality removed since park_zones doesn't have workflow columns
    
    if want_artikel:'''
)

# 7. Add taman handling before the final return
taman_code = '''
    # Parks (Taman)
    if want_taman:
        stmt = select(Park).where(Park.status == "draft")
        if user.role == UserRole.regional_admin:
            stmt = stmt.join(Region, Region.id == Park.region_id).where(Region.code == user.region_code)
        
        park_rows = (await db.execute(stmt)).scalars().all()
        counts["taman"] = len(park_rows)
        for park in park_rows:
            records.append(
                ApprovalItem(
                    entity_type="taman",
                    entity_id=park.id,
                    title=park.name or f"Taman #{park.id}",
                    status=park.status,
                    submitted_at=park.created_at,
                    updated_at=park.updated_at,
                    metadata=ApprovalMeta(
                        region_code=None,
                        submitted_by=park.created_by,
                        approved_by=None,
                    ),
                    thumbnail_url=None,
                )
            )
'''

# Find the position before the final return and insert taman code
content = content.replace(
    '    records.sort(key=lambda item: (item.submitted_at or item.updated_at or datetime.min), reverse=True)',
    taman_code + '\n    records.sort(key=lambda item: (item.submitted_at or item.updated_at or datetime.min), reverse=True)'
)

# Write back
with open('api/v1/routes/approvals.py', 'w') as f:
    f.write(content)

print("✅ approvals.py updated successfully!")
print("Changes:")
print("  - Removed 'zona' references")
print("  - Added 'taman' support")
print("  - Added Park and Region imports")

