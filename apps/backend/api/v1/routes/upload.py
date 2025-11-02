from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import List
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from core.database.session import get_session
from users.models import User, UserRole
from api.v1.permissions.rbac import current_user
from api.v1.permissions.policies import require_roles
import os
import uuid
from datetime import datetime
from pathlib import Path
import aiofiles

router = APIRouter(prefix="/upload")

# Configuration
# Use UPLOAD_DIRECTORY to match main.py static files mount
UPLOAD_DIR = os.getenv("UPLOAD_DIRECTORY") or os.getenv("UPLOAD_DIR") or os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "uploads")
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".tiff"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)
print(f"UPLOAD_DIR: {UPLOAD_DIR}")
print(f"UPLOAD_DIR exists: {os.path.exists(UPLOAD_DIR)}")

def is_allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS

def generate_filename(original_filename: str) -> str:
    """Generate unique filename"""
    ext = Path(original_filename).suffix.lower()
    unique_id = str(uuid.uuid4())
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return f"{timestamp}_{unique_id}{ext}"

@router.post("/gallery-image")
async def upload_gallery_image(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user)
):
    """
    Upload image file for gallery
    """
    # Check user permissions
    allowed_roles = ["regional_admin", "super_admin"]
    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Insufficient permissions to upload files. Your role: {user.role}"
        )
    
    # Validate file
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided"
        )
    
    if not is_allowed_file(file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Check file size first by checking content-length header
    content_length = file.size if hasattr(file, 'size') else None
    if content_length and content_length > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    # Generate unique filename
    filename = generate_filename(file.filename)
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    print(f"Uploading file to: {file_path}")
    print(f"UPLOAD_DIR: {UPLOAD_DIR}")
    print(f"UPLOAD_DIR exists: {os.path.exists(UPLOAD_DIR)}")
    
    try:
        # Save file using streaming to avoid loading entire file into memory
        total_size = 0
        async with aiofiles.open(file_path, 'wb') as f:
            # Stream chunks instead of reading entire file at once
            while True:
                chunk = await file.read(8192)  # Read 8KB chunks
                if not chunk:
                    break
                total_size += len(chunk)
                # Check size during streaming
                if total_size > MAX_FILE_SIZE:
                    # Clean up partial file
                    if os.path.exists(file_path):
                        os.remove(file_path)
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
                    )
                await f.write(chunk)
        
        print(f"File saved successfully to: {file_path}")
        print(f"File exists after save: {os.path.exists(file_path)}")
        
        # Generate full URL for frontend to access
        # In production, this would be your CDN/storage URL
        base_url = os.getenv("BASE_URL", "http://localhost:8000")
        file_url = f"{base_url}/uploads/{filename}"
        
        return JSONResponse(content={
            "success": True,
            "filename": filename,
            "url": file_url,
            "size": total_size,
            "message": "File uploaded successfully"
        })
        
    except Exception as e:
        # Clean up file if upload failed
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )

@router.delete("/gallery-image/{filename}")
async def delete_gallery_image(
    filename: str,
    user: User = Depends(current_user)
):
    """
    Delete uploaded image file
    """
    # Check user permissions
    if user.role not in [UserRole.regional_admin, UserRole.super_admin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to delete files"
        )
    
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    try:
        os.remove(file_path)
        return JSONResponse(content={
            "success": True,
            "message": "File deleted successfully"
        })
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete file: {str(e)}"
        )

