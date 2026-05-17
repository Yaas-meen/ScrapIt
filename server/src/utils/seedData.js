import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.model.js';
import Collector from '../models/Collector.model.js';
import Pickup from '../models/Pickup.model.js';
import Reward from '../models/Reward.model.js';
import Notification from '../models/Notification.model.js';
import { WASTE_RATES } from '../services/points.service.js';
import { generateRewardCode } from '../utils/generateRewardCode.js';

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data except admin
    await Promise.all([
      User.deleteMany({ role: 'user' }),
      Collector.deleteMany(),
      Pickup.deleteMany(),
      Reward.deleteMany(),
      Notification.deleteMany(),
    ]);
    console.log('Cleared existing seed data');

    //Users
    const users = await User.create([
      {
        fullName: 'Chidi Okeke',
        email: 'chidi@gmail.com',
        password: 'password123',
        phone: '+2348012345678',
        defaultAddress: '14 Admiralty Way, Lekki Phase 1, Lagos',
        points: 2450,
        totalPointsEarned: 3200,
        totalPointsSpent: 750,
        role: 'user',
      },
      {
        fullName: 'Hauwa Ismail',
        email: 'hauwa@gmail.com',
        password: 'password123',
        phone: '+2348023456789',
        defaultAddress: '7 Adeola Odeku Street, Victoria Island, Lagos',
        points: 8000,
        totalPointsEarned: 9500,
        totalPointsSpent: 1500,
        role: 'user',
      },
      {
        fullName: 'Ibrahim Auwal',
        email: 'ibrahim@gmail.com',
        password: 'password123',
        phone: '+2348034567890',
        defaultAddress: '22 Allen Avenue, Ikeja, Lagos',
        points: 500,
        totalPointsEarned: 500,
        totalPointsSpent: 0,
        role: 'user',
      },
      {
        fullName: 'Kemi Lawson',
        email: 'kemi@gmail.com',
        password: 'password123',
        phone: '+2348045678901',
        defaultAddress: '3 Isaac John Street, GRA, Ikeja, Lagos',
        points: 1200,
        totalPointsEarned: 2000,
        totalPointsSpent: 800,
        role: 'user',
      },
      {
        fullName: 'James John',
        email: 'james@gmail.com',
        password: 'password123',
        phone: '+2348056789012',
        defaultAddress: '9 Bode Thomas Street, Surulere, Lagos',
        points: 100,
        totalPointsEarned: 100,
        totalPointsSpent: 0,
        role: 'user',
      },
    ]);
    console.log(`Seeded ${users.length} users`);

    // Collectors
    const collectors = await Collector.create([
      {
        fullName: 'Jamilu Abubakar',
        email: 'jamilu@scrapit.com',
        password: 'collector123',
        phone: '+2348098765432',
        isActive: true,
        totalCompleted: 34,
      },
      {
        fullName: 'Sola Adebayo',
        email: 'sola@scrapit.com',
        password: 'collector123',
        phone: '+2348087654321',
        isActive: true,
        totalCompleted: 21,
      },
      {
        fullName: 'Ngozi Eze',
        email: 'ngozi@scrapit.com',
        password: 'collector123',
        phone: '+2348076543210',
        isActive: false,
        totalCompleted: 8,
      },
    ]);
    console.log(`Seeded ${collectors.length} collectors`);


    const makeItems = (items) =>
      items.map(({ type, weight }) => ({
        type,
        weight,
        pointsRate: WASTE_RATES[type],
        pointsEarned: Math.round(weight * WASTE_RATES[type]),
      }));

    const totalPts = (items) =>
      items.reduce((sum, i) => sum + i.pointsEarned, 0);

    const totalWt = (items) =>
      items.reduce((sum, i) => sum + i.weight, 0);

    //Seed data
    const now = new Date();
    const daysAgo = (n) => new Date(now - n * 86400000);

    const pickupDefs = [
      // Completed pickups
      {
        user: users[0]._id,
        items: makeItems([{ type: 'Plastic', weight: 2.5 }, { type: 'Metal', weight: 1 }]),
        date: daysAgo(10),
        address: users[0].defaultAddress,
        status: 'Completed',
        collector: collectors[0]._id,
        pointsAwarded: true,
      },
      {
        user: users[1]._id,
        items: makeItems([{ type: 'Glass', weight: 5 }, { type: 'Metal', weight: 3 }]),
        date: daysAgo(8),
        address: users[1].defaultAddress,
        status: 'Completed',
        collector: collectors[1]._id,
        pointsAwarded: true,
      },
      {
        user: users[0]._id,
        items: makeItems([{ type: 'Metal', weight: 4 }]),
        date: daysAgo(6),
        address: users[0].defaultAddress,
        status: 'Completed',
        collector: collectors[0]._id,
        pointsAwarded: true,
      },
      {
        user: users[3]._id,
        items: makeItems([{ type: 'Plastic', weight: 3 }, { type: 'Glass', weight: 2 }]),
        date: daysAgo(5),
        address: users[3].defaultAddress,
        status: 'Completed',
        collector: collectors[1]._id,
        pointsAwarded: true,
      },
      {
        user: users[2]._id,
        items: makeItems([{ type: 'Plastic', weight: 5 }]),
        date: daysAgo(4),
        address: users[2].defaultAddress,
        status: 'Completed',
        collector: collectors[0]._id,
        pointsAwarded: true,
      },
      // In Progress
      {
        user: users[1]._id,
        items: makeItems([{ type: 'Metal', weight: 2 }, { type: 'Glass', weight: 1.5 }]),
        date: daysAgo(1),
        address: users[1].defaultAddress,
        status: 'In Progress',
        collector: collectors[0]._id,
        pointsAwarded: false,
      },
      {
        user: users[4]._id,
        items: makeItems([{ type: 'Plastic', weight: 3.5 }]),
        date: daysAgo(1),
        address: users[4].defaultAddress,
        status: 'In Progress',
        collector: collectors[1]._id,
        pointsAwarded: false,
      },
      // Approved
      {
        user: users[0]._id,
        items: makeItems([{ type: 'Glass', weight: 4 }, { type: 'Plastic', weight: 2 }]),
        date: daysAgo(2),
        address: users[0].defaultAddress,
        status: 'Approved',
        collector: collectors[0]._id,
        pointsAwarded: false,
      },
      {
        user: users[3]._id,
        items: makeItems([{ type: 'Metal', weight: 1.5 }]),
        date: daysAgo(2),
        address: users[3].defaultAddress,
        status: 'Approved',
        collector: null,
        pointsAwarded: false,
      },
      // Pending
      {
        user: users[1]._id,
        items: makeItems([{ type: 'Plastic', weight: 6 }]),
        date: daysAgo(0),
        address: users[1].defaultAddress,
        status: 'Pending',
        collector: null,
        pointsAwarded: false,
      },
      {
        user: users[2]._id,
        items: makeItems([{ type: 'Glass', weight: 3 }, { type: 'Metal', weight: 2 }]),
        date: daysAgo(0),
        address: users[2].defaultAddress,
        status: 'Pending',
        collector: null,
        pointsAwarded: false,
      },
      {
        user: users[4]._id,
        items: makeItems([{ type: 'Plastic', weight: 1 }]),
        date: daysAgo(0),
        address: users[4].defaultAddress,
        status: 'Pending',
        collector: null,
        pointsAwarded: false,
      },
      // Rejected
      {
        user: users[0]._id,
        items: makeItems([{ type: 'Metal', weight: 0.5 }]),
        date: daysAgo(3),
        address: users[0].defaultAddress,
        status: 'Rejected',
        collector: null,
        pointsAwarded: false,
        rejectionReason: 'Image was too blurry. Please resubmit with a clear photo.',
      },
      {
        user: users[3]._id,
        items: makeItems([{ type: 'Glass', weight: 1 }]),
        date: daysAgo(7),
        address: users[3].defaultAddress,
        status: 'Rejected',
        collector: null,
        pointsAwarded: false,
        rejectionReason: 'Waste type mismatch — item is not recyclable glass.',
      },
      {
        user: users[1]._id,
        items: makeItems([{ type: 'Plastic', weight: 2 }, { type: 'Metal', weight: 1 }]),
        date: daysAgo(9),
        address: users[1].defaultAddress,
        status: 'Rejected',
        collector: null,
        pointsAwarded: false,
        rejectionReason: 'Address is outside our current service area.',
      },
    ];

    const pickups = await Promise.all(
      pickupDefs.map((def) =>
        Pickup.create({
          user: def.user,
          wasteItems: def.items,
          totalWeight: totalWt(def.items),
          totalPoints: totalPts(def.items),
          pickupDate: def.date,
          address: def.address,
          status: def.status,
          assignedCollector: def.collector || null,
          pointsAwarded: def.pointsAwarded,
          rejectionReason: def.rejectionReason || null,
          statusLog: [
            {
              status: 'Pending',
              changedByModel: 'User',
              note: 'Request created',
            },
          ],
        })
      )
    );
    console.log(`Seeded ${pickups.length} pickups`);

    // Seed Rewards
    const rewards = await Reward.create([
      {
        user: users[0]._id,
        type: 'Airtime',
        provider: 'MTN',
        pointsSpent: 500,
        nairaValue: 500,
        code: generateRewardCode(),
        isCodeRevealed: true,
      },
      {
        user: users[1]._id,
        type: 'Gift Card',
        provider: 'Google Play',
        pointsSpent: 1000,
        nairaValue: 1000,
        denomination: 1000,
        code: generateRewardCode(),
        isCodeRevealed: false,
      },
      {
        user: users[1]._id,
        type: 'Airtime',
        provider: 'Airtel',
        pointsSpent: 500,
        nairaValue: 500,
        code: generateRewardCode(),
        isCodeRevealed: true,
      },
      {
        user: users[3]._id,
        type: 'Gift Card',
        provider: 'Apple',
        pointsSpent: 2000,
        nairaValue: 2000,
        denomination: 2000,
        code: generateRewardCode(),
        isCodeRevealed: false,
      },
      {
        user: users[0]._id,
        type: 'Airtime',
        provider: 'Glo',
        pointsSpent: 500,
        nairaValue: 500,
        code: generateRewardCode(),
        isCodeRevealed: true,
      },
    ]);
    console.log(`Seeded ${rewards.length} rewards`);

    // Seed Notifications 
    await Notification.create([
      {
        user: users[0]._id,
        type: 'Completed',
        title: 'Pickup completed!',
        message: `Your pickup is complete. You earned ${totalPts(pickupDefs[0].items)} points. Keep recycling!`,
        pickup: pickups[0]._id,
        isRead: true,
      },
      {
        user: users[0]._id,
        type: 'Approved',
        title: 'Pickup request approved!',
        message: 'Your pickup request has been approved. A collector will be assigned shortly.',
        pickup: pickups[7]._id,
        isRead: false,
      },
      {
        user: users[0]._id,
        type: 'Rejected',
        title: 'Pickup request rejected',
        message: 'Your pickup was rejected. Reason: Image was too blurry.',
        pickup: pickups[12]._id,
        isRead: false,
      },
      {
        user: users[1]._id,
        type: 'In Progress',
        title: 'Collector is on the way',
        message: 'Your assigned collector has started the pickup. Please have your waste ready.',
        pickup: pickups[5]._id,
        isRead: false,
      },
      {
        user: users[1]._id,
        type: 'Completed',
        title: 'Pickup completed!',
        message: `Your pickup is complete. You earned ${totalPts(pickupDefs[1].items)} points.`,
        pickup: pickups[1]._id,
        isRead: true,
      },
    ]);
    console.log('Seeded notifications');

    console.log('\nSeed complete. Test credentials:');
    console.log('─────────────────────────────────────');
    console.log('Users:     chidi@gmail.com / amaka@gmail.com / bola@gmail.com');
    console.log('           kemi@gmail.com  / tunde@gmail.com');
    console.log('Password:  password123 (all users)');
    console.log('Admin:     admin@scrapit.com / Admin@1234');
    console.log('Collectors: emeka@scrapit.com / sola@scrapit.com');
    console.log('Password:  collector123 (all collectors)');
    console.log('─────────────────────────────────────');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();