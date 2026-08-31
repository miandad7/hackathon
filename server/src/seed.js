const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/db');
const User = require('./models/User');
const Complaint = require('./models/Complaint');

const seedData = async (shouldExit = true) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    // Clear existing data
    await User.deleteMany({});
    await Complaint.deleteMany({});
    console.log('Cleared existing User and Complaint data.');

    // Create Demo Officer
    const officer = await User.create({
      name: 'Officer Sarah Jenkins',
      email: 'officer@demo.gov',
      password: 'officer123',
      role: 'officer'
    });

    // Create Demo Citizen
    const citizen = await User.create({
      name: 'Alex Rivera',
      email: 'citizen@demo.gov',
      password: 'citizen123',
      role: 'citizen'
    });

    // Create Additional Citizens for realistic dataset
    const citizen2 = await User.create({
      name: 'David Chen',
      email: 'david@demo.gov',
      password: 'password123',
      role: 'citizen'
    });

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    // 9 Sample complaints with varying ages, upvotes, areas, categories, and statuses
    const sampleComplaints = [
      {
        title: 'Severe Asphalt Pothole on 5th Avenue',
        description: 'Large deep pothole disrupting traffic near the central bus stop. Caused tire damage to multiple vehicles.',
        category: 'Road',
        area: 'Downtown',
        status: 'pending',
        upvotes: 18,
        createdBy: citizen._id,
        createdAt: new Date(now - 8 * oneDay) // Age: 8 days -> Score = 18*2 + 8 = 44 (Critical)
      },
      {
        title: 'Overflowing Municipal Garbage Bins',
        description: 'Trash bins at 4th Street Plaza are overflowing, causing odors and attracting pests near food stalls.',
        category: 'Garbage',
        area: 'Westend',
        status: 'in-progress',
        upvotes: 9,
        createdBy: citizen2._id,
        officerRemark: 'Sanitation crew scheduled for evening clearance.',
        createdAt: new Date(now - 4 * oneDay) // Age: 4 days -> Score = 9*2 + 4 = 22 (High)
      },
      {
        title: 'Main Water Pipe Leak on Elm Street',
        description: 'Water leaking steadily onto sidewalk from broken main valve. Low water pressure reported in nearby apartments.',
        category: 'Water',
        area: 'Downtown',
        status: 'pending',
        upvotes: 14,
        createdBy: citizen._id,
        createdAt: new Date(now - 5 * oneDay) // Age: 5 days -> Score = 14*2 + 5 = 33 (Critical)
      },
      {
        title: 'Flickering Streetlight near Elementary School',
        description: 'Streetlight pole #42 is flickering intermittently at night, creating safety issues for evening pedestrians.',
        category: 'Electricity',
        area: 'North Suburbs',
        status: 'pending',
        upvotes: 2,
        createdBy: citizen2._id,
        createdAt: new Date(now - 1 * oneDay) // Age: 1 day -> Score = 2*2 + 1 = 5 (Medium)
      },
      {
        title: 'Broken Traffic Light Signal',
        description: 'Traffic signal at Industrial Blvd intersection stuck on flashing red in all directions.',
        category: 'Road',
        area: 'Industrial Ward',
        status: 'resolved',
        upvotes: 11,
        officerRemark: 'Electrician dispatched. Signal board replaced and tested.',
        feedbackRating: 5,
        feedbackComment: 'Prompt response! Signal is working perfectly now.',
        feedbackGiven: true,
        feedbackPending: false,
        createdBy: citizen._id,
        createdAt: new Date(now - 6 * oneDay),
        updatedAt: new Date(now - 1 * oneDay)
      },
      {
        title: 'Illegal Dumping of Construction Debris',
        description: 'Pile of concrete blocks and drywall left in vacant lot behind Community Center.',
        category: 'Garbage',
        area: 'Eastside',
        status: 'pending',
        upvotes: 4,
        createdBy: citizen2._id,
        createdAt: new Date(now - 0.2 * oneDay) // Age: 0 days -> Score = 4*2 + 0 = 8 (Medium)
      },
      {
        title: 'Substation Transformer Noise',
        description: 'Loud buzzing noise emanating from neighborhood substation unit.',
        category: 'Electricity',
        area: 'Westend',
        status: 'resolved',
        upvotes: 5,
        officerRemark: 'Grid maintenance team inspected and dampener pads installed.',
        feedbackPending: true, // Citizen needs to give feedback!
        feedbackGiven: false,
        createdBy: citizen._id,
        createdAt: new Date(now - 7 * oneDay),
        updatedAt: new Date(now - 2 * oneDay)
      },
      {
        title: 'Damaged Park Bench and Fence',
        description: 'Vandalism on western park boundary fence and broken wooden bench.',
        category: 'Other',
        area: 'North Suburbs',
        status: 'pending',
        upvotes: 1,
        createdBy: citizen2._id,
        createdAt: new Date(now - 0.5 * oneDay) // Age: 0 days -> Score = 1*2 + 0 = 2 (Low)
      },
      {
        title: 'Storm Drain Blocked by Dead Leaves',
        description: 'Drain inlet clogged at Corner of Oak & 9th, water accumulating after rain.',
        category: 'Water',
        area: 'Eastside',
        status: 'in-progress',
        upvotes: 6,
        createdBy: citizen._id,
        officerRemark: 'Public works team cleared surface layer. Pipe flushing scheduled.',
        createdAt: new Date(now - 3 * oneDay) // Age: 3 days -> Score = 6*2 + 3 = 15 (Medium)
      }
    ];

    await Complaint.insertMany(sampleComplaints);
    console.log(`Seeded ${sampleComplaints.length} complaints successfully.`);

    console.log('\n--- SEED COMPLETE ---');
    console.log('Demo Officer: email="officer@demo.gov", password="officer123"');
    console.log('Demo Citizen: email="citizen@demo.gov", password="citizen123"');
    console.log('---------------------\n');

    if (shouldExit) {
      process.exit(0);
    }
  } catch (error) {
    console.error('Error seeding database:', error);
    if (shouldExit) {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seedData(true);
}

module.exports = { seedData };
