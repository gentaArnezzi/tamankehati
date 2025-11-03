# Server Deployment Package

This package contains minimal files needed for production deployment.

## Files Included

- `docker-compose.pull.yml` - Docker Compose configuration for pulling images
- `env.production.example` - Environment variables template
- `deploy-package/nginx/` - Nginx reverse proxy configuration
- `scripts/` - Deployment helper scripts (optional)

## Quick Start

1. Copy this entire folder to your server
2. Rename `env.production.example` to `.env`
3. Edit `.env` with your server configuration
4. Run: `docker compose -f docker-compose.pull.yml pull`
5. Run: `docker compose -f docker-compose.pull.yml up -d`

## Detailed Instructions

See: `docs/deployment/DEPLOYMENT_STEP_BY_STEP.md`
