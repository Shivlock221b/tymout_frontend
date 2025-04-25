// Script to start the frontend with the correct port from .env
const dotenv = require('dotenv');
const { spawn } = require('child_process');
const path = require('path');

// Load environment variables from root .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Get the frontend port from environment variables
const port = process.env.FRONTEND_PORT || 3006;

console.log(`Starting frontend on port ${port}...`);

// Set the PORT environment variable and start the React app
process.env.PORT = port;
const reactStart = spawn('npm', ['start'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: port }
});

reactStart.on('error', (error) => {
  console.error('Failed to start frontend:', error);
});
