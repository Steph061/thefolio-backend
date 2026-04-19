// backend/routes/contact.routes.js
const express = require('express');
const Message = require('../models/Message');

const router = express.Router();

// POST /api/contact — public contact form submission
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required.' });
    }

    await Message.create({
      name,
      email,
      message
    });

    res.status(201).json({ message: 'Message received successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
