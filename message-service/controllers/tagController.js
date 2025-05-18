const Tag = require('../models/Tag');

// Create a new tag
exports.createTag = async (req, res) => {
  try {
    const { name, eventId } = req.body;
    const createdBy = req.user ? req.user._id : null; // Allow unauthenticated for now
    const tag = await Tag.create({ name, eventId, createdBy });
    res.status(201).json(tag);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Tag name must be unique for this event.' });
    }
    res.status(500).json({ error: 'Failed to create tag.' });
  }
};

// Edit a tag
exports.editTag = async (req, res) => {
  try {
    const { tagId } = req.params;
    const { name } = req.body;
    const tag = await Tag.findByIdAndUpdate(tagId, { name }, { new: true });
    if (!tag) return res.status(404).json({ error: 'Tag not found.' });
    res.json(tag);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Tag name must be unique for this event.' });
    }
    res.status(500).json({ error: 'Failed to edit tag.' });
  }
};

// Delete a tag
exports.deleteTag = async (req, res) => {
  try {
    const { tagId } = req.params;
    const tag = await Tag.findByIdAndDelete(tagId);
    if (!tag) return res.status(404).json({ error: 'Tag not found.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete tag.' });
  }
};

// List tags for an event
exports.listTags = async (req, res) => {
  try {
    const { eventId } = req.query;
    if (!eventId) return res.status(400).json({ error: 'eventId is required.' });
    const tags = await Tag.find({ eventId }).sort({ name: 1 });
    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tags.' });
  }
}; 