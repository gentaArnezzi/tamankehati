# Fix Image Upload URL Issue - Deployment Guide

## Problem

Uploaded images for parks and flora were not showing in preview, approval, and public pages because backend was falling back to Render URLs instead of using server URL.

## Solution

Backend code has been updated to:
1. Remove `RENDER_EXTERNAL_URL` fallback
2. Use consistent priority order: `BASE_URL` > `API_BASE_URL` > `BACKEND_URL` > request URL
3. Return relative paths if no env vars are set (frontend will handle it)

## Required Environment Variables

### On Server (`.env` file)

**Location:** `~/dasmap_prod/apps/tamankehati/.env`

**Required variables for image URLs:**

```bash
# Base URL for image serving (highest priority)
BASE_URL=http://38.47.93.167:8080

# Alternative: If using domain
# BASE_URL=https://tamankehati.dasmap.co.id

# API Base URL (fallback)
API_BASE_URL=http://38.47.93.167:8080

# Backend URL (fallback)
BACKEND_URL=http://38.47.93.167:8080
```

**Note:** Priority order is `BASE_URL` > `API_BASE_URL` > `BACKEND_URL` > request URL

### Frontend Environment Variables

**Location:** `apps/frontend/.env.production` or build-time env vars

```bash
NEXT_PUBLIC_API_URL=http://38.47.93.167:8080
# OR if using domain:
# NEXT_PUBLIC_API_URL=https://tamankehati.dasmap.co.id
```

## Deployment Steps

### Step 1: Update Server Environment Variables

SSH into server and update `.env` file:

```bash
ssh ubuntu@38.47.93.167
cd ~/dasmap_prod/apps/tamankehati
nano .env
```

Add or update these variables:
```bash
BASE_URL=http://38.47.93.167:8080
API_BASE_URL=http://38.47.93.167:8080
BACKEND_URL=http://38.47.93.167:8080
```

### Step 2: Build New Docker Image

**On local machine or CI/CD:**

```bash
# Set environment variables
export DOCKER_USERNAME=arnezzi
export IMAGE_TAG=v1.0.6

# Build and push backend image
cd apps/backend
docker build -t ${DOCKER_USERNAME}/tamankehati-backend:${IMAGE_TAG} .
docker push ${DOCKER_USERNAME}/tamankehati-backend:${IMAGE_TAG}
```

**Or use build script:**
```bash
./scripts/build-and-push-images.sh
```

### Step 3: Update Server Deployment

**On server:**

```bash
# Pull new image
docker compose -f docker-compose.pull.no-nginx.yml pull backend

# Restart backend with new image
docker compose -f docker-compose.pull.no-nginx.yml up -d backend

# Check logs
docker compose -f docker-compose.pull.no-nginx.yml logs -f backend
```

### Step 4: Verify Deployment

1. **Test image upload:**
   ```bash
   curl -X POST http://38.47.93.167:8080/api/v1/upload/gallery-image \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "file=@test-image.jpg"
   ```

2. **Check response URL:**
   - Should return URL with `http://38.47.93.167:8080/uploads/...`
   - Should NOT contain Render URL

3. **Test in frontend:**
   - Upload park image → Check preview
   - Upload flora image → Check preview
   - View in approval page → Images should load
   - View in public page → Images should load

## Code Changes

### Files Modified

1. **apps/backend/api/v1/routes/upload.py**
   - Removed `RENDER_EXTERNAL_URL` fallback from `get_base_url()`
   - Updated priority order

2. **apps/backend/api/v1/public/flora.py**
   - Removed `RENDER_EXTERNAL_URL` fallback from `_build_image_url()`
   - Updated priority order to match upload.py

3. **apps/backend/api/v1/public/fauna.py**
   - Removed `RENDER_EXTERNAL_URL` fallback from `_build_image_url()`
   - Updated priority order to match upload.py

### Priority Order (All Files)

1. `BASE_URL` (highest priority)
2. `API_BASE_URL`
3. `BACKEND_URL`
4. Request URL (extracted from request object)
5. Relative path (no fallback to Render)

## Troubleshooting

### Images Still Not Showing

1. **Check backend logs:**
   ```bash
   docker compose logs backend | grep "WARNING: No BASE_URL"
   ```

2. **Verify environment variables:**
   ```bash
   docker compose exec backend env | grep BASE_URL
   docker compose exec backend env | grep BACKEND_URL
   ```

3. **Check if images are being uploaded:**
   ```bash
   docker compose exec backend ls -la /app/uploads
   ```

4. **Test image URL directly:**
   ```bash
   curl -I http://38.47.93.167:8080/uploads/FILENAME.jpg
   ```

### Images Still Using Render URLs

1. **Check database for old Render URLs:**
   ```sql
   SELECT gambar_utama FROM parks WHERE gambar_utama LIKE '%render.com%';
   SELECT gambar_utama FROM flora WHERE gambar_utama LIKE '%render.com%';
   ```

2. **Run migration script** (if created) to update old URLs

3. **Verify backend is using new code:**
   ```bash
   docker compose exec backend grep -r "RENDER_EXTERNAL_URL" /app/api/v1/routes/upload.py
   # Should return nothing (no matches)
   ```

## Migration Script (Optional)

If existing data has Render URLs, create and run a migration script:

```python
# scripts/migrate_render_urls.py
import os
from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

# Replace Render URLs with relative paths
with engine.connect() as conn:
    # Update parks
    conn.execute(text("""
        UPDATE parks 
        SET gambar_utama = REPLACE(gambar_utama, 'https://tamankehati-backend-pxnu.onrender.com', '')
        WHERE gambar_utama LIKE '%render.com%'
    """))
    
    # Update flora
    conn.execute(text("""
        UPDATE flora 
        SET gambar_utama = REPLACE(gambar_utama, 'https://tamankehati-backend-pxnu.onrender.com', ''),
            leaf_image_url = REPLACE(leaf_image_url, 'https://tamankehati-backend-pxnu.onrender.com', ''),
            stem_image_url = REPLACE(stem_image_url, 'https://tamankehati-backend-pxnu.onrender.com', ''),
            flower_image_url = REPLACE(flower_image_url, 'https://tamankehati-backend-pxnu.onrender.com', ''),
            fruit_image_url = REPLACE(fruit_image_url, 'https://tamankehati-backend-pxnu.onrender.com', '')
        WHERE gambar_utama LIKE '%render.com%' 
           OR leaf_image_url LIKE '%render.com%'
           OR stem_image_url LIKE '%render.com%'
           OR flower_image_url LIKE '%render.com%'
           OR fruit_image_url LIKE '%render.com%'
    """))
    
    # Update fauna
    conn.execute(text("""
        UPDATE fauna 
        SET gambar_utama = REPLACE(gambar_utama, 'https://tamankehati-backend-pxnu.onrender.com', '')
        WHERE gambar_utama LIKE '%render.com%'
    """))
    
    # Update galleries
    conn.execute(text("""
        UPDATE galleries 
        SET image_url = REPLACE(image_url, 'https://tamankehati-backend-pxnu.onrender.com', '')
        WHERE image_url LIKE '%render.com%'
    """))
    
    conn.commit()
```

## Summary

- ✅ Removed Render URL fallback from backend code
- ✅ Updated environment variable priority order
- ✅ Consistent URL building logic across all files
- ✅ Frontend handles relative URLs correctly
- ⚠️ **Action Required:** Update server `.env` file with `BASE_URL`
- ⚠️ **Action Required:** Build and push new Docker image (v1.0.6)
- ⚠️ **Action Required:** Deploy updated backend to server

