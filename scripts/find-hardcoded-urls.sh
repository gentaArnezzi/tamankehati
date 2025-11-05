#!/bin/bash
# Script to find all hardcoded IP:port URLs in the codebase
# Usage: ./scripts/find-hardcoded-urls.sh

set -e

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "🔍 Finding Hardcoded URLs"
echo "========================="
echo ""

# IP pattern
IP_PATTERN="38\.47\.93\.167"
IP_PORT_PATTERN="38\.47\.93\.167:8080"
HTTP_IP_PATTERN="http://38\.47\.93\.167"

echo "📋 Files with IP address (38.47.93.167):"
echo "----------------------------------------"
grep -r "$IP_PATTERN" \
  --include="*.ts" \
  --include="*.tsx" \
  --include="*.js" \
  --include="*.jsx" \
  --include="*.yml" \
  --include="*.yaml" \
  --include="*.sh" \
  --include="*.env*" \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  --exclude-dir=dist \
  --exclude-dir=build \
  apps/ scripts/ deployment-package/ deploy-package/ 2>/dev/null | \
  grep -v "node_modules" | \
  grep -v ".next" | \
  grep -v "docs/" | \
  head -50

echo ""
echo "📋 Files with IP:Port (38.47.93.167:8080):"
echo "----------------------------------------"
grep -r "$IP_PORT_PATTERN" \
  --include="*.ts" \
  --include="*.tsx" \
  --include="*.js" \
  --include="*.jsx" \
  --include="*.yml" \
  --include="*.yaml" \
  --include="*.sh" \
  --include="*.env*" \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  --exclude-dir=dist \
  --exclude-dir=build \
  apps/ scripts/ deployment-package/ deploy-package/ 2>/dev/null | \
  grep -v "node_modules" | \
  grep -v ".next" | \
  grep -v "docs/" | \
  head -50

echo ""
echo "📋 Frontend Files with Hardcoded Fallback URLs:"
echo "----------------------------------------"
echo -e "${YELLOW}⚠️  These files need fallback value update (optional)${NC}"
grep -r "$HTTP_IP_PATTERN" \
  --include="*.ts" \
  --include="*.tsx" \
  apps/frontend/src/ 2>/dev/null | \
  grep -v "node_modules" | \
  grep -v ".next" | \
  head -30

echo ""
echo "📊 Summary:"
echo "----------"
echo ""

# Count files
FRONTEND_COUNT=$(grep -r "$IP_PORT_PATTERN" \
  --include="*.ts" \
  --include="*.tsx" \
  apps/frontend/src/ 2>/dev/null | \
  wc -l | xargs)

SCRIPT_COUNT=$(grep -r "$IP_PORT_PATTERN" \
  --include="*.sh" \
  scripts/ 2>/dev/null | \
  wc -l | xargs)

CONFIG_COUNT=$(grep -r "$IP_PORT_PATTERN" \
  --include="*.yml" \
  --include="*.yaml" \
  --include="*.env*" \
  deployment-package/ deploy-package/ 2>/dev/null | \
  wc -l | xargs)

echo "Frontend files: $FRONTEND_COUNT"
echo "Script files: $SCRIPT_COUNT"
echo "Config files: $CONFIG_COUNT"

echo ""
echo -e "${GREEN}✅ Scan complete!${NC}"
echo ""
echo "📝 Next Steps:"
echo "1. Update environment variables (.env)"
echo "2. Update Docker compose files"
echo "3. Rebuild frontend with new API URL"
echo "4. Update Nginx config"
echo ""
echo "See: docs/deployment/MIGRATION_CHECKLIST.md for complete guide"

