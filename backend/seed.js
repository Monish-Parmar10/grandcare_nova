import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import User from './src/models/User.js';
import NewsQuizQuestion from './src/models/NewsQuizQuestion.js';

dotenv.config();

connectDB();

const seedData = async () => {
  try {
    await User.deleteMany();
    await NewsQuizQuestion.deleteMany();

    // 1. Create Mock Users
    const users = await User.insertMany([
      {
        name: 'John Elder',
        phone: '1234567890',
        password: 'password123', // Will be hashed by pre-save hook
        role: 'elder',
        city: 'Mumbai',
        grandScore: 50,
        location: {
          type: 'Point',
          coordinates: [72.8777, 19.0760] // Mumbai [lng, lat]
        }
      },
      {
        name: 'Jane Helper',
        phone: '0987654321',
        password: 'password123',
        role: 'helper',
        city: 'Mumbai',
        skills: ['Grocery', 'Tech help'],
        location: {
          type: 'Point',
          coordinates: [72.8778, 19.0761] // Nearby
        }
      }
    ]);

    // 2. Create Mock Quiz Questions
    await NewsQuizQuestion.insertMany([
      {
        question: 'What is the capital of India?',
        options: ['Mumbai', 'New Delhi', 'Kolkata', 'Chennai'],
        correctIndex: 1,
        points: 10,
      },
      {
        question: 'Which of the following is good for bone health?',
        options: ['Sugar', 'Calcium', 'Caffeine', 'Sodium'],
        correctIndex: 1,
        points: 10,
      },
      {
        question: 'How many glasses of water are recommended daily?',
        options: ['1-2', '3-4', '8-10', '15-20'],
        correctIndex: 2,
        points: 10,
      }
    ]);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
