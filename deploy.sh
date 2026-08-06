#!/bin/bash
set -e

STAGE="${1:-main}"
echo "Deploying healstack to stage: $STAGE"

npm run build
echo "✓ Build successful"

npx wrangler pages deploy dist --project-name healstack --branch "$STAGE"
echo "✓ Deployed to Cloudflare Pages"
