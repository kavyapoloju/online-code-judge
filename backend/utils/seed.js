require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Problem = require('../models/Problem');

const problems = [
  {
    title: 'Two Sum',
    slug: 'two-sum',
    description:
      'Given a line of space-separated integers followed by a target on the next line, print the 0-based indices of the two numbers that add up to the target, space-separated.',
    difficulty: 'Easy',
    tags: ['array', 'hash-map'],
    constraints: '2 <= n <= 10^4',
    testCases: [
      { input: '2 7 11 15\n9', expectedOutput: '0 1', isSample: true },
      { input: '3 2 4\n6', expectedOutput: '1 2', isSample: true },
      { input: '3 3\n6', expectedOutput: '0 1', isSample: false },
    ],
    timeLimitMs: 2000,
  },
  {
    title: 'Reverse a String',
    slug: 'reverse-a-string',
    description: 'Read a single line string and print it reversed.',
    difficulty: 'Easy',
    tags: ['strings'],
    constraints: '1 <= |s| <= 10^5',
    testCases: [
      { input: 'hello', expectedOutput: 'olleh', isSample: true },
      { input: 'racecar', expectedOutput: 'racecar', isSample: true },
      { input: 'abcd', expectedOutput: 'dcba', isSample: false },
    ],
    timeLimitMs: 2000,
  },
  {
    title: 'Fibonacci Number',
    slug: 'fibonacci-number',
    description: 'Given an integer n, print the nth Fibonacci number (0-indexed, F(0)=0, F(1)=1).',
    difficulty: 'Medium',
    tags: ['dp', 'math'],
    constraints: '0 <= n <= 30',
    testCases: [
      { input: '5', expectedOutput: '5', isSample: true },
      { input: '10', expectedOutput: '55', isSample: true },
      { input: '0', expectedOutput: '0', isSample: false },
    ],
    timeLimitMs: 2000,
  },
];

const run = async () => {
  await connectDB();
  await mongoose.connection.dropDatabase();
  console.log('Cleared old database for a clean seed.');

  const adminEmail = 'admin@codejudge.dev';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      username: 'admin',
      email: adminEmail,
      password: 'Admin@123',
      role: 'admin',
    });
    console.log('Created admin user: admin@codejudge.dev / Admin@123');
  }

  for (const p of problems) {
    const exists = await Problem.findOne({ slug: p.slug });
    if (!exists) {
      await Problem.create({ ...p, createdBy: admin._id });
      console.log(`Seeded problem: ${p.title}`);
    }
  }

  console.log('Seeding complete.');
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
