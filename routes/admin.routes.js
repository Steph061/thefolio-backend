// backend/routes/admin.routes.js
const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const Message = require('../models/Message');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/role.middleware');

const router = express.Router();

router.use(protect, adminOnly);

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('name email role status createdAt')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/users/:id/status
router.put('/users/:id/status', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role === 'admin') {
      return res.status(404).json({ message: 'User not found' });
    }

    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    user.status = newStatus;
    await user.save();

    res.json({
      message: `User is now ${newStatus}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/posts
router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/posts/:id/remove
router.put('/posts/:id/remove', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { status: 'removed' },
      { new: true }
    ).populate('author', 'name email');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ message: 'Post has been removed', post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/messages
router.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find({}).sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const totalMembers = await User.countDocuments({ role: { $ne: 'admin' } });
    const activeMembers = await User.countDocuments({
      role: { $ne: 'admin' },
      status: 'active'
    });
    const totalPosts = await Post.countDocuments({});
    const totalMessages = await Message.countDocuments({});

    res.json({
      totalMembers,
      activeMembers,
      totalPosts,
      totalMessages,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;