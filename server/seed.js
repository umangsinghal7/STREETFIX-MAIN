const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Ward = require('./models/Ward');
const Report = require('./models/Report');

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Ward.deleteMany({});
  await Report.deleteMany({});
  console.log('Cleared existing data');

  // Create users
  const users = await User.create([
    { name: 'Arjun Mehta', email: 'citizen@example.com', password: 'password123', role: 'citizen', ward: 'Ward 1 - Koramangala' },
    { name: 'Municipal Authority Office', email: 'authority@example.com', password: 'password123', role: 'authority', ward: 'Ward 1 - Koramangala' },
    { name: 'Admin User', email: 'admin@example.com', password: 'password123', role: 'admin', ward: '' },
    { name: 'Priya Sharma', email: 'priya@example.com', password: 'password123', role: 'citizen', ward: 'Ward 2 - Indiranagar' },
    { name: 'Rahul Verma', email: 'rahul@example.com', password: 'password123', role: 'citizen', ward: 'Ward 3 - HSR Layout' },
  ]);
  console.log(`Created ${users.length} users`);

  // Create wards
  const wards = await Ward.create([
    { name: 'Ward 1 - Koramangala', city: 'Bengaluru', representative: { name: 'Rajesh Kumar', email: 'rajesh.kumar@bbmp.gov.in', phone: '9876543210' }, totalReports: 3, resolvedReports: 0, avgResolutionDays: 3.2, responseScore: 82 },
    { name: 'Ward 2 - Indiranagar', city: 'Bengaluru', representative: { name: 'Sunita Devi', email: 'sunita.devi@bbmp.gov.in', phone: '9876543211' }, totalReports: 1, resolvedReports: 0, avgResolutionDays: 5.6, responseScore: 58 },
    { name: 'Ward 3 - HSR Layout', city: 'Bengaluru', representative: { name: 'Amit Patel', email: 'amit.patel@bbmp.gov.in', phone: '9876543212' }, totalReports: 2, resolvedReports: 1, avgResolutionDays: 2.1, responseScore: 91 },
    { name: 'Ward 4 - Whitefield', city: 'Bengaluru', representative: { name: 'Kavitha Reddy', email: 'kavitha.r@bbmp.gov.in', phone: '9876543213' }, totalReports: 2, resolvedReports: 0, avgResolutionDays: 9.4, responseScore: 32 },
    { name: 'Ward 5 - Jayanagar', city: 'Bengaluru', representative: { name: 'Vikram Singh', email: 'vikram.s@bbmp.gov.in', phone: '9876543214' }, totalReports: 2, resolvedReports: 2, avgResolutionDays: 1.8, responseScore: 95 },
    { name: 'Ward 6 - Electronic City', city: 'Bengaluru', representative: { name: 'Meera Nair', email: 'meera.n@bbmp.gov.in', phone: '9876543215' }, totalReports: 1, resolvedReports: 0, avgResolutionDays: 11.2, responseScore: 25 },
  ]);
  console.log(`Created ${wards.length} wards`);

  // Create reports
  const [arjun, authority, admin, priya, rahul] = users;

  const reports = await Report.create([
    {
      title: 'Massive pothole causing accidents on 80 Feet Road',
      description: 'A 3-foot wide pothole has formed near the Sony Signal junction. Two auto-rickshaws have already damaged their axles here.',
      category: 'pothole', status: 'escalated', ward: 'Ward 4 - Whitefield',
      location: { type: 'Point', coordinates: [77.7480, 12.9698], address: '80 Feet Road, near Sony Signal, Whitefield' },
      beforeImage: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400&h=300&fit=crop',
      reportedBy: arjun._id, escalatedAt: new Date('2026-04-30'), escalationEmailSent: true,
      upvotes: [arjun._id, priya._id, rahul._id, admin._id],
      createdAt: new Date('2026-04-20'),
      timeline: [
        { action: 'created', description: 'Report submitted by citizen', performedBy: arjun._id, timestamp: new Date('2026-04-20') },
        { action: 'escalated', description: 'Auto-escalated after 7 days. Email sent to Kavitha Reddy.', timestamp: new Date('2026-04-27') },
      ],
    },
    {
      title: 'Streetlight out for 3 weeks on 100ft Road',
      description: 'The streetlight near Koramangala BDA Complex has been non-functional for 3 weeks. Unsafe for women and elderly after dark.',
      category: 'streetlight', status: 'in_progress', ward: 'Ward 1 - Koramangala',
      location: { type: 'Point', coordinates: [77.6245, 12.9352], address: '100ft Road, BDA Complex, Koramangala' },
      beforeImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop',
      reportedBy: priya._id, upvotes: [arjun._id, rahul._id],
      createdAt: new Date('2026-04-28'),
      timeline: [
        { action: 'created', description: 'Report submitted by citizen', performedBy: priya._id, timestamp: new Date('2026-04-28') },
        { action: 'status_change', description: 'Status changed to in_progress. Assigned to BESCOM.', performedBy: authority._id, timestamp: new Date('2026-04-30') },
      ],
    },
    {
      title: 'Garbage dump overflowing near school entrance',
      description: 'Community waste collection point near DPS School has not been cleared in 10+ days. Health risk to children.',
      category: 'trash', status: 'escalated', ward: 'Ward 6 - Electronic City',
      location: { type: 'Point', coordinates: [77.6701, 12.8458], address: 'Near DPS School Gate, Electronic City Phase 1' },
      beforeImage: 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=400&h=300&fit=crop',
      reportedBy: rahul._id, escalatedAt: new Date('2026-04-25'), escalationEmailSent: true,
      upvotes: [arjun._id, priya._id, rahul._id, authority._id, admin._id],
      createdAt: new Date('2026-04-15'),
      timeline: [
        { action: 'created', description: 'Report submitted by citizen', performedBy: rahul._id, timestamp: new Date('2026-04-15') },
        { action: 'escalated', description: 'Auto-escalated after 7 days. Notified Meera Nair.', timestamp: new Date('2026-04-22') },
      ],
    },
    {
      title: 'Open drainage blocking pedestrian walkway',
      description: 'Storm drain cover missing on 12th Main, HSR Layout. Extremely dangerous during monsoon.',
      category: 'drainage', status: 'resolved', ward: 'Ward 3 - HSR Layout',
      location: { type: 'Point', coordinates: [77.6387, 12.9116], address: '12th Main Road, HSR Layout Sector 4' },
      beforeImage: 'https://images.unsplash.com/photo-1582653291997-079a1c04e5a1?w=400&h=300&fit=crop',
      afterImage: 'https://images.unsplash.com/photo-1590496793929-36417d3117de?w=400&h=300&fit=crop',
      reportedBy: arjun._id, resolvedBy: authority._id, resolvedAt: new Date('2026-04-22'),
      upvotes: [priya._id, rahul._id],
      createdAt: new Date('2026-04-19'),
      timeline: [
        { action: 'created', description: 'Report submitted by citizen', performedBy: arjun._id, timestamp: new Date('2026-04-19') },
        { action: 'status_change', description: 'Maintenance crew dispatched.', performedBy: authority._id, timestamp: new Date('2026-04-20') },
        { action: 'resolved', description: 'New drain cover installed. Walkway safe.', performedBy: authority._id, timestamp: new Date('2026-04-22') },
      ],
    },
    {
      title: 'Road completely damaged after water pipe burst',
      description: 'BWSSB water pipe burst has caused a 50-meter stretch to collapse. 30-min delays during peak hours.',
      category: 'road_damage', status: 'in_progress', ward: 'Ward 2 - Indiranagar',
      location: { type: 'Point', coordinates: [77.6408, 12.9784], address: 'CMH Road, near Indiranagar Metro Station' },
      beforeImage: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400&h=300&fit=crop',
      reportedBy: priya._id, upvotes: [arjun._id, rahul._id, admin._id],
      createdAt: new Date('2026-05-01'),
      timeline: [
        { action: 'created', description: 'Report submitted by citizen', performedBy: priya._id, timestamp: new Date('2026-05-01') },
        { action: 'status_change', description: 'BWSSB and road repair team coordinating.', performedBy: authority._id, timestamp: new Date('2026-05-02') },
      ],
    },
    {
      title: 'Broken footpath tiles causing tripping hazard',
      description: 'Multiple tiles on footpath near Jayanagar 4th Block are broken. One person hospitalized with a fracture.',
      category: 'road_damage', status: 'resolved', ward: 'Ward 5 - Jayanagar',
      location: { type: 'Point', coordinates: [77.5820, 12.9259], address: '4th Block, Jayanagar Shopping Complex' },
      beforeImage: 'https://images.unsplash.com/photo-1584463699057-a0c3dba3ef44?w=400&h=300&fit=crop',
      afterImage: 'https://images.unsplash.com/photo-1567449303183-ae0d6ed1c12e?w=400&h=300&fit=crop',
      reportedBy: arjun._id, resolvedBy: authority._id, resolvedAt: new Date('2026-04-18'),
      upvotes: [priya._id],
      createdAt: new Date('2026-04-16'),
      timeline: [
        { action: 'created', description: 'Report submitted by citizen', performedBy: arjun._id, timestamp: new Date('2026-04-16') },
        { action: 'resolved', description: 'All broken tiles replaced.', performedBy: authority._id, timestamp: new Date('2026-04-18') },
      ],
    },
    {
      title: 'Illegal dumping of construction debris',
      description: '2 truckloads of construction debris dumped on empty site corner. Blocking half the road.',
      category: 'trash', status: 'open', ward: 'Ward 1 - Koramangala',
      location: { type: 'Point', coordinates: [77.6190, 12.9340], address: '5th Cross, 6th Block, Koramangala' },
      beforeImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop',
      reportedBy: rahul._id, upvotes: [arjun._id, priya._id],
      createdAt: new Date('2026-05-04'),
      timeline: [
        { action: 'created', description: 'Report submitted by citizen', performedBy: rahul._id, timestamp: new Date('2026-05-04') },
      ],
    },
    {
      title: 'Traffic signal not working at major junction',
      description: 'Traffic signal at Silk Board junction blinking yellow for 2 days. 3 minor collisions already.',
      category: 'streetlight', status: 'open', ward: 'Ward 3 - HSR Layout',
      location: { type: 'Point', coordinates: [77.6225, 12.9172], address: 'Silk Board Junction, HSR Layout' },
      beforeImage: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400&h=300&fit=crop',
      reportedBy: arjun._id, upvotes: [priya._id, rahul._id, authority._id, admin._id],
      createdAt: new Date('2026-05-05'),
      timeline: [
        { action: 'created', description: 'Report submitted by citizen', performedBy: arjun._id, timestamp: new Date('2026-05-05') },
      ],
    },
    {
      title: 'Water logging on underpass after light rain',
      description: 'Whitefield underpass floods knee-deep even with 30 minutes of rain. Recurring every monsoon for 3 years.',
      category: 'drainage', status: 'escalated', ward: 'Ward 4 - Whitefield',
      location: { type: 'Point', coordinates: [77.7510, 12.9750], address: 'ITPL Main Road Underpass, Whitefield' },
      beforeImage: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=400&h=300&fit=crop',
      reportedBy: rahul._id, escalatedAt: new Date('2026-04-28'), escalationEmailSent: true,
      upvotes: [arjun._id, priya._id, rahul._id, authority._id],
      createdAt: new Date('2026-04-18'),
      timeline: [
        { action: 'created', description: 'Report submitted by citizen', performedBy: rahul._id, timestamp: new Date('2026-04-18') },
        { action: 'escalated', description: 'Auto-escalated after 7 days. Third escalation this year.', timestamp: new Date('2026-04-25') },
      ],
    },
    {
      title: 'Fallen tree blocking entire lane after storm',
      description: 'Large neem tree uprooted in storm. No vehicles can pass. Power lines tangled.',
      category: 'other', status: 'resolved', ward: 'Ward 5 - Jayanagar',
      location: { type: 'Point', coordinates: [77.5780, 12.9300], address: '11th Main, Jayanagar 3rd Block' },
      beforeImage: 'https://images.unsplash.com/photo-1542621334-a254cf47733d?w=400&h=300&fit=crop',
      afterImage: 'https://images.unsplash.com/photo-1567449303183-ae0d6ed1c12e?w=400&h=300&fit=crop',
      reportedBy: priya._id, resolvedBy: authority._id, resolvedAt: new Date('2026-05-03'),
      upvotes: [arjun._id, rahul._id],
      createdAt: new Date('2026-05-02'),
      timeline: [
        { action: 'created', description: 'Emergency report submitted.', performedBy: priya._id, timestamp: new Date('2026-05-02') },
        { action: 'resolved', description: 'Tree removed, road cleared, power restored.', performedBy: authority._id, timestamp: new Date('2026-05-03') },
      ],
    },
  ]);
  console.log(`Created ${reports.length} reports`);

  console.log('\n✅ Database seeded successfully!');
  console.log('Login: citizen@example.com / password123');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
