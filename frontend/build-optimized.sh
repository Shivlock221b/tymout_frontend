#!/bin/bash

# Build script for optimizing Tymout frontend performance

echo "🚀 Starting optimized build process for Tymout frontend..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Set environment variables for production
echo "🔧 Setting up production environment variables..."
export NODE_ENV=production
export GENERATE_SOURCEMAP=false

# API Gateway URL from AWS App Runner
export REACT_APP_API_GATEWAY_URL=https://y9tvvqw2ff.us-east-1.awsapprunner.com

# Service URLs - derived from API Gateway URL
export REACT_APP_USER_SERVICE_URL=${REACT_APP_API_GATEWAY_URL}/api/users
export REACT_APP_EVENT_SERVICE_URL=${REACT_APP_API_GATEWAY_URL}/api/events
export REACT_APP_DISCOVERY_SERVICE_URL=${REACT_APP_API_GATEWAY_URL}/api/discovery
export REACT_APP_MESSAGE_SERVICE_URL=${REACT_APP_API_GATEWAY_URL}/api/messages

# Frontend URL
export REACT_APP_FRONTEND_URL=https://www.tymout.com

# Build the application with CRACO
echo "🏗️ Building optimized production bundle..."
npm run build

# Optimize images (if tools are available)
echo "🖼️ Checking for image optimization tools..."
if command -v optipng &> /dev/null; then
  echo "✅ optipng found, optimizing PNG images..."
  find build -name "*.png" -exec optipng -o5 {} \;
else
  echo "⚠️ optipng not found, skipping PNG optimization"
  echo "To install: brew install optipng"
fi

if command -v jpegoptim &> /dev/null; then
  echo "✅ jpegoptim found, optimizing JPG images..."
  find build -name "*.jpg" -exec jpegoptim --strip-all --max=85 {} \;
else
  echo "⚠️ jpegoptim not found, skipping JPG optimization"
  echo "To install: brew install jpegoptim"
fi

# Gzip static assets for faster delivery (if gzip is available)
echo "📦 Checking for compression tools..."
if command -v gzip &> /dev/null; then
  echo "✅ gzip found, compressing static assets..."
  find build -type f -name "*.js" -exec gzip -9 -k {} \;
  find build -type f -name "*.css" -exec gzip -9 -k {} \;
  find build -type f -name "*.html" -exec gzip -9 -k {} \;
else
  echo "⚠️ gzip not found, skipping compression"
fi

echo "✅ Build completed successfully!"
echo "📊 Run 'npm run analyze' to view bundle size analysis"
echo "🌐 Deploy the contents of the 'build' folder to AWS Amplify"
