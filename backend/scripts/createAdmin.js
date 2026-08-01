/**
 * Run this once to create the first admin account, since there's no
 * public endpoint to self-assign the admin role (by design).
 *
 * Usage:
 *   node scripts/createAdmin.js "Admin Name" admin@example.com "StrongPass123"
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const run = async () => {
  const [, , name, email, password] = process.argv;

  if (!name || !email || !password) {
    console.log('Usage: node scripts/createAdmin.js "Admin Name" admin@example.com "StrongPass123"');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    existing.role = 'admin';
    await existing.save();
    console.log(`Existing user ${email} promoted to admin.`);
  } else {
    await User.create({ name, email, password, role: 'admin' });
    console.log(`Admin account created for ${email}.`);
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Failed to create admin:', err.message);
  process.exit(1);
});
