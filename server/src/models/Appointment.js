import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
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
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department reference is required']
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required']
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'] // e.g. "09:30"
    },
    duration: {
      type: Number,
      default: 30 // in minutes
    },
    type: {
      type: String,
      enum: ['in-person', 'video-consultation'],
      default: 'in-person'
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'],
      default: 'confirmed'
    },
    reason: {
      type: String,
      required: [true, 'Reason for appointment is required'],
      trim: true
    },
    symptoms: {
      type: [String],
      default: []
    },
    doctorNotes: {
      type: String,
      default: ''
    },
    cancellationReason: {
      type: String,
      default: ''
    },
    fee: {
      type: Number,
      default: 45
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'paid'
    },
    meetingRoomId: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Composite index to ensure slot availability queries are fast and enforce integrity
appointmentSchema.index({ doctor: 1, appointmentDate: 1, timeSlot: 1 });

export default mongoose.model('Appointment', appointmentSchema);