@router.post("/multiple-gallery-images")
async def upload_multiple_gallery_images(
    files: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user)
):
    """
    Upload multiple image files for gallery
    """
    # Check user permissions
    allowed_roles = ["regional_admin", "super_admin"]
    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Insufficient permissions to upload files. Your role: {user.role}"
        )
    
    # Validate number of files
    if len(files) > 10:  # Max 10 files at once
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 10 files allowed per upload"
        )
    
    if len(files) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No files provided"
        )
    
    uploaded_files = []
    failed_files = []
    
    for file in files:
        try:
            # Validate file
            if not file.filename:
                failed_files.append({
                    "filename": "unknown",
                    "error": "No filename provided"
                })
                continue
            
            if not is_allowed_file(file.filename):
                failed_files.append({
                    "filename": file.filename,
                    "error": f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
                })
                continue
            
            # Check file size first by checking content-length header
            content_length = file.size if hasattr(file, 'size') else None
            if content_length and content_length > MAX_FILE_SIZE:
                failed_files.append({
                    "filename": file.filename,
                    "error": f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
                })
                continue
            
            # Generate unique filename
            filename = generate_filename(file.filename)
            file_path = os.path.join(UPLOAD_DIR, filename)
            
            # Save file using streaming to avoid loading entire file into memory
            total_size = 0
            try:
                async with aiofiles.open(file_path, 'wb') as f:
                    # Stream chunks instead of reading entire file at once
                    while True:
                        chunk = await file.read(8192)  # Read 8KB chunks
                        if not chunk:
                            break
                        total_size += len(chunk)
                        # Check size during streaming
                        if total_size > MAX_FILE_SIZE:
                            # Clean up partial file
                            if os.path.exists(file_path):
                                os.remove(file_path)
                            raise ValueError(f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB")
                        await f.write(chunk)
                
                # Generate URL
                file_url = f"/uploads/{filename}"
                
                uploaded_files.append({
                    "filename": filename,
                    "original_name": file.filename,
                    "url": file_url,
                    "size": total_size
                })
            except ValueError as ve:
                failed_files.append({
                    "filename": file.filename,
                    "error": str(ve)
                })
                continue
            except Exception as e:
                failed_files.append({
                    "filename": file.filename,
                    "error": str(e)
                })
                # Clean up file if upload failed
                if 'file_path' in locals() and os.path.exists(file_path):
                    os.remove(file_path)
                continue
        except Exception as e:
            # Catch any other unexpected exceptions from outer try block
            failed_files.append({
                "filename": file.filename if hasattr(file, 'filename') and file.filename else "unknown",
                "error": str(e)
            })
            continue
    
    return JSONResponse(content={
        "success": len(uploaded_files) > 0,
        "uploaded_files": uploaded_files,
        "failed_files": failed_files,
        "total_uploaded": len(uploaded_files),
        "total_failed": len(failed_files),
        "message": f"Uploaded {len(uploaded_files)} files successfully"
    })

@router.post("/activity-images")
async def upload_activity_images(
    files: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_session),
    user: User = Depends(current_user)
):
    """
    Upload multiple image files for activities
    """
    # Check user permissions - allow all authenticated users to upload activity images
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    # Validate number of files
    if len(files) > 10:  # Max 10 files at once
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 10 files allowed per upload"
        )
    
    if len(files) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No files provided"
        )
    
    uploaded_files = []
    failed_files = []
    
    for file in files:
        try:
            # Validate file
            if not file.filename:
                failed_files.append({
                    "filename": "unknown",
                    "error": "No filename provided"
                })
                continue
            
            if not is_allowed_file(file.filename):
                failed_files.append({
                    "filename": file.filename,
                    "error": f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
                })
                continue
            
            # Check file size first by checking content-length header
            content_length = file.size if hasattr(file, 'size') else None
            if content_length and content_length > MAX_FILE_SIZE:
                failed_files.append({
                    "filename": file.filename,
                    "error": f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
                })
                continue
            
            # Generate unique filename
            filename = generate_filename(file.filename)
            file_path = os.path.join(UPLOAD_DIR, filename)
            
            # Save file using streaming to avoid loading entire file into memory
            total_size = 0
            try:
                async with aiofiles.open(file_path, 'wb') as f:
                    # Stream chunks instead of reading entire file at once
                    while True:
                        chunk = await file.read(8192)  # Read 8KB chunks
                        if not chunk:
                            break
                        total_size += len(chunk)
                        # Check size during streaming
                        if total_size > MAX_FILE_SIZE:
                            # Clean up partial file
                            if os.path.exists(file_path):
                                os.remove(file_path)
                            raise ValueError(f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB")
                        await f.write(chunk)
                
                # Generate URL
                file_url = f"/uploads/{filename}"
                
                uploaded_files.append({
                    "filename": filename,
                    "original_name": file.filename,
                    "url": file_url,
                    "size": total_size
                })
            except ValueError as ve:
                failed_files.append({
                    "filename": file.filename,
                    "error": str(ve)
                })
                continue
            except Exception as e:
                failed_files.append({
                    "filename": file.filename,
                    "error": str(e)
                })
                # Clean up file if upload failed
                if 'file_path' in locals() and os.path.exists(file_path):
                    os.remove(file_path)
                continue
        except Exception as e:
            # Catch any other unexpected exceptions from outer try block
            failed_files.append({
                "filename": file.filename if hasattr(file, 'filename') and file.filename else "unknown",
                "error": str(e)
            })
            continue
    
    return JSONResponse(content={
        "success": len(uploaded_files) > 0,
        "uploaded_files": uploaded_files,
        "failed_files": failed_files,
        "total_uploaded": len(uploaded_files),
        "total_failed": len(failed_files),
        "message": f"Uploaded {len(uploaded_files)} files successfully"
    })
