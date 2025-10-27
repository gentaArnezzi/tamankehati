#!/usr/bin/env python3
"""
Check available API endpoints
"""

import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent / "apps" / "backend"
sys.path.insert(0, str(backend_dir))

from main import app

def check_endpoints():
    """Check all available endpoints"""
    print("🚀 Available API endpoints:")
    print("=" * 60)
    
    # Get all routes
    routes = []
    for route in app.routes:
        if hasattr(route, 'path') and hasattr(route, 'methods'):
            routes.append((route.path, list(route.methods)))
        elif hasattr(route, 'path'):
            routes.append((route.path, ['GET']))
    
    # Sort routes
    routes.sort()
    
    # Group by category
    public_routes = []
    admin_routes = []
    regional_routes = []
    auth_routes = []
    other_routes = []
    
    for path, methods in routes:
        methods_str = ', '.join([m for m in methods if m != 'HEAD'])
        route_info = f"{methods_str:15} {path}"
        
        if '/api/v1/public/' in path:
            public_routes.append(route_info)
        elif '/api/v1/admin/' in path:
            admin_routes.append(route_info)
        elif '/api/v1/regional/' in path:
            regional_routes.append(route_info)
        elif '/api/v1/auth/' in path:
            auth_routes.append(route_info)
        else:
            other_routes.append(route_info)
    
    # Print categorized routes
    if other_routes:
        print("📋 General Endpoints:")
        for route in other_routes:
            print(f"  {route}")
        print()
    
    if auth_routes:
        print("🔐 Authentication Endpoints:")
        for route in auth_routes:
            print(f"  {route}")
        print()
    
    if public_routes:
        print("🌐 Public Endpoints:")
        for route in public_routes:
            print(f"  {route}")
        print()
    
    if admin_routes:
        print("👑 Admin Endpoints:")
        for route in admin_routes:
            print(f"  {route}")
        print()
    
    if regional_routes:
        print("🏢 Regional Admin Endpoints:")
        for route in regional_routes:
            print(f"  {route}")
        print()
    
    print(f"📊 Total routes: {len(routes)}")

if __name__ == "__main__":
    check_endpoints()
