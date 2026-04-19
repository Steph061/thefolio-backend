// backend/seedAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.DATABASE_URL);

    const exists = await User.findOne({ email: 'admin@thefolio.com' });
    if (exists) {
      console.log('Admin already exists.');
      process.exit();
    }

    const hashed = await bcrypt.hash('Admin@1234', 12);
    await User.create({
      name: 'TheFolio Admin',
      email: 'admin@thefolio.com',
      password: hashed,
      role: 'admin'
    });

    console.log('Admin created! Email: admin@thefolio.com / Password: Admin@1234');
    process.exit();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

seed();