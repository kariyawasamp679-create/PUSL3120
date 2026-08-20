import User from '../models/User.js';
import Department from '../models/Department.js';
import { hashPassword } from './security.js';

let isSeeding = false;

export async function ensureDefaultData() {
  if (isSeeding) return;
  isSeeding = true;

  try {
    const deptCount = await Department.countDocuments();

    if (deptCount === 0) {
      console.log('[AutoSeed] Populating default departments...');
      await Department.insertMany([
        {
          name: 'Cardiology',
          code: 'CARD',
          description: 'Specialist heart health diagnostics, ECG, echocardiograms, and hypertension management.',
          icon: 'HeartPulse',
          color: '#ef4444',
          location: 'Wing B, Floor 2',
          phone: '+44 20 7946 0120'
        },
        {
          name: 'Dental Surgery',
          code: 'DENT',
          description: 'Comprehensive dental hygiene, extractions, root canal treatments, and oral surgery.',
          icon: 'Sparkles',
          color: '#0284c7',
          location: 'Wing A, Ground Floor',
          phone: '+44 20 7946 0121'
        },
        {
          name: 'General Practice',
          code: 'GP',
          description: 'Routine health evaluations, prescription renewals, vaccinations, and primary diagnostic triage.',
          icon: 'Stethoscope',
          color: '#059669',
          location: 'Main Clinic, Floor 1',
          phone: '+44 20 7946 0122'
        },
        {
          name: 'Pediatrics',
          code: 'PED',
          description: 'Dedicated neonatal, infant, and adolescent medical care with specialized child diagnostics.',
          icon: 'Baby',
          color: '#d97706',
          location: 'Wing C, Floor 3',
          phone: '+44 20 7946 0123'
        },
        {
          name: 'Orthopedics',
          code: 'ORTH',
          description: 'Joint reconstruction, musculoskeletal rehabilitation, fracture care, and physiotherapy triage.',
          icon: 'Activity',
          color: '#7c3aed',
          location: 'Wing B, Ground Floor',
          phone: '+44 20 7946 0124'
        }
      ]);
    }

    // Ensure ONLY the System Administrator account exists
    const adminEmail = 'admin@medipulse.com';
    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      const defaultPassword = hashPassword('Password123!');
      await User.create({
        email: adminEmail,
        name: 'System Administrator',
        role: 'admin',
        phone: '+44 20 7946 0001',
        password: defaultPassword,
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256'
      });
      console.log('[AutoSeed] Created System Administrator: admin@medipulse.com');
    }
  } catch (err) {
    console.warn('[AutoSeed] Non-critical notice:', err.message);
  } finally {
    isSeeding = false;
  }
}
