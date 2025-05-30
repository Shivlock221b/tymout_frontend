#!/bin/bash

# Balanced build script with safe optimizations for AWS Amplify deployment
echo "🚀 Starting balanced build for AWS Amplify deployment..."

# Set environment variables
echo "📝 Setting up environment variables..."
export REACT_APP_API_GATEWAY_URL="https://y9tvvqw2ff.us-east-1.awsapprunner.com"
export REACT_APP_EVENT_SERVICE_URL="https://4racpsbxvp.ap-southeast-1.awsapprunner.com"
export REACT_APP_USER_SERVICE_URL="https://dz9fi6brn6.ap-southeast-1.awsapprunner.com"
export REACT_APP_MESSAGE_SERVICE_URL="https://gse6svsquj.ap-south-1.awsapprunner.com"
export REACT_APP_CHAT_SERVICE_URL="https://gse6svsquj.ap-south-1.awsapprunner.com"
export REACT_APP_DISCOVERY_SERVICE_URL="https://uubgaznt7a.ap-south-1.awsapprunner.com"
export GENERATE_SOURCEMAP=false
export DISABLE_ESLINT_PLUGIN=true
export REACT_APP_ENABLE_OPTIMIZATIONS="safe"

# Create .env file for build process
echo "Creating .env file with environment variables"
cat > .env << EOL
REACT_APP_API_GATEWAY_URL=$REACT_APP_API_GATEWAY_URL
REACT_APP_EVENT_SERVICE_URL=$REACT_APP_EVENT_SERVICE_URL
REACT_APP_USER_SERVICE_URL=$REACT_APP_USER_SERVICE_URL
REACT_APP_MESSAGE_SERVICE_URL=$REACT_APP_MESSAGE_SERVICE_URL
REACT_APP_CHAT_SERVICE_URL=$REACT_APP_CHAT_SERVICE_URL
REACT_APP_DISCOVERY_SERVICE_URL=$REACT_APP_DISCOVERY_SERVICE_URL
REACT_APP_ENV=production
GENERATE_SOURCEMAP=false
DISABLE_ESLINT_PLUGIN=true
REACT_APP_ENABLE_OPTIMIZATIONS=safe
EOL

# Create runtime environment config file
echo "Creating runtime environment config file"
cat > public/env-config.js << EOL
window.env = {
  REACT_APP_API_GATEWAY_URL: "$REACT_APP_API_GATEWAY_URL",
  REACT_APP_EVENT_SERVICE_URL: "$REACT_APP_EVENT_SERVICE_URL",
  REACT_APP_USER_SERVICE_URL: "$REACT_APP_USER_SERVICE_URL",
  REACT_APP_MESSAGE_SERVICE_URL: "$REACT_APP_MESSAGE_SERVICE_URL",
  REACT_APP_CHAT_SERVICE_URL: "$REACT_APP_CHAT_SERVICE_URL",
  REACT_APP_DISCOVERY_SERVICE_URL: "$REACT_APP_DISCOVERY_SERVICE_URL",
  REACT_APP_ENV: "production",
  REACT_APP_ENABLE_OPTIMIZATIONS: "safe"
};
EOL

# Build the application with balanced optimizations
echo "🏗️ Building production bundle with balanced optimizations..."
npm run build:balanced

# Ensure service worker is registered
echo "🔧 Ensuring service worker is registered..."
if ! grep -q "serviceWorker.register" build/index.html; then
  # Backup the original file
  cp build/index.html build/index.html.bak
  
  # Insert service worker registration before the closing body tag
  sed -i 's|</body>|<script>\n      if ("serviceWorker" in navigator) {\n        window.addEventListener("load", function() {\n          navigator.serviceWorker.register("/service-worker.js")\n            .then(function(registration) {\n              console.log("ServiceWorker registration successful with scope: ", registration.scope);\n            })\n            .catch(function(error) {\n              console.log("ServiceWorker registration failed: ", error);\n            });\n        });\n      }\n    </script>\n</body>|' build/index.html
fi

# Copy env-config.js to build directory
echo "📋 Copying environment config to build directory..."
cp public/env-config.js build/

echo "✅ Build completed successfully!"
