# Server Deployment Package

This package contains minimal files needed for production deployment.

## Files Included

- `docker-compose.pull.yml` - Docker Compose configuration for pulling images (with Nginx container)
- `docker-compose.pull.no-nginx.yml` - Docker Compose configuration WITHOUT Nginx container (for server with existing Nginx)
- `env.production.example` - Environment variables template
- `deploy-package/nginx/` - Nginx reverse proxy configuration
- `deploy-package/nginx/server-nginx-example.conf` - Nginx config template for server (not container)
- `scripts/` - Deployment helper scripts (optional)

## Quick Start

1. Copy this entire folder to your server
2. Rename `env.production.example` to `.env`
3. Edit `.env` with your server configuration
4. Run: `docker compose -f docker-compose.pull.no-nginx.yml pull` (if server has existing Nginx)
5. Run: `docker compose -f docker-compose.pull.no-nginx.yml up -d`
6. Setup Nginx routing di server (see server-nginx-example.conf)

## Detailed Instructions

See: `docs/deployment/DEPLOYMENT_STEP_BY_STEP.md`
