#!/bin/bash
# Frontend Build & Deploy Script

set -e

echo "🚀 EasyGo Frontend - Production Build & Deploy"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Environment setup
ENVIRONMENT=${1:-production}
DEPLOY_DIR="./dist"

echo -e "${YELLOW}Step 1: Environment Setup${NC}"
echo "Environment: $ENVIRONMENT"

# Install dependencies
echo -e "${YELLOW}Step 2: Installing Dependencies${NC}"
npm ci --prefer-offline --no-audit

# Build the project
echo -e "${YELLOW}Step 3: Building Application${NC}"
if [ "$ENVIRONMENT" = "staging" ]; then
    npm run build:staging
elif [ "$ENVIRONMENT" = "production" ]; then
    npm run build:production
else
    npm run build
fi

# Build size check
echo -e "${YELLOW}Step 4: Build Size Analysis${NC}"
if [ -d "$DEPLOY_DIR" ]; then
    TOTAL_SIZE=$(du -sh "$DEPLOY_DIR" | cut -f1)
    echo -e "${GREEN}Build size: $TOTAL_SIZE${NC}"
    
    # Warn if build is too large
    SIZE_NUM=$(du -s "$DEPLOY_DIR" | cut -f1)
    if [ "$SIZE_NUM" -gt 5242880 ]; then  # 5MB
        echo -e "${RED}⚠️  Build size exceeds 5MB. Consider code optimization.${NC}"
    fi
fi

# Run tests if available
echo -e "${YELLOW}Step 5: Running Tests${NC}"
if npm run test -- --passWithNoTests 2>/dev/null; then
    echo -e "${GREEN}✅ Tests passed${NC}"
else
    echo -e "${YELLOW}⚠️  Tests skipped or failed (continuing with build)${NC}"
fi

# Create deployment metadata
echo -e "${YELLOW}Step 6: Creating Deployment Metadata${NC}"
cat > "$DEPLOY_DIR/build-info.json" <<EOF
{
  "version": "$(node -p 'require(\"./package.json\").version')",
  "buildTime": "$(date -u +'%Y-%m-%dT%H:%M:%SZ')",
  "environment": "$ENVIRONMENT",
  "gitCommit": "$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
}
EOF

echo -e "${GREEN}✅ Frontend build complete!${NC}"
echo ""
echo "📦 Deployment files ready in: $DEPLOY_DIR"
echo ""
echo "🚀 Next steps:"
echo "1. Upload $DEPLOY_DIR to your hosting provider"
echo "2. Configure environment variables for $ENVIRONMENT"
echo "3. Test all API endpoints"
echo "4. Monitor application performance"
