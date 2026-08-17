import mongoose from 'mongoose';

const prescriptionItemSchema = new mongoose.Schema(
  {
    medication: {
      type: String,
      required: true
    },
    dosage: {
      type: String,
      required: true // e.g. "500 mg"
    },
    frequency: {
      type: String,
      required: true // e.g. "Twice daily after meals"
    },
    duration: {
      type: String,
      required: true // e.g. "7 days"
    },
    instructions: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const vitalsSchema = new mongoose.Schema(
  {
    bloodPressure: { type: String, default: '120/80 mmHg' },
    heartRate: { type: Number, default: 72 }, // bpm
    temperature: { type: Number, default: 36.8 }, // Celsius
    weight: { type: Number, default: 70 }, // kg
    height: { type: Number, default: 175 }, // cm
    oxygenSaturation: { type: Number, default: 98 } // %
  },
  { _id: false }
);

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient reference is required']
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor reference is required']
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    },
    visitDate: {
      type: Date,
      default: Date.now
    },
    diagnosis: {
      type: String,
      required: [true, 'Diagnosis is required'],
      trim: true
    },
    vitals: {
      type: vitalsSchema,
      default: () => ({})
    },
    symptoms: {
      type: [String],
      default: []
    },
    clinicalNotes: {
      type: String,
      default: ''
    },
    prescriptions: {
      type: [prescriptionItemSchema],
      default: []
    },
    labTestsRecommended: {
      type: [String],
      default: []
    },
    followUpDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('MedicalRecord', medicalRecordSchema);
