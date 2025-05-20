const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const session = require('express-session');

// Load environment variables with fallbacks
dotenv.config({ path: '../.env' });

// Following Single Responsibility Principle - server.js only handles server setup and routing
const app = express();
const PORT = process.env.PORT || process.env.API_GATEWAY_PORT || 3000;

// Get service ports from environment variables with fallbacks
const USER_SERVICE_PORT = process.env.USER_SERVICE_PORT || 3001;
const EVENT_SERVICE_PORT = process.env.EVENT_SERVICE_PORT || 3002;
const DISCOVERY_SERVICE_PORT = process.env.DISCOVERY_SERVICE_PORT || 3003;
const REQUEST_SERVICE_PORT = process.env.REQUEST_SERVICE_PORT || 3004;
const NOTIFICATION_SERVICE_PORT = process.env.NOTIFICATION_SERVICE_PORT || 3005;
const FEEDBACK_SERVICE_PORT = process.env.FEEDBACK_SERVICE_PORT || 3006;
const SAFETY_SERVICE_PORT = process.env.SAFETY_SERVICE_PORT || 3007;
const PAYMENT_SERVICE_PORT = process.env.PAYMENT_SERVICE_PORT || 3008;
const PARTNERSHIP_SERVICE_PORT = process.env.PARTNERSHIP_SERVICE_PORT || 3009;

// Frontend URL for redirects
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3010';

// Middleware
app.use(
  session({
    secret: process.env.COOKIE_KEY || 'tymout_cookie_secret_key_change_in_production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3010',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet()); // Security headers
app.use(express.json()); // Parse JSON bodies
app.use(morgan('dev')); // Logging

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`[API Gateway:Step 1] Received ${req.method} request to ${req.url}`);
  console.log(`[API Gateway:Step 2] Headers:`, req.headers);
  console.log(`[API Gateway:Step 3] Body:`, req.body);
  next();
});

// Routes to microservices
app.use('/api/users', createProxyMiddleware({ 
  target: process.env.USER_SERVICE_URL || `http://localhost:${USER_SERVICE_PORT}`, 
  changeOrigin: true,
  pathRewrite: {'^/api/users': ''},
  cookieDomainRewrite: {
    '*': process.env.FRONTEND_URL || 'http://localhost:3010'
  },
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers['connection'] = 'keep-alive';
    if (srcReq.body) {
      proxyReqOpts.headers['content-type'] = 'application/json';
    }
    if (srcReq.headers.authorization) {
      console.log('[API Gateway] Forwarding Authorization header to User Service');
      proxyReqOpts.headers['authorization'] = srcReq.headers.authorization;
    }
    return proxyReqOpts;
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[API Gateway:Step 4] Proxying request to User Service: ${req.method} ${req.url}`);
    console.log(`[API Gateway:Step 5] Proxy Request Headers:`, proxyReq.getHeaders());
    console.log(`[API Gateway:Step 5.1] Proxy Request Body:`, req.body);
    console.log(`[API Gateway:Step 5.2] Target URL: http://localhost:${USER_SERVICE_PORT}${req.url.replace('/api/users', '')}`);
    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[API Gateway:Step 6] Received response from User Service:`, {
      statusCode: proxyRes.statusCode,
      headers: proxyRes.headers
    });
    
    // Handle redirects
    if (proxyRes.headers.location) {
      const location = proxyRes.headers.location;
      
      // If it's a Google OAuth redirect, let it pass through without modification
      if (location.startsWith('https://accounts.google.com')) {
        res.redirect(location);
        return;
      }
      
      // If it's any redirect to frontend URL, let it pass through without modification
      if (location.includes(FRONTEND_URL)) {
        res.redirect(location);
        return;
      }
      
      // For other redirects, handle them as usual
      console.log(`[API Gateway:Step 7] Auth request: ${req.method} ${req.url}`);
      console.log(`[API Gateway:Step 8] Response status: ${proxyRes.statusCode}`);
      console.log(`[API Gateway:Step 9] Redirect location: ${location}`);
    }
    
    // Log response body if available
    const chunks = [];
    proxyRes.on('data', (chunk) => chunks.push(chunk));
    proxyRes.on('end', () => {
      const body = Buffer.concat(chunks).toString();
      console.log(`[API Gateway:Step 6.1] Response Body:`, body);
    });
    
    // Log all proxied requests for debugging OAuth issues
    if (req.url.includes('/auth/')) {
      console.log(`[API Gateway:Step 7] Auth request: ${req.method} ${req.url}`);
      console.log(`[API Gateway:Step 8] Response status: ${proxyRes.statusCode}`);
      
      if (proxyRes.headers.location) {
        console.log(`[API Gateway:Step 9] Redirect location: ${proxyRes.headers.location}`);
      }
    }
    
    // Handle redirects from the user service
    if (proxyRes.headers.location) {
      const location = proxyRes.headers.location;
      // Only modify paths that are meant to be proxied to other services
      if (location.startsWith('/api/users')) {
        proxyRes.headers.location = location;
      } else if (location.includes('/auth/success')) {
        // For frontend redirects, keep the URL as-is
        proxyRes.headers.location = `${FRONTEND_URL}/auth/success`;
      } else {
        // For other paths, add the /api/users prefix
        proxyRes.headers.location = `/api/users${location}`;
      }
    }
  },
  onError: (err, req, res) => {
    console.error(`[API Gateway:Step 10] Proxy Error:`, err);
    console.error(`[API Gateway:Step 10.1] Error Details:`, {
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    console.error(`[API Gateway:Step 10.2] Request Details:`, {
      method: req.method,
      url: req.url,
      headers: req.headers
    });
    res.status(500).json({ error: 'Proxy Error', details: err.message });
  }
}));

app.use('/api/events', createProxyMiddleware({ 
  target: process.env.EVENT_SERVICE_URL || `http://localhost:${EVENT_SERVICE_PORT}`, 
  changeOrigin: true,
  pathRewrite: {'^/api/events': '/events'},
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    // Maintain keep-alive connection
    proxyReqOpts.headers['connection'] = 'keep-alive';
    // Ensure proper content-type is set
    if (srcReq.body) {
      proxyReqOpts.headers['content-type'] = 'application/json';
    }
    return proxyReqOpts;
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[API Gateway:Step 4] Proxying request to Event Service: ${req.method} ${req.url}`);
    console.log(`[API Gateway:Step 5] Proxy Request Headers:`, proxyReq.getHeaders());
    console.log(`[API Gateway:Step 5.1] Proxy Request Body:`, req.body);
    console.log(`[API Gateway:Step 5.2] Target URL: http://localhost:${EVENT_SERVICE_PORT}${req.url.replace('/api/events', '')}`);
    
    // Ensure body is properly forwarded
    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
}));

