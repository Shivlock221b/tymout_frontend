const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load environment variables using absolute path
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

// Following Single Responsibility Principle - this file only handles authentication strategies
// Get configuration from environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET || 'tymout_jwt_secret_key_change_in_production';
const API_GATEWAY_PORT = process.env.API_GATEWAY_PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3010';

// Log environment variables to help with debugging
console.log('Environment variables loaded in passport.js:');
console.log('GOOGLE_CLIENT_ID:', GOOGLE_CLIENT_ID ? 'Set (value hidden)' : 'Not set');
console.log('GOOGLE_CLIENT_SECRET:', GOOGLE_CLIENT_SECRET ? 'Set (value hidden)' : 'Not set');
console.log('API_GATEWAY_PORT:', API_GATEWAY_PORT);
console.log('FRONTEND_URL:', FRONTEND_URL);

// Construct the callback URL using environment variables
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || `http://localhost:${API_GATEWAY_PORT}`;
const CALLBACK_URL = `${API_GATEWAY_URL}/api/users/auth/google/callback`;

// Define authorized origins
const AUTHORIZED_ORIGINS = [
  process.env.API_GATEWAY_URL || `http://localhost:${API_GATEWAY_PORT}`,
  FRONTEND_URL
];

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
      proxy: true,
      accessType: 'offline',
      prompt: 'consent',
      // Add these options to help with token issues
      passReqToCallback: true,
      userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google profile received:', profile.id);
        console.log('Google profile details:', {
          displayName: profile.displayName,
          email: profile.emails?.[0]?.value || 'No email provided',
          photo: profile.photos?.[0]?.value || 'No photo provided'
        });
        
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          console.log('Existing user found:', user.id);
          // Update user info if needed
          if (user.name !== profile.displayName || 
              user.email !== profile.emails[0].value || 
              user.profilePicture !== profile.photos[0].value) {
            
            user.name = profile.displayName;
            user.email = profile.emails[0].value;
            user.profilePicture = profile.photos[0].value;
            await user.save();
            console.log('User information updated');
          }
          return done(null, user);
        }

        console.log('Creating new user in MongoDB...');
        // Create new user
        const newUser = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          profilePicture: profile.photos[0].value,
          verified: true // Google accounts are pre-verified
        });

        // Save the new user
        await newUser.save();
        console.log('New user created:', newUser.id);
        console.log('User details:', {
          id: newUser.id,
          googleId: newUser.googleId,
          name: newUser.name,
          email: newUser.email
        });

        return done(null, newUser);
      } catch (err) {
        console.error('Error in Google strategy:', err);
        return done(err, null);
      }
    }
  )
);

// JWT Strategy for API authentication
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET
    },
    async (payload, done) => {
      try {
        // Find the user by ID
        const user = await User.findById(payload.id);

        if (!user) {
          return done(null, false);
        }

        return done(null, user);
      } catch (err) {
        console.error('Error in JWT strategy:', err);
        return done(err, false);
      }
    }
  )
);

module.exports = passport;
