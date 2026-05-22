#!/bin/bash
# ============================================
# Local Deployment Script
# ============================================
# This script is executed by the backend API when
# an admin approves a deployment request.
# It restarts the sample-app container locally.
# ============================================

echo "----------------------------------------"
echo "🚀 Starting deployment of sample-app..."
echo "----------------------------------------"

# Navigate to the project root (assuming script is run from project root or scripts folder)
# We'll ensure we are in the directory containing docker-compose.yml
cd "$(dirname "$0")/.."

# Stop the existing container if running
echo "🛑 Stopping existing container..."
docker-compose stop sample-app

# Rebuild and start the updated container
echo "🏗️ Rebuilding and starting new container..."
docker-compose up -d --build sample-app

# Verify it started successfully
if [ $? -eq 0 ]; then
  echo "✅ Deployment successful!"
  echo "🌐 App is now accessible at http://localhost:9090"
else
  echo "❌ Deployment failed! Check docker-compose logs."
  exit 1
fi
