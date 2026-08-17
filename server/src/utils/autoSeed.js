import User from '../models/User.js';
import Department from '../models/Department.js';
import { hashPassword } from './security.js';

let isSeeding = false;

export async function ensureDefaultData() {
  if (isSeeding) return;
  isSeeding = true;

  try {
    const deptCount = await Department.countDocuments();
    let depts = {};

    if (deptCount === 0) {
      console.log('[AutoSeed] Populating default departments...');
      const createdDepts = await Department.insertMany([
        {
          name: 'Cardiology & Cardiovascular Care',
          code: 'CARD',
          description: 'Specialist heart health diagnostics, ECG, echocardiograms, and hypertension management.',
          icon: 'HeartPulse',
          color: '#ef4444',
          location: 'Wing B, Floor 2',
          phone: '+44 (0) 20 7946 0120'
        },
        {
          name: 'Dental Surgery & Oral Health',
          code: 'DENT',
          description: 'Comprehensive dental hygiene, extractions, root canal treatments, and cosmetic oral surgery.',
          icon: 'Sparkles',
          color: '#0ea5e9',
          location: 'Wing A, Ground Floor',
          phone: '+44 (0) 20 7946 0121'
        },
        {
          name: 'General Practice & Family Medicine',
          code: 'GP',
          description: 'Routine health evaluations, prescription renewals, vaccinations, and initial diagnostic triage.',
          icon: 'Stethoscope',
          color: '#10b981',
          location: 'Main Clinic, Floor 1',
          phone: '+44 (0) 20 7946 0122'
        },
        {
          name: 'Pediatrics & Child Wellness',
          code: 'PED',
          description: 'Dedicated neonatal, infant, and adolescent medical care with specialized child diagnostics.',
          icon: 'Baby',
          color: '#f59e0b',
          location: 'Wing C, Floor 3',
          phone: '+44 (0) 20 7946 0123'
        },
        {
          name: 'Orthopedics & Sports Medicine',
          code: 'ORTH',
          description: 'Joint reconstruction, musculoskeletal rehabilitation, fracture care, and physiotherapy triage.',
          icon: 'Activity',
          color: '#8b5cf6',
          location: 'Wing B, Ground Floor',
          phone: '+44 (0) 20 7946 0124'
        }
      ]);

      createdDepts.forEach((d) => {
        depts[d.code] = d._id;
      });
    } else {
      const existing = await Department.find({});
      existing.forEach((d) => {
        depts[d.code] = d._id;
      });
    }

    const defaultPassword = hashPassword('Password123!');

    // Demo Users list
    const demoUsers = [
      {
        email: 'admin@medipulse.com',
        name: 'Eleanor Vance (Hospital Director)',
        role: 'admin',
        phone: '+44 (0) 20 7946 0001',
        password: defaultPassword
      },
      {
        email: 'dr.sarah@medipulse.com',
        name: 'Dr. Sarah Jenkins, MD, FRCP',
        role: 'doctor',
        specialization: 'Senior Consultant Cardiologist',
        department: depts['CARD'],
        consultationFee: 120,
        phone: '+44 (0) 20 7946 0002',
        password: defaultPassword,
        qualifications: 'MBBS, MD (Cardiology), FRCP (London)',
        bio: 'Over 14 years of clinical experience in interventional cardiology and structural heart disease.',
        workingHours: {
          start: '09:00',
          end: '17:00',
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        }
      },
      {
        email: 'dr.marcus@medipulse.com',
        name: 'Dr. Marcus Vance, BDS, MFDS',
        role: 'doctor',
        specialization: 'Lead Dental Surgeon & Implantologist',
        department: depts['DENT'],
        consultationFee: 95,
        phone: '+44 (0) 20 7946 0003',
        password: defaultPassword,
        qualifications: 'BDS (Hons), MFDS RCPS (Glasg)',
        bio: 'Specialist in restorative dentistry, prosthodontics, and minimally invasive oral surgery.',
        workingHours: {
          start: '08:30',
          end: '16:30',
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        }
      },
      {
        email: 'dr.emily@medipulse.com',
        name: 'Dr. Emily Watson, MBBS, MRCGP',
        role: 'doctor',
        specialization: 'Principal General Practitioner (GP)',
        department: depts['GP'],
        consultationFee: 80,
        phone: '+44 (0) 20 7946 0004',
        password: defaultPassword,
        qualifications: 'MBBS, MRCGP, DCH, DRCOG',
        bio: 'Dedicated family physician with special interests in preventative medicine and chronic disease care.',
        workingHours: {
          start: '09:00',
          end: '17:00',
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        }
      },
      {
        email: 'jane.doe@example.com',
        name: 'Jane Doe',
        role: 'patient',
        phone: '+44 (0) 7700 900077',
        password: defaultPassword,
        bloodGroup: 'A+',
        dateOfBirth: new Date('1992-06-15'),
        address: '42 Blossom Street, London, E1 6PL'
      },
      {
        email: 'john.smith@example.com',
        name: 'John Smith',
        role: 'patient',
        phone: '+44 (0) 7700 900088',
        password: defaultPassword,
        bloodGroup: 'O+',
        dateOfBirth: new Date('1985-11-23'),
        address: '18 Cambridge Road, London, SW3 4TU'
      }
    ];

    for (const u of demoUsers) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        await User.create(u);
        console.log(`[AutoSeed] Created demo user: ${u.email} (${u.role})`);
      }
    }
  } catch (err) {
    console.warn('[AutoSeed] Non-critical autoseed notice:', err.message);
  } finally {
    isSeeding = false;
  }
}
