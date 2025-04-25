const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const auth = (req, res, next) => {
  console.log(`[Auth Middleware] Starting authentication check`);
  
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');
  console.log(`[Auth Middleware] Token from header:`, token ? 'Present' : 'Missing');

  // Check if no token
  if (!token) {
    console.log(`[Auth Middleware] No token provided`);
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    console.log(`[Auth Middleware] Verifying token`);
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tymout_jwt_secret_key_change_in_production');
    console.log(`[Auth Middleware] Token decoded successfully:`, { userId: decoded.id });
    
    // Add user from payload - handle both structures
    req.user = {
      id: decoded.id || decoded.user?.id,
      email: decoded.email,
      role: decoded.role
    };
    next();
  } catch (err) {
    console.error(`[Auth Middleware] Token verification failed:`, err.message);
    res.status(401).json({ error: 'Token is not valid' });
  }
};

module.exports = auth;
