#!/usr/bin/env python3
"""
Verify Environment Variables untuk Deployment

Script ini membantu validate bahwa semua environment variables
sudah di-set dengan benar untuk deployment.

Usage:
  python verify-env.py [render|vercel|railway]
"""

import sys
import os
from typing import Dict, List, Optional


class Colors:
    """ANSI color codes"""
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'


def print_header(text: str):
    """Print formatted header"""
    print(f"\n{Colors.BLUE}{Colors.BOLD}{'='*60}{Colors.END}")
    print(f"{Colors.BLUE}{Colors.BOLD}{text:^60}{Colors.END}")
    print(f"{Colors.BLUE}{Colors.BOLD}{'='*60}{Colors.END}\n")


def print_success(text: str):
    """Print success message"""
    print(f"{Colors.GREEN}✓ {text}{Colors.END}")


def print_warning(text: str):
    """Print warning message"""
    print(f"{Colors.YELLOW}⚠ {text}{Colors.END}")


def print_error(text: str):
    """Print error message"""
    print(f"{Colors.RED}✗ {text}{Colors.END}")


def check_env_var(var_name: str, required: bool = True, min_length: int = 0) -> bool:
    """Check if environment variable is set and valid"""
    value = os.getenv(var_name)
    
    if value is None or value == "":
        if required:
            print_error(f"{var_name}: NOT SET")
            return False
        else:
            print_warning(f"{var_name}: Not set (optional)")
            return True
    
    if min_length > 0 and len(value) < min_length:
        print_error(f"{var_name}: Too short (minimum {min_length} chars)")
        return False
    
    # Mask sensitive values
    if 'KEY' in var_name or 'PASSWORD' in var_name or 'SECRET' in var_name:
        display_value = value[:4] + '*' * (len(value) - 8) + value[-4:] if len(value) > 8 else '****'
    elif 'URL' in var_name:
        display_value = value[:30] + '...' if len(value) > 30 else value
    else:
        display_value = value[:50] + '...' if len(value) > 50 else value
    
    print_success(f"{var_name}: {display_value}")
    return True


def verify_render_backend():
    """Verify Render backend environment variables"""
    print_header("RENDER BACKEND - Environment Variables")
    
    required_vars = {
        "DATABASE_URL": 50,
        "DATABASE_URL_SYNC": 50,
        "SECRET_KEY": 32,
        "ALGORITHM": 0,
        "ACCESS_TOKEN_EXPIRE_MINUTES": 0,
        "ENVIRONMENT": 0,
        "DEBUG": 0,
        "CORS_ORIGINS": 10,
    }
    
    optional_vars = {
        "REDIS_URL": 10,
        "UPLOAD_DIRECTORY": 5,
        "MAX_FILE_SIZE": 0,
        "LOG_LEVEL": 0,
        "LOG_FORMAT": 0,
    }
    
    print(f"{Colors.BOLD}Required Variables:{Colors.END}")
    required_ok = all(check_env_var(var, True, min_len) for var, min_len in required_vars.items())
    
    print(f"\n{Colors.BOLD}Optional Variables:{Colors.END}")
    optional_ok = all(check_env_var(var, False, min_len) for var, min_len in optional_vars.items())
    
    # Specific checks
    print(f"\n{Colors.BOLD}Validation Checks:{Colors.END}")
    
    # Check DATABASE_URL format
    db_url = os.getenv("DATABASE_URL", "")
    if "postgresql+asyncpg://" in db_url:
        print_success("DATABASE_URL: Correct format (asyncpg)")
    else:
        print_error("DATABASE_URL: Must use 'postgresql+asyncpg://' for async support")
        required_ok = False
    
    # Check SECRET_KEY strength
    secret = os.getenv("SECRET_KEY", "")
    if secret and len(secret) >= 32:
        print_success("SECRET_KEY: Strong (>= 32 characters)")
    elif secret:
        print_warning("SECRET_KEY: Weak (< 32 characters)")
    
    # Check ENVIRONMENT
    env = os.getenv("ENVIRONMENT", "")
    if env == "production":
        print_success("ENVIRONMENT: Set to production")
    else:
        print_warning(f"ENVIRONMENT: '{env}' (should be 'production')")
    
    # Check DEBUG
    debug = os.getenv("DEBUG", "")
    if debug.lower() in ["false", "0", ""]:
        print_success("DEBUG: Disabled (good for production)")
    else:
        print_warning("DEBUG: Enabled (should be false in production)")
    
    # Check CORS
    cors = os.getenv("CORS_ORIGINS", "")
    if cors and "vercel.app" in cors:
        print_success("CORS_ORIGINS: Contains Vercel domain")
    elif cors and "localhost" in cors:
        print_warning("CORS_ORIGINS: Contains localhost (remove for production)")
    
    print(f"\n{Colors.BOLD}Result:{Colors.END}")
    if required_ok:
        print_success("All required variables are set!")
        return True
    else:
        print_error("Some required variables are missing or invalid")
        return False


