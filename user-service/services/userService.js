const User = require('../models/User');
const UserPreferences = require('../models/UserPreferences');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { uploadFileToS3 } = require('../utils/s3Upload');

class UserService {
  // User Authentication Methods
  async register(userData) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Create new user
      const user = new User(userData);
      await user.save();

      // Create default preferences
      const preferences = new UserPreferences({
        userId: user._id
      });
      await preferences.save();

      // Generate JWT token
      const token = this.generateToken(user);

      return { user, token };
    } catch (error) {
      throw error;
    }
  }

  async login(email, password) {
    try {
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      const token = this.generateToken(user);
      return { user, token };
    } catch (error) {
      throw error;
    }
  }

  async getCurrentUser(userId) {
    try {
      console.log(`[User Service:Step 1] Starting getCurrentUser process`);
      console.log(`[User Service:Step 2] User ID from request:`, userId);
      
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      console.log(`[User Service:Step 3] User found:`, { userId: user._id, email: user.email });
      return user;
    } catch (error) {
      console.error(`[User Service:Step 4] getCurrentUser error:`, error.message);
      
      throw error;
    }
  }
  
  /**
   * Get user profile by ID
   * @param {string} userId - The user ID to fetch
   * @returns {Promise<object>} - User object
   */
  async getUserById(userId) {
    try {
      console.log(`[User Service] Starting getUserById process for ID: ${userId}`);
      
      // Find user by ID
      const user = await User.findById(userId);
      if (!user) {
        console.log(`[User Service] User not found with ID: ${userId}`);
        throw new Error(`User not found with ID: ${userId}`);
      }
      
      console.log(`[User Service] User found:`, { userId: user._id, name: user.name });
      
      // Return user data without sensitive information
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        location: user.location,
        profileImage: user.profileImage,
        interests: user.interests,
        joined: user.createdAt,
        verified: user.verified,
        rating: user.rating,
        eventsHosted: user.eventsHosted || 0
      };
    } catch (error) {
      console.error(`[User Service] getUserById error:`, error.message);
      throw error;
    }
  }

  async updateProfile(userId, updateData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Update user fields
      Object.keys(updateData).forEach(key => {
        user[key] = updateData[key];
      });

      // Recalculate completeness
      user.calculateCompleteness();

      await user.save();
      return user;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Upload profile image and update user profile
   * @param {string} userId - The user ID
   * @param {object} file - The uploaded file (from multer)
   * @returns {Promise<object>} - Updated user object
   */
  async uploadProfileImage(userId, file) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Upload file to S3
      const imageUrl = await uploadFileToS3(
        file.buffer,
        file.originalname,
        userId
      );
      
      // Update user profile with the image URL
      user.profileImage = imageUrl;
      
      // Recalculate completeness
      user.calculateCompleteness();
      
      await user.save();
      return user;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  }

  // User Preferences Methods
  async getUserPreferences(userId) {
    console.log(`[User Service:Step 1] Starting getUserPreferences process`);
    console.log(`[User Service:Step 2] User ID from request:`, userId);
    
    try {
      const preferences = await UserPreferences.findOne({ userId });
      if (!preferences) {
        throw new Error('Preferences not found');
      }
      return preferences;
    } catch (error) {
      throw error;
    }
  }

  async updateUserPreferences(userId, updateData) {
    try {
      const preferences = await UserPreferences.findOne({ userId });
      if (!preferences) {
        throw new Error('Preferences not found');
      }

      Object.keys(updateData).forEach(key => {
        preferences[key] = updateData[key];
      });

      await preferences.save();
      return preferences;
    } catch (error) {
      throw error;
    }
  }

  // Helper Methods
  generateToken(user) {
    return jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserService(); 