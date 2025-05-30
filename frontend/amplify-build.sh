#!/bin/bash

# Optimized build script for AWS Amplify deployment
echo "🚀 Starting optimized build for AWS Amplify deployment..."

# Build the application with CRACO
echo "🏗️ Building optimized production bundle..."
npm run build

# Add service worker registration to index.html if not already present
echo "🔧 Ensuring service worker is registered..."
if ! grep -q "serviceWorker.register" build/index.html; then
  # Backup the original file
  cp build/index.html build/index.html.bak
  
  # Insert service worker registration before the closing body tag
  sed -i 's|</body>|<script>\n      if ("serviceWorker" in navigator) {\n        window.addEventListener("load", function() {\n          navigator.serviceWorker.register("/service-worker.js")\n            .then(function(registration) {\n              console.log("ServiceWorker registration successful with scope: ", registration.scope);\n            })\n            .catch(function(error) {\n              console.log("ServiceWorker registration failed: ", error);\n            });\n        });\n      }\n    </script>\n</body>|' build/index.html
fi

echo "✅ Build completed successfully!"
