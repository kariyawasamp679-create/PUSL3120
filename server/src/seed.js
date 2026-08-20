import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Department from './models/Department.js';
import Appointment from './models/Appointment.js';
import MedicalRecord from './models/MedicalRecord.js';
import { hashPassword } from './utils/security.js';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pusl3120';

export async function seedDatabase() {
  try {
    console.log('[Seed] Connecting to database...');
    await mongoose.connect(uri);
    console.log('[Seed] Connected. Cleaning existing dummy data...');

    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      Appointment.deleteMany({}),
      MedicalRecord.deleteMany({})
    ]);

    console.log('[Seed] Creating default medical departments...');
    const departmentsData = [
      {
        name: 'Cardiology',
        code: 'CARD',
        description: 'Comprehensive cardiovascular care, diagnostic ECG, echocardiograms, and heart disease management.',
        icon: 'HeartPulse',
        color: '#ef4444',
        location: 'Wing B, Level 3',
        phone: '+44 20 7946 0101'
      },
      {
        name: 'Dental Surgery',
        code: 'DENT',
        description: 'Modern cosmetic and restorative dentistry, teeth whitening, orthodontics, and oral surgery.',
        icon: 'Sparkles',
        color: '#0284c7',
        location: 'Wing A, Level 1',
        phone: '+44 20 7946 0102'
      },
      {
        name: 'General Practice',
        code: 'GP',
        description: 'Primary healthcare consultations, routine medical checkups, immunizations, and preventive health.',
        icon: 'Stethoscope',
        color: '#059669',
        location: 'Main Building, Ground Floor',
        phone: '+44 20 7946 0103'
      },
      {
        name: 'Pediatrics',
        code: 'PED',
        description: 'Dedicated infant, child, and adolescent healthcare, growth monitoring, and pediatric wellness.',
        icon: 'Baby',
        color: '#d97706',
        location: 'Children Pavilion, Level 2',
        phone: '+44 20 7946 0104'
      },
      {
        name: 'Orthopedics',
        code: 'ORTH',
        description: 'Bone and joint care, sports injury rehabilitation, spine health, and musculoskeletal surgery.',
        icon: 'Activity',
        color: '#7c3aed',
        location: 'Wing C, Level 2',
        phone: '+44 20 7946 0105'
      }
    ];

    await Department.insertMany(departmentsData);

    console.log('[Seed] Creating System Administrator...');
    const defaultPassword = hashPassword('Password123!');

    await User.create({
      name: 'System Administrator',
      email: 'admin@medipulse.com',
      password: defaultPassword,
      role: 'admin',
      phone: '+44 20 7946 0001',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256'
    });

    console.log('\n======================================================');
    console.log('  DATABASE INITIALIZED WITH CLEAN SYSTEM ADMIN ONLY!  ');
    console.log('======================================================');
    console.log('  Admin Email:    admin@medipulse.com');
    console.log('  Admin Password: Password123!');
    console.log('  Role:           admin');
    console.log('  Doctors:        0 (Add via Admin Portal)');
    console.log('  Patients:       0 (Register via /register or Admin)');
    console.log('======================================================\n');
  } catch (error) {
    console.error('[Seed Error]:', error);
  }
}

if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase().then(() => {
    process.exit(0);
  });
}
