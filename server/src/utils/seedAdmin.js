import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.model.js';

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email: 'admin@scrapit.com' });

    if (existing) {
      console.log('Admin already exists — skipping seed');
      process.exit(0);
    }

    await User.create({
      fullName: 'ScrapIt Admin',
      email: 'admin@scrapit.com',
      password: 'Admin@1234',
      role: 'admin',
      phone: '+2348000000001',
      defaultAddress: 'ScrapIt HQ, Victoria Island, Lagos',
    });

    console.log('Admin seeded successfully');
    console.log('Email:    admin@scrapit.com');
    console.log('Password: Admin@1234');
    console.log('Change this password immediately after first login!');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedAdmin();