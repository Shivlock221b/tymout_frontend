const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
// const requireAuth = require('../middleware/requireAuth'); // Uncomment and use when available

// Create a tag (admin only)
router.post('/', /*requireAuth,*/ tagController.createTag);
// Edit a tag (admin only)
router.put('/:tagId', /*requireAuth,*/ tagController.editTag);
// Delete a tag (admin only)
router.delete('/:tagId', /*requireAuth,*/ tagController.deleteTag);
// List tags for an event (all members)
router.get('/', /*requireAuth,*/ tagController.listTags);

module.exports = router; 