app.use('/api/circles', createProxyMiddleware({ 
  target: process.env.EVENT_SERVICE_URL || `http://localhost:${EVENT_SERVICE_PORT}`, 
  changeOrigin: true,
  pathRewrite: {'^/api/circles': '/circles'},
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers['connection'] = 'keep-alive';
    if (srcReq.body) {
      proxyReqOpts.headers['content-type'] = 'application/json';
    }
    return proxyReqOpts;
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[API Gateway:Step 4] Proxying request to Event Service (Circles): ${req.method} ${req.url}`);
    console.log(`[API Gateway:Step 5] Proxy Request Headers:`, proxyReq.getHeaders());
    console.log(`[API Gateway:Step 5.1] Proxy Request Body:`, req.body);
    console.log(`[API Gateway:Step 5.2] Target URL: http://localhost:${EVENT_SERVICE_PORT}${req.url.replace('/api/circles', '')}`);
    
    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
}));

// Discovery Service Routes
app.use(['/api/discovery', '/api/search', '/api/recommendations'], createProxyMiddleware({ 
  target: process.env.DISCOVERY_SERVICE_URL || `http://localhost:${DISCOVERY_SERVICE_PORT}`, 
  changeOrigin: true,
  pathRewrite: {
    '^/api/discovery': '/discovery',
    '^/api/search': '/search',
    '^/api/recommendations': '/recommendations'
  },
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers['connection'] = 'keep-alive';
    if (srcReq.body) {
      proxyReqOpts.headers['content-type'] = 'application/json';
    }
    return proxyReqOpts;
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[API Gateway:Step 4] Proxying request to Discovery Service: ${req.method} ${req.url}`);
    console.log(`[API Gateway:Step 5] Proxy Request Headers:`, proxyReq.getHeaders());
    console.log(`[API Gateway:Step 5.1] Proxy Request Body:`, req.body);
    console.log(`[API Gateway:Step 5.2] Target URL: http://localhost:${DISCOVERY_SERVICE_PORT}${req.url.replace(/^\/api\/(discovery|search|recommendations)/, '/$1')}`);
    
    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  }
}));

app.use('/api/requests', createProxyMiddleware({ 
  target: process.env.REQUEST_SERVICE_URL || `http://localhost:${REQUEST_SERVICE_PORT}`, 
  changeOrigin: true,
  pathRewrite: {'^/api/requests': ''}
}));

app.use('/api/notifications', createProxyMiddleware({ 
  target: process.env.NOTIFICATION_SERVICE_URL || `http://localhost:${NOTIFICATION_SERVICE_PORT}`, 
  changeOrigin: true,
  pathRewrite: {'^/api/notifications': ''}
}));

app.use('/api/feedback', createProxyMiddleware({ 
  target: process.env.FEEDBACK_SERVICE_URL || `http://localhost:${FEEDBACK_SERVICE_PORT}`, 
  changeOrigin: true,
  pathRewrite: {'^/api/feedback': ''}
}));

app.use('/api/safety', createProxyMiddleware({ 
  target: process.env.SAFETY_SERVICE_URL || `http://localhost:${SAFETY_SERVICE_PORT}`, 
  changeOrigin: true,
  pathRewrite: {'^/api/safety': ''}
}));

app.use('/api/payments', createProxyMiddleware({ 
  target: process.env.PAYMENT_SERVICE_URL || `http://localhost:${PAYMENT_SERVICE_PORT}`, 
  changeOrigin: true,
  pathRewrite: {'^/api/payments': ''}
}));

app.use('/api/partnerships', createProxyMiddleware({ 
  target: process.env.PARTNERSHIP_SERVICE_URL || `http://localhost:${PARTNERSHIP_SERVICE_PORT}`, 
  changeOrigin: true,
  pathRewrite: {'^/api/partnerships': ''}
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'api-gateway' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[API Gateway:Step 11]`, err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`[API Gateway:Step 12] API Gateway running on port ${PORT}`);
  console.log(`[API Gateway:Step 13] Forwarding user service requests to: http://localhost:${USER_SERVICE_PORT}`);
  console.log(`[API Gateway:Step 14] Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3010'}`);
});
