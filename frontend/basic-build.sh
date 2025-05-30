#!/bin/bash

# Basic build script without optimizations for AWS Amplify deployment
echo "🚀 Starting basic build for AWS Amplify deployment..."

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

# Build the application with React Scripts directly (no CRACO)
echo "🏗️ Building production bundle with React Scripts..."
npm run build:basic

# Copy env-config.js to build directory
echo "📋 Copying environment config to build directory..."
cp public/env-config.js build/

echo "✅ Build completed successfully!"
