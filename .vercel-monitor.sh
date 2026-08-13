#!/bin/bash

# Vercel deployment monitor script
# Usage: ./scripts/check-deployment.sh
# This script checks the latest deployment status and can trigger rebuilds

PROJECT_ID="prj_rHFD5IYE6CSTmnUnzAM4KBHMR0Pb"
VERCEL_TOKEN="${VERCEL_TOKEN}"

if [ -z "$VERCEL_TOKEN" ]; then
  echo "Error: VERCEL_TOKEN environment variable not set"
  exit 1
fi

echo "📊 Checking notsh-survival deployment status..."
echo ""

# Get latest 3 deployments
DEPLOYMENTS=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v6/deployments?projectId=$PROJECT_ID&limit=3")

echo "$DEPLOYMENTS" | jq -r '.deployments[] |
  "State: \(.state | if . == "READY" then "✅ READY" elif . == "ERROR" then "❌ ERROR" elif . == "BUILDING" then "🔨 BUILDING" else . end) | Created: \(.createdAt | todateiso8601) | URL: \(.url)"' | head -10

echo ""
echo "To trigger a rebuild, run:"
echo "  git push origin main"
echo ""
