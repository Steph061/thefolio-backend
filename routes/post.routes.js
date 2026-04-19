// backend/routes/post.routes.js
const express = require('express');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth.middleware');
const { memberOrAdmin } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload');

const router = express.Router();

// GET /api/posts — Public: all published posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({ status: 'published' })
      .populate('author', 'name profile_pic')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/posts/:id
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name profile_pic');
    if (!post || post.status !== 'published') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/posts/mine — Authenticated user posts
router.get('/mine', protect, memberOrAdmin, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id })
      .populate('author', 'name profile_pic')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/posts — Create new post
router.post('/', protect, memberOrAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, body } = req.body;
    const postData = {
      title,
      body,
      author: req.user._id
    };

    if (req.file) {
      postData.image = req.file.filename;
    }

    const post = await Post.create(postData);
    await post.populate('author', 'name profile_pic');
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/posts/:id — Update post
router.put('/:id', protect, memberOrAdmin, upload.single('image'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns the post or is admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    const { title, body } = req.body;
    const updateData = { title, body };

    if (req.file) {
      updateData.image = req.file.filename;
    }

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).populate('author', 'name profile_pic');

    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/posts/:id — Delete post
router.delete('/:id', protect, memberOrAdmin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns the post or is admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
router.put('/:id', protect, memberOrAdmin, upload.single('image'), async (req, res) => {
  try {
    const post = await pool.query('SELECT * FROM posts WHERE id = $1', [req.params.id]);
    if (post.rows.length === 0) return res.status(404).json({ message: 'Post not found' });
    const isOwner = post.rows[0].author_id === req.user.id;
    if (!isOwner && req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });
    const { title, body } = req.body;
    const image = req.file ? req.file.filename : post.rows[0].image;
    const result = await pool.query(
      'UPDATE posts SET title=$1, body=$2, image=$3, updated_at=CURRENT_TIMESTAMP WHERE id=$4 RETURNING *',
      [title||post.rows[0].title, body||post.rows[0].body, image, req.params.id] );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/posts/:id
router.delete('/:id', protect, memberOrAdmin, async (req, res) => {
  try {
    const post = await pool.query('SELECT * FROM posts WHERE id = $1', [req.params.id]);
    if (post.rows.length === 0) return res.status(404).json({ message: 'Post not found' });
    const isOwner = post.rows[0].author_id === req.user.id;
    if (!isOwner && req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });
    await pool.query('DELETE FROM posts WHERE id = $1', [req.params.id]);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;