def verify_vercel_frontend():
    """Verify Vercel frontend environment variables"""
    print_header("VERCEL FRONTEND - Environment Variables")
    
    required_vars = {
        "NEXT_PUBLIC_API_URL": 10,
        "NEXT_PUBLIC_APP_NAME": 3,
        "NODE_ENV": 0,
    }
    
    optional_vars = {
        "NEXT_PUBLIC_APP_VERSION": 0,
        "NEXT_TELEMETRY_DISABLED": 0,
        "NEXT_PUBLIC_MAP_TILE_URL": 10,
        "NEXT_PUBLIC_MAP_ATTRIBUTION": 5,
        "NEXT_PUBLIC_DEFAULT_LAT": 0,
        "NEXT_PUBLIC_DEFAULT_LNG": 0,
        "NEXT_PUBLIC_DEFAULT_ZOOM": 0,
        "NEXT_PUBLIC_ENABLE_AI": 0,
        "NEXT_PUBLIC_ENABLE_MAPS": 0,
        "NEXT_PUBLIC_ENABLE_UPLOADS": 0,
        "NEXT_PUBLIC_ENABLE_NOTIFICATIONS": 0,
    }
    
    print(f"{Colors.BOLD}Required Variables:{Colors.END}")
    required_ok = all(check_env_var(var, True, min_len) for var, min_len in required_vars.items())
    
    print(f"\n{Colors.BOLD}Optional Variables:{Colors.END}")
    optional_ok = all(check_env_var(var, False, min_len) for var, min_len in optional_vars.items())
    
    # Specific checks
    print(f"\n{Colors.BOLD}Validation Checks:{Colors.END}")
    
    # Check API URL
    api_url = os.getenv("NEXT_PUBLIC_API_URL", "")
    if "onrender.com" in api_url or "render.com" in api_url:
        print_success("NEXT_PUBLIC_API_URL: Points to Render backend")
    elif "localhost" in api_url:
        print_warning("NEXT_PUBLIC_API_URL: Points to localhost (update for production)")
    elif api_url:
        print_success(f"NEXT_PUBLIC_API_URL: Custom backend URL")
    
    # Check NODE_ENV
    node_env = os.getenv("NODE_ENV", "")
    if node_env == "production":
        print_success("NODE_ENV: Set to production")
    else:
        print_warning(f"NODE_ENV: '{node_env}' (should be 'production')")
    
    # Check NEXT_PUBLIC_ prefix
    print(f"\n{Colors.BOLD}Note:{Colors.END}")
    print("All public variables must start with 'NEXT_PUBLIC_' prefix")
    print("These variables are exposed to the browser")
    
    print(f"\n{Colors.BOLD}Result:{Colors.END}")
    if required_ok:
        print_success("All required variables are set!")
        return True
    else:
        print_error("Some required variables are missing or invalid")
        return False


def verify_railway_database():
    """Verify Railway database connection"""
    print_header("RAILWAY DATABASE - Connection Info")
    
    print(f"{Colors.BOLD}Database Connection:{Colors.END}")
    db_url = os.getenv("DATABASE_URL", "")
    
    if not db_url:
        print_error("DATABASE_URL: Not set")
        return False
    
    # Parse connection string
    if "railway.app" in db_url:
        print_success("DATABASE_URL: Railway database detected")
    else:
        print_warning("DATABASE_URL: Not a Railway database")
    
    if "postgresql" in db_url:
        print_success("Database Type: PostgreSQL")
    else:
        print_error("Database Type: Not PostgreSQL")
        return False
    
    print(f"\n{Colors.BOLD}Note:{Colors.END}")
    print("To test connection, run:")
    print(f"{Colors.YELLOW}cd apps/backend && alembic upgrade head{Colors.END}")
    
    return True


def print_usage():
    """Print usage instructions"""
    print(f"""
{Colors.BOLD}Usage:{Colors.END}
  python verify-env.py [platform]

{Colors.BOLD}Platforms:{Colors.END}
  render     - Verify Render backend environment variables
  vercel     - Verify Vercel frontend environment variables
  railway    - Verify Railway database connection
  all        - Check all platforms

{Colors.BOLD}Examples:{Colors.END}
  python verify-env.py render
  python verify-env.py vercel
  python verify-env.py all

{Colors.BOLD}Note:{Colors.END}
This script checks environment variables in your current shell.
For deployment, you need to set these in:
  - Render Dashboard → Environment tab
  - Vercel Dashboard → Settings → Environment Variables
  - Railway Dashboard → Variables tab
""")


def main():
    """Main function"""
    if len(sys.argv) < 2:
        print_usage()
        sys.exit(1)
    
    platform = sys.argv[1].lower()
    
    results = []
    
    if platform == "render":
        results.append(verify_render_backend())
    elif platform == "vercel":
        results.append(verify_vercel_frontend())
    elif platform == "railway":
        results.append(verify_railway_database())
    elif platform == "all":
        results.append(verify_render_backend())
        results.append(verify_vercel_frontend())
        results.append(verify_railway_database())
    else:
        print_error(f"Unknown platform: {platform}")
        print_usage()
        sys.exit(1)
    
    # Summary
    print_header("SUMMARY")
    if all(results):
        print_success("All checks passed! Ready to deploy 🚀")
        sys.exit(0)
    else:
        print_error("Some checks failed. Please review the errors above.")
        sys.exit(1)


if __name__ == "__main__":
    main()

