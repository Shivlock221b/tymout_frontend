const userService = require('../services/userService');
const { validationResult } = require('express-validator');

class UserController {
  // Authentication Controllers
  async register(req, res) {
    console.log(`[User Controller:Step 1] Starting registration process`);
    console.log(`[User Controller:Step 2] Request body:`, { ...req.body, password: '***' });
    
    try {
      console.log(`[User Controller:Step 3] Validating request data`);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log(`[User Controller:Step 4] Validation errors:`, errors.array());
        return res.status(400).json({ errors: errors.array() });
      }
      console.log(`[User Controller:Step 5] Validation passed`);

      console.log(`[User Controller:Step 6] Calling userService.register`);
      const { user, token, refreshToken } = await userService.register(req.body);
      console.log(`[User Controller:Step 7] User created successfully:`, { userId: user._id, email: user.email });
      console.log(`[User Controller:Step 8] JWT tokens generated`);

      res.status(201).json({
        success: true,
        data: {
          user,
          token,
          refreshToken
        }
      });
      console.log(`[User Controller:Step 9] Registration response sent`);
    } catch (error) {
      console.error(`[User Controller:Step 10] Registration error:`, error.message);
      console.error(`[User Controller:Step 10.1] Error details:`, {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async login(req, res) {
    console.log(`[User Controller:Step 1] Starting login process`);
    console.log(`[User Controller:Step 2] Request body:`, { ...req.body, password: '***' });
    
    try {
      console.log(`[User Controller:Step 3] Validating request data`);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log(`[User Controller:Step 4] Validation errors:`, errors.array());
        return res.status(400).json({ errors: errors.array() });
      }
      console.log(`[User Controller:Step 5] Validation passed`);

      const { email, password } = req.body;
      console.log(`[User Controller:Step 6] Calling userService.login for email:`, email);
      
      const { user, token, refreshToken } = await userService.login(email, password);
      console.log(`[User Controller:Step 7] Login successful for user:`, { userId: user._id, email: user.email });
      console.log(`[User Controller:Step 8] JWT tokens generated`);
      
      res.status(200).json({
        success: true,
        data: {
          user,
          token,
          refreshToken
        }
      });
      console.log(`[User Controller:Step 9] Login response sent`);
    } catch (error) {
      console.error(`[User Controller:Step 10] Login error:`, error.message);
      console.error(`[User Controller:Step 10.1] Error details:`, {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      res.status(401).json({
        success: false,
        error: error.message
      });
    }
  }

  async getCurrentUser(req, res) {
    console.log(`[User Controller:Step 1] Starting getCurrentUser process`);
    console.log(`[User Controller:Step 2] User ID from request:`, req.user.id);
    
    try {
      console.log(`[User Controller:Step 3] Calling userService.getCurrentUser`);
      const user = await userService.getCurrentUser(req.user.id);
      console.log(`[User Controller:Step 4] User found:`, { userId: user._id, email: user.email });
      
      res.status(200).json({
        success: true,
        data: user
      });
      console.log(`[User Controller:Step 5] getCurrentUser response sent`);
    } catch (error) {
      console.error(`[User Controller:Step 6] getCurrentUser error:`, error.message);
      console.error(`[User Controller:Step 6.1] Error details:`, {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }
  
  /**
   * Refresh the user's access token using a refresh token
   * @param {object} req - Express request object with refreshToken in body
   * @param {object} res - Express response object
   */
  async refreshToken(req, res) {
    console.log(`[User Controller:Step 1] Starting refreshToken process`);
    
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        console.log(`[User Controller:Step 2] No refresh token provided`);
        return res.status(400).json({
          success: false,
          error: 'Refresh token is required'
        });
      }
      
      console.log(`[User Controller:Step 3] Calling userService.refreshUserToken`);
      const { user, token } = await userService.refreshUserToken(refreshToken);
      console.log(`[User Controller:Step 4] Token refreshed for user:`, { userId: user._id, email: user.email });
      
      res.status(200).json({
        success: true,
        data: {
          user,
          token
        }
      });
      console.log(`[User Controller:Step 5] Response sent with new token`);
    } catch (error) {
      console.error(`[User Controller:Step 6] Token refresh error:`, error.message);
      res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }
  }
  
  /**
   * Get user profile by ID
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getUserById(req, res) {
    console.log(`[User Controller] Starting getUserById process`);
    console.log(`[User Controller] User ID from params:`, req.params.id);
    
    try {
      // Get user by ID from userService
      const user = await userService.getUserById(req.params.id);
      console.log(`[User Controller] User found:`, { userId: user._id, name: user.name });
      
      // Return user data
      res.status(200).json({
        success: true,
        data: user
      });
      console.log(`[User Controller] getUserById response sent`);
    } catch (error) {
      console.error(`[User Controller] getUserById error:`, error.message);
      console.error(`[User Controller] Error details:`, {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await userService.updateProfile(req.user.id, req.body);
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
  
  /**
   * Upload profile image
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async uploadProfileImage(req, res) {
    try {
      console.log(`[User Controller] Starting profile image upload for user ${req.user.id}`);
      
      // Check if file exists in request
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No image file provided'
        });
      }
      
      console.log(`[User Controller] File received:`, {
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      });
      
      // Process the upload
      const user = await userService.uploadProfileImage(req.user.id, req.file);
      
      console.log(`[User Controller] Profile image uploaded successfully for user ${req.user.id}`);
      
      res.status(200).json({
        success: true,
        data: {
          user,
          profileImage: user.profileImage
        }
      });
    } catch (error) {
      console.error(`[User Controller] Error uploading profile image:`, error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to upload profile image'
      });
    }
  }

  // Preferences Controllers
  async getUserPreferences(req, res) {
    try {
      console.log(`[User Controller:Step 1] Starting getUserPreferences process`);
      console.log(`[User Controller:Step 2] User ID from request:`, req.user.id);
      
      const preferences = await userService.getUserPreferences(req.user.id);
      console.log(`[User Controller:Step 3] Preferences found:`, preferences);
      res.status(200).json({
        success: true,
        data: preferences
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }

  async updateUserPreferences(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const preferences = await userService.updateUserPreferences(req.user.id, req.body);
      res.status(200).json({
        success: true,
        data: preferences
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new UserController(); 