#!/bin/bash

# Optimized build script for AWS Amplify deployment
echo "🚀 Starting optimized build for AWS Amplify deployment..."

# Set environment variables if they're not already set
echo "📝 Setting up environment variables..."

# Default API URLs if not set in environment
if [ -z "$REACT_APP_API_GATEWAY_URL" ]; then
  export REACT_APP_API_GATEWAY_URL="https://y9tvvqw2ff.us-east-1.awsapprunner.com"
  echo "Using default API Gateway URL: $REACT_APP_API_GATEWAY_URL"
fi

if [ -z "$REACT_APP_EVENT_SERVICE_URL" ]; then
  export REACT_APP_EVENT_SERVICE_URL="https://4racpsbxvp.ap-southeast-1.awsapprunner.com"
  echo "Using default Event Service URL: $REACT_APP_EVENT_SERVICE_URL"
fi

if [ -z "$REACT_APP_USER_SERVICE_URL" ]; then
  export REACT_APP_USER_SERVICE_URL="https://dz9fi6brn6.ap-southeast-1.awsapprunner.com"
  echo "Using default User Service URL: $REACT_APP_USER_SERVICE_URL"
fi

if [ -z "$REACT_APP_MESSAGE_SERVICE_URL" ]; then
  export REACT_APP_MESSAGE_SERVICE_URL="https://gse6svsquj.ap-south-1.awsapprunner.com"
  echo "Using default Message Service URL: $REACT_APP_MESSAGE_SERVICE_URL"
fi

if [ -z "$REACT_APP_CHAT_SERVICE_URL" ]; then
  export REACT_APP_CHAT_SERVICE_URL="https://gse6svsquj.ap-south-1.awsapprunner.com"
  echo "Using default Chat Service URL: $REACT_APP_CHAT_SERVICE_URL"
fi

if [ -z "$REACT_APP_DISCOVERY_SERVICE_URL" ]; then
  export REACT_APP_DISCOVERY_SERVICE_URL="https://uubgaznt7a.ap-south-1.awsapprunner.com"
  echo "Using default Discovery Service URL: $REACT_APP_DISCOVERY_SERVICE_URL"
fi

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
  REACT_APP_ENV: "production"
};
EOL

# Build the application with CRACO
echo "🏗️ Building optimized production bundle..."
CROSS_ENV_REACT_APP_API_GATEWAY_URL=$REACT_APP_API_GATEWAY_URL \
CROSS_ENV_REACT_APP_EVENT_SERVICE_URL=$REACT_APP_EVENT_SERVICE_URL \
CROSS_ENV_REACT_APP_USER_SERVICE_URL=$REACT_APP_USER_SERVICE_URL \
CROSS_ENV_REACT_APP_MESSAGE_SERVICE_URL=$REACT_APP_MESSAGE_SERVICE_URL \
CROSS_ENV_REACT_APP_CHAT_SERVICE_URL=$REACT_APP_CHAT_SERVICE_URL \
CROSS_ENV_REACT_APP_DISCOVERY_SERVICE_URL=$REACT_APP_DISCOVERY_SERVICE_URL \
npm run build

# Add service worker registration to index.html if not already present
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

# Ensure environment variables are available in the build
echo "🔍 Injecting environment variables into build..."
cat > build/env-config.js << EOL
window.env = {
  REACT_APP_API_GATEWAY_URL: "$REACT_APP_API_GATEWAY_URL",
  REACT_APP_EVENT_SERVICE_URL: "$REACT_APP_EVENT_SERVICE_URL",
  REACT_APP_USER_SERVICE_URL: "$REACT_APP_USER_SERVICE_URL",
  REACT_APP_MESSAGE_SERVICE_URL: "$REACT_APP_MESSAGE_SERVICE_URL",
  REACT_APP_CHAT_SERVICE_URL: "$REACT_APP_CHAT_SERVICE_URL",
  REACT_APP_DISCOVERY_SERVICE_URL: "$REACT_APP_DISCOVERY_SERVICE_URL",
  REACT_APP_ENV: "production"
};
EOL

echo "✅ Build completed successfully!"
