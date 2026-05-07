require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Ward = require('./models/Ward');
const Report = require('./models/Report');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Ward.deleteMany({});
  await Report.deleteMany({});

  // Create wards
  const wards = await Ward.insertMany([
    { name: 'Ward 1 - Downtown', city: 'Metro City', representative: { name: 'Raj Kumar', email: 'raj@gov.example.com', phone: '9876543210' } },
    { name: 'Ward 2 - Eastside', city: 'Metro City', representative: { name: 'Priya Sharma', email: 'priya@gov.example.com', phone: '9876543211' } },
    { name: 'Ward 3 - Westend', city: 'Metro City', representative: { name: 'Amit Patel', email: 'amit@gov.example.com', phone: '9876543212' } },
    { name: 'Ward 4 - Northgate', city: 'Metro City', representative: { name: 'Sunita Devi', email: 'sunita@gov.example.com', phone: '9876543213' } },
    { name: 'Ward 5 - Southpark', city: 'Metro City', representative: { name: 'Vikram Singh', email: 'vikram@gov.example.com', phone: '9876543214' } },
  ]);

  // Create users
  const citizen = await User.create({
    name: 'Test Citizen',
    email: 'citizen@example.com',
    password: 'password123',
    role: 'citizen',
    ward: 'Ward 1 - Downtown',
  });

  const authority = await User.create({
    name: 'City Authority',
    email: 'authority@example.com',
    password: 'password123',
    role: 'authority',
    ward: 'Ward 1 - Downtown',
  });

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
  });

  // Create sample reports
  const reports = await Report.insertMany([
    {
      title: 'Large pothole on MG Road',
      description: 'A dangerous pothole near the bus stop that has caused multiple accidents.',
      category: 'pothole',
      status: 'open',
      ward: 'Ward 1 - Downtown',
      location: { type: 'Point', coordinates: [77.5946, 12.9716], address: 'MG Road, Downtown' },
      beforeImage: '/uploads/sample-pothole.jpg',
      reportedBy: citizen._id,
      timeline: [{ action: 'created', description: 'Report submitted', performedBy: citizen._id }],
    },
    {
      title: 'Broken streetlight on 5th Avenue',
      description: 'Streetlight has been out for 2 weeks, making the area unsafe at night.',
      category: 'streetlight',
      status: 'in_progress',
      ward: 'Ward 2 - Eastside',
      location: { type: 'Point', coordinates: [77.6010, 12.9750], address: '5th Avenue, Eastside' },
      beforeImage: '/uploads/sample-streetlight.jpg',
      reportedBy: citizen._id,
      timeline: [
        { action: 'created', description: 'Report submitted', performedBy: citizen._id },
        { action: 'status_change', description: 'Status changed to in_progress', performedBy: authority._id },
      ],
    },
    {
      title: 'Overflowing garbage bin near park',
      description: 'The community garbage bin hasnt been emptied in over a week.',
      category: 'trash',
      status: 'escalated',
      ward: 'Ward 3 - Westend',
      location: { type: 'Point', coordinates: [77.5800, 12.9650], address: 'Central Park, Westend' },
      beforeImage: '/uploads/sample-trash.jpg',
      reportedBy: citizen._id,
      escalatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      escalationEmailSent: true,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      timeline: [
        { action: 'created', description: 'Report submitted', performedBy: citizen._id },
        { action: 'escalated', description: 'Auto-escalated after 7 days', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      ],
    },
  ]);

  // Update ward metrics
  const ward1 = await Ward.findOne({ name: 'Ward 1 - Downtown' });
  ward1.totalReports = 1;
  await ward1.save();

  const ward2 = await Ward.findOne({ name: 'Ward 2 - Eastside' });
  ward2.totalReports = 1;
  await ward2.save();

  const ward3 = await Ward.findOne({ name: 'Ward 3 - Westend' });
  ward3.totalReports = 1;
  await ward3.save();

  console.log('✅ Seed data created successfully');
  console.log('   - 5 wards');
  console.log('   - 3 users (citizen@example.com / authority@example.com / admin@example.com)');
  console.log('   - 3 sample reports');
  console.log('   Password for all users: password123');

  await mongoose.disconnect();
};

seed().catch(console.error);
