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
    console.log('[Seed] Connected. Cleaning existing data...');

    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      Appointment.deleteMany({}),
      MedicalRecord.deleteMany({})
    ]);

    console.log('[Seed] Creating Departments...');
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
        color: '#0ea5e9',
        location: 'Wing A, Level 1',
        phone: '+44 20 7946 0102'
      },
      {
        name: 'General Practice',
        code: 'GP',
        description: 'Primary healthcare consultations, routine medical checkups, immunizations, and preventive health.',
        icon: 'Stethoscope',
        color: '#10b981',
        location: 'Main Building, Ground Floor',
        phone: '+44 20 7946 0103'
      },
      {
        name: 'Pediatrics',
        code: 'PED',
        description: 'Dedicated infant, child, and adolescent healthcare, growth monitoring, and pediatric wellness.',
        icon: 'Baby',
        color: '#f59e0b',
        location: 'Children’s Pavilion, Level 2',
        phone: '+44 20 7946 0104'
      },
      {
        name: 'Orthopedics',
        code: 'ORTH',
        description: 'Bone and joint care, sports injury rehabilitation, spine health, and musculoskeletal surgery.',
        icon: 'Activity',
        color: '#8b5cf6',
        location: 'Wing C, Level 2',
        phone: '+44 20 7946 0105'
      }
    ];

    const departments = await Department.insertMany(departmentsData);
    const deptMap = {};
    departments.forEach(d => { deptMap[d.code] = d._id; });

    console.log('[Seed] Creating Administrator...');
    const defaultPassword = hashPassword('Password123!');

    const admin = await User.create({
      name: 'Eleanor Vance (Hospital Director)',
      email: 'admin@medipulse.com',
      password: defaultPassword,
      role: 'admin',
      phone: '+44 20 7946 0999',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256'
    });

    console.log('[Seed] Creating Doctors...');
    const doctorsData = [
      {
        name: 'Dr. Sarah Jenkins',
        email: 'dr.sarah@medipulse.com',
        password: defaultPassword,
        role: 'doctor',
        phone: '+44 7700 900101',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=256',
        specialization: 'Cardiology Specialist',
        qualifications: 'MBBS, MD (Cardiology), MRCP (London)',
        department: deptMap['CARD'],
        consultationFee: 75,
        bio: 'Senior consultant cardiologist with 14+ years of clinical excellence in preventive cardiology and heart rhythm management.',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        workingHours: { start: '09:00', end: '16:30' }
      },
      {
        name: 'Dr. Marcus Vance',
        email: 'dr.marcus@medipulse.com',
        password: defaultPassword,
        role: 'doctor',
        phone: '+44 7700 900102',
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=256',
        specialization: 'Dental Surgeon & Implantologist',
        qualifications: 'BDS, MDS (Oral Surgery), FDSRCS',
        department: deptMap['DENT'],
        consultationFee: 60,
        bio: 'Specialist cosmetic dental surgeon focusing on pain-free treatments, teeth alignment, and digital smile design.',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Friday'],
        workingHours: { start: '09:00', end: '17:00' }
      },
      {
        name: 'Dr. Emily Watson',
        email: 'dr.emily@medipulse.com',
        password: defaultPassword,
        role: 'doctor',
        phone: '+44 7700 900103',
        avatar: 'https://images.unsplash.com/photo-1594824813533-450521e86a0b?auto=format&fit=crop&q=80&w=256',
        specialization: 'Family Medicine & General Practice',
        qualifications: 'MBBS, MRCGP (UK), DCH',
        department: deptMap['GP'],
        consultationFee: 45,
        bio: 'Dedicated General Practitioner focusing on holistic family care, lifestyle medicine, and chronic condition management.',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        workingHours: { start: '08:30', end: '16:00' }
      },
      {
        name: 'Dr. Robert Chen',
        email: 'dr.robert@medipulse.com',
        password: defaultPassword,
        role: 'doctor',
        phone: '+44 7700 900104',
        avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=256',
        specialization: 'Consultant Pediatrician',
        qualifications: 'MBBS, MD (Pediatrics), FAAP',
        department: deptMap['PED'],
        consultationFee: 55,
        bio: 'Caring pediatrician passionate about child development, allergy testing, and childhood immunity programs.',
        workingDays: ['Monday', 'Wednesday', 'Thursday', 'Friday'],
        workingHours: { start: '09:00', end: '16:00' }
      }
    ];

    const doctors = await User.insertMany(doctorsData);

    // Update departments with head doctors
    await Department.findByIdAndUpdate(deptMap['CARD'], { headDoctor: doctors[0]._id });
    await Department.findByIdAndUpdate(deptMap['DENT'], { headDoctor: doctors[1]._id });
    await Department.findByIdAndUpdate(deptMap['GP'], { headDoctor: doctors[2]._id });
    await Department.findByIdAndUpdate(deptMap['PED'], { headDoctor: doctors[3]._id });

    console.log('[Seed] Creating Patients...');
    const patientsData = [
      {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        password: defaultPassword,
        role: 'patient',
        phone: '+44 7700 900201',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256',
        dateOfBirth: new Date('1994-05-14'),
        gender: 'female',
        bloodGroup: 'A+',
        address: '42 Baker Street, Marylebone, London, UK',
        emergencyContact: {
          name: 'Michael Doe',
          phone: '+44 7700 900202',
          relation: 'Spouse'
        }
      },
      {
        name: 'John Smith',
        email: 'john.smith@example.com',
        password: defaultPassword,
        role: 'patient',
        phone: '+44 7700 900203',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
        dateOfBirth: new Date('1988-11-23'),
        gender: 'male',
        bloodGroup: 'O+',
        address: '18 Regent Street, London, UK',
        emergencyContact: {
          name: 'Sarah Smith',
          phone: '+44 7700 900204',
          relation: 'Sister'
        }
      },
      {
        name: 'Alice Wong',
        email: 'alice.wong@example.com',
        password: defaultPassword,
        role: 'patient',
        phone: '+44 7700 900205',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
        dateOfBirth: new Date('1998-02-19'),
        gender: 'female',
        bloodGroup: 'B+',
        address: '77 Piccadilly, London, UK',
        emergencyContact: {
          name: 'David Wong',
          phone: '+44 7700 900206',
          relation: 'Father'
        }
      }
    ];

    const patients = await User.insertMany(patientsData);

    console.log('[Seed] Creating Sample Appointments...');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 3);

    const appointmentsData = [
      {
        patient: patients[0]._id,
        doctor: doctors[0]._id, // Dr. Sarah (Cardiology)
        department: deptMap['CARD'],
        appointmentDate: tomorrow,
        timeSlot: '10:00',
        reason: 'Routine cardiac health review and blood pressure assessment.',
        symptoms: ['Occasional mild palpitations', 'Fatigue'],
        type: 'in-person',
        status: 'confirmed',
        fee: 75,
        paymentStatus: 'paid',
        meetingRoomId: 'consult-card-001'
      },
      {
        patient: patients[0]._id,
        doctor: doctors[1]._id, // Dr. Marcus (Dental)
        department: deptMap['DENT'],
        appointmentDate: dayAfter,
        timeSlot: '14:00',
        reason: 'Annual dental prophylaxis and scaling checkup.',
        symptoms: ['Mild sensitivity to cold drinks'],
        type: 'in-person',
        status: 'confirmed',
        fee: 60,
        paymentStatus: 'paid',
        meetingRoomId: 'consult-dent-002'
      },
      {
        patient: patients[1]._id,
        doctor: doctors[2]._id, // Dr. Emily (GP)
        department: deptMap['GP'],
        appointmentDate: tomorrow,
        timeSlot: '11:30',
        reason: 'Seasonal allergy consultation and inhaler renewal.',
        symptoms: ['Nasal congestion', 'Dry cough'],
        type: 'video-consultation',
        status: 'confirmed',
        fee: 45,
        paymentStatus: 'paid',
        meetingRoomId: 'consult-gp-003'
      },
      {
        patient: patients[2]._id,
        doctor: doctors[0]._id, // Dr. Sarah
        department: deptMap['CARD'],
        appointmentDate: yesterday,
        timeSlot: '09:30',
        reason: 'Initial ECG diagnostic consultation.',
        symptoms: ['Dizziness after exercise'],
        type: 'in-person',
        status: 'completed',
        fee: 75,
        paymentStatus: 'paid',
        meetingRoomId: 'consult-card-004'
      }
    ];

    const appointments = await Appointment.insertMany(appointmentsData);

    console.log('[Seed] Creating Medical Records and Prescriptions...');
    const record = await MedicalRecord.create({
      patient: patients[2]._id,
      doctor: doctors[0]._id,
      appointment: appointments[3]._id,
      visitDate: yesterday,
      diagnosis: 'Sinus Tachycardia - Mild Dehydration Induced',
      vitals: {
        bloodPressure: '118/76 mmHg',
        heartRate: 78,
        temperature: 36.6,
        weight: 62,
        height: 168,
        oxygenSaturation: 99
      },
      symptoms: ['Mild palpitations', 'Post-workout fatigue'],
      clinicalNotes: 'ECG shows normal sinus rhythm. No structural abnormalities observed. Advised increased electrolyte and water intake during workouts.',
      prescriptions: [
        {
          medication: 'Oral Rehydration Salts (Dioralyte)',
          dosage: '1 sachet in 200ml water',
          frequency: 'Once daily after exercise',
          duration: '14 days',
          instructions: 'Drink immediately after preparation'
        },
        {
          medication: 'Coenzyme Q10 100mg',
          dosage: '1 capsule',
          frequency: 'Once daily with morning meal',
          duration: '30 days',
          instructions: 'Cardiovascular vitality support'
        }
      ],
      labTestsRecommended: ['Complete Blood Count (CBC)', 'Serum Electrolyte Panel'],
      followUpDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    console.log('\n======================================================');
    console.log('  MEDIPULSE 360 DATABASE SEEDED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('Demo Credentials for Testing:');
    console.log('  1. Hospital Admin : admin@medipulse.com        / Password123!');
    console.log('  2. Cardiologist   : dr.sarah@medipulse.com      / Password123!');
    console.log('  3. Dental Surgeon : dr.marcus@medipulse.com     / Password123!');
    console.log('  4. GP Doctor      : dr.emily@medipulse.com      / Password123!');
    console.log('  5. Patient (Jane) : jane.doe@example.com        / Password123!');
    console.log('  6. Patient (John) : john.smith@example.com      / Password123!');
    console.log('======================================================\n');
  } catch (error) {
    console.error('[Seed Error]:', error);
  }
}

// Run standalone if executed directly
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase().then(() => {
    mongoose.connection.close();
  });
